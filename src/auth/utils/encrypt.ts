import { createHmac } from 'crypto';

/**
 * Wrapper around encryption method.
 *
 * Hardcoding hmac sha512 hash digest.
 */
const encrypt = async (text: string, salt: string) => {
  const hash = createHmac('sha512', salt);
  hash.update(text);
  const encrypted = hash.digest('base64');

  return encrypted;
};

/**
 * Wrapper around verify method.
 *
 * Just encrypts with same salt and comares result.
 *
 * Decryption is not performed.
 */
const verify = async (
  password: string,
  salt: string,
  trialPassword: string,
) => {
  const trialEncrypted = await encrypt(trialPassword, salt);
  return password === trialEncrypted;
};

export class PasswordSecurity {
  static encrypt = encrypt;
  static verify = verify;
}
