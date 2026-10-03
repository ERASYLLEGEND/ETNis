import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const JWT_SECRET: string = process.env.JWT_SECRET || 'et_nis_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  role: 'teacher' | 'student';
  email: string;
  fullName: string;
  teacherId?: string | null;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}
