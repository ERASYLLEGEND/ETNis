import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

export const createTopicSchema = z.object({
  sectionName: z.enum(['oqylym', 'jazylym']),
  parentTopicId: z.string().nullable().optional(),
  title: z.string().min(2, 'Тақырып атауын енгізіңіз'),
  description: z.string().optional(),
  theoryContentHtml: z.string().default(''),
  orderIndex: z.number().default(0),
});

export const updateTopicSchema = z.object({
  title: z.string().min(2, 'Тақырып атауын енгізіңіз'),
  description: z.string().optional(),
  theoryContentHtml: z.string().optional(),
  orderIndex: z.number().optional(),
  parentTopicId: z.string().nullable().optional(),
});

/**
 * Get theory sections with nested topics tree
 */
export async function getTheorySections(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;
    let teacherId = user.userId;

    if (user.role === 'student') {
      const student = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { teacherId: true },
      });
      if (!student?.teacherId) {
        res.json({ sections: [] });
        return;
      }
      teacherId = student.teacherId;
    }

    // Ensure default sections exist for this teacher
    const oqylym = await prisma.theorySection.upsert({
      where: { id: `oqylym_${teacherId}` },
      update: {},
      create: {
        id: `oqylym_${teacherId}`,
        name: 'oqylym',
        title: 'Оқылым',
        teacherId,
      },
    });

    const jazylym = await prisma.theorySection.upsert({
      where: { id: `jazylym_${teacherId}` },
      update: {},
      create: {
        id: `jazylym_${teacherId}`,
        name: 'jazylym',
        title: 'Жазылым',
        teacherId,
      },
    });

    const sections = await prisma.theorySection.findMany({
      where: { teacherId },
      include: {
        topics: {
          include: {
            files: true,
            quizzes: {
              select: {
                id: true,
                title: true,
                passingScore: true,
                _count: { select: { questions: true } },
                attempts: user.role === 'student' ? {
                  where: { studentId: user.userId },
                  orderBy: { startedAt: 'desc' },
                  take: 1,
                  select: { score: true, maxScore: true, submittedAt: true },
                } : false,
              },
            },
            subTopics: {
              include: {
                files: true,
                quizzes: {
                  select: {
                    id: true,
                    title: true,
                    passingScore: true,
                    _count: { select: { questions: true } },
                    attempts: user.role === 'student' ? {
                      where: { studentId: user.userId },
                      orderBy: { startedAt: 'desc' },
                      take: 1,
                      select: { score: true, maxScore: true, submittedAt: true },
                    } : false,
                  },
                },
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    res.json({ sections });
  } catch (error) {
    console.error('Get theory sections error:', error);
    res.status(500).json({ error: 'Тақырыптарды алу мүмкін болмады' });
  }
}

/**
 * Get single topic detail
 */
export async function getTopicDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const topic = await prisma.theoryTopic.findUnique({
      where: { id },
      include: {
        section: true,
        files: true,
        quizzes: {
          include: {
            _count: { select: { questions: true } },
            attempts: user.role === 'student' ? {
              where: { studentId: user.userId },
              orderBy: { startedAt: 'desc' },
            } : true,
          },
        },
      },
    });

    if (!topic) {
      res.status(404).json({ error: 'Тақырып табылмады' });
      return;
    }

    res.json({ topic });
  } catch (error) {
    console.error('Get topic detail error:', error);
    res.status(500).json({ error: 'Тақырыпты жүктеу мүмкін болмады' });
  }
}

/**
 * Create topic (Teacher)
 */
export async function createTopic(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;
    const data = req.body;

    const section = await prisma.theorySection.findFirst({
      where: { teacherId, name: data.sectionName },
    });

    if (!section) {
      res.status(400).json({ error: 'Бөлім табылмады' });
      return;
    }

    const topic = await prisma.theoryTopic.create({
      data: {
        sectionId: section.id,
        parentTopicId: data.parentTopicId || null,
        title: data.title,
        description: data.description || '',
        theoryContentHtml: data.theoryContentHtml || '',
        orderIndex: data.orderIndex || 0,
      },
    });

    res.status(201).json({ message: 'Тақырып сәтті қосылды', topic });
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({ error: 'Тақырып құру мүмкін болмады' });
  }
}

/**
 * Update topic (Teacher)
 */
export async function updateTopic(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;
    const { id } = req.params;
    const data = req.body;

    const topic = await prisma.theoryTopic.findUnique({
      where: { id },
      include: { section: true },
    });

    if (!topic || topic.section.teacherId !== teacherId) {
      res.status(403).json({ error: 'Бұл тақырыпты өзгертуге рұқсат жоқ' });
      return;
    }

    const updated = await prisma.theoryTopic.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : topic.title,
        description: data.description !== undefined ? data.description : topic.description,
        theoryContentHtml: data.theoryContentHtml !== undefined ? data.theoryContentHtml : topic.theoryContentHtml,
        orderIndex: data.orderIndex !== undefined ? data.orderIndex : topic.orderIndex,
        parentTopicId: data.parentTopicId !== undefined ? data.parentTopicId : topic.parentTopicId,
      },
    });

    res.json({ message: 'Тақырып жаңартылды', topic: updated });
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ error: 'Тақырыпты жаңарту мүмкін болмады' });
  }
}

/**
 * Delete topic (Teacher)
 */
export async function deleteTopic(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;
    const { id } = req.params;

    const topic = await prisma.theoryTopic.findUnique({
      where: { id },
      include: { section: true },
    });

    if (!topic || topic.section.teacherId !== teacherId) {
      res.status(403).json({ error: 'Бұл тақырыпты жоюға құқығыңыз жоқ' });
      return;
    }

    await prisma.theoryTopic.delete({ where: { id } });
    res.json({ message: 'Тақырып жойылды' });
  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({ error: 'Тақырыпты жою мүмкін болмады' });
  }
}

/**
 * Attach file to topic (Local storage metadata)
 */
export async function attachTopicFile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'Файл жүктелмеді' });
      return;
    }

    const topic = await prisma.theoryTopic.findUnique({
      where: { id },
      include: { section: true },
    });

    if (!topic || topic.section.teacherId !== teacherId) {
      res.status(403).json({ error: 'Файл қосуға құқығыңыз жоқ' });
      return;
    }

    const fileType = file.originalname.split('.').pop() || 'file';
    const fileUrl = `/uploads/${file.filename}`;

    const createdFile = await prisma.theoryFile.create({
      data: {
        topicId: id,
        fileName: file.originalname,
        fileUrl,
        fileType,
        fileSize: file.size,
      },
    });

    res.status(201).json({ message: 'Файл сәтті қосылды', file: createdFile });
  } catch (error) {
    console.error('Attach file error:', error);
    res.status(500).json({ error: 'Файлды тіркеу мүмкін болмады' });
  }
}

/**
 * Delete attached file (Teacher)
 */
export async function deleteTopicFile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.userId;
    const { id } = req.params;

    const file = await prisma.theoryFile.findUnique({
      where: { id },
      include: { topic: { include: { section: true } } },
    });

    if (!file || file.topic.section.teacherId !== teacherId) {
      res.status(403).json({ error: 'Файлды жоюға құқығыңыз жоқ' });
      return;
    }

    await prisma.theoryFile.delete({ where: { id } });
    res.json({ message: 'Файл жойылды' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Файлды жою мүмкін болмады' });
  }
}
