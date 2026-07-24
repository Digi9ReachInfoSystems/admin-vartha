import React, { useEffect, useState } from "react";
import {
  Image,
  Popconfirm,
  message,
  Modal,
  Space,
  Descriptions,
  Select,
} from "antd";
import {
  getMagazines,
  deleteMagazine,
  approveMagazine,
  getMagazineHistory1ById,
  getMagazineByYear,
} from "../../service/Magazine/MagazineService";
import { Eye, Pencil, Trash2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTableShell from "../ui/DataTableShell";
import SearchBar from "../ui/SearchBar";
import StatusBadge from "../ui/StatusBadge";
import { IconActionBtn } from "../ui/ui.styles";

const { Option } = Select;

function MagazineTable2() {
  const [magazines, setMagazines] = useState([]);
  const [filteredMagazines, setFilteredMagazines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);
  const [selectedMagazine, setSelectedMagazine] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedYear, setSelectedYear] = useState(undefined);
  const [approving, setApproving] = useState(false);
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    fetchMagazines();
  }, []);

  const fetchMagazines = async () => {
    try {
      const response = await getMagazines();
      if (response.success) {
        setMagazines(response.data);
        setFilteredMagazines(response.data);
      } else {
        message.error("Failed to load magazines");
      }
    } catch (error) {
      message.error("Error fetching magazines");
    } finally {
      setLoading(false);
    }
  };

  const fetchMagazinesByYear = async (year) => {
    try {
      setLoading(true);
      const response = await getMagazineByYear(year);
      if (response.success) {
        setFilteredMagazines(response.data);
      } else {
        message.error("No magazines found for the selected year");
      }
    } catch (error) {
      message.error("Error fetching magazines by year");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteMagazine(id);
      if (response.success) {
        message.success("Magazine deleted successfully!");
        const updatedMagazines = magazines.filter(
          (magazine) => magazine._id !== id
        );
        setMagazines(updatedMagazines);
        setFilteredMagazines(updatedMagazines);
      } else {
        message.error(response.message || "Failed to delete magazine");
      }
    } catch (error) {
      message.error("Error deleting magazine");
    }
  };

  const handleView = (magazine) => {
    setSelectedMagazine(magazine);
    setIsModalVisible(true);
  };

  const handleStatusClick = (magazine) => {
    if (userRole === "admin" && magazine.status === "pending") {
      setSelectedMagazine(magazine);
      setIsApprovalModalVisible(true);
    }
  };

  const handleApprove = async () => {
    if (!selectedMagazine) return;
    setApproving(true);
    try {
      const response = await approveMagazine(selectedMagazine._id);
      if (response.success) {
        message.success("Magazine approved successfully!");
        const updatedMagazines = magazines.map((magazine) =>
          magazine._id === selectedMagazine._id
            ? { ...magazine, status: "approved" }
            : magazine
        );
        setMagazines(updatedMagazines);
        setFilteredMagazines(updatedMagazines);
        setIsApprovalModalVisible(false);
      } else {
        message.error(response.message || "Failed to approve magazine");
      }
    } catch (error) {
      message.error("Error approving magazine");
    } finally {
      setApproving(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const q = (value || "").toLowerCase();
    const filtered = magazines.filter((magazine) =>
      (magazine.title || "").toLowerCase().includes(q)
    );
    setFilteredMagazines(filtered);
  };

  const handleYearChange = (value) => {
    const year = value === "all" || !value ? undefined : value;
    setSelectedYear(year);
    if (year) {
      fetchMagazinesByYear(year);
    } else {
      setFilteredMagazines(magazines);
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await getMagazineHistory1ById(id);
      if (res.success && Array.isArray(res.data)) {
        if (res.data.length <= 1) {
          navigate(`/edit-varthajanapada/${id}`);
        } else {
          navigate(`/varthajanapada-history/${id}`);
        }
      } else {
        navigate(`/edit-varthajanapada/${id}`);
      }
    } catch (err) {
      message.warning(
        "Error checking magazine history. Redirecting to edit page."
      );
      navigate(`/edit-varthajanapada/${id}`);
    }
  };

  const uniqueYears = [
    ...new Set(magazines.map((mag) => mag.publishedYear).filter(Boolean)),
  ].sort((a, b) => b - a);

  const columns = [
    {
      title: "Thumbnail",
      dataIndex: "magazineThumbnail",
      key: "magazineThumbnail",
      width: 100,
      render: (text) => (
        <Image
          width={64}
          height={80}
          src={text}
          alt="Magazine Thumbnail"
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
      render: (text) => text || "N/A",
    },
    {
      title: "Edition",
      dataIndex: "editionNumber",
      key: "editionNumber",
      width: 90,
      ellipsis: true,
      render: (text) => text || "N/A",
    },
    {
      title: "Published",
      key: "published",
      width: 130,
      ellipsis: true,
      render: (_, record) => {
        const month = record.publishedMonth;
        const year = record.publishedYear;
        if (month && year) return `${month} ${year}`;
        return month || year || "N/A";
      },
    },
    {
      title: "Date",
      dataIndex: "createdTime",
      key: "createdTime",
      width: 110,
      render: (text) =>
        text ? new Date(text).toLocaleDateString() : "N/A",
    },
    {
      title: "PDF",
      dataIndex: "magazinePdf",
      key: "magazinePdf",
      width: 90,
      render: (text) =>
        text ? (
          <a href={text} target="_blank" rel="noopener noreferrer">
            View PDF
          </a>
        ) : (
          "N/A"
        ),
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
            handleStatusClick(record);
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
        <Space size={4} onClick={(e) => e.stopPropagation()}>
          <IconActionBtn
            type="button"
            title="View"
            onClick={() => handleView(record)}
          >
            <Eye size={16} />
          </IconActionBtn>
          <IconActionBtn
            type="button"
            title="Edit"
            onClick={() => handleEdit(record._id)}
          >
            <Pencil size={16} />
          </IconActionBtn>
          {(userRole === "admin" ||
            (userRole === "moderator" &&
              record.createdBy?._id === localStorage.getItem("userId"))) && (
            <Popconfirm
              title="Are you sure to delete this magazine?"
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
    <>
      <DataTableShell
        toolbar={
          <Space wrap>
            <Select
              placeholder="All Years"
              style={{ width: 150 }}
              value={selectedYear ?? "all"}
              onChange={handleYearChange}
              allowClear
            >
              <Option value="all">All Years</Option>
              {uniqueYears.map((year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
            <SearchBar
              placeholder="Search by Title"
              value={searchText}
              onChange={handleSearch}
            />
          </Space>
        }
        dataSource={filteredMagazines}
        columns={columns}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1100 }}
        emptyTitle="No magazines found"
      />

      <Modal
        title="Magazine Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={720}
        centered
      >
        {selectedMagazine && (
          <>
            <Image
              width="100%"
              height={280}
              src={selectedMagazine.magazineThumbnail}
              alt="Magazine Thumbnail"
              style={{ marginBottom: 20, objectFit: "contain" }}
            />
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Title">
                {selectedMagazine.title}
              </Descriptions.Item>
              <Descriptions.Item label="Edition Number">
                {selectedMagazine.editionNumber || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Published Date">
                {selectedMagazine.createdTime
                  ? new Date(selectedMagazine.createdTime).toLocaleDateString()
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusBadge status={selectedMagazine.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Published Month">
                {selectedMagazine.publishedMonth || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Published Year">
                {selectedMagazine.publishedYear || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {selectedMagazine.createdBy?.displayName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="PDF Link">
                {selectedMagazine.magazinePdf ? (
                  <a
                    href={selectedMagazine.magazinePdf}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View PDF
                  </a>
                ) : (
                  "N/A"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedMagazine.description || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>

      <Modal
        title="Approve Magazine"
        open={isApprovalModalVisible}
        onOk={handleApprove}
        onCancel={() => setIsApprovalModalVisible(false)}
        confirmLoading={approving}
        width={720}
        centered
        okText="Approve"
        cancelText="Cancel"
      >
        {selectedMagazine && (
          <>
            <Image
              width="100%"
              height={280}
              src={selectedMagazine.magazineThumbnail}
              alt="Magazine Thumbnail"
              style={{ marginBottom: 20, objectFit: "contain" }}
            />
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Title">
                {selectedMagazine.title}
              </Descriptions.Item>
              <Descriptions.Item label="Edition Number">
                {selectedMagazine.editionNumber || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Published Date">
                {selectedMagazine.createdTime
                  ? new Date(selectedMagazine.createdTime).toLocaleDateString()
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusBadge status={selectedMagazine.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {selectedMagazine.createdBy?.displayName || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </>
  );
}

export default MagazineTable2;
