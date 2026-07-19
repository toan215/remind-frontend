export interface ActivityLog {
  id: string;
  action: string;
  targetName: string;
  adminName: string;
  timestamp: string;
  type: "approve" | "suspend" | "create" | "update" | "delete";
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  commission: number;
  consultations: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeExperts: number;
  totalExperts: number;
  pendingApprovals: number;
  pendingPriceRequests: number;
  revenue: number;
  monthlyRevenue: number;
  activeConsultations: number;
  reportedPosts: number;
  averageRating: number;
  commissionRate: number;
  recentActions: ActivityLog[];
  revenueChartData?: RevenuePoint[];
}
