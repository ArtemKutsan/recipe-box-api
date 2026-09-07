import { Server } from 'socket.io';
import config from '#config/index.js';
import { getSessionTokenFromRequest } from '#api/v1/modules/auth/session/cookie.js';
import { findUserBySessionToken } from '#api/v1/modules/auth/session/service.js';
import { addUserSocket, removeUserSocket } from './registry.js';

const SOCKET_PATH = '/api/v1/socket.io';

function buildUnauthorizedError() {
  const error = new Error('Authentication is required.');
  error.data = { code: 'UNAUTHORIZED' };
  return error;
}

// Подключаем Socket.IO к тому же серверу и проверяем ту же cookie-сессию.
export function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    path: SOCKET_PATH,
    cors: config.app.clientOrigin
      ? { origin: config.app.clientOrigin, credentials: true }
      : undefined,
  });

  // Cookie с Path=/api/v1 доступна этому handshake-пути.
  io.use(async (socket, next) => {
    try {
      const sessionToken = getSessionTokenFromRequest(socket.request);
      const user = await findUserBySessionToken(sessionToken);

      if (!user) {
        throw buildUnauthorizedError();
      }

      socket.data.user = user;
      return next();
    } catch (error) {
      return next(error);
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user._id.toString();

    addUserSocket(userId, socket);
    socket.emit('socket:ready');

    socket.on('disconnect', () => {
      removeUserSocket(userId, socket);
    });
  });

  return io;
}
