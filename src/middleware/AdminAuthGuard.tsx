import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthController } from "../controllers/AuthController";

interface AdminAuthGuardProps {
  userRole?: string;
  onBackToHome?: () => void;
  children?: React.ReactNode;
}

/**
 * Route-level guard for /admin/* routes.
 * Supports both react-router-dom and state-based routing.
 */
export default function AdminAuthGuard({ userRole, onBackToHome, children }: AdminAuthGuardProps) {
  const user = AuthController.getCurrentUser();
  const isAuthenticated = AuthController.isAuthenticated();

  const isStateBased = !!onBackToHome;
  const currentRole = userRole || user?.role;

  useEffect(() => {
    if (isStateBased && currentRole !== "admin" && currentRole !== "system_manager") {
      onBackToHome();
    }
  }, [currentRole, isStateBased, onBackToHome]);

  if (currentRole !== "admin" && currentRole !== "system_manager") {
    if (isStateBased) {
      return null;
    }
    return <Navigate to="/admin" replace />;
  }

  if (isStateBased && children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
