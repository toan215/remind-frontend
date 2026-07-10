import { apiHelper } from "../utils/apiHelper";
import { API_ENDPOINTS } from "../utils/constants";

export interface UserDto {
  id: string;
  email: string;
  fullName?: string;
  role: "student" | "expert" | "admin" | "system_manager";
  status: "active" | "pending" | "rejected" | "banned";
}

export interface AuthResponse {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
}

export class AuthController {
  /**
   * Logs in a user with email/name and password
   */
  static async login(identifier: string, password: string): Promise<AuthResponse> {
    try {
      const data = await apiHelper.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
        identifier,
        password,
      });

      if (data && data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      throw new Error(errorMsg);
    }
  }

  /**
   * Registers a new user account (defaults to role 'student')
   */
  static async register(
    fullname: string,
    email: string,
    password: string,
    role: "student" | "expert" = "student"
  ): Promise<AuthResponse> {
    try {
      const data = await apiHelper.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, {
        fullName: fullname,
        email,
        password,
        role,
      });

      if (data && data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Đăng ký thất bại. Vui lòng thử lại.";
      throw new Error(errorMsg);
    }
  }

  /**
   * Logs in or registers via Google access token
   */
  static async googleLogin(googleToken: string): Promise<AuthResponse> {
    const data = await apiHelper.post<AuthResponse>(API_ENDPOINTS.AUTH.GOOGLE, {
      googleToken,
    });

    if (data && data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  }

  /**
   * Logs out the current user, notifying the backend and clearing local tokens
   */
  static async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await apiHelper.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất trên server:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

  /**
   * Gets the current logged in user details from localStorage
   */
  static getCurrentUser(): UserDto | null {
    const userJson = localStorage.getItem("user");
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  /**
   * Checks if user is authenticated (checks access token existence)
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  }

  /**
   * Yêu cầu gửi mã OTP khôi phục mật khẩu tới email
   */
  static async forgotPassword(email: string): Promise<any> {
    try {
      const data = await apiHelper.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Gửi yêu cầu thất bại. Vui lòng kiểm tra lại email.";
      throw new Error(errorMsg);
    }
  }

  /**
   * Đặt lại mật khẩu mới sử dụng mã OTP đã nhận
   */
  static async resetPassword(email: string, otp: string, newPassword: string): Promise<any> {
    try {
      const data = await apiHelper.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        email,
        otp,
        newPassword,
      });
      return data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.";
      throw new Error(errorMsg);
    }
  }
}
