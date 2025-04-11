import { Socket } from 'socket.io-client';
import { Project } from '../interfaces/Project';

interface ServerToClientEvents {
  new_project: (project: Project) => void;
}

interface ClientToServerEvents {
  join_room: (roomId: string) => void;
}

declare module 'socket.io-client' {
  export interface Socket extends Socket<ServerToClientEvents, ClientToServerEvents> {}
}
