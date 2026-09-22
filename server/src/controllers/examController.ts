import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

export const createExamSchema = z.object({
  title: z.string().min(3, 'Сынақ емтихан атауын енгізіңіз'),
  textATitle: z.string().min(2, 'А мәтінінің тақырыбын енгізіңіз'),
  textAContent: z.string().min(10, 'А мәтінінің мазмұнын енгізіңіз'),
  textBTitle: z.string().min(2, 'Ә мәтінінің тақырыбын енгізіңіз'),
  textBContent: z.string().min(10, 'Ә мәтінінің мазмұнын енгізіңіз'),
  task1aInstruction: z.string().min(5, '1(а) тапсырма нұсқауын енгізіңіз'),
  task1aMaxScore: z.number().default(15),
  task1aeInstruction: z.string().min(5, '1(ә) тапсырма нұсқауын енгізіңіз'),
  task1aeWordMin: z.number().default(150),
  task1aeWordMax: z.number().default(180),
  task1aeMaxScore: z.number().default(20),
  task2Option1: z.string().min(5, '2-тапсырма 1-тақырыбын енгізіңіз'),
  task2Option2: z.string().min(5, '2-тапсырма 2-тақырыбын енгізіңіз'),
  task2Option3: z.string().min(5, '2-тапсырма 3-тақырыбын енгізіңіз'),
  task2WordMin: z.number().default(350),
  task2WordMax: z.number().default(450),
  task2MaxScore: z.number().default(25),
  timeLimitMinutes: z.number().default(135),
  scoringCriteriaJson: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
});

// Default official NIS criteria rubrics
export const DEFAULT_NIS_RUBRICS = {
  task1a: {
    title: '1(а) тапсырма: Мәтіндерді салыстырмалы талдау (15 балл)',
    ranges: [
      { range: '13-15', desc: 'Екі мәтіннің мақсаты мен аудиториясын, құрылымы мен стилін, тілдік амал-тәсілдерін терең әрі жан-жақты салыстырады. Ұқсастықтары мен айырмашылықтарын нақты мысалдармен дәйекті дәлелдейді.' },
      { range: '10-12', desc: 'Мәтіндердің негізгі ерекшеліктері мен стилін жақсы талдайды, ұқсастық пен айырмашылықтарды анықтайды, көбіне сәйкес мысалдар келтіреді.' },
      { range: '7-9', desc: 'Мәтіндерді салыстырады, бірақ талдау деңгейі орташа. Мысалдар жеткіліксіз немесе толық түсіндірілмеген.' },
      { range: '4-6', desc: 'Мәтіндерді тек үстірт салыстырады, негізгі стильдік немесе құрылымдық ерекшеліктерді ажыратуда қиналады.' },
      { range: '1-3', desc: 'Мәтіндерді салыстыруға талпыныс жасайды, бірақ талдау нақты емес, тапсырма талабынан ауытқиды.' },
      { range: '0', desc: 'Жауап жоқ немесе тапсырмаға мүлде сәйкес келмейді.' },
    ],
  },
  task1ae: {
    title: '1(ә) тапсырма: Бағытталған жазылым (20 балл)',
    ranges: [
      { range: '18-20', desc: 'Тақырып пен аудитория ерекшелігі толық сақталған. Жанрға сай сөздер мен тілдік құралдар орынды қолданылған. Орфографиялық және пунктуациялық қателер жоқ (немесе 1-2 байқалмайтын қате).' },
      { range: '14-17', desc: 'Тақырып мазмұны ашылған, аудитория ескерілген, құрылымы жүйелі. Тілдік қателер аз, мағынаға кедергі келтірмейді.' },
      { range: '10-13', desc: 'Тақырып жалпы түсінікті, бірақ стиль мен аудитория талаптары толық ескерілмеген. Бірқатар грамматикалық қателер кездеседі.' },
      { range: '6-9', desc: 'Мәтін құрылымы әлсіз, ой жүйесі шашыраңқы, тілдік қателер жиі кездеседі.' },
      { range: '1-5', desc: 'Сөз саны нормадан айтарлықтай аз, мазмұн талапқа сәйкес келмейді, өрескел қателер көп.' },
      { range: '0', desc: 'Жұмыс орындалмаған.' },
    ],
  },
  task2: {
    title: '2-тапсырма: Шығармашылық жазылым (25 балл)',
    ranges: [
      { range: '22-25', desc: 'Таңдалған тақырып терең, креативті әрі көркем ашылған. Сюжет пен кейіпкер образы (немесе эссе логикасы) шебер өрілген. Көркемдегіш құралдар, сөз байлығы жоғары. Сауаттылық мінсіз.' },
      { range: '17-21', desc: 'Тақырып жақсы ашылған, құрылымы жүйелі (кіріспе, негізгі, қорытынды). Көркемдік деңгейі жоғары, кейбір шағын кемшіліктер ғана бар.' },
      { range: '12-16', desc: 'Тақырып мазмұны орташа деңгейде ашылған, ой қайталаулар, құрылымдық сәйкессіздіктер бар. Сөздік қоры шектеулі.' },
      { range: '7-11', desc: 'Шығармашылық ой әлсіз, тақырыптан ауытқу бар, сөз саны талапқа жетпейді немесе қателер көп.' },
      { range: '1-6', desc: 'Тақырып ашылмаған, мазмұнсыз, сөздік қоры тым жұтаң, өрескел қателер басым.' },
      { range: '0', desc: 'Жұмыс орындалмаған.' },
    ],
  },
};

/**
 * Get exams list (Teacher sees theirs, Student sees published from their teacher)
 */
export async function getExams(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;

    if (user.role === 'teacher') {
      const exams = await prisma.mockExam.findMany({
        where: { teacherId: user.userId },
        include: {
          _count: {
            select: { submissions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ exams });
      return;
    }

    // Role: Student
    // Get student's teacherId
    const student = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { teacherId: true },
    });

    if (!student?.teacherId) {
      res.json({ exams: [] });
      return;
    }

    const exams = await prisma.mockExam.findMany({
      where: {
        teacherId: student.teacherId,
        status: 'published',
      },
      include: {
        submissions: {
          where: { studentId: user.userId },
          select: {
            id: true,
            status: true,
            totalScore: true,
            letterGrade: true,
            startedAt: true,
            submittedAt: true,
          },
          orderBy: { startedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = exams.map(e => {
      const latestSub = e.submissions[0] || null;
      return {
        id: e.id,
        title: e.title,
        timeLimitMinutes: e.timeLimitMinutes,
        task1aMaxScore: e.task1aMaxScore,
        task1aeMaxScore: e.task1aeMaxScore,
        task2MaxScore: e.task2MaxScore,
        totalMaxScore: e.task1aMaxScore + e.task1aeMaxScore + e.task2MaxScore,
        createdAt: e.createdAt,
        latestSubmission: latestSub,
        canStart: !latestSub || latestSub.status !== 'in_progress',
        inProgressSubmissionId: latestSub?.status === 'in_progress' ? latestSub.id : null,
      };
    });

    res.json({ exams: formatted });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ error: 'Сынақ емтихандарын алу кезінде қате орын алды' });
  }
}

/**
 * Get single exam detail
 */
export async function getExamById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const exam = await prisma.mockExam.findUnique({
      where: { id },
      include: {
        teacher: {
          select: { fullName: true, email: true },
        },
      },
    });

    if (!exam) {
      res.status(404).json({ error: 'Сынақ емтихан табылмады' });
      return;
    }

    // Permission check
    if (user.role === 'teacher' && exam.teacherId !== user.userId) {
      res.status(403).json({ error: 'Бұл емтиханға қолжетімділік жоқ' });
      return;
    }

    if (user.role === 'student' && exam.status !== 'published') {
      res.status(403).json({ error: 'Бұл сынақ емтихан әлі жарияланбаған' });
      return;
    }

    res.json({ exam });
  } catch (error) {
    console.error('Get exam detail error:', error);
    res.status(500).json({ error: 'Емтихан мәліметтерін алу кезінде қате орын алды' });
  }
}

/**
 * Create new mock exam (Teacher only)
 */
export async function createExam(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;
    const data = req.body;

    const scoringCriteriaJson = data.scoringCriteriaJson || JSON.stringify(DEFAULT_NIS_RUBRICS);

    const exam = await prisma.mockExam.create({
      data: {
        teacherId,
        title: data.title,
        textATitle: data.textATitle,
        textAContent: data.textAContent,
        textBTitle: data.textBTitle,
        textBContent: data.textBContent,
        task1aInstruction: data.task1aInstruction,
        task1aMaxScore: data.task1aMaxScore,
        task1aeInstruction: data.task1aeInstruction,
        task1aeWordMin: data.task1aeWordMin,
        task1aeWordMax: data.task1aeWordMax,
        task1aeMaxScore: data.task1aeMaxScore,
        task2Option1: data.task2Option1,
        task2Option2: data.task2Option2,
        task2Option3: data.task2Option3,
        task2WordMin: data.task2WordMin,
        task2WordMax: data.task2WordMax,
        task2MaxScore: data.task2MaxScore,
        timeLimitMinutes: data.timeLimitMinutes,
        scoringCriteriaJson,
        status: data.status || 'published',
      },
    });

    res.status(201).json({ message: 'Сынақ емтихан сәтті құрылды', exam });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ error: 'Емтихан құру кезінде қате орын алды' });
  }
}

/**
 * Update exam status (Teacher only)
 */
export async function updateExamStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      res.status(400).json({ error: 'Жарамсыз статус' });
      return;
    }

    const exam = await prisma.mockExam.findFirst({
      where: { id, teacherId },
    });

    if (!exam) {
      res.status(404).json({ error: 'Емтихан табылмады' });
      return;
    }

    const updated = await prisma.mockExam.update({
      where: { id },
      data: { status },
    });

    res.json({ message: 'Емтихан күйі жаңартылды', exam: updated });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Күйді жаңарту мүмкін болмады' });
  }
}
