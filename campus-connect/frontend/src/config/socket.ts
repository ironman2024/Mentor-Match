import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5002';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;
