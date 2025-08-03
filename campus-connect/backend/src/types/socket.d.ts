declare module 'socket.io' {
  interface Socket {
    userId?: string;
    user?: any;
  }
}