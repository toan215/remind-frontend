import { lazy } from "react";
const AdminDashboard = lazy(() => import("../components/Admin/AdminDashboard"));
const AdminExpertCrud = lazy(() => import("../components/Admin/AdminExpertCrud"));
const AdminExpertReview = lazy(() => import("../components/Admin/AdminExpertReview").then(m => ({ default: m.AdminExpertReview })));

export type AdminRoute = "dashboard" | "expert-crud" | "expert-review";

interface AdminRouteConfig {
  path: AdminRoute;
  label: string;
  icon: string;
  component: React.ComponentType<any>;
}

export const ADMIN_ROUTES: AdminRouteConfig[] = [
  {
    path: "dashboard",
    label: "Bảng điều khiển",
    icon: "bx-grid-alt",
    component: AdminDashboard
  },
  {
    path: "expert-crud",
    label: "Quản lý Chuyên gia",
    icon: "bx-user-voice",
    component: AdminExpertCrud
  },
  {
    path: "expert-review",
    label: "Xét duyệt Chuyên gia",
    icon: "bx-user-check",
    component: AdminExpertReview
  }
];

interface AdminRouteDispatcherProps {
  currentRoute: AdminRoute;
  onNavigate: (route: AdminRoute) => void;
  onBackToHome: () => void;
}

export function AdminRouteDispatcher({ currentRoute, onNavigate, onBackToHome }: AdminRouteDispatcherProps) {
  const activeRoute = ADMIN_ROUTES.find(r => r.path === currentRoute);
  
  if (!activeRoute) {
    return <AdminDashboard onNavigate={onNavigate} />;
  }

  const Component = activeRoute.component;
  return <Component onNavigate={onNavigate} onBackToHome={onBackToHome} />;
}
