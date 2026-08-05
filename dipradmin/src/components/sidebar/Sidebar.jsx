import React, { useMemo } from "react";
import { Menu, Button, Modal, Typography } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Newspaper,
  BookOpen,
  Clapperboard,
  Film,
  Images,
  Globe,
  Bell,
  Handshake,
  Tv,
  FolderOpen,
  MapPin,
  MessagesSquare,
  Settings,
  LogOut,
} from "lucide-react";
import {
  SidebarRoot,
  BrandBlock,
  BrandMark,
  BrandTextWrap,
  MenuScroll,
  LogoutBar,
} from "./Sidebar.Styles";
import logoimage from "../../assets/Logo.png";

const { Text } = Typography;

const icon = (Icon) => <Icon size={18} strokeWidth={1.85} className="lucide" />;

const Sidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const role = localStorage.getItem("role");
  const isAdminOrModerator = role === "admin" || role === "moderator";
  const isContentRole = role === "content";
  const canViewContent = isAdminOrModerator || isContentRole;

  const handleLogout = () => {
    Modal.confirm({
      title: "Confirm Logout",
      content: "Are you sure you want to logout?",
      okText: "Logout",
      cancelText: "Cancel",
      okType: "danger",
      centered: true,
      onOk: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      },
    });
  };

  const go = (key) => {
    navigate(key);
    onNavigate?.();
  };

  const menuItems = useMemo(() => {
    const items = [];

    if (isAdminOrModerator) {
      items.push(
        { key: "/dashboard", icon: icon(LayoutDashboard), label: "Dashboard" },
        { key: "/manage-users", icon: icon(Users), label: "Users" }
      );
    }

    if (canViewContent) {
      items.push(
        { key: "/manage-articles", icon: icon(Newspaper), label: "Articles" },
        {
          key: "/karnataka-public-news",
          icon: icon(Newspaper),
          label: "Inshorts-News",
        },
        {
          key: "/manage-varthajanapada",
          icon: icon(BookOpen),
          label: "Vartha Janapada",
        },
        {
          key: "/manage-marchofkarnataka",
          icon: icon(BookOpen),
          label: "March of Karnataka",
        },
        {
          key: "/manage-shortvideos",
          icon: icon(Clapperboard),
          label: "Short Videos",
        },
        {
          key: "/manage-longvideo",
          icon: icon(Film),
          label: "Long Videos",
        },
        { key: "/manage-photos", icon: icon(Images), label: "Photos" },
        { key: "/website-pages", icon: icon(Globe), label: "Websites" },
        {
          key: "/latestnotification",
          icon: icon(Bell),
          label: "Latest Notification",
        },
        {
          key: "/ServiceNotification",
          icon: icon(Handshake),
          label: "Our Services",
        },
        { key: "/live-tv", icon: icon(Tv), label: "Live TV" }
      );
    }

    if (isAdminOrModerator) {
      items.push(
        {
          key: "/video-categories",
          icon: icon(FolderOpen),
          label: "Video Categories",
        },
        {
          key: "/photo-categories",
          icon: icon(FolderOpen),
          label: "Photo Categories",
        },
        { key: "/districts", icon: icon(MapPin), label: "Districts" },
        {
          key: "/manage-moderation",
          icon: icon(MessagesSquare),
          label: "Comments",
        },
        {
          key: "settings",
          icon: icon(Settings),
          label: "Settings",
          children: [
            {
              key: "/settings/karnataka-dipr-integration",
              label: "Inshorts Integration",
            },
          ],
        }
      );
    }

    return items;
  }, [canViewContent, isAdminOrModerator]);

  const flatKeys = (items) =>
    items.flatMap((item) =>
      item.children?.length ? flatKeys(item.children) : [item.key]
    );

  const allKeys = flatKeys(menuItems);
  const selectedKey =
    allKeys.find((key) => currentPath === key) ||
    allKeys.find((key) => currentPath.startsWith(`${key}/`)) ||
    currentPath;

  return (
    <SidebarRoot>
      <BrandBlock>
        <BrandMark>
          <img src={logoimage} alt="Vartha Admin logo" />
        </BrandMark>
        <BrandTextWrap>
          <Text strong className="brand-title">
            Vartha Admin
          </Text>
          <Text type="secondary" className="brand-sub">
            DIPR · Government of Karnataka
          </Text>
        </BrandTextWrap>
      </BrandBlock>

      <MenuScroll>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => go(key)}
        />
      </MenuScroll>

      <LogoutBar>
        <Button
          danger
          block
          icon={<LogOut size={16} />}
          onClick={handleLogout}
          size="large"
        >
          Logout
        </Button>
      </LogoutBar>
    </SidebarRoot>
  );
};

export default Sidebar;
