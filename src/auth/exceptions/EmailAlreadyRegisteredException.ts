import { HttpException, HttpStatus } from '@nestjs/common';

export const UsernameAlreadyRegisterdExpection = () =>
  new HttpException('Username already registered', HttpStatus.CONFLICT);
