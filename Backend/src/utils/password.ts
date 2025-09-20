import bcrypt from 'bcrypt';
// const ROUNDS = 10;

export async function hashPassword(plain: unknown) {
  if (typeof plain !== 'string' || plain.length === 0) {
    throw new Error('Invalid password input');
  }
  return bcrypt.hash(plain, 10);
}
