import React, { useEffect, useMemo, useState } from "react";
import { Card, Col, DatePicker, Row, Spin } from "antd";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import dayjs from "dayjs";
import { getArticles } from "../../../service/Article/ArticleService";
import { getTotalVisitors } from "../../../service/statsService/statsService";
import EmptyState from "../../ui/EmptyState";

const COLORS = ["#005BAC", "#16A34A", "#F59E0B", "#DC2626", "#6B7280", "#38BDF8"];

const ChartCard = ({ title, children, height = 280 }) => (
  <Card
    title={title}
    styles={{
      header: { fontWeight: 600, borderBottom: "1px solid #E5E7EB" },
      body: { minHeight: height },
    }}
    style={{
      borderRadius: 12,
      border: "1px solid #E5E7EB",
      boxShadow: "0 1px 3px rgba(17, 24, 39, 0.06)",
      height: "100%",
    }}
  >
    {children}
  </Card>
);

function MonthlyArticlesChart({ articles }) {
  const data = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      name: dayjs().month(i).format("MMM"),
      count: 0,
    }));
    articles.forEach((a) => {
      const d = new Date(a.publishedAt || a.createdAt || a.updatedAt);
      if (!Number.isNaN(d.getTime()) && d.getFullYear() === new Date().getFullYear()) {
        months[d.getMonth()].count += 1;
      }
    });
    return months;
  }, [articles]);

  const hasData = data.some((d) => d.count > 0);

  return (
    <ChartCard title="Monthly Articles">
      {!hasData ? (
        <EmptyState title="No article data" description="Publish articles to see monthly trends." />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#005BAC" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

function CategoryDistributionChart({ articles }) {
  const data = useMemo(() => {
    const map = {};
    articles.forEach((a) => {
      const name =
        a.category?.name ||
        a.categoryName ||
        a.category ||
        "Uncategorized";
      const key = typeof name === "string" ? name : "Uncategorized";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [articles]);

  return (
    <ChartCard title="Category Distribution">
      {!data.length ? (
        <EmptyState title="No categories" description="Category breakdown will appear here." />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

function DistrictArticlesChart({ articles }) {
  const data = useMemo(() => {
    const map = {};
    articles.forEach((a) => {
      const name =
        a.district?.name ||
        a.districtName ||
        a.district ||
        "General";
      const key = typeof name === "string" ? name : "General";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [articles]);

  return (
    <ChartCard title="District-wise Articles">
      {!data.length ? (
        <EmptyState title="No district data" description="District article counts will appear here." />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#16A34A" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

function UserGrowthChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(dayjs());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const year = month.year();
        const m = month.month() + 1;
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/users/getMonthlyUser?year=${year}&month=${m}`
        );
        const result = await response.json();
        if (result?.success && Array.isArray(result.data)) {
          setData(
            result.data.map((d) => ({
              name: d.date || d.day || d.label || "",
              users: d.count || d.users || d.total || 0,
            }))
          );
        } else {
          setData([]);
        }
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month]);

  return (
    <ChartCard
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span>User Growth</span>
          <DatePicker
            picker="month"
            value={month}
            onChange={(d) => d && setMonth(d)}
            allowClear={false}
            size="small"
          />
        </div>
      }
    >
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spin />
        </div>
      ) : !data.length ? (
        <EmptyState title="No user growth data" description="Monthly user registrations will appear here." />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#005BAC" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

function VisitorAnalyticsCard({ visitors }) {
  const data = [
    { name: "Total Visits", value: visitors ?? 0 },
  ];

  return (
    <ChartCard title="Visitor Analytics">
      {visitors == null ? (
        <EmptyState title="Visitor data unavailable" description="Connect visitor stats to view analytics." />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#F59E0B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export default function DashboardCharts() {
  const [articles, setArticles] = useState([]);
  const [visitors, setVisitors] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [news, visitorRes] = await Promise.all([
          getArticles().catch(() => null),
          getTotalVisitors().catch(() => null),
        ]);
        const list = Array.isArray(news?.data)
          ? news.data
          : Array.isArray(news)
            ? news
            : [];
        setArticles(list);
        setVisitors(visitorRes?.totalVisits ?? null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
      <Col xs={24} lg={12}>
        <MonthlyArticlesChart articles={articles} />
      </Col>
      <Col xs={24} lg={12}>
        <UserGrowthChart />
      </Col>
      <Col xs={24} lg={12}>
        <CategoryDistributionChart articles={articles} />
      </Col>
      <Col xs={24} lg={12}>
        <DistrictArticlesChart articles={articles} />
      </Col>
      <Col xs={24}>
        <VisitorAnalyticsCard visitors={visitors} />
      </Col>
    </Row>
  );
}
