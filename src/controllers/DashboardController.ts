import { DashboardStats, ActivityLog } from "../models/DashboardStats";
import { apiHelper } from "../utils/apiHelper";
import { API_ENDPOINTS } from "../utils/constants";

export class DashboardController {
  static async getAdminStats(): Promise<DashboardStats> {
    // Giả định backend trả về một đối tượng đầy đủ bao gồm cả `recentActions`
    // Trong thực tế, bạn có thể cần gọi 2 endpoints riêng biệt
    const statsData = await apiHelper.get<DashboardStats>(API_ENDPOINTS.ADMIN.DASHBOARD_STATS);
    const logsData = await apiHelper.get<{logs: ActivityLog[]}>(API_ENDPOINTS.ADMIN.ACTIVITY_LOG);

    return {
      ...statsData,
      recentActions: logsData.logs || []
    };
  }
}
