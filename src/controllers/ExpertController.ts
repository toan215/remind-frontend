import { Expert, ExpertFormData } from "../models/Expert";
import { apiHelper } from "../utils/apiHelper";
import { API_ENDPOINTS } from "../utils/constants";

// Giả định interface này được định nghĩa ở một file model chung
interface ExpertDashboardData {
  upcomingAppointments: any[];
  stats: {
      completedSessions: number;
      monthlyEarnings: number;
      rating: number;
  };
  profileCompletion: number;
}

export class ExpertController {
  // === Dành cho vai trò Admin ===
  static async getExpertsForAdmin(): Promise<Expert[]> {
    const data = await apiHelper.get(API_ENDPOINTS.ADMIN.LIST_EXPERTS);
    return data.experts || [];
  }

  static async createExpert(data: ExpertFormData): Promise<Expert> {
    return await apiHelper.post(API_ENDPOINTS.ADMIN.CREATE_EXPERT, data);
  }

  static async updateExpert(id: number, data: Partial<ExpertFormData>): Promise<Expert> {
    return await apiHelper.put(API_ENDPOINTS.ADMIN.UPDATE_EXPERT(id), data);
  }

  static async deleteExpert(id: number): Promise<void> {
    await apiHelper.delete(API_ENDPOINTS.ADMIN.DELETE_EXPERT(id));
  }

  static async approveExpert(id: number): Promise<void> {
    await apiHelper.post(API_ENDPOINTS.ADMIN.APPROVE_EXPERT(id), {});
  }

  static async suspendExpert(id: number): Promise<void> {
    await apiHelper.post(API_ENDPOINTS.ADMIN.SUSPEND_EXPERT(id), {});
  }

  // === Dành cho vai trò Chuyên gia (Expert) ===
  static async getDashboard(): Promise<ExpertDashboardData> {
    // API_ENDPOINTS.EXPERTS.DASHBOARD sẽ trỏ tới '/api/experts/me/dashboard'
    return await apiHelper.get(API_ENDPOINTS.EXPERTS.DASHBOARD);
  }

  static async getSettings(): Promise<any> {
    return await apiHelper.get(API_ENDPOINTS.EXPERTS.SETTINGS);
  }

  static async updateSettings(settingsData: any): Promise<any> {
    return await apiHelper.put(API_ENDPOINTS.EXPERTS.SETTINGS, settingsData);
  }

  // === Dành cho Khách (Guest) ===
  static async getApprovedExpertsForGuest(): Promise<Expert[]> {
    const data = await apiHelper.get(API_ENDPOINTS.EXPERTS.LIST_APPROVED);
    return data.experts || [];
  }

  // === Logic Validate (giữ lại ở client-side) ===
  static validate(data: ExpertFormData): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!data.name.trim()) errors.name = "Tên chuyên gia không được để trống";
    if (!data.specialty.trim()) errors.specialty = "Chuyên môn không được để trống";
    if (data.languages.length === 0) errors.languages = "Chọn ít nhất một ngôn ngữ";
    if (data.cost < 0) errors.cost = "Chi phí phải lớn hơn hoặc bằng 0";
    if (!data.desc.trim()) errors.desc = "Mô tả giới thiệu không được để trống";
    return errors;
  }
}
