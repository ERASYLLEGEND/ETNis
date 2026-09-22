import { Response } from 'express';
import { prisma } from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Teacher Dashboard Statistics
 */
export async function getTeacherStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;

    const [
      totalStudents,
      pendingSubmissionsCount,
      publishedExamsCount,
      totalTopicsCount,
      recentPendingSubmissions,
    ] = await Promise.all([
      prisma.user.count({ where: { teacherId, role: 'student' } }),
      prisma.examSubmission.count({
        where: {
          mockExam: { teacherId },
          status: 'submitted',
        },
      }),
      prisma.mockExam.count({
        where: { teacherId, status: 'published' },
      }),
      prisma.theoryTopic.count({
        where: { section: { teacherId } },
      }),
      prisma.examSubmission.findMany({
        where: {
          mockExam: { teacherId },
          status: 'submitted',
        },
        include: {
          student: { select: { id: true, fullName: true, email: true } },
          mockExam: { select: { id: true, title: true } },
        },
        orderBy: { submittedAt: 'asc' },
        take: 5,
      }),
    ]);

    res.json({
      stats: {
        totalStudents,
        pendingSubmissionsCount,
        publishedExamsCount,
        totalTopicsCount,
      },
      recentSubmissions: recentPendingSubmissions,
    });
  } catch (error) {
    console.error('Teacher stats error:', error);
    res.status(500).json({ error: 'Мұғалім статистикасын алу мүмкін болмады' });
  }
}

/**
 * Student Dashboard Statistics & Recommendations
 */
export async function getStudentStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user!.userId;

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { teacherId: true },
    });

    const teacherId = student?.teacherId;

    const [
      availableExamsCount,
      completedQuizzesCount,
      latestCheckedSubmission,
      allTopics,
      studentAttempts,
    ] = await Promise.all([
      teacherId
        ? prisma.mockExam.count({ where: { teacherId, status: 'published' } })
        : 0,
      prisma.quizAttempt.count({ where: { studentId } }),
      prisma.examSubmission.findFirst({
        where: { studentId, status: 'checked' },
        include: { mockExam: { select: { title: true } } },
        orderBy: { checkedAt: 'desc' },
      }),
      teacherId
        ? prisma.theoryTopic.findMany({
            where: { section: { teacherId } },
            include: {
              section: { select: { name: true, title: true } },
              quizzes: { select: { id: true, title: true } },
            },
          })
        : [],
      prisma.quizAttempt.findMany({
        where: { studentId },
        include: { quiz: { select: { topicId: true } } },
        orderBy: { submittedAt: 'desc' },
      }),
    ]);

    // Compute weak topics (where quiz score was < 60% or lowest)
    const topicScoreMap = new Map<string, number>();
    for (const attempt of studentAttempts) {
      const topicId = attempt.quiz.topicId;
      const pct = attempt.maxScore > 0 ? (attempt.score / attempt.maxScore) * 100 : 0;
      if (!topicScoreMap.has(topicId)) {
        topicScoreMap.set(topicId, pct);
      }
    }

    const recommendedTopics = (allTopics as any[])
      .filter((t: any) => {
        const score = topicScoreMap.get(t.id);
        // Recommend if score was low (< 65%) or not attempted yet (if has quizzes)
        return (score !== undefined && score < 65) || (score === undefined && t.quizzes.length > 0);
      })
      .slice(0, 4)
      .map((t: any) => ({
        id: t.id,
        title: t.title,
        sectionTitle: t.section.title,
        lastScore: topicScoreMap.get(t.id) ?? null,
      }));

    res.json({
      stats: {
        availableExamsCount,
        completedQuizzesCount,
        latestResult: latestCheckedSubmission
          ? {
              examTitle: latestCheckedSubmission.mockExam.title,
              totalScore: latestCheckedSubmission.totalScore,
              letterGrade: latestCheckedSubmission.letterGrade,
              checkedAt: latestCheckedSubmission.checkedAt,
            }
          : null,
      },
      recommendedTopics,
    });
  } catch (error) {
    console.error('Student stats error:', error);
    res.status(500).json({ error: 'Оқушы статистикасын алу мүмкін болмады' });
  }
}
