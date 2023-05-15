import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginCredentials } from './interfaces/LoginCredentials';
import { AuthService } from './auth.service';
import { EmailAlreadyRegisterdExpection } from './exceptions/EmailAlreadyRegisteredException';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() credentials: LoginCredentials) {
    const { token } = await this.authService.login(credentials);
    if (token === undefined) {
      throw new UnauthorizedException();
    }

    return {
      token,
    };
  }

  @Post('register')
  async register(@Body() credentials: LoginCredentials) {
    try {
      const { token } = await this.authService.register(credentials);
      return { token };
    } catch (error) {
      throw EmailAlreadyRegisterdExpection();
    }
  }
}
