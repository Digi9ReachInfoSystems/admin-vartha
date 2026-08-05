import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Image, Tag, Tooltip, Typography, message } from "antd";
import { Plus, Send } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import PageHeader from "../../components/ui/PageHeader";
import DataTableShell from "../../components/ui/DataTableShell";
import SearchBar from "../../components/ui/SearchBar";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  getCreatedMarks,
  getDistrictNews,
  getLocalCreatedArticleIds,
  mapArticleToPublishPayload,
} from "../../service/karnatakaNews/KarnatakaNewsService";

const { Text } = Typography;

const PageWrap = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;

  .kn-table {
    box-shadow: 0 4px 18px rgba(15, 23, 42, 0.07);
    border-color: #e2e8f0;
  }

  .kn-table .dts-body,
  .kn-table .ant-table-body,
  .kn-table .ant-table-content {
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: #94a3b8 transparent;
  }

  .kn-table .dts-body::-webkit-scrollbar,
  .kn-table .ant-table-body::-webkit-scrollbar,
  .kn-table .ant-table-content::-webkit-scrollbar {
    height: 6px;
    width: 6px;
  }

  .kn-table .dts-body::-webkit-scrollbar-track,
  .kn-table .ant-table-body::-webkit-scrollbar-track,
  .kn-table .ant-table-content::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 999px;
    margin: 0 8px;
  }

  .kn-table .dts-body::-webkit-scrollbar-thumb,
  .kn-table .ant-table-body::-webkit-scrollbar-thumb,
  .kn-table .ant-table-content::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 999px;
    border: 1px solid transparent;
    background-clip: padding-box;
  }

  .kn-table .dts-body::-webkit-scrollbar-thumb:hover,
  .kn-table .ant-table-body::-webkit-scrollbar-thumb:hover,
  .kn-table .ant-table-content::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .kn-table .dts-body::-webkit-scrollbar-button,
  .kn-table .ant-table-body::-webkit-scrollbar-button,
  .kn-table .ant-table-content::-webkit-scrollbar-button {
    display: none;
    width: 0;
    height: 0;
  }

  .kn-table .ant-table-cell {
    vertical-align: middle;
  }

  .kn-title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.45;
    max-width: 420px;
    white-space: normal;
    word-break: break-word;
    color: #0f172a;
    font-weight: 500;
  }

  .kn-thumb {
    width: 64px;
    height: 48px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
  }

  .kn-meta {
    color: #64748b;
    font-size: 12px;
    white-space: nowrap;
  }
`;

function formatDistrict(value) {
  const raw = String(value || "").trim();
  if (!raw) return "—";
  return raw
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPublished(value, row) {
  const raw = value || row?.createdTime || row?.createdAt;
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function KarnatakaNewsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [createdIds, setCreatedIds] = useState(() => getLocalCreatedArticleIds());
  const [searchText, setSearchText] = useState("");

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const [newsRes, marksRes] = await Promise.all([
        getDistrictNews(1, 50),
        getCreatedMarks().catch((err) => {
          console.error(err);
          return { data: [] };
        }),
      ]);

      setItems(Array.isArray(newsRes?.data) ? newsRes.data : []);

      const fromDb = new Set(
        (Array.isArray(marksRes?.data) ? marksRes.data : [])
          .map((m) => String(m.articleId || "").trim())
          .filter(Boolean)
      );
      const local = getLocalCreatedArticleIds();
      local.forEach((id) => fromDb.add(id));
      setCreatedIds(fromDb);
    } catch (error) {
      console.error(error);
      message.error(error.message || "Failed to load district news");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (location.state?.createdArticleId || location.state?.refreshMarks) {
      loadList();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, loadList, navigate]);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return items;
    return items.filter((row) => {
      const title = String(row?.title || row?.kannada?.title || "").toLowerCase();
      const district = String(
        row?.district || row?.district_slug || ""
      ).toLowerCase();
      return title.includes(q) || district.includes(q);
    });
  }, [items, searchText]);

  const openCreateFromRow = (article) => {
    const payload = mapArticleToPublishPayload(article);
    navigate("/karnataka-public-news/create", {
      state: {
        article,
        payload,
        fromArticle: true,
      },
    });
  };

  const isCreated = (row) =>
    createdIds.has(String(row?._id || row?.id || ""));

  const columns = [
    {
      title: "Image",
      dataIndex: "newsImage",
      key: "newsImage",
      width: 88,
      render: (url) =>
        url ? (
          <Image
            src={url}
            alt="news"
            width={64}
            height={48}
            className="kn-thumb"
            preview={{ mask: "View" }}
          />
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 360,
      ellipsis: true,
      render: (text, row) => {
        const title = text || row?.kannada?.title || "—";
        return (
          <Tooltip title={title} placement="topLeft">
            <span className="kn-title">{title}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "District",
      key: "district",
      width: 140,
      ellipsis: true,
      render: (_, row) => (
        <Tag style={{ marginInlineEnd: 0 }}>
          {formatDistrict(row?.district || row?.district_slug)}
        </Tag>
      ),
    },
    {
      title: "Type",
      dataIndex: "newsType",
      key: "newsType",
      width: 120,
      render: (text) => (
        <Tag color="blue" style={{ marginInlineEnd: 0 }}>
          {text || "districtnews"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status) => <StatusBadge status={status || "—"} />,
    },
    {
      title: "Published",
      dataIndex: "publishedAt",
      key: "publishedAt",
      width: 120,
      render: (value, row) => (
        <span className="kn-meta">{formatPublished(value, row)}</span>
      ),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 110,
      render: (_, row) =>
        isCreated(row) ? (
          <Tag color="success" style={{ marginInlineEnd: 0 }}>
            Created
          </Tag>
        ) : (
          <Button
            type="primary"
            size="small"
            icon={<Send size={14} />}
            onClick={() => openCreateFromRow(row)}
            style={{ background: "#005BAC" }}
          >
            Create
          </Button>
        ),
    },
  ];

  return (
    <PageWrap>
      <PageHeader
        title="Inshorts-News"
        extra={
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => navigate("/karnataka-public-news/create")}
            style={{ background: "#005BAC" }}
          >
            Create
          </Button>
        }
      />

      <DataTableShell
        className="kn-table"
        loading={loading}
        rowKey={(row) => row._id || row.id}
        columns={columns}
        dataSource={filtered}
        emptyTitle="No district news found"
        emptyDescription="Existing districtnews will appear here."
        scroll={{ x: 980 }}
        sticky
        toolbar={
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search title or district"
          />
        }
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `${total} items`,
        }}
      />
    </PageWrap>
  );
}
