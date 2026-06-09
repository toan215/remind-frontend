import { DashboardStats, ActivityLog } from "../models/DashboardStats";
import { ExpertController } from "./ExpertController";

const ACTIVITY_LOG_KEY = "remind_admin_activity_log";

const DEFAULT_LOGS: ActivityLog[] = [
  {
    id: "log1",
    action: "Phê duyệt hồ sơ chuyên gia",
    targetName: "Tư vấn viên Nguyễn Hữu Nhân",
    adminName: "Admin Moderator",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    type: "approve"
  },
  {
    id: "log2",
    action: "Cập nhật thông tin chuyên gia",
    targetName: "ThS. BS. Nguyễn Minh Anh",
    adminName: "Admin Moderator",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    type: "update"
  },
  {
    id: "log3",
    action: "Đình chỉ hoạt động chuyên gia",
    targetName: "Chuyên gia Phan Thảo C",
    adminName: "Admin Moderator",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    type: "suspend"
  }
];

export class DashboardController {
  static getStats(): DashboardStats {
    const experts = ExpertController.getExperts();
    
    const totalExperts = experts.length;
    const pendingApprovals = experts.filter(e => e.approvalStatus === "pending").length;
    
    // Average rating of approved experts with rating > 0
    const approvedWithRating = experts.filter(e => e.approvalStatus === "approved" && parseFloat(e.rating) > 0);
    const sumRatings = approvedWithRating.reduce((sum, e) => sum + parseFloat(e.rating), 0);
    const averageRating = approvedWithRating.length > 0 ? parseFloat((sumRatings / approvedWithRating.length).toFixed(1)) : 4.8;

    // Active consultations can be calculated or static
    const activeConsultations = experts.filter(e => e.approvalStatus === "approved" && e.status !== "unavailable").length * 8 + 14;

    // Get logs from local storage or seed them
    const logsData = localStorage.getItem(ACTIVITY_LOG_KEY);
    let recentActions: ActivityLog[] = [];
    if (logsData) {
      recentActions = JSON.parse(logsData);
    } else {
      localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(DEFAULT_LOGS));
      recentActions = DEFAULT_LOGS;
    }

    return {
      totalExperts,
      pendingApprovals,
      activeConsultations,
      reportedPosts: 3, // Mocked reported items
      averageRating,
      recentActions
    };
  }
}
