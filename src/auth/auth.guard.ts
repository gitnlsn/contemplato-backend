import {
  Injectable,
  CanActivate,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from '../config/env';
import { JwtPayload } from './interfaces/JwtPayload';

// Sample code from official docs (2023-05-14)
// https://docs.nestjs.com/security/authentication#implementing-the-authentication-guard
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const jwt = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: env.JWT_SECRET,
      });
      request['jwt'] = jwt;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // @ts-expect-error
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
