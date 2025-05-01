/**
 * Notification API
 * Send notifications to clients through sockets
 */

import { Socket } from "socket.io";
import type { APINotification } from "@workspace/types/api-types"

let sockets: Socket[] = [];

export const setupNotifications = (socket: Socket) => {
  sockets.push(socket);
}

export const removeNotifications = (socket: Socket) => {
  sockets = sockets.filter((s) => s.id !== socket.id);
}

export const sendNotificationToClients = (notification: APINotification) => {
  sockets.forEach((socket) => {
    socket.emit(`notification`, { type: 'transcode:ready', data: notification.data });
  });
};
