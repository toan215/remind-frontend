import { apiHelper } from "../utils/apiHelper";
import { API_ENDPOINTS } from "../utils/constants";
import { UserDto } from "./AuthController";

export type UserRoleType = UserDto["role"];
export type UserStatusType = UserDto["status"];

export interface AdminUser extends UserDto {
  _id: string;
  createdAt?: string;
}

export class UserController {
  /**
   * Lấy thông tin cá nhân mới nhất từ server và lưu vào localStorage
   */
  static async getProfile(): Promise<UserDto> {
    try {
      const response = await apiHelper.get<{ user: UserDto }>(API_ENDPOINTS.USERS.PROFILE);
      if (response && response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        return response.user;
      }
      throw new Error("Không thể tải thông tin cá nhân");
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Lỗi khi lấy thông tin cá nhân.";
      throw new Error(errorMsg);
    }
  }

  /**
   * Cập nhật thông tin cá nhân (họ tên và/hoặc chế độ ẩn danh)
   */
  static async updateProfile(fullName?: string, isAnonymous?: boolean): Promise<UserDto> {
    try {
      const response = await apiHelper.put<{ user: UserDto }>(API_ENDPOINTS.USERS.PROFILE, {
        fullName,
        isAnonymous,
      });
      if (response && response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        return response.user;
      }
      throw new Error("Không thể cập nhật thông tin cá nhân");
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Cập nhật thất bại. Vui lòng thử lại.";
      throw new Error(errorMsg);
    }
  }

  /**
   * Thay đổi mật khẩu tài khoản
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiHelper.put(API_ENDPOINTS.USERS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Đổi mật khẩu thất bại. Vui lòng thử lại.";
      throw new Error(errorMsg);
    }
  }

  /**
   * Tải lên ảnh đại diện (avatar)
   */
  static async uploadAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      // Lưu ý: Đối với FormData, chúng ta cần truyền Header multipart/form-data
      const response = await apiHelper.put<{ message: string; avatar: string; user: UserDto }>(
        API_ENDPOINTS.USERS.AVATAR,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response && response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        return response.avatar;
      }
      throw new Error("Không nhận được dữ liệu phản hồi từ server");
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Tải lên ảnh đại diện thất bại.";
      throw new Error(errorMsg);
    }
  }

  // === Admin: User role & permission management ===
  static async listUsers(): Promise<AdminUser[]> {
    const res = await apiHelper.get<{ users: AdminUser[] }>(API_ENDPOINTS.USERS.LIST);
    return res.users || [];
  }

  static async updateUserRole(id: string | number, role: UserRoleType): Promise<AdminUser> {
    const res = await apiHelper.put<{ user: AdminUser }>(API_ENDPOINTS.USERS.UPDATE_ROLE(id), { role });
    return res.user;
  }

  static async banUser(id: string | number): Promise<AdminUser> {
    const res = await apiHelper.post<{ user: AdminUser }>(API_ENDPOINTS.USERS.BAN(id), {});
    return res.user;
  }

  static async unbanUser(id: string | number): Promise<AdminUser> {
    const res = await apiHelper.post<{ user: AdminUser }>(API_ENDPOINTS.USERS.UNBAN(id), {});
    return res.user;
  }
}
