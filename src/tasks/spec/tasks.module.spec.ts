import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { TasksModule } from '../tasks.module';
import { JwtPayload } from '../../auth/interfaces/JwtPayload';

describe('TasksModule', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  let user: User;
  let anotherUser: User;

  let token: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TasksModule],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    app = module.createNestApplication();
    await app.init();

    user = await prismaService.user.create({
      data: {
        username: 'username',
        password: 'password',
        salt: 'salt',
      },
    });

    anotherUser = await prismaService.user.create({
      data: {
        username: 'another username',
        password: 'password',
        salt: 'salt',
      },
    });

    token = jwtService.sign({
      userId: user.id,
      username: user.username,
      role: user.role,
    } as JwtPayload);
  });

  afterEach(async () => {
    await prismaService.task.deleteMany({});
  });

  afterAll(async () => {
    await prismaService.user.deleteMany({});
  });

  describe('POST /', () => {
    it('should create tasks', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tasks: [{ content: 'some content' }, { content: 'another content' }],
        })
        .expect(201);

      expect(response.body).toEqual({
        tasks: [
          { content: 'some content', id: expect.anything(), userId: user.id },
          {
            content: 'another content',
            id: expect.anything(),
            userId: user.id,
          },
        ],
      });
    });

    it('should block unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({
          tasks: [{ content: 'some content' }, { content: 'another content' }],
        })
        .expect(401);
    });
  });

  describe('GET /', () => {
    beforeEach(async () => {
      await prismaService.task.createMany({
        data: [
          { content: 'some content', userId: user.id },
          { content: 'another content', userId: user.id },
          { content: 'other user content', userId: anotherUser.id },
        ],
      });
    });

    it('should get all tasks from given user', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        tasks: [
          { content: 'some content', id: expect.anything(), userId: user.id },
          {
            content: 'another content',
            id: expect.anything(),
            userId: user.id,
          },
        ],
      });
    });

    it('should block unauthenticated requests', async () => {
      await request(app.getHttpServer()).get('/tasks').expect(401);
    });
  });
});
