import { getUserSockets } from './registry.js';

export function emitToUser(userId, eventName, payload) {
  const userSockets = getUserSockets(userId);

  for (const socket of userSockets) {
    socket.emit(eventName, payload);
  }

  return userSockets.size;
}
