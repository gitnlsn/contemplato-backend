import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateTaskProps } from './interfaces/ControllerParams';
import { TasksService } from './tasks.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthGuardedRequest } from '../auth/interfaces/AuthGuardedRequest';
import { DeleteTaskProps } from './interfaces/CrudProps';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAll(@Request() request: AuthGuardedRequest) {
    const { userId } = request.jwt;
    const tasks = await this.tasksService.getAll({ userId });

    return { tasks };
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Request() request: AuthGuardedRequest,
    @Body() createTaskProps: CreateTaskProps,
  ) {
    const { userId } = request.jwt;

    try {
      const tasks = await this.tasksService.create({
        userId,
        tasks: createTaskProps.tasks,
      });

      return {
        tasks,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(AuthGuard)
  @Delete()
  async delete(
    @Request() request: AuthGuardedRequest,
    @Body() deleteTaskProps: DeleteTaskProps,
  ) {
    const { userId } = request.jwt;

    try {
      const task = await this.tasksService.delete({
        userId,
        taskId: deleteTaskProps.taskId,
      });

      return {
        task,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
