import { Expert, ExpertFormData, ExpertSlot } from "../models/Expert";
import { apiHelper } from "../utils/apiHelper";
import { API_ENDPOINTS } from "../utils/constants";

const AVATARS = ["🧠", "🌿", "💡", "🤝", "🌟", "🪴", "🔆", "🕊️"];

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

  static async approveExpert(id: number | string): Promise<void> {
    await apiHelper.post(API_ENDPOINTS.ADMIN.APPROVE_EXPERT(id), {});
  }

  static async rejectExpert(id: number | string, reason: string): Promise<void> {
    await apiHelper.post(API_ENDPOINTS.ADMIN.REJECT_EXPERT(id), { reason });
  }

  static async getPendingExperts(): Promise<any[]> {
    const data = await apiHelper.get(API_ENDPOINTS.ADMIN.PENDING_EXPERTS);
    return data.experts || [];
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

  static async submitCredential(formData: FormData): Promise<any> {
    return apiHelper.post(API_ENDPOINTS.EXPERTS.CREDENTIALS, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  static async getCredentials(): Promise<any[]> {
    const data = await apiHelper.get(API_ENDPOINTS.EXPERTS.CREDENTIALS);
    return data.credentials || [];
  }

  // === Dành cho Khách (Guest) ===
  static async getApprovedExpertsForGuest(): Promise<Expert[]> {
    const data = await apiHelper.get(API_ENDPOINTS.EXPERTS.LIST_APPROVED);
    const experts: any[] = data.experts || [];
    return experts.map((e, i) => {
      const price = typeof e.priceFrom === "number" ? e.priceFrom : 0;
      const specialty = Array.isArray(e.specialties) ? e.specialties.join(", ") : e.title || "";
      return {
        id: i + 1,
        _id: e._id,
        name: e.fullName || e.title || "Chuyên gia",
        avatar: AVATARS[i % AVATARS.length],
        specialty: specialty || "Tâm lý học",
        experience: e.title || "Chuyên gia tư vấn",
        rating: "4.8",
        reviews: 0,
        languages: Array.isArray(e.languages) ? e.languages : ["Tiếng Việt"],
        cost: price,
        costDisplay: price > 0 ? `${price.toLocaleString("vi-VN")} VNĐ` : "Miễn phí",
        price,
        status: price > 0 ? "available" : "limited",
        statusLabel: price > 0 ? "Đang tuyển" : "Miễn phí",
        desc: e.bio || specialty || "Chuyên gia tư vấn tại ReMind.",
        approvalStatus: "approved",
        createdAt: e.createdAt || "",
      };
    });
  }

  static async getExpertSlots(expertId: string): Promise<ExpertSlot[]> {
    const data = await apiHelper.get(API_ENDPOINTS.EXPERTS.LIST_APPROVED + `/${expertId}/availability`);
    return data.slots || [];
  }

  static async bookAppointment(expertId: string, slotId: string) {
    return apiHelper.post(API_ENDPOINTS.APPOINTMENTS.BOOK, { expertId, slotId });
  }

  static async createAppointmentPayment(appointmentId: string) {
    return apiHelper.post(API_ENDPOINTS.PAYMENTS.APPOINTMENT, { appointmentId });
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
