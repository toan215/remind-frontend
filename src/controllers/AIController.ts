import { API_ENDPOINTS } from "../utils/constants";
import { apiHelper } from "../utils/apiHelper";

export const AIController = {
  chat: async (prompt: string, history: any[] = []) => {
    try {
      const response = await apiHelper.post(API_ENDPOINTS.AI.CHAT, { prompt, history });
      return response;
    } catch (error) {
      console.error("AIController chat error:", error);
      throw error;
    }
  },
};
