declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {}; //makes the file a module rather than a script
