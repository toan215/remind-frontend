import { Expert, ExpertFormData } from "../models/Expert";

const LOCAL_STORAGE_KEY = "remind_experts_list";
const ACTIVITY_LOG_KEY = "remind_admin_activity_log";

const DEFAULT_EXPERTS: Expert[] = [
  {
    id: 1,
    name: "ThS. BS. Nguyễn Minh Anh",
    avatar: "👩‍⚕️",
    specialty: "Trầm cảm",
    experience: "8 năm kinh nghiệm",
    rating: "4.9",
    reviews: 142,
    languages: ["Tiếng Việt", "Tiếng Anh"],
    cost: 450000,
    costDisplay: "450.000đ / 50 phút",
    status: "available",
    statusLabel: "Sẵn sàng hỗ trợ",
    desc: "Chuyên trị liệu nhận thức hành vi (CBT) cho người trẻ gặp áp lực học tập và công việc.",
    approvalStatus: "approved",
    createdAt: "2026-05-15T08:30:00Z",
  },
  {
    id: 2,
    name: "TS. BS. Trần Hoàng Nam",
    avatar: "👨‍⚕️",
    specialty: "Stress công việc",
    experience: "12 năm kinh nghiệm",
    rating: "5.0",
    reviews: 89,
    languages: ["Tiếng Việt"],
    cost: 600000,
    costDisplay: "600.000đ / 50 phút",
    status: "limited",
    statusLabel: "Lịch hẹn giới hạn",
    desc: "Hỗ trợ vượt qua khủng hoảng hiện sinh, stress nơi công sở và cân bằng cuộc sống.",
    approvalStatus: "approved",
    createdAt: "2026-05-20T10:15:00Z",
  },
  {
    id: 3,
    name: "Chuyên gia Tâm lý Lê Thị Mỹ Linh",
    avatar: "👩‍⚕️",
    specialty: "Mối quan hệ",
    experience: "6 năm kinh nghiệm",
    rating: "4.8",
    reviews: 75,
    languages: ["Tiếng Việt", "Tiếng Anh"],
    cost: 350000,
    costDisplay: "350.000đ / 50 phút",
    status: "available",
    statusLabel: "Sẵn sàng hỗ trợ",
    desc: "Hỗ trợ giải quyết mâu thuẫn cặp đôi, gia đình và vượt qua đổ vỡ tình cảm.",
    approvalStatus: "approved",
    createdAt: "2026-05-22T14:00:00Z",
  },
  {
    id: 4,
    name: "ThS. BS. Phạm Thanh Sơn",
    avatar: "👨‍⚕️",
    specialty: "Lo âu",
    experience: "15 năm kinh nghiệm",
    rating: "4.9",
    reviews: 210,
    languages: ["Tiếng Việt"],
    cost: 700000,
    costDisplay: "700.000đ / 50 phút",
    status: "unavailable",
    statusLabel: "Bận / Đầy lịch",
    desc: "Điều trị các hội chứng rối loạn lo âu xã hội, mất ngủ mãn tính và stress kéo dài.",
    approvalStatus: "approved",
    createdAt: "2026-05-25T09:45:00Z",
  },
  {
    id: 5,
    name: "Tư vấn viên Nguyễn Hữu Nhân",
    avatar: "🧑‍⚕️",
    specialty: "LGBTQ+",
    experience: "4 năm kinh nghiệm",
    rating: "4.7",
    reviews: 54,
    languages: ["Tiếng Việt"],
    cost: 0,
    costDisplay: "Miễn phí (Hỗ trợ cộng đồng)",
    status: "available",
    statusLabel: "Sẵn sàng hỗ trợ",
    desc: "Lắng nghe, chia sẻ và đồng hành cùng các bạn trẻ LGBTQ+ trong hành trình định vị bản thân.",
    approvalStatus: "approved",
    createdAt: "2026-06-01T11:00:00Z",
  },
  {
    id: 6,
    name: "TS. Nguyễn Văn A",
    avatar: "👨‍⚕️",
    specialty: "Trầm cảm",
    experience: "5 năm kinh nghiệm",
    rating: "0.0",
    reviews: 0,
    languages: ["Tiếng Việt"],
    cost: 400000,
    costDisplay: "400.000đ / 50 phút",
    status: "available",
    statusLabel: "Sẵn sàng hỗ trợ",
    desc: "Chuyên gia tư vấn về kiểm soát cảm xúc, vượt qua trầm cảm sau chấn thương tâm lý.",
    approvalStatus: "pending",
    createdAt: "2026-06-08T16:20:00Z",
  },
  {
    id: 7,
    name: "ThS. Lê Hoàng B",
    avatar: "👩‍⚕️",
    specialty: "Lo âu",
    experience: "7 năm kinh nghiệm",
    rating: "0.0",
    reviews: 0,
    languages: ["Tiếng Việt", "Tiếng Anh"],
    cost: 500000,
    costDisplay: "500.000đ / 50 phút",
    status: "limited",
    statusLabel: "Lịch hẹn giới hạn",
    desc: "Hỗ trợ trị liệu rối loạn lo âu lan tỏa, quản lý cơn hoảng loạn ở thanh thiếu niên.",
    approvalStatus: "pending",
    createdAt: "2026-06-09T07:10:00Z",
  },
  {
    id: 8,
    name: "Chuyên gia Phan Thảo C",
    avatar: "👩‍⚕️",
    specialty: "Stress công việc",
    experience: "10 năm kinh nghiệm",
    rating: "4.5",
    reviews: 28,
    languages: ["Tiếng Việt"],
    cost: 450000,
    costDisplay: "450.000đ / 50 phút",
    status: "unavailable",
    statusLabel: "Bận / Đầy lịch",
    desc: "Tư vấn kỹ năng vượt qua kiệt sức (burnout), xây dựng động lực làm việc và định hướng nghề nghiệp.",
    approvalStatus: "suspended",
    createdAt: "2026-05-10T15:30:00Z",
  }
];

export class ExpertController {
  static getExperts(): Expert[] {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_EXPERTS));
      return DEFAULT_EXPERTS;
    }
    return JSON.parse(data);
  }

  static saveExperts(experts: Expert[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(experts));
  }

  static addActivityLog(action: string, targetName: string, type: "approve" | "suspend" | "create" | "update" | "delete"): void {
    const logsData = localStorage.getItem(ACTIVITY_LOG_KEY);
    const logs = logsData ? JSON.parse(logsData) : [];
    
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      action,
      targetName,
      adminName: "Admin Moderator",
      timestamp: new Date().toISOString(),
      type
    };

    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify([newLog, ...logs].slice(0, 50)));
  }

  static getApprovedExpertsForGuest(): Expert[] {
    return this.getExperts().filter(e => e.approvalStatus === "approved");
  }

  static createExpert(data: ExpertFormData): Expert {
    const experts = this.getExperts();
    const newId = experts.length > 0 ? Math.max(...experts.map(e => e.id)) + 1 : 1;
    
    const costDisplay = data.cost === 0 ? "Miễn phí (Hỗ trợ cộng đồng)" : `${data.cost.toLocaleString("vi-VN")}đ / 50 phút`;
    const statusLabel = data.status === "available" ? "Sẵn sàng hỗ trợ" : data.status === "limited" ? "Lịch hẹn giới hạn" : "Bận / Đầy lịch";

    const newExpert: Expert = {
      ...data,
      id: newId,
      rating: "0.0",
      reviews: 0,
      costDisplay,
      statusLabel,
      approvalStatus: "pending", // default is pending review
      createdAt: new Date().toISOString()
    };

    experts.push(newExpert);
    this.saveExperts(experts);
    this.addActivityLog("Yêu cầu thêm mới chuyên gia", newExpert.name, "create");
    return newExpert;
  }

  static updateExpert(id: number, data: Partial<Expert>): Expert {
    const experts = this.getExperts();
    const index = experts.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Expert with ID ${id} not found`);
    }

    const current = experts[index];
    const cost = data.cost !== undefined ? data.cost : current.cost;
    const costDisplay = cost === 0 ? "Miễn phí (Hỗ trợ cộng đồng)" : `${cost.toLocaleString("vi-VN")}đ / 50 phút`;
    
    const status = data.status || current.status;
    const statusLabel = status === "available" ? "Sẵn sàng hỗ trợ" : status === "limited" ? "Lịch hẹn giới hạn" : "Bận / Đầy lịch";

    const updatedExpert: Expert = {
      ...current,
      ...data,
      costDisplay,
      statusLabel
    };

    experts[index] = updatedExpert;
    this.saveExperts(experts);
    this.addActivityLog("Cập nhật thông tin chuyên gia", updatedExpert.name, "update");
    return updatedExpert;
  }

  static deleteExpert(id: number): void {
    const experts = this.getExperts();
    const expertToDelete = experts.find(e => e.id === id);
    if (!expertToDelete) return;

    const filtered = experts.filter(e => e.id !== id);
    this.saveExperts(filtered);
    this.addActivityLog("Xóa vĩnh viễn chuyên gia", expertToDelete.name, "delete");
  }

  static approveExpert(id: number): void {
    const experts = this.getExperts();
    const index = experts.findIndex(e => e.id === id);
    if (index !== -1) {
      experts[index].approvalStatus = "approved";
      this.saveExperts(experts);
      this.addActivityLog("Phê duyệt hồ sơ chuyên gia", experts[index].name, "approve");
    }
  }

  static suspendExpert(id: number): void {
    const experts = this.getExperts();
    const index = experts.findIndex(e => e.id === id);
    if (index !== -1) {
      experts[index].approvalStatus = "suspended";
      this.saveExperts(experts);
      this.addActivityLog("Đình chỉ hoạt động chuyên gia", experts[index].name, "suspend");
    }
  }

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
