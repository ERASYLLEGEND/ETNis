import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

export const saveQuizSchema = z.object({
  topicId: z.string(),
  title: z.string().min(2, 'Тест атауын енгізіңіз'),
  passingScore: z.number().default(70),
  timeLimitMinutes: z.number().nullable().optional(),
  questions: z.array(
    z.object({
      id: z.string().optional(),
      questionText: z.string().min(1, 'Сұрақ мәтінін енгізіңіз'),
      questionType: z.enum(['single_choice', 'multiple_choice', 'matching']),
      orderIndex: z.number().default(0),
      points: z.number().default(1),
      options: z.array(
        z.object({
          id: z.string().optional(),
          optionText: z.string().min(1, 'Жауап нұсқасын енгізіңіз'),
          isCorrect: z.boolean().default(false),
          orderIndex: z.number().default(0),
        })
      ).optional(),
      matchingPairs: z.array(
        z.object({
          id: z.string().optional(),
          leftItemText: z.string().min(1, 'Сол жақ сәйкестікті енгізіңіз'),
          rightItemText: z.string().min(1, 'Оң жақ сәйкестікті енгізіңіз'),
          orderIndex: z.number().default(0),
        })
      ).optional(),
    })
  ),
});

/**
 * Get quiz by ID (for student or teacher)
 */
export async function getQuizById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        topic: { select: { id: true, title: true, section: { select: { title: true } } } },
        questions: {
          include: {
            options: true,
            matchingPairs: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!quiz) {
      res.status(404).json({ error: 'Мини-тест табылмады' });
      return;
    }

    if (user.role === 'teacher') {
      res.json({ quiz });
      return;
    }

    // For student: hide `isCorrect` from options, and shuffle matching right-side items
    const sanitizedQuestions = quiz.questions.map(q => {
      if (q.questionType === 'matching') {
        const shuffledRight = [...q.matchingPairs]
          .map(p => ({ id: p.id, rightText: p.rightItemText }))
          .sort(() => Math.random() - 0.5);

        return {
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          orderIndex: q.orderIndex,
          points: q.points,
          leftItems: q.matchingPairs.map(p => ({ id: p.id, leftText: p.leftItemText })),
          shuffledRightItems: shuffledRight,
        };
      }

      // Single or multiple choice
      return {
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        orderIndex: q.orderIndex,
        points: q.points,
        options: q.options.map(opt => ({
          id: opt.id,
          optionText: opt.optionText,
          orderIndex: opt.orderIndex,
        })),
      };
    });

    res.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        topic: quiz.topic,
        passingScore: quiz.passingScore,
        timeLimitMinutes: quiz.timeLimitMinutes,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Тестті жүктеу мүмкін болмады' });
  }
}

/**
 * Create or replace Quiz (Teacher)
 */
export async function saveQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;
    const data = req.body;

    // Verify topic belongs to teacher
    const topic = await prisma.theoryTopic.findUnique({
      where: { id: data.topicId },
      include: { section: true },
    });

    if (!topic || topic.section.teacherId !== teacherId) {
      res.status(403).json({ error: 'Бұл тақырыпқа тест қосуға құқығыңыз жоқ' });
      return;
    }

    // Check if quiz exists for this topic
    let quiz = await prisma.quiz.findFirst({
      where: { topicId: data.topicId },
    });

    if (quiz) {
      // Delete old questions to rebuild cleanly
      await prisma.quizQuestion.deleteMany({
        where: { quizId: quiz.id },
      });

      quiz = await prisma.quiz.update({
        where: { id: quiz.id },
        data: {
          title: data.title,
          passingScore: data.passingScore || 70,
          timeLimitMinutes: data.timeLimitMinutes || null,
        },
      });
    } else {
      quiz = await prisma.quiz.create({
        data: {
          topicId: data.topicId,
          title: data.title,
          passingScore: data.passingScore || 70,
          timeLimitMinutes: data.timeLimitMinutes || null,
        },
      });
    }

    // Insert questions
    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      const createdQuestion = await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          questionText: q.questionText,
          questionType: q.questionType,
          orderIndex: i,
          points: q.points || 1,
        },
      });

      if (q.questionType === 'matching' && q.matchingPairs) {
        for (let j = 0; j < q.matchingPairs.length; j++) {
          const pair = q.matchingPairs[j];
          await prisma.quizMatchingPair.create({
            data: {
              questionId: createdQuestion.id,
              leftItemText: pair.leftItemText,
              rightItemText: pair.rightItemText,
              orderIndex: j,
            },
          });
        }
      } else if (q.options) {
        for (let k = 0; k < q.options.length; k++) {
          const opt = q.options[k];
          await prisma.quizOption.create({
            data: {
              questionId: createdQuestion.id,
              optionText: opt.optionText,
              isCorrect: !!opt.isCorrect,
              orderIndex: k,
            },
          });
        }
      }
    }

    res.status(200).json({ message: 'Мини-тест сәтті сақталды!', quizId: quiz.id });
  } catch (error) {
    console.error('Save quiz error:', error);
    res.status(500).json({ error: 'Тестті сақтау кезінде қате орын алды' });
  }
}

/**
 * Submit Quiz Attempt (Student)
 */
export async function submitQuizAttempt(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user!.userId;
    const { id } = req.params;
    const { answers } = req.body; // { [questionId: string]: string | string[] | { [pairId: string]: string } }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
            matchingPairs: true,
          },
        },
      },
    });

    if (!quiz) {
      res.status(404).json({ error: 'Тест табылмады' });
      return;
    }

    let earnedScore = 0;
    let maxScore = 0;
    const feedback: any[] = [];

    for (const q of quiz.questions) {
      maxScore += q.points;
      const studentAnswer = answers?.[q.id];
      let isCorrect = false;

      if (q.questionType === 'single_choice') {
        const correctOpt = q.options.find(o => o.isCorrect);
        isCorrect = correctOpt ? correctOpt.id === studentAnswer : false;
        if (isCorrect) earnedScore += q.points;

        feedback.push({
          questionId: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          isCorrect,
          pointsEarned: isCorrect ? q.points : 0,
          maxPoints: q.points,
          studentAnswer: q.options.find(o => o.id === studentAnswer)?.optionText || 'Жауап берілмеді',
          correctAnswer: correctOpt?.optionText || '',
        });
      } else if (q.questionType === 'multiple_choice') {
        const correctOptIds = q.options.filter(o => o.isCorrect).map(o => o.id).sort();
        const selectedIds = Array.isArray(studentAnswer) ? [...studentAnswer].sort() : [];
        isCorrect = JSON.stringify(correctOptIds) === JSON.stringify(selectedIds);
        if (isCorrect) earnedScore += q.points;

        feedback.push({
          questionId: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          isCorrect,
          pointsEarned: isCorrect ? q.points : 0,
          maxPoints: q.points,
          studentAnswer: q.options.filter(o => selectedIds.includes(o.id)).map(o => o.optionText),
          correctAnswer: q.options.filter(o => o.isCorrect).map(o => o.optionText),
        });
      } else if (q.questionType === 'matching') {
        // studentAnswer is object { [pairId]: rightText }
        let matchingPairsCorrect = 0;
        const totalPairs = q.matchingPairs.length;

        const breakdown = q.matchingPairs.map(p => {
          const matchedRight = studentAnswer?.[p.id];
          const matchedCorrect = matchedRight === p.rightItemText;
          if (matchedCorrect) matchingPairsCorrect++;
          return {
            leftText: p.leftItemText,
            rightText: p.rightItemText,
            studentRightText: matchedRight || 'Таңдалмады',
            isCorrect: matchedCorrect,
          };
        });

        isCorrect = totalPairs > 0 && matchingPairsCorrect === totalPairs;
        const pointsForQuestion = totalPairs > 0 ? Math.round((matchingPairsCorrect / totalPairs) * q.points) : 0;
        earnedScore += pointsForQuestion;

        feedback.push({
          questionId: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          isCorrect,
          pointsEarned: pointsForQuestion,
          maxPoints: q.points,
          pairsBreakdown: breakdown,
        });
      }
    }

    const percentage = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 0;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        studentId,
        score: earnedScore,
        maxScore,
        submittedAt: new Date(),
        answersJson: JSON.stringify({ feedback, percentage }),
      },
    });

    res.json({
      message: 'Тест аяқталды!',
      attemptId: attempt.id,
      score: earnedScore,
      maxScore,
      percentage,
      passed: percentage >= (quiz.passingScore || 70),
      feedback,
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Тест жауаптарын тексеру кезінде қате орын алды' });
  }
}
