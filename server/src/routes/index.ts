import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { upload } from '../utils/upload';

import { login, getMe, loginSchema } from '../controllers/authController';
import {
  getTeacherStudents,
  createStudent,
  toggleStudentActive,
  resetStudentPassword,
  getStudentDetail,
  createStudentSchema,
  resetPasswordSchema,
} from '../controllers/studentController';
import {
  getExams,
  getExamById,
  createExam,
  updateExamStatus,
  createExamSchema,
} from '../controllers/examController';
import {
  startOrResumeExam,
  autosaveDraft,
  submitExam,
  getSubmissionDetail,
  getTeacherSubmissions,
  gradeSubmission,
  saveDraftSchema,
  gradeSubmissionSchema,
} from '../controllers/submissionController';
import {
  getTheorySections,
  getTopicDetail,
  createTopic,
  updateTopic,
  deleteTopic,
  attachTopicFile,
  deleteTopicFile,
  createTopicSchema,
  updateTopicSchema,
} from '../controllers/theoryController';
import {
  getQuizById,
  saveQuiz,
  submitQuizAttempt,
  saveQuizSchema,
} from '../controllers/quizController';
import { getTeacherStats, getStudentStats } from '../controllers/statsController';

export const router = Router();

// =================== AUTH ===================
router.post('/auth/login', validateBody(loginSchema), login);
router.get('/auth/me', requireAuth, getMe);

// =================== TEACHER STUDENTS ===================
router.get('/teacher/students', requireAuth, requireRole(['teacher']), getTeacherStudents);
router.post('/teacher/students', requireAuth, requireRole(['teacher']), validateBody(createStudentSchema), createStudent);
router.patch('/teacher/students/:id/status', requireAuth, requireRole(['teacher']), toggleStudentActive);
router.post('/teacher/students/:id/reset-password', requireAuth, requireRole(['teacher']), validateBody(resetPasswordSchema), resetStudentPassword);
router.get('/teacher/students/:id', requireAuth, requireRole(['teacher']), getStudentDetail);

// =================== STATS ===================
router.get('/teacher/stats', requireAuth, requireRole(['teacher']), getTeacherStats);
router.get('/student/stats', requireAuth, requireRole(['student']), getStudentStats);

// =================== EXAMS ===================
router.get('/exams', requireAuth, getExams);
router.get('/exams/:id', requireAuth, getExamById);
router.post('/exams', requireAuth, requireRole(['teacher']), validateBody(createExamSchema), createExam);
router.patch('/exams/:id/status', requireAuth, requireRole(['teacher']), updateExamStatus);

// =================== SUBMISSIONS & GRADING ===================
router.post('/submissions/start', requireAuth, requireRole(['student']), startOrResumeExam);
router.patch('/submissions/:id/autosave', requireAuth, requireRole(['student']), validateBody(saveDraftSchema), autosaveDraft);
router.post('/submissions/:id/submit', requireAuth, requireRole(['student']), submitExam);
router.get('/submissions/:id', requireAuth, getSubmissionDetail);

router.get('/teacher/submissions', requireAuth, requireRole(['teacher']), getTeacherSubmissions);
router.post('/teacher/submissions/:id/grade', requireAuth, requireRole(['teacher']), validateBody(gradeSubmissionSchema), gradeSubmission);

// =================== THEORY & TOPICS ===================
router.get('/theory/sections', requireAuth, getTheorySections);
router.get('/theory/topics/:id', requireAuth, getTopicDetail);
router.post('/teacher/topics', requireAuth, requireRole(['teacher']), validateBody(createTopicSchema), createTopic);
router.put('/teacher/topics/:id', requireAuth, requireRole(['teacher']), validateBody(updateTopicSchema), updateTopic);
router.delete('/teacher/topics/:id', requireAuth, requireRole(['teacher']), deleteTopic);
router.post('/teacher/topics/:id/files', requireAuth, requireRole(['teacher']), upload.single('file'), attachTopicFile);
router.delete('/teacher/files/:id', requireAuth, requireRole(['teacher']), deleteTopicFile);

// =================== QUIZZES ===================
router.get('/quizzes/:id', requireAuth, getQuizById);
router.post('/teacher/quizzes', requireAuth, requireRole(['teacher']), validateBody(saveQuizSchema), saveQuiz);
router.post('/quizzes/:id/submit', requireAuth, requireRole(['student']), submitQuizAttempt);
