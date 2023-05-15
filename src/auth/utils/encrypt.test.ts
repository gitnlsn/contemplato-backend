import { PasswordSecurity } from './encrypt';

describe('encrypt - verify', () => {
  it('should validate correct password', async () => {
    const encrypted = await PasswordSecurity.encrypt('password', 'salt');

    const failingPasswordResult = await PasswordSecurity.verify(
      encrypted,
      'salt',
      'trial password',
    );

    const successfulPasswordResult = await PasswordSecurity.verify(
      encrypted,
      'salt',
      'password',
    );

    expect(failingPasswordResult).toBe(false);
    expect(successfulPasswordResult).toBe(true);
  });
});
