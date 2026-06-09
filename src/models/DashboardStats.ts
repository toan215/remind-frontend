export interface ActivityLog {
  id: string;
  action: string;
  targetName: string;
  adminName: string;
  timestamp: string;
  type: "approve" | "suspend" | "create" | "update" | "delete";
}

export interface DashboardStats {
  totalExperts: number;
  pendingApprovals: number;
  activeConsultations: number;
  reportedPosts: number;
  averageRating: number;
  recentActions: ActivityLog[];
}
