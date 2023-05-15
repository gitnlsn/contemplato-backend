import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  username: string;
  role: Role;
}
