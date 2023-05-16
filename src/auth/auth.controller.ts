import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginCredentials } from './interfaces/LoginCredentials';
import { AuthService } from './auth.service';
import { UsernameAlreadyRegisterdExpection } from './exceptions/EmailAlreadyRegisteredException';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() credentials: LoginCredentials) {
    const response = await this.authService.login(credentials);
    if (response === undefined) {
      throw new UnauthorizedException();
    }
    const { token } = response;

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
      console.error(error);
      throw UsernameAlreadyRegisterdExpection();
    }
  }
}
