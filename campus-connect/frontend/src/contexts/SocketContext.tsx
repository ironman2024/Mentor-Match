import React, { createContext, useContext, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const socket = io('http://localhost:5002', {
    autoConnect: false,
    withCredentials: true
  });

  useEffect(() => {
    if (user?._id) {
      socket.connect();
      socket.emit('joinRoom', user._id);

      socket.on('new_mentorship_request', (data) => {
        // Add notification handling
        console.log('New mentorship request:', data);
      });

      socket.on('mentorship_request_update', (data) => {
        // Add notification handling
        console.log('Mentorship request update:', data);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
