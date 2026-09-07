const socketsByUserId = new Map();

export function addUserSocket(userId, socket) {
  const userSockets = socketsByUserId.get(userId) ?? new Set();

  userSockets.add(socket);
  socketsByUserId.set(userId, userSockets);
}

export function removeUserSocket(userId, socket) {
  const userSockets = socketsByUserId.get(userId);

  if (!userSockets) {
    return;
  }

  userSockets.delete(socket);

  if (userSockets.size === 0) {
    socketsByUserId.delete(userId);
  }
}

export function getUserSockets(userId) {
  return socketsByUserId.get(userId) ?? new Set();
}
