import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { JwtModule } from '@nestjs/jwt';
import { env } from '../config/env';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [TasksService, PrismaService],
  controllers: [TasksController],
})
export class TasksModule {}
