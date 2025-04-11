declare namespace Express {
  interface Request {
    user?: {
      _id: string;
    };
  }
}
