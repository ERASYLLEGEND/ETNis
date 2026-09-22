import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { signToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/auth';

export const loginSchema = z.object({
  email: z.string().email('Жарамды email адресін енгізіңіз'),
  password: z.string().min(6, 'Құпиясөз кемінде 6 таңбадан тұруы керек'),
});

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      res.status(401).json({ error: 'Электрондық пошта немесе құпиясөз қате' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Бұл аккаунт уақытша белсенді емес. Мұғаліміңізге хабарласыңыз.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Электрондық пошта немесе құпиясөз қате' });
      return;
    }

    const token = signToken({
      userId: user.id,
      role: user.role as 'teacher' | 'student',
      email: user.email,
      fullName: user.fullName,
      teacherId: user.teacherId,
    });

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        teacherId: user.teacherId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Жүйеге кіру кезінде қате орын алды' });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Авторизация қажет' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        role: true,
        fullName: true,
        email: true,
        teacherId: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(404).json({ error: 'Пайдаланушы табылмады немесе бұғатталған' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Пайдаланушы мәліметтерін алу мүмкін болмады' });
  }
}
