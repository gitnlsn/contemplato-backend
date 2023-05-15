import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { LoginCredentials } from '../interfaces/LoginCredentials';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { AuthModule } from '../auth.module';
import { PrismaService } from '../../prisma.service';

describe('AuthModule', () => {
  let app: INestApplication;
  let prismaClient: PrismaService;
  let jwtService: JwtService;
  let authService: AuthService;

  const defaultCredentials: LoginCredentials = {
    username: 'username',
    password: 'password',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    prismaClient = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    authService = module.get<AuthService>(AuthService);

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await prismaClient.user.deleteMany({});
  });

  describe('POST /register', () => {
    it('should return jwt token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...defaultCredentials,
        })
        .expect(201);

      expect(response.body).toEqual({
        token: expect.anything(),
      });

      const decodedToken = jwtService.decode(response.body.token);

      expect(decodedToken).toEqual({
        userId: expect.anything(),
        username: defaultCredentials.username,
        role: 'Default',
        iat: expect.anything(),
        exp: expect.anything(),
      });
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      await authService.register({ ...defaultCredentials });
    });

    test('/login', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          ...defaultCredentials,
        })
        .expect(200);

      expect(response.body).toEqual({
        token: expect.anything(),
      });

      const decodedToken = jwtService.decode(response.body.token);

      expect(decodedToken).toEqual({
        userId: expect.anything(),
        username: defaultCredentials.username,
        role: 'Default',
        iat: expect.anything(),
        exp: expect.anything(),
      });
    });
  });
});
