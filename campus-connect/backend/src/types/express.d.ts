declare namespace Express {
  interface Request {
    user?: {
      _id: string;
      id: string;
      role?: string;
    };
  }
}
