import { lazy } from "react";

const AdminDashboard = lazy(() => import("../components/Admin/AdminDashboard"));
const AdminExpertReview = lazy(() => import("../components/Admin/AdminExpertReview").then(m => ({ default: m.AdminExpertReview })));
const AdminFinances = lazy(() => import("../components/Admin/AdminFinances"));
const AdminCommission = lazy(() => import("../components/Admin/AdminCommission"));
const AdminPriceRequests = lazy(() => import("../components/Admin/AdminPriceRequests"));
const AdminExpertCrud = lazy(() => import("../components/Admin/AdminExpertCrud"));
const AdminUserRoles = lazy(() => import("../components/Admin/AdminUserRoles"));
const AdminModeration = lazy(() => import("../components/Admin/AdminModeration"));
const AdminForumManagement = lazy(() => import("../components/Admin/AdminForumManagement").then(m => ({ default: m.default || m.AdminForumManagement })));

export type AdminRoute =
  | "dashboard"
  | "finances"
  | "commission"
  | "expert-review"
  | "price-requests"
  | "expert-crud"
  | "user-roles"
  | "moderation"
  | "forum-management";

export interface AdminRouteConfig {
  path: AdminRoute;
  label: string;
  icon: string;
  badge?: string;
  component: React.ComponentType<any>;
}

export type AdminNavGroupId =
  | "overview"
  | "finances-pricing"
  | "expert-operations"
  | "system-moderation";

export interface AdminNavGroup {
  id: AdminNavGroupId;
  label: string;
  icon: string;
  routes: AdminRoute[];
}

// Sidebar grouped strictly according to user's specification
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Tổng quan",
    icon: "bx-grid-alt",
    routes: ["dashboard"],
  },
  {
    id: "finances-pricing",
    label: "Quản lý Tài chính & Phí",
    icon: "bx-dollar-circle",
    routes: ["finances", "commission"],
  },
  {
    id: "expert-operations",
    label: "Xét duyệt & Vận hành Chuyên gia",
    icon: "bx-user-check",
    routes: ["expert-review", "price-requests", "expert-crud"],
  },
  {
    id: "system-moderation",
    label: "Hệ thống & Diễn đàn",
    icon: "bx-cog",
    routes: ["user-roles", "moderation", "forum-management"],
  },
];

export const ADMIN_ROUTES: AdminRouteConfig[] = [
  {
    path: "dashboard",
    label: "Bảng điều khiển",
    icon: "bx-grid-alt",
    component: AdminDashboard,
  },
  {
    path: "finances",
    label: "Theo dõi Doanh thu",
    icon: "bx-line-chart",
    component: AdminFinances,
  },
  {
    path: "commission",
    label: "Phí hoa hồng",
    icon: "bx-percentage",
    component: AdminCommission,
  },
  {
    path: "expert-review",
    label: "Xét duyệt Chuyên gia",
    icon: "bx-user-check",
    component: AdminExpertReview,
  },
  {
    path: "price-requests",
    label: "Yêu cầu đổi giá",
    icon: "bx-purchase-tag-alt",
    component: AdminPriceRequests,
  },
  {
    path: "expert-crud",
    label: "Danh sách Chuyên gia",
    icon: "bx-user-voice",
    component: AdminExpertCrud,
  },
  {
    path: "user-roles",
    label: "Vai trò & Phân quyền",
    icon: "bx-user-circle",
    component: AdminUserRoles,
  },
  {
    path: "moderation",
    label: "Kiểm duyệt & Báo cáo",
    icon: "bx-shield-x",
    component: AdminModeration,
  },
  {
    path: "forum-management",
    label: "Quản lý Diễn đàn",
    icon: "bx-message-square-edit",
    component: AdminForumManagement,
  },
];

interface AdminRouteDispatcherProps {
  currentRoute: AdminRoute;
  onNavigate: (route: AdminRoute) => void;
  onBackToHome: () => void;
}

export function AdminRouteDispatcher({ currentRoute, onNavigate, onBackToHome }: AdminRouteDispatcherProps) {
  const activeRoute = ADMIN_ROUTES.find((r) => r.path === currentRoute);

  if (!activeRoute) {
    return <AdminDashboard onNavigate={onNavigate} />;
  }

  const Component = activeRoute.component;
  return <Component onNavigate={onNavigate} onBackToHome={onBackToHome} />;
}
