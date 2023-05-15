import { randomBytes } from 'crypto';

export class Salt {
  static generate() {
    return randomBytes(Math.ceil(1024 / 2))
      .toString('hex')
      .slice(0, 32);
  }
}
