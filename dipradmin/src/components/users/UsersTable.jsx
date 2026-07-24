import React, { useEffect, useState } from "react";
import {
  Avatar,
  Tag,
  Button,
  Space,
  Tooltip,
  Tabs,
  Modal,
  Form,
  Input,
  message,
  Descriptions,
} from "antd";
import { Eye, Trash2, User, Plus } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import {
  getUsers,
  createModerator,
  getUserById,
  deleteUser,
  createAdmin,
} from "../../service/User/UserApi";
import DataTableShell from "../ui/DataTableShell";
import { IconActionBtn } from "../ui/ui.styles";

const moment = window.moment;
const { TabPane } = Tabs;

function getLoggedInIdentity() {
  const token = localStorage.getItem("token");
  let fromToken = {};
  if (token) {
    try {
      fromToken = jwtDecode(token) || {};
    } catch {
      fromToken = {};
    }
  }

  const userId =
    localStorage.getItem("userId") ||
    fromToken.id ||
    fromToken.userId ||
    null;
  const email = (
    localStorage.getItem("userEmail") ||
    fromToken.email ||
    ""
  )
    .toString()
    .toLowerCase();

  if (userId && !localStorage.getItem("userId")) {
    localStorage.setItem("userId", String(userId));
  }
  if (email && !localStorage.getItem("userEmail")) {
    localStorage.setItem("userEmail", email);
  }

  return { userId: userId ? String(userId) : null, email };
}

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [form] = Form.useForm();
  const [modalType, setModalType] = useState(""); // 'moderator' or 'admin'
  const currentUserRole = localStorage.getItem("role");
  const { userId: currentUserId, email: currentUserEmail } =
    getLoggedInIdentity();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsersByRole();
  }, [users, activeTab]);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsersByRole = () => {
    let filtered = [];
    switch (activeTab) {
      case "users":
        filtered = users.filter((user) => user.role === "user");
        break;
      case "moderators":
        // If current user is moderator, don't show moderators tab
        if (currentUserRole !== "moderator") {
          filtered = users.filter((user) => user.role === "moderator");
        }
        break;
      case "admins":
        // Only show admins tab if current user is admin
        if (currentUserRole === "admin") {
          filtered = users.filter((user) => user.role === "admin");
        }
        break;
      default:
        filtered = users;
    }
    setFilteredUsers(filtered);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleCreateModerator = () => {
    setModalType("moderator");
    setIsModalVisible(true);
  };

  const handleCreateAdmin = () => {
    setModalType("admin");
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setModalType("");
    form.resetFields();
  };

  const handleViewModalCancel = () => {
    setIsViewModalVisible(false);
    setCurrentUser(null);
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await getUserById(userId);
      if (response.success) {
        setCurrentUser(response.data);
        setIsViewModalVisible(true);
      } else {
        message.error(response.message || "Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      message.error("Error fetching user details");
    }
  };

  const handleSubmit = async (values) => {
    try {
      let response;
      
      if (modalType === "moderator") {
        response = await createModerator(values);
      } else if (modalType === "admin") {
        response = await createAdmin(values);
      }
      
      if (response.success) {
        message.success(`${modalType === 'moderator' ? 'Moderator' : 'Admin'} created successfully!`);
        fetchUsers();
        setIsModalVisible(false);
        setModalType("");
        form.resetFields();
      } else {
        message.error(response.message || `Failed to create ${modalType}`);
      }
    } catch (error) {
      console.error("Detailed error:", error);
      message.error(error.message || `Error creating ${modalType}`);
    }
  };

  // Action handlers
  const showDeleteConfirm = (userId) => {
    const target = users.find((u) => String(u._id) === String(userId));
    const isSelf =
      (currentUserId && String(userId) === String(currentUserId)) ||
      (currentUserEmail &&
        target?.email &&
        String(target.email).toLowerCase() === currentUserEmail);

    if (isSelf) {
      message.warning("You cannot delete your own account.");
      return;
    }
    setUserToDelete(userId);
    setDeleteConfirmVisible(true);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteUser(userToDelete);
      if (response.success) {
        message.success("User deleted successfully!");
        fetchUsers(); // Refresh the user list
      } else {
        message.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Error deleting user");
    } finally {
      setDeleteConfirmVisible(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmVisible(false);
    setUserToDelete(null);
  };

  // Get modal title based on type
  const getModalTitle = () => {
    return modalType === "moderator" ? "Create New Moderator" : "Create New Admin";
  };

  // Define table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "displayName",
      key: "displayName",
      width: 180,
      ellipsis: true,
      render: (text) => text || "N/A",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 240,
      ellipsis: true,
      render: (text) => text || "N/A",
    },
    {
      title: "Phone Number",
      dataIndex: "phone_Number",
      key: "phone_Number",
      width: 140,
      ellipsis: true,
      render: (text) => text || "—",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role) => {
        const displayRole = role === "content" ? "user" : role;

        return (
          <Tag
            color={
              displayRole === "admin"
                ? "red"
                : displayRole === "moderator"
                ? "blue"
                : "green"
            }
          >
            {(displayRole || "user").toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      fixed: "right",
      render: (_, record) => {
        const isSelf =
          (currentUserId && String(record._id) === String(currentUserId)) ||
          (currentUserEmail &&
            record.email &&
            String(record.email).toLowerCase() === currentUserEmail);

        return (
          <Space size={4}>
            <Tooltip title="View User">
              <IconActionBtn
                type="button"
                title="View"
                onClick={() => handleViewUser(record._id)}
              >
                <Eye size={16} />
              </IconActionBtn>
            </Tooltip>
            {currentUserRole === "admin" && !isSelf && (
              <IconActionBtn
                type="button"
                title="Delete"
                $danger
                onClick={() => showDeleteConfirm(record._id)}
              >
                <Trash2 size={16} />
              </IconActionBtn>
            )}
          </Space>
        );
      },
    },
  ];

  // Determine which tabs to show based on user role
  const getTabs = () => {
    if (currentUserRole === "moderator") {
      return [<TabPane tab="Users" key="users" />];
    } else if (currentUserRole === "admin") {
      return [
        <TabPane tab="Users" key="users" />,
        <TabPane tab="Moderators" key="moderators" />,
        <TabPane tab="Admins" key="admins" />,
      ];
    }
    // Default return if no role matches (shouldn't happen)
    return [<TabPane tab="Users" key="users" />];
  };

  // Get the appropriate button for the current tab
  const getCreateButton = () => {
    if (currentUserRole === "admin") {
      if (activeTab === "moderators") {
        return (
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleCreateModerator}
          >
            Create Moderator
          </Button>
        );
      } else if (activeTab === "admins") {
        return (
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleCreateAdmin}
          >
            Create Admin
          </Button>
        );
      }
    }
    return null;
  };

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        tabBarExtraContent={getCreateButton()}
      >
        {getTabs()}
      </Tabs>

      <DataTableShell
        columns={columns}
        dataSource={filteredUsers.map((user) => ({
          key: user._id,
          ...user,
        }))}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 900 }}
        emptyTitle="No users found"
      />

      {/* Create Moderator/Admin Modal */}
      <Modal
        title={getModalTitle()}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input the email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please input the password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="displayName"
            label="Display Name"
            rules={[
              { required: true, message: "Please input the display name!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone_Number"
            label="Phone Number"
            rules={[
              { required: true, message: "Please input the phone number!" },
              {
                pattern: /^[0-9]{10}$/,
                message: "Please enter a valid 10-digit phone number!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create {modalType === 'moderator' ? 'Moderator' : 'Admin'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* View User Modal */}
      <Modal
        title="User Details"
        open={isViewModalVisible}
        onCancel={handleViewModalCancel}
        footer={[
          <Button key="back" onClick={handleViewModalCancel}>
            Close
          </Button>,
        ]}
        width={700}
        centered
      >
        {currentUser && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Profile Image">
              {currentUser.profileImage ? (
                <Avatar src={currentUser.profileImage} size={64} />
              ) : (
                <Avatar icon={<User size={24} />} size={64} />
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              {currentUser.displayName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {currentUser.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone Number">
              {currentUser.phone_Number}
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag
                color={
                  currentUser.role === "admin"
                    ? "red"
                    : currentUser.role === "moderator"
                    ? "blue"
                    : "green"
                }
              >
                {currentUser.role.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created Time">
              {moment(currentUser.createdTime).format("YYYY-MM-DD HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Last Logged In">
              {currentUser.last_logged_in
                ? moment(currentUser.last_logged_in).format("YYYY-MM-DD HH:mm")
                : "Never Logged In"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={deleteConfirmVisible}
        onOk={handleDelete}
        onCancel={handleDeleteCancel}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        centered
      >
        <p>
          Are you sure you want to delete this user? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}

export default UsersTable;