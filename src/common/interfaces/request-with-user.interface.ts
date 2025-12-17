import { Request } from 'express';
import { UserRole } from '../constants/roles.enum';

// Type alias evita conflictos de herencia con Express Request
export type RequestWithUser = Request & {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
};
