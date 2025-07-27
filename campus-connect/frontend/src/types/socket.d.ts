import { Socket as BaseSocket } from 'socket.io-client';
import { Project } from './project';

interface ServerToClientEvents {
  new_project: (project: Project) => void;
}

interface ClientToServerEvents {
  join_room: (roomId: string) => void;
}

// Extend the Socket interface without recursive reference
export interface CustomSocket extends BaseSocket<ServerToClientEvents, ClientToServerEvents> {}
