import AdminDashboard from "../components/Admin/AdminDashboard";
import AdminExpertCrud from "../components/Admin/AdminExpertCrud";

export type AdminRoute = "dashboard" | "expert-crud";

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
