import { HttpException, HttpStatus } from '@nestjs/common';

export const EmailAlreadyRegisterdExpection = () =>
  new HttpException('Email already registered', HttpStatus.CONFLICT);
