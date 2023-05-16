import { TasksService } from '../tasks.service';
import { PrismaService } from '../../prisma.service';
import { User } from '@prisma/client';

describe('TasksService', () => {
  let prismaService: PrismaService;
  let tasksService: TasksService;

  let user: User;
  let anotherUser: User;

  beforeAll(async () => {
    prismaService = new PrismaService();
    tasksService = new TasksService(prismaService);

    user = await prismaService.user.create({
      data: {
        username: 'username',
        password: 'password',
        salt: 'salt',
      },
    });

    anotherUser = await prismaService.user.create({
      data: {
        username: 'anotherusername',
        password: 'password',
        salt: 'salt',
      },
    });
  });

  afterAll(async () => {
    await prismaService.user.deleteMany();
  });

  afterEach(async () => {
    await prismaService.task.deleteMany();
  });

  describe('create', () => {
    it('should create single task', async () => {
      const task = await tasksService.create({
        userId: user.id,
        tasks: [{ content: 'some content' }],
      });

      expect(task).toEqual([
        {
          id: expect.anything(),
          userId: user.id,
          content: 'some content',
          status: 'active',
        },
      ]);
    });

    it('should create two different tasks', async () => {
      await tasksService.create({
        userId: user.id,
        tasks: [{ content: 'some content' }],
      });

      await tasksService.create({
        userId: user.id,
        tasks: [{ content: 'some another content' }],
      });
    });

    it('should create two task with same content', async () => {
      await tasksService.create({
        userId: user.id,
        tasks: [{ content: 'some content' }],
      });

      await tasksService.create({
        userId: user.id,
        tasks: [{ content: 'some content' }],
      });
    });
  });

  describe('delete', () => {
    beforeAll(async () => {
      await prismaService.task.createMany({
        data: [
          { userId: user.id, content: 'some content' },
          { userId: user.id, content: 'some another content' },
          { userId: anotherUser.id, content: 'some another content' },
        ],
      });
    });

    it('should set status to deleted', async () => {
      const taskToUpdate = await prismaService.task.findFirst();

      const updatedTask = await tasksService.delete({
        userId: user.id,
        taskId: taskToUpdate.id,
      });

      expect(updatedTask.status).toBe('deleted');
    });
  });

  describe('getAll', () => {
    beforeAll(async () => {
      await prismaService.task.createMany({
        data: [
          { userId: user.id, content: 'some content' },
          { userId: user.id, content: 'some another content' },
          { userId: anotherUser.id, content: 'some another content' },
        ],
      });
    });

    it('should get all task from specified user', async () => {
      const tasks = await tasksService.getAll({ userId: user.id });

      expect(tasks.length).toBe(2);

      expect(tasks).toContainEqual({
        id: expect.anything(),
        userId: user.id,
        content: 'some content',
        status: 'active',
      });

      expect(tasks).toContainEqual({
        id: expect.anything(),
        userId: user.id,
        content: 'some another content',
        status: 'active',
      });
    });
  });
});
