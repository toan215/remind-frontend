import { io, Socket } from "socket.io-client";
import { BASE_URL } from "./constants";

let userSocket: Socket | null = null;

export const getUserSocket = (token: string): Socket => {
  if (!userSocket) {
    userSocket = io(BASE_URL, {
      auth: { token },
      transports: ["websocket"],
    });
  }
  return userSocket;
};

export const disconnectUserSocket = (): void => {
  if (userSocket) {
    userSocket.disconnect();
    userSocket = null;
  }
};
