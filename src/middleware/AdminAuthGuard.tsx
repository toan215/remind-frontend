import React from "react";
import { Outlet } from "react-router-dom";
import { AuthController } from "../controllers/AuthController";

interface AdminAuthGuardProps {
  userRole?: string;
  onBackToHome?: () => void;
  children?: React.ReactNode;
}

/**
 * Route-level guard for /admin routes.
 * Directly renders the Admin Dashboard when navigating to #/admin or /admin.
 */
export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  // Always render children (Admin Dashboard) directly when accessed via state or router
  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
