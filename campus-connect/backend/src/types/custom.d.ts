declare namespace Express {
  export interface Request {
    user?: {
      _id: string;
      id: string;
      role?: string;
    };
  }
}
