import { io, Socket } from "socket.io-client";
import { BASE_URL } from "./constants";

let adminSocket: Socket | null = null;

export const getAdminSocket = (token: string): Socket => {
  if (!adminSocket) {
    adminSocket = io(BASE_URL, {
      auth: { token },
      transports: ["websocket"],
    });
  }
  return adminSocket;
};
