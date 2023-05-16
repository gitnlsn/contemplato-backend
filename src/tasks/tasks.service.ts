import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateTaskProps,
  DeleteTaskProps,
  GetAllTasksProps,
} from './interfaces/CrudProps';

@Injectable()
export class TasksService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll({ userId }: GetAllTasksProps) {
    return await this.prismaService.task.findMany({
      where: { userId, status: 'active' },
    });
  }

  async create({ userId, tasks }: CreateTaskProps) {
    const [_, createdTasks] = await this.prismaService.$transaction([
      this.prismaService.task.createMany({
        data: tasks.map(({ content }) => ({
          content,
          userId,
        })),
      }),
      this.prismaService.task.findMany({
        where: {
          userId,
          content: {
            in: tasks.map(({ content }) => content),
          },
        },
      }),
    ]);

    return createdTasks;
  }

  async delete({ userId, taskId }: DeleteTaskProps) {
    return await this.prismaService.$transaction(async (transaction) => {
      const task = await transaction.task.findFirst({
        where: {
          userId,
          id: taskId,
        },
      });

      return await transaction.task.update({
        data: {
          status: 'deleted',
        },
        where: { id: task.id },
      });
    });
  }
}
