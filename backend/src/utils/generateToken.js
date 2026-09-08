import jwt from 'jsonwebtoken';

export const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_fallback';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, {
    expiresIn,
  });
};