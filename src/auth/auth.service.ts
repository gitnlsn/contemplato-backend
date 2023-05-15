import { Injectable } from '@nestjs/common';
import { LoginCredentials } from './interfaces/LoginCredentials';
import { Salt } from './utils/SaltFactory';
import { PasswordSecurity } from './utils/encrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaClient: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login({ username, password: trialPassword }: LoginCredentials) {
    const existingUser = await this.prismaClient.user.findFirst({
      where: { username },
    });

    if (!existingUser) {
      return undefined;
    }

    const isValidPassword = await PasswordSecurity.verify(
      existingUser.password,
      existingUser.salt,
      trialPassword,
    );

    if (!isValidPassword) {
      return undefined;
    }

    const token = this.jwtService.sign({
      userId: existingUser.id,
      username: existingUser.username,
      role: existingUser.role,
    });

    return { token, user: existingUser };
  }

  async register({ username, password }: LoginCredentials) {
    const salt = Salt.generate();
    const encryptedPassword = await PasswordSecurity.encrypt(password, salt);

    const createdUser = await this.prismaClient.user.create({
      data: { username, password: encryptedPassword, salt },
    });

    const token = this.jwtService.sign({
      userId: createdUser.id,
      username: createdUser.username,
      role: createdUser.role,
    });

    return { token, user: createdUser };
  }
}
