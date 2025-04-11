import { io } from 'socket.io-client';

export const socket = io('http://localhost:5002', {
  autoConnect: true,
  withCredentials: true
});

export default socket;
