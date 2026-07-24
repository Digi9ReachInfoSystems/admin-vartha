import React, { useEffect, useState } from "react";
import {
  Image,
  Popconfirm,
  message,
  Modal,
  Space,
  Descriptions,
} from "antd";
import {
  getArticles,
  deleteArticle,
  approveNews,
  getHistoryById, // ✅ Import history API
} from "../../service/Article/ArticleService";
import { getDistricts } from "../../service/districts/DistrictsApi";
import { Eye, Pencil, Trash2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTableShell from "../ui/DataTableShell";
import SearchBar from "../ui/SearchBar";
import StatusBadge from "../ui/StatusBadge";
import { IconActionBtn } from "../ui/ui.styles";

function ArticleTable() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [approving, setApproving] = useState(false);
  const [districts, setDistricts] = useState([]);
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    fetchArticles();
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const response = await getDistricts();
      if (response?.success && response?.data?.districts && Array.isArray(response.data.districts)) {
        setDistricts(response.data.districts);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchArticles = async () => {
    try {
      // Fast GET: /api/news-new/getNewsByNewsType/* (our backend, paginated)
      const response = await getArticles(1, 50);
      if (response.success) {
        const list = Array.isArray(response.data) ? response.data : [];
        setArticles(list);
        setFilteredArticles(list);
      } else {
        message.error("Failed to load articles");
      }
    } catch (error) {
      message.error("Error fetching articles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteArticle(id);
      if (response.success) {
        message.success("Article deleted successfully!");
        const updatedArticles = articles.filter(
          (article) => article._id !== id
        );
        setArticles(updatedArticles);
        setFilteredArticles(updatedArticles);
      } else {
        message.error("Failed to delete article");
      }
    } catch (error) {
      message.error("Error deleting article");
    }
  };

  const handleView = (article) => {
    setSelectedArticle(article);
    setIsModalVisible(true);
  };

  const handleStatusClick = (article, e) => {
    e.stopPropagation();
    if (userRole === "admin" && article.status === "pending") {
      setSelectedArticle(article);
      setIsApprovalModalVisible(true);
    }
  };

  const handleApprove = async () => {
    if (!selectedArticle) return;

    setApproving(true);
    try {
      const response = await approveNews(selectedArticle._id);
      if (response.success) {
        message.success("Article approved successfully!");
        const updatedArticles = articles.map((article) =>
          article._id === selectedArticle._id
            ? { ...article, status: "approved" }
            : article
        );
        setArticles(updatedArticles);
        setFilteredArticles(updatedArticles);
        setIsApprovalModalVisible(false);
      } else {
        message.error(response.message || "Failed to approve article");
      }
    } catch (error) {
      message.error("Error approving article");
    } finally {
      setApproving(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const q = (value || "").toLowerCase();
    const filtered = articles.filter((article) =>
      article.title.toLowerCase().includes(q)
    );
    setFilteredArticles(filtered);
  };

  // ✅ Updated to check version history before navigation
  const handleEdit = async (id) => {
    try {
      const res = await getHistoryById(id);
      if (res.success && Array.isArray(res.data)) {
        if (res.data.length <= 1) {
          navigate(`/edit-Article/${id}`);
        } else {
          navigate(`/article-history/${id}`);
        }
      } else {
        navigate(`/edit-Article/${id}`);
      }
    } catch (err) {
      message.warning(
        "Error checking article history. Redirecting to edit page."
      );
      navigate(`/edit-Article/${id}`);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "newsImage",
      key: "newsImage",
      width: 90,
      render: (text) => (
        <Image
          width={56}
          height={40}
          src={text}
          alt="Article"
          style={{ objectFit: "cover", borderRadius: 6 }}
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Magazine types",
      dataIndex: "magazineType",
      key: "magazineType",
      width: 150,
      ellipsis: true,
      render: (text) => {
        if (text === "magazine") {
          return "Vartha janapada";
        } else if (text === "magazine2") {
          return "March of Karnataka";
        }
        return text || "N/A";
      },
    },
    {
      title: "News type",
      dataIndex: "newsType",
      key: "newsType",
      width: 120,
      ellipsis: true,
      render: (text) => {
        if (text === "specialnews") {
          return "Special news";
        } else if (text === "statenews") {
          return "State news";
        } else if (text === "districtnews") {
          return "District news";
        }
        return text || "N/A";
      },
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
      width: 120,
      ellipsis: true,
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
      width: 120,
      ellipsis: true,
      render: (district, record) => {
        // Try to find district by ID first
        if (district) {
          const districtId = typeof district === 'object' && district?.$oid 
            ? district.$oid 
            : district;
          const districtObj = districts.find((d) => {
            const dId = typeof d._id === 'object' && d._id?.$oid ? d._id.$oid : d._id;
            return dId === districtId;
          });
          if (districtObj) {
            return districtObj.district_name || "N/A";
          }
        }
        
        // If district ID not found, try to find by district_slug
        if (record.district_slug) {
          const districtBySlug = districts.find((d) => d.district_slug === record.district_slug);
          if (districtBySlug) {
            return districtBySlug.district_name || "N/A";
          }
        }
        
        return "N/A";
      },
    },
    {
      title: "Published Date",
      dataIndex: "publishedAt",
      key: "publishedAt",
      width: 120,
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status, record) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleStatusClick(record, e);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            cursor:
              userRole === "admin" && status === "pending"
                ? "pointer"
                : "default",
          }}
        >
          <StatusBadge status={status} />
          {userRole === "admin" && status === "pending" && <Check size={14} />}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Space size={4}>
          <IconActionBtn type="button" title="View" onClick={() => handleView(record)}>
            <Eye size={16} />
          </IconActionBtn>
          <IconActionBtn type="button" title="Edit" onClick={() => handleEdit(record._id)}>
            <Pencil size={16} />
          </IconActionBtn>
          {(userRole === "admin" ||
            (userRole === "moderator" &&
              record.createdBy?._id === localStorage.getItem("userId"))) && (
            <Popconfirm
              title="Are you sure to delete this article?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <IconActionBtn type="button" title="Delete" $danger>
                <Trash2 size={16} />
              </IconActionBtn>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
      <DataTableShell
        toolbar={
          <SearchBar
            placeholder="Search by Title"
            value={searchText}
            onChange={handleSearch}
            style={{ marginLeft: "auto" }}
          />
        }
        dataSource={filteredArticles}
        columns={columns}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
        emptyTitle="No articles found"
      />

      {/* Article View Modal */}
      <Modal
        title="Article Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedArticle && (
          <>
            <Image
              width="100%"
              height={300}
              src={selectedArticle.newsImage}
              alt="Article Image"
              style={{ marginBottom: 20 }}
            />

            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Title">
                {selectedArticle.title}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {selectedArticle.category?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Author">
                {selectedArticle.author || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Magazine Type">
                {selectedArticle.magazineType === "magazine"
                  ? "Vartha janapada"
                  : selectedArticle.magazineType === "magazine2"
                  ? "March of Karnataka"
                  : selectedArticle.magazineType || "N/A"}
              </Descriptions.Item>

            <Descriptions.Item label="News Type">
                            {selectedArticle.newsType === "specialnews"
                              ? "Special news"
                              : selectedArticle.newsType === "statenews"
                              ? "State news"
                              : selectedArticle.newsType === "districtnews"
                              ? "District news"
                              : selectedArticle.newsType || "N/A"}
                          </Descriptions.Item>
              <Descriptions.Item label="Published Date">
                {new Date(selectedArticle.publishedAt).toLocaleDateString()}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Likes & Views">
                👍 {selectedArticle.total_Likes || 0} &nbsp;&nbsp;&nbsp; 👀{" "}
                {selectedArticle.views || 0}
              </Descriptions.Item> */}
              <Descriptions.Item label="Status">
                <StatusBadge status={selectedArticle.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {selectedArticle.createdBy?.displayName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Main Description">
                {selectedArticle.description || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Kannada Description">
                {selectedArticle.kannada?.description || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Hindi Description">
                {selectedArticle.hindi?.description || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="English Description">
                {selectedArticle.English?.description || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        title="Approve Article"
        visible={isApprovalModalVisible}
        onOk={handleApprove}
        onCancel={() => setIsApprovalModalVisible(false)}
        confirmLoading={approving}
        width={700}
        okText="Approve"
        cancelText="Cancel"
      >
        {selectedArticle && (
          <>
            <Image
              width="100%"
              height={300}
              src={selectedArticle.newsImage}
              alt="Article Image"
              style={{ marginBottom: 20 }}
            />

            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Title">
                {selectedArticle.title}
              </Descriptions.Item>
              <Descriptions.Item label="Magazine type">
                {selectedArticle.magazineType}
              </Descriptions.Item>
              <Descriptions.Item label="News type">
                {selectedArticle.newsType}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {selectedArticle.category?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Author">
                {selectedArticle.author || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Published Date">
                {new Date(selectedArticle.publishedAt).toLocaleDateString()}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Likes & Views">
          👍 {selectedArticle.total_Likes || 0} &nbsp;&nbsp;&nbsp; 👀 {selectedArticle.views || 0}
        </Descriptions.Item> */}
              <Descriptions.Item label="Status">
                <StatusBadge status={selectedArticle.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {selectedArticle.createdBy?.displayName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Main Description">
                {selectedArticle.description || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Kannada Description">
                {selectedArticle.kannada?.description || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Hindi Description">
                {selectedArticle.hindi?.description || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="English Description">
                {selectedArticle.English?.description || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </div>
  );
}

export default ArticleTable;
