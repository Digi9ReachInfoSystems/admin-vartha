import React, { useEffect, useState } from "react";
import { Card, DatePicker, message, Spin } from "antd";
import { Bar } from "@ant-design/plots";
import { CalendarOutlined } from "@ant-design/icons";
const moment = window.moment;

function DailyUserCard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment());

  // Fetch monthly user data
  const fetchData = async (selectedMonth) => {
    try {
      const year = selectedMonth.year();
      const month = selectedMonth.month() + 1;

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/users/getMonthlyUser?year=${year}&month=${month}`
      );

      if (!response.ok) throw new Error("Failed to fetch data.");

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        message.warning("No data found for this month.");
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, []);

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
      setLoading(true);
      fetchData(date);
    }
  };

  // Chart data formatting
  const chartData = data.map((item) => ({
    date: item.date.slice(8, 10),
    count: item.count,
  }));

  // Chart config
  const config = {
    data: chartData,
    xField: "date",
    yField: "count",
    smooth: true,
    color: ({ count }) =>
      count > 100
        ? "#4CAF50"
        : count > 50
        ? "#2196F3"
        : "#FFC107", // dynamic color
    columnStyle: {
      radius: [6, 6, 0, 0],
      fillOpacity: 0.9,
    },
    tooltip: {
      showMarkers: true,
      shared: true,
    },
    label: {
      position: "top",
      style: {
        fill: "#fff",
        fontSize: 12,
        fontWeight: "bold",
      },
    },
    xAxis: {
      label: {
        style: {
          fill: "#aaa",
          fontSize: 12,
        },
      },
    },
    yAxis: {
      label: {
        style: {
          fill: "#aaa",
          fontSize: 12,
        },
      },
    },
    meta: {
      date: { alias: "Day" },
      count: { alias: "New Users" },
    },
    interactions: [{ type: "active-region" }],
  };

  return (
    <Card
      title={
        <span style={{ fontWeight: 600, fontSize: "16px", color: "#222" }}>
          📊 Daily New Users
        </span>
      }
      extra={
        <DatePicker
          value={selectedDate}
          onChange={handleDateChange}
          picker="month"
          suffixIcon={<CalendarOutlined />}
          style={{
            borderRadius: 8,
            boxShadow: "0 0 4px rgba(0,0,0,0.1)",
            width: 180,
          }}
        />
      }
      style={{
        borderRadius: "12px",
        background: "linear-gradient(135deg, #ffffff, #f3f7ff)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        padding: "16px",
      }}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "250px",
          }}
        >
          <Spin size="large" />
        </div>
      ) : data.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#888",
            fontSize: "16px",
            padding: "50px 0",
          }}
        >
          No data available for this month 📭
        </div>
      ) : (
        <div style={{ height: "300px", paddingTop: "10px" }}>
          <Bar {...config} />
        </div>
      )}
    </Card>
  );
}

export default DailyUserCard;
