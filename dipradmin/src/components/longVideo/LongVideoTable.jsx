import React, { useEffect, useState } from "react";
import {
  Popconfirm,
  message,
  Space,
  Image,
  Modal,
  Tooltip,
  Descriptions,
} from "antd";
import { Eye, Pencil, Trash2, Check } from "lucide-react";
import {
  getShortVideos,
  deleteById,
  approveVideo,
  getLongVideoHistoryById,
} from "../../service/LongVideo/LongVideoService";
import { useNavigate } from "react-router-dom";
import DataTableShell from "../ui/DataTableShell";
import SearchBar from "../ui/SearchBar";
import StatusBadge from "../ui/StatusBadge";
import { IconActionBtn } from "../ui/ui.styles";

function LongVideoTable() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [approving, setApproving] = useState(false);
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    fetchVideos();
  }, []);

const fetchVideos = async () => {
  try {
    const response = await getShortVideos();

    if (response.success) {
      // ✅ Sort by createdAt in descending order (latest first)
      const sortedVideos = [...response.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setVideos(sortedVideos);
      setFilteredVideos(sortedVideos);
    } else {
      message.error("Failed to load videos");
    }
  } catch (error) {
    message.error("Error fetching videos");
    console.error("Error fetching videos:", error);
  } finally {
    setLoading(false);
  }
};


  const handleDelete = async (id) => {
    try {
      const response = await deleteById(id);
      if (response.success) {
        message.success("Video deleted successfully!");
        const updated = videos.filter((video) => video._id !== id);
        setVideos(updated);
        setFilteredVideos(updated);
      } else {
        message.error("Failed to delete video");
      }
    } catch (error) {
      message.error("Error deleting video");
    }
  };

  const handleApprove = async () => {
    if (!selectedVideo) return;
    setApproving(true);
    try {
      const response = await approveVideo(selectedVideo._id);
      if (response.success) {
        message.success("Video approved successfully!");
        const updated = videos.map((v) =>
          v._id === selectedVideo._id ? { ...v, status: "approved" } : v
        );
        setVideos(updated);
        setFilteredVideos(updated);
        setIsApprovalModalVisible(false);
      } else {
        message.error(response.message || "Failed to approve video");
      }
    } catch (error) {
      message.error("Error approving video");
    } finally {
      setApproving(false);
    }
  };

  const handleViewInNewTab = (url) => {
    window.open(url, "_blank");
  };

  // New function to handle viewing video details
  const handleViewDetails = (video) => {
    setSelectedVideo(video);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedVideo(null);
  };

  const handleSearchChange = (value) => {
    setSearchText(value);
    const q = (value || "").toLowerCase();
    const filtered = videos.filter((v) =>
      v.title?.toLowerCase().includes(q)
    );
    setFilteredVideos(filtered);
  };

  const handleStatusClick = (video) => {
    if (userRole === "admin" && video.status === "pending") {
      setSelectedVideo(video);
      setIsApprovalModalVisible(true);
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await getLongVideoHistoryById(id);
      if (res.success && Array.isArray(res.data)) {
        if (res.data.length <= 1) {
          navigate(`/edit-long-video/${id}`);
        } else {
          navigate(`/long-video-history/${id}`);
        }
      } else {
        navigate(`/edit-long-video/${id}`);
      }
    } catch (err) {
      message.warning(
        "Error checking video history. Redirecting to edit page."
      );
      navigate(`/edit-long-video/${id}`);
    }
  };

  const columns = [
    {
      title: "Thumbnail",
      dataIndex: "thumbnail",
      key: "thumbnail",
      width: 120,
      render: (thumb) => (
        <Image
          width={88}
          height={56}
          src={thumb}
          style={{ objectFit: "cover", borderRadius: 6 }}
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 200,
      ellipsis: true,
      render: (text) => text || "No title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 240,
      ellipsis: true,
      render: (text) => text || "No description",
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
      width: 130,
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
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 140,
      ellipsis: true,
      render: (_, record) => record.createdBy?.displayName || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status, record) => (
        <div
          onClick={() => handleStatusClick(record)}
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
          <IconActionBtn
            type="button"
            title="View"
            onClick={() => handleViewDetails(record)}
          >
            <Eye size={16} />
          </IconActionBtn>
          <Tooltip title="Edit">
            <IconActionBtn
              type="button"
              title="Edit"
              onClick={() => handleEdit(record._id)}
            >
              <Pencil size={16} />
            </IconActionBtn>
          </Tooltip>
          {(userRole === "admin" ||
            (userRole === "moderator" &&
              record.createdBy?._id === localStorage.getItem("userId"))) && (
            <Popconfirm
              title="Are you sure to delete this video?"
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
            onChange={handleSearchChange}
            style={{ marginLeft: "auto" }}
          />
        }
        columns={columns}
        dataSource={filteredVideos}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
        emptyTitle="No long videos found"
      />

      {/* Video Details Modal - Updated to match ShortVideosTable design */}
      <Modal
        title="Video Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedVideo && (
          <>
            {/* Video Player */}
            <div style={{ marginBottom: 20 }}>
              <video width="100%" controls style={{ marginBottom: 10 }}>
                <source src={selectedVideo.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Thumbnail */}
            <Image
              width="100%"
              height={200}
              src={selectedVideo.thumbnail}
              alt="Video Thumbnail"
              style={{
                marginBottom: 20,
                objectFit: "cover",
              }}
            />

            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Title">
                {selectedVideo.title || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedVideo.description || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Magazine Type">
                {selectedVideo.magazineType === "magazine"
                  ? "Vartha janapada"
                  : selectedVideo.magazineType === "magazine2"
                  ? "March of Karnataka"
                  : selectedVideo.magazineType || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="News Type">
                {selectedVideo.newsType === "specialnews"
                  ? "Special news"
                  : selectedVideo.newsType === "statenews"
                  ? "State news"
                  : selectedVideo.newsType === "districtnews"
                  ? "District news"
                  : selectedVideo.newsType || "N/A"}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Likes & Views">
                👍 {selectedVideo.total_Likes || 0} &nbsp;&nbsp;&nbsp; 👀{" "}
                {selectedVideo.Total_views || 0}
              </Descriptions.Item> */}
              <Descriptions.Item label="Status">
                <StatusBadge status={selectedVideo.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {selectedVideo.createdBy?.displayName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {selectedVideo.createdAt 
                  ? new Date(selectedVideo.createdAt).toLocaleDateString()
                  : "N/A"}
              </Descriptions.Item>

              {/* Translations - Add these if your long videos have translation fields */}
              {selectedVideo.kannada && (
                <>
                  <Descriptions.Item label="Kannada Title">
                    {selectedVideo.kannada?.title || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Kannada Description">
                    {selectedVideo.kannada?.description || "N/A"}
                  </Descriptions.Item>
                </>
              )}
              {selectedVideo.hindi && (
                <>
                  <Descriptions.Item label="Hindi Title">
                    {selectedVideo.hindi?.title || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hindi Description">
                    {selectedVideo.hindi?.description || "N/A"}
                  </Descriptions.Item>
                </>
              )}
              {selectedVideo.english && (
                <>
                  <Descriptions.Item label="English Title">
                    {selectedVideo.english?.title || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="English Description">
                    {selectedVideo.english?.description || "N/A"}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        title="Approve Video"
        open={isApprovalModalVisible}
        onOk={handleApprove}
        onCancel={() => setIsApprovalModalVisible(false)}
        confirmLoading={approving}
        okText="Approve"
        cancelText="Cancel"
        width={800}
      >
        {selectedVideo && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Title">
              {selectedVideo.title || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedVideo.description || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Created By">
              {selectedVideo.createdBy?.displayName || "N/A"}
            </Descriptions.Item>
            {/* <Descriptions.Item label="Total Likes">
              {selectedVideo.total_Likes || 0}
            </Descriptions.Item> */}
            <Descriptions.Item label="Status">
              <StatusBadge status={selectedVideo.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Thumbnail">
              <Image
                width={200}
                src={selectedVideo.thumbnail}
                alt="Video Thumbnail"
              />
            </Descriptions.Item>
            <Descriptions.Item label="Preview">
              <video width="100%" height="240" controls>
                <source src={selectedVideo.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default LongVideoTable;