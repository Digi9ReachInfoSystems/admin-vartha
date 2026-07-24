import React from "react";
import { LongVideoWrapper } from "./Long-Videos.styles";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LongVideosTable from "../../components/longVideo/LongVideoTable";
import PageHeader from "../../components/ui/PageHeader";

function LongVideos() {
  const navigate = useNavigate();

  const handleAddClick = () => {
    navigate("/add-LongVideo");
  };

  return (
    <LongVideoWrapper>
      <PageHeader
        title="Long Videos"
        breadcrumbs={[{ title: "Videos" }]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddClick}
          >
            Add Video
          </Button>
        }
      />

      <div className="block-Table">
        <LongVideosTable />
      </div>
    </LongVideoWrapper>
  );
}

export default LongVideos;
