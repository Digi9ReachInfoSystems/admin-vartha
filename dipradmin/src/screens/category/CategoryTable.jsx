import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  message,
  Space,
  Tag,
  Modal,
  Typography,
  Descriptions,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  getCategories,
  deleteCategory,
  approveCategory,
} from "../../service/category/categoryservice";

const { Title } = Typography;

function CategoryTable() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [approving, setApproving] = useState(false);
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await getCategories();

      if (response?.success && Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (Array.isArray(response)) {
        setCategories(response);
      } else {
        message.error("Failed to load categories");
      }
    } catch (error) {
      message.error("Error fetching categories");
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete category
  const handleDelete = async (id) => {
    try {
      const response = await deleteCategory(id);
      if (
        response?.success ||
        response?.message === "Category deleted successfully"
      ) {
        message.success("Category deleted successfully!");
        setCategories(categories.filter((item) => item._id !== id));
      } else {
        message.error("Failed to delete category");
      }
    } catch (error) {
      message.error("Error deleting category");
      console.error("Error deleting category:", error);
    }
  };

  // ✅ View modal
  const handleView = (category) => {
    setSelectedCategory(category);
    setViewModalVisible(true);
  };

  // ✅ Open approve modal
  const handleApproveClick = (category) => {
    setSelectedCategory(category);
    setApprovalModalVisible(true);
  };

  // ✅ Approve category using your API
  const handleApprove = async () => {
    if (!selectedCategory) return;
    setApproving(true);

    try {
      const response = await approveCategory(selectedCategory._id);

      if (response?.success) {
        message.success("Category approved successfully!");
        setCategories((prev) =>
          prev.map((item) =>
            item._id === selectedCategory._id
              ? { ...item, status: "approved" }
              : item
          )
        );
        setApprovalModalVisible(false);
      } else {
        message.error(response?.message || "Failed to approve category");
      }
    } catch (error) {
      message.error("Error approving category");
      console.error("Error approving category:", error);
    } finally {
      setApproving(false);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => text || "No name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "No description",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Tag
          color={
            status === "approved"
              ? "green"
              : status === "rejected"
              ? "red"
              : "orange"
          }
          style={{
            cursor:
              role === "admin" && status !== "approved" ? "pointer" : "default",
          }}
          onClick={() =>
            role === "admin" &&
            status !== "approved" &&
            handleApproveClick(record)
          }
        >
          {status.toUpperCase()}
          {role === "admin" && status !== "approved" && (
            <span style={{ marginLeft: 5 }}>
              <CheckOutlined />
            </span>
          )}
        </Tag>
      ),
    },
     {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (_, record) => (
        <span>{record.createdBy?.displayName || "Unknown"}</span>
      )
    },
    {
      title: "Created Time",
      dataIndex: "createdTime",
      key: "createdTime",
      render: (time) =>
        time ? new Date(time).toLocaleString() : "Not available",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          {(role === "admin" ||
            (role === "moderator" &&
              record.createdBy?._id === localStorage.getItem("userId"))) && (
            <Popconfirm
              title="Are you sure to delete this category?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={categories}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      {/* View Modal */}
      <Modal
        title="Category Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedCategory && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">
              {selectedCategory.name || "No name"}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedCategory.description || "No description"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={
                  selectedCategory.status === "approved"
                    ? "green"
                    : selectedCategory.status === "rejected"
                    ? "red"
                    : "orange"
                }
              >
                {selectedCategory.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created Time">
              {selectedCategory.createdTime
                ? new Date(selectedCategory.createdTime).toLocaleString()
                : "Not available"}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {selectedCategory.last_updated
                ? new Date(selectedCategory.last_updated).toLocaleString()
                : "Not available"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        title="Approve Category"
        open={approvalModalVisible}
        onOk={handleApprove}
        onCancel={() => setApprovalModalVisible(false)}
        confirmLoading={approving}
        okText="Approve"
        cancelText="Cancel"
        width={700}
      >
        {selectedCategory && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Name">
              {selectedCategory.name || "No name"}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedCategory.description || "No description"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={
                  selectedCategory.status === "approved"
                    ? "green"
                    : selectedCategory.status === "rejected"
                    ? "red"
                    : "orange"
                }
              >
                {selectedCategory.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created Time">
              {selectedCategory.createdTime
                ? new Date(selectedCategory.createdTime).toLocaleString()
                : "Not available"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default CategoryTable;
