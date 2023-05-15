import { JwtPayload } from './JwtPayload';

export interface AuthGuardedRequest extends Request {
  jwt: JwtPayload;
}
