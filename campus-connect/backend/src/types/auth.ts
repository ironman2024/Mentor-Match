import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    id: string;
    role?: string;
  };
}

export interface User {
  _id: string;
  id: string;
  role?: string;
}