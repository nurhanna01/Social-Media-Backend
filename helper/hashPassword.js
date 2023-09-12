import bcrypt, { hash } from 'bcrypt';
const hashPassword = async (plaintextPassword) => {
  const hash = await bcrypt.hash(plaintextPassword, 10);
  return hash;
};

export default hashPassword;
