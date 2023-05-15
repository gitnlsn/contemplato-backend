import { Salt } from './SaltFactory';

describe('SaltFactory', () => {
  it('should generate random salt', () => {
    const salts = [Salt.generate(), Salt.generate()];

    expect(salts[0]).not.toBe(salts[1]);
  });
});
