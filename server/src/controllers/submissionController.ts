import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { calculateNISGrade } from '../utils/gradingScale';
import { countKazakhWords } from '../utils/wordCount';

export const saveDraftSchema = z.object({
  answer1aText: z.string().optional(),
  answer1aeText: z.string().optional(),
  task2ChosenOption: z.number().nullable().optional(),
  answer2Text: z.string().optional(),
  timeSpentSeconds: z.number().optional(),
});

export const gradeSubmissionSchema = z.object({
  score1a: z.number().min(0).max(15, '1(а) балы 0-15 аралығында болуы керек'),
  score1ae: z.number().min(0).max(20, '1(ә) балы 0-20 аралығында болуы керек'),
  score2: z.number().min(0).max(25, '2-тапсырма балы 0-25 аралығында болуы керек'),
  teacherComment1a: z.string().optional(),
  teacherComment1ae: z.string().optional(),
  teacherComment2: z.string().optional(),
});

/**
 * Start a new exam attempt or resume existing in-progress attempt for student
 */
export async function startOrResumeExam(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user!.userId;
    const { mockExamId } = req.body;

    // Check if mock exam exists and is published
    const exam = await prisma.mockExam.findUnique({
      where: { id: mockExamId },
    });

    if (!exam || exam.status !== 'published') {
      res.status(404).json({ error: 'Сынақ емтихан табылмады немесе қолжетімді емес' });
      return;
    }

    // Check if there is already an in-progress submission for this student on this exam
    let submission = await prisma.examSubmission.findFirst({
      where: {
        mockExamId,
        studentId,
        status: 'in_progress',
      },
    });

    if (!submission) {
      // Check if student has another in-progress exam anywhere
      const anyInProgress = await prisma.examSubmission.findFirst({
        where: {
          studentId,
          status: 'in_progress',
        },
        include: { mockExam: { select: { title: true } } },
      });

      if (anyInProgress) {
        res.status(400).json({
          error: `Сізде аяқталмаған басқа емтихан бар: «${anyInProgress.mockExam.title}». Алдымен оны аяқтаңыз немесе тапсырыңыз.`,
          existingSubmissionId: anyInProgress.id,
        });
        return;
      }

      // Create new submission
      submission = await prisma.examSubmission.create({
        data: {
          mockExamId,
          studentId,
          status: 'in_progress',
          startedAt: new Date(),
        },
      });
    }

    res.json({
      message: 'Сынақ емтихан басталды',
      submissionId: submission.id,
      submission,
      exam,
    });
  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({ error: 'Емтиханды бастау кезінде қате орын алды' });
  }
}

/**
 * Autosave draft (student)
 */
export async function autosaveDraft(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user!.userId;
    const { id } = req.params;
    const { answer1aText, answer1aeText, task2ChosenOption, answer2Text, timeSpentSeconds } = req.body;

    const submission = await prisma.examSubmission.findFirst({
      where: { id, studentId },
    });

    if (!submission) {
      res.status(404).json({ error: 'Жұмыс табылмады' });
      return;
    }

    if (submission.status !== 'in_progress') {
      res.status(400).json({ error: 'Бұл жұмыс тапсырылған, өзгертуге болмайды' });
      return;
    }

    const updated = await prisma.examSubmission.update({
      where: { id },
      data: {
        answer1aText: answer1aText !== undefined ? answer1aText : submission.answer1aText,
        answer1aeText: answer1aeText !== undefined ? answer1aeText : submission.answer1aeText,
        task2ChosenOption: task2ChosenOption !== undefined ? task2ChosenOption : submission.task2ChosenOption,
        answer2Text: answer2Text !== undefined ? answer2Text : submission.answer2Text,
        timeSpentSeconds: timeSpentSeconds !== undefined ? timeSpentSeconds : submission.timeSpentSeconds,
      },
    });

    res.json({ message: 'Сәтті сақталды', savedAt: new Date() });
  } catch (error) {
    console.error('Autosave error:', error);
    res.status(500).json({ error: 'Автосақтау кезінде қате орын алды' });
  }
}

/**
 * Final submit exam (student)
 */
export async function submitExam(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user!.userId;
    const { id } = req.params;
    const { answer1aText, answer1aeText, task2ChosenOption, answer2Text, timeSpentSeconds } = req.body;

    const submission = await prisma.examSubmission.findFirst({
      where: { id, studentId },
      include: { mockExam: true },
    });

    if (!submission) {
      res.status(404).json({ error: 'Жұмыс табылмады' });
      return;
    }

    if (submission.status !== 'in_progress') {
      res.status(400).json({ error: 'Бұл жұмыс бұрын тапсырылған' });
      return;
    }

    const updated = await prisma.examSubmission.update({
      where: { id },
      data: {
        answer1aText: answer1aText !== undefined ? answer1aText : submission.answer1aText,
        answer1aeText: answer1aeText !== undefined ? answer1aeText : submission.answer1aeText,
        task2ChosenOption: task2ChosenOption !== undefined ? task2ChosenOption : submission.task2ChosenOption,
        answer2Text: answer2Text !== undefined ? answer2Text : submission.answer2Text,
        timeSpentSeconds: timeSpentSeconds !== undefined ? timeSpentSeconds : submission.timeSpentSeconds,
        status: 'submitted',
        submittedAt: new Date(),
      },
    });

    // Notify teacher
    await prisma.notification.create({
      data: {
        userId: submission.mockExam.teacherId,
        type: 'new_mock_exam',
        message: `Жаңа жұмыс тексеруді күтуде: «${submission.mockExam.title}» (${req.user!.fullName})`,
      },
    });

    res.json({
      message: 'Жұмыс тексеруге сәтті жіберілді! Мұғалім тексергеннен кейін баға қойылады.',
      submission: updated,
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ error: 'Жұмысты тапсыру кезінде қате орын алды' });
  }
}

/**
 * Get single submission detail
 */
export async function getSubmissionDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const submission = await prisma.examSubmission.findUnique({
      where: { id },
      include: {
        mockExam: true,
        student: {
          select: { id: true, fullName: true, email: true, teacherId: true },
        },
        checkedBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!submission) {
      res.status(404).json({ error: 'Жұмыс табылмады' });
      return;
    }

    // Role check
    if (user.role === 'student' && submission.studentId !== user.userId) {
      res.status(403).json({ error: 'Бұл жұмысты көруге рұқсатыңыз жоқ' });
      return;
    }

    if (user.role === 'teacher' && submission.mockExam.teacherId !== user.userId) {
      res.status(403).json({ error: 'Бұл жұмысты көруге рұқсатыңыз жоқ' });
      return;
    }

    // Calculate word counts
    const count1a = countKazakhWords(submission.answer1aText);
    const count1ae = countKazakhWords(submission.answer1aeText);
    const count2 = countKazakhWords(submission.answer2Text);

    res.json({
      submission,
      wordCounts: {
        count1a,
        count1ae,
        count2,
      },
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Жұмыс мәліметтерін алу кезінде қате орын алды' });
  }
}

/**
 * Get submissions list for Teacher (pending review / checked)
 */
export async function getTeacherSubmissions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;
    const statusFilter = req.query.status as string | undefined;

    const whereClause: any = {
      mockExam: { teacherId },
    };

    if (statusFilter) {
      whereClause.status = statusFilter;
    } else {
      // By default exclude in_progress
      whereClause.status = { in: ['submitted', 'checked'] };
    }

    const submissions = await prisma.examSubmission.findMany({
      where: whereClause,
      include: {
        mockExam: {
          select: { id: true, title: true },
        },
        student: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: [
        // Pending first (submitted first), then by date
        { status: 'desc' },
        { submittedAt: 'asc' },
      ],
    });

    res.json({ submissions });
  } catch (error) {
    console.error('Get teacher submissions error:', error);
    res.status(500).json({ error: 'Жұмыстар тізімін алу мүмкін болмады' });
  }
}

/**
 * Grade submission (Teacher only)
 */
export async function gradeSubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;
    const { id } = req.params;
    const {
      score1a,
      score1ae,
      score2,
      teacherComment1a,
      teacherComment1ae,
      teacherComment2,
    } = req.body;

    const submission = await prisma.examSubmission.findUnique({
      where: { id },
      include: { mockExam: true, student: true },
    });

    if (!submission || submission.mockExam.teacherId !== teacherId) {
      res.status(404).json({ error: 'Жұмыс табылмады немесе тексеруге құқығыңыз жоқ' });
      return;
    }

    const totalScore = score1a + score1ae + score2;
    const maxScore = submission.mockExam.task1aMaxScore + submission.mockExam.task1aeMaxScore + submission.mockExam.task2MaxScore;
    const gradeResult = calculateNISGrade(totalScore, maxScore);

    const updated = await prisma.examSubmission.update({
      where: { id },
      data: {
        score1a,
        score1ae,
        score2,
        totalScore,
        letterGrade: gradeResult.letterGrade,
        teacherComment1a: teacherComment1a || null,
        teacherComment1ae: teacherComment1ae || null,
        teacherComment2: teacherComment2 || null,
        status: 'checked',
        checkedAt: new Date(),
        checkedById: teacherId,
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: submission.studentId,
        type: 'exam_checked',
        message: `«${submission.mockExam.title}» бойынша жұмысыңыз тексерілді. Баға: ${gradeResult.letterGrade} (${totalScore}/${maxScore})`,
      },
    });

    res.json({
      message: 'Бағалау сәтті аяқталды!',
      submission: updated,
      gradeResult,
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ error: 'Бағалауды сақтау кезінде қате орын алды' });
  }
}
