import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

export const createStudentSchema = z.object({
  fullName: z.string().min(2, 'Оқушының толық аты-жөнін жазыңыз'),
  email: z.string().email('Жарамды email адресін жазыңыз'),
  password: z.string().min(6, 'Құпиясөз кемінде 6 таңбадан тұруы керек'),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Жаңа құпиясөз кемінде 6 таңбадан тұруы керек'),
});

/**
 * List all students for current teacher
 */
export async function getTeacherStudents(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;

    const students = await prisma.user.findMany({
      where: {
        role: 'student',
        teacherId: teacherId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        createdAt: true,
        submissions: {
          where: { status: 'checked' },
          select: {
            totalScore: true,
            letterGrade: true,
          },
        },
        quizAttempts: {
          select: {
            score: true,
            maxScore: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = students.map(s => {
      const checkedExams = s.submissions.length;
      const totalExamScore = s.submissions.reduce((acc, sub) => acc + (sub.totalScore || 0), 0);
      const avgExamScore = checkedExams > 0 ? Math.round(totalExamScore / checkedExams) : null;

      const totalQuizzes = s.quizAttempts.length;
      const avgQuizPct = totalQuizzes > 0
        ? Math.round((s.quizAttempts.reduce((acc, q) => acc + (q.maxScore > 0 ? (q.score / q.maxScore) * 100 : 0), 0)) / totalQuizzes)
        : null;

      return {
        id: s.id,
        fullName: s.fullName,
        email: s.email,
        isActive: s.isActive,
        createdAt: s.createdAt,
        checkedExamsCount: checkedExams,
        avgExamScore,
        totalQuizzesCount: totalQuizzes,
        avgQuizPct,
      };
    });

    res.json({ students: formatted });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Оқушылар тізімін алу кезінде қате орын алды' });
  }
}

/**
 * Create a new student assigned to the current teacher
 */
export async function createStudent(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;
    const { fullName, email, password } = req.body;

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      res.status(400).json({ error: 'Бұл email жүйеде тіркелген. Басқа email таңдаңыз.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const student = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'student',
        teacherId: teacherId,
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: 'Оқушы сәтті тіркелді',
      student,
      initialPassword: password, // Shown once in modal
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Оқушыны қосу мүмкін болмады' });
  }
}

/**
 * Toggle student active/inactive status
 */
export async function toggleStudentActive(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;
    const { id } = req.params;

    const student = await prisma.user.findFirst({
      where: { id, teacherId, role: 'student' },
    });

    if (!student) {
      res.status(404).json({ error: 'Оқушы табылмады' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !student.isActive },
      select: { id: true, fullName: true, isActive: true },
    });

    res.json({
      message: updated.isActive ? 'Оқушы аккаунты белсендірілді' : 'Оқушы аккаунты бұғатталды',
      student: updated,
    });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({ error: 'Күйді өзгерту мүмкін болмады' });
  }
}

/**
 * Reset student password
 */
export async function resetStudentPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;
    const { id } = req.params;
    const { newPassword } = req.body;

    const student = await prisma.user.findFirst({
      where: { id, teacherId, role: 'student' },
    });

    if (!student) {
      res.status(404).json({ error: 'Оқушы табылмады' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    res.json({
      message: 'Құпиясөз сәтті жаңартылды',
      newPassword,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Құпиясөзді жаңарту мүмкін болмады' });
  }
}

/**
 * Get detailed student profile, past exams, quizzes, and progress chart data
 */
export async function getStudentDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;
    const { id } = req.params;

    const student = await prisma.user.findFirst({
      where: { id, teacherId, role: 'student' },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        createdAt: true,
        submissions: {
          include: {
            mockExam: {
              select: { title: true },
            },
          },
          orderBy: { startedAt: 'desc' },
        },
        quizAttempts: {
          include: {
            quiz: {
              select: {
                title: true,
                topic: {
                  select: { title: true, section: { select: { name: true, title: true } } },
                },
              },
            },
          },
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!student) {
      res.status(404).json({ error: 'Оқушы табылмады' });
      return;
    }

    // Prepare chart data: exam scores over time
    const chartData = student.submissions
      .filter(s => s.status === 'checked' && s.totalScore !== null)
      .reverse()
      .map(s => ({
        date: new Date(s.checkedAt || s.startedAt).toLocaleDateString('kk-KZ', { month: 'short', day: 'numeric' }),
        title: s.mockExam.title,
        score: s.totalScore,
        score1a: s.score1a,
        score1ae: s.score1ae,
        score2: s.score2,
        grade: s.letterGrade,
      }));

    res.json({ student, chartData });
  } catch (error) {
    console.error('Get student detail error:', error);
    res.status(500).json({ error: 'Оқушы мәліметтерін алу мүмкін болмады' });
  }
}
