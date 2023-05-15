import { JwtService } from '@nestjs/jwt';
import { PrismaClient, Role } from '@prisma/client';
import { AuthService } from '../auth.service';
import { LoginCredentials } from '../interfaces/LoginCredentials';
import { PrismaService } from '../../prisma.service';

describe('authentication', () => {
  let jwtService: JwtService;
  let prismaClient: PrismaClient;
  let authService: AuthService;

  beforeAll(() => {
    prismaClient = new PrismaClient();
    jwtService = new JwtService({ secret: 'secret' });
    authService = new AuthService(prismaClient as PrismaService, jwtService);
  });

  afterEach(async () => {
    await prismaClient.user.deleteMany({});
  });

  const defaultCredentials: LoginCredentials[] = [
    {
      username: 'username 1',
      password: 'password 1',
    },
    {
      username: 'username 2',
      password: 'password 2',
    },
  ];

  describe('register', () => {
    it('should register single user', async () => {
      await authService.register({ ...defaultCredentials[0] });

      const registeredUsers = await prismaClient.user.findMany({
        where: { username: defaultCredentials[0].username },
      });

      expect(registeredUsers.length).toBe(1);
      expect(registeredUsers).toContainEqual({
        id: expect.anything(),
        username: defaultCredentials[0].username,
        password: expect.anything(),
        salt: expect.anything(),
        role: Role.Default,
      });
    });

    it('should register two different users', async () => {
      await authService.register({ ...defaultCredentials[0] });
      await authService.register({ ...defaultCredentials[1] });

      const registeredUsers = await prismaClient.user.findMany({});

      expect(registeredUsers.length).toBe(2);
      expect(registeredUsers).toContainEqual({
        id: expect.anything(),
        username: defaultCredentials[0].username,
        password: expect.anything(),
        salt: expect.anything(),
        role: Role.Default,
      });
      expect(registeredUsers).toContainEqual({
        id: expect.anything(),
        username: defaultCredentials[1].username,
        password: expect.anything(),
        salt: expect.anything(),
        role: Role.Default,
      });
    });

    it('should not register same user', async () => {
      await authService.register({ ...defaultCredentials[0] });
      await expect(async () => {
        await authService.register({ ...defaultCredentials[0] });
      }).rejects.toThrowError();

      const registeredUsers = await prismaClient.user.findMany({});

      expect(registeredUsers.length).toBe(1);
      expect(registeredUsers).toContainEqual({
        id: expect.anything(),
        username: defaultCredentials[0].username,
        password: expect.anything(),
        salt: expect.anything(),
        role: Role.Default,
      });
    });

    it('should encode sign jwt token', async () => {
      const { token } = await authService.register({
        ...defaultCredentials[0],
      });

      const decodedToken = jwtService.decode(token);

      expect(decodedToken).toEqual({
        userId: expect.anything(),
        username: defaultCredentials[0].username,
        role: 'Default',
        iat: expect.anything(),
      });
    });
  });

  describe('login', () => {
    const registeredUser = defaultCredentials[0];
    const unregisteredUser = defaultCredentials[1];

    beforeEach(async () => {
      await authService.register({ ...registeredUser });
    });

    it('should not authenticate unregistered user', async () => {
      const token = await authService.login({ ...unregisteredUser });
      expect(token).toBe(undefined);
    });

    it('should authenticate registered user with correct login', async () => {
      const { token } = await authService.login({ ...registeredUser });
      const decoded = jwtService.decode(token);

      expect(decoded).toEqual({
        userId: expect.anything(),
        username: registeredUser.username,
        role: 'Default',
        iat: expect.anything(),
      });
    });

    it('should not authenticate registered user with incorrect password', async () => {
      const token = await authService.login({
        ...registeredUser,
        password: 'incorrect password',
      });
      expect(token).toBe(undefined);
    });
  });
});
