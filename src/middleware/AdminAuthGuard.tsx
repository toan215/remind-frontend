import { Navigate, Outlet } from "react-router-dom";
import { AuthController } from "../controllers/AuthController";

/**
 * Route-level guard for /admin/* routes.
 * Checks localStorage for a valid admin session.
 * Redirects to /admin (login) if not authenticated as admin.
 */
export default function AdminAuthGuard() {
  const user = AuthController.getCurrentUser();
  const isAuthenticated = AuthController.isAuthenticated();

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin" replace />;
  }

  if (user.role !== "admin" && user.role !== "system_manager") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
