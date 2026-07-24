import React, { useState } from "react";
import { Drawer, Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar.jsx";
import TopNavbar from "./TopNavbar.jsx";

const { Sider, Content } = Layout;

const BaseLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <Sider
        width={260}
        theme="light"
        breakpoint="lg"
        collapsedWidth={0}
        trigger={null}
        style={{
          background: "#fff",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          overflow: "hidden",
          zIndex: 100,
          borderRight: "1px solid #E5E7EB",
        }}
        className="cms-sider-desktop"
      >
        <Sidebar />
      </Sider>

      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        width={280}
        styles={{ body: { padding: 0 } }}
        className="cms-sider-drawer"
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Layout
        className="cms-main-layout"
        style={{
          marginLeft: 260,
          minHeight: "100vh",
          background: "#F8FAFC",
        }}
      >
        <TopNavbar onMenuClick={() => setMobileOpen(true)} />
        <Content
          style={{
            margin: 0,
            padding: "20px 20px 28px",
            background: "#F8FAFC",
            minHeight: "calc(100vh - 68px)",
            overflowX: "hidden",
          }}
          className="page-fade"
        >
          <Outlet />
        </Content>
      </Layout>

      <style>{`
        @media (max-width: 992px) {
          .cms-sider-desktop {
            display: none !important;
          }
          .cms-main-layout {
            margin-left: 0 !important;
          }
        }
        @media (min-width: 993px) {
          .cms-sider-drawer {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default BaseLayout;
