export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  teacherId?: string | null;
  isActive?: boolean;
}

export type LetterGrade = 'A*' | 'A' | 'B' | 'C' | 'D' | 'E' | 'U';

export interface RubricRange {
  range: string;
  desc: string;
}

export interface RubricCategory {
  title: string;
  ranges: RubricRange[];
}

export interface ScoringRubrics {
  task1a: RubricCategory;
  task1ae: RubricCategory;
  task2: RubricCategory;
}

export interface MockExam {
  id: string;
  teacherId: string;
  title: string;
  textATitle: string;
  textAContent: string;
  textBTitle: string;
  textBContent: string;
  task1aInstruction: string;
  task1aMaxScore: number;
  task1aeInstruction: string;
  task1aeWordMin: number;
  task1aeWordMax: number;
  task1aeMaxScore: number;
  task2Option1: string;
  task2Option2: string;
  task2Option3: string;
  task2WordMin: number;
  task2WordMax: number;
  task2MaxScore: number;
  timeLimitMinutes: number;
  scoringCriteriaJson: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  _count?: {
    submissions: number;
  };
}

export interface ExamSubmission {
  id: string;
  mockExamId: string;
  mockExam?: MockExam;
  studentId: string;
  student?: {
    id: string;
    fullName: string;
    email: string;
  };
  startedAt: string;
  submittedAt?: string | null;
  timeSpentSeconds: number;
  answer1aText: string;
  answer1aeText: string;
  task2ChosenOption?: number | null;
  answer2Text: string;
  status: 'in_progress' | 'submitted' | 'checked';
  score1a?: number | null;
  score1ae?: number | null;
  score2?: number | null;
  totalScore?: number | null;
  letterGrade?: LetterGrade | null;
  teacherComment1a?: string | null;
  teacherComment1ae?: string | null;
  teacherComment2?: string | null;
  checkedAt?: string | null;
  checkedBy?: {
    id: string;
    fullName: string;
  } | null;
}

export interface TheoryFile {
  id: string;
  topicId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface TheoryTopic {
  id: string;
  sectionId: string;
  parentTopicId?: string | null;
  title: string;
  description?: string | null;
  theoryContentHtml: string;
  orderIndex: number;
  createdAt: string;
  files?: TheoryFile[];
  quizzes?: Quiz[];
  subTopics?: TheoryTopic[];
}

export interface TheorySection {
  id: string;
  name: 'oqylym' | 'jazylym';
  title: string;
  teacherId: string;
  topics: TheoryTopic[];
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'matching';

export interface QuizOption {
  id?: string;
  optionText: string;
  isCorrect?: boolean;
  orderIndex: number;
}

export interface QuizMatchingPair {
  id?: string;
  leftItemText: string;
  rightItemText: string;
  orderIndex: number;
}

export interface QuizQuestion {
  id?: string;
  quizId?: string;
  questionText: string;
  questionType: QuestionType;
  orderIndex: number;
  points: number;
  options?: QuizOption[];
  matchingPairs?: QuizMatchingPair[];
  // For student taking quiz:
  leftItems?: { id: string; leftText: string }[];
  shuffledRightItems?: { id: string; rightText: string }[];
}

export interface Quiz {
  id: string;
  topicId: string;
  title: string;
  passingScore?: number;
  timeLimitMinutes?: number | null;
  createdAt?: string;
  questions?: QuizQuestion[];
  _count?: {
    questions: number;
  };
  attempts?: QuizAttempt[];
  topic?: {
    id: string;
    title: string;
    section?: {
      name: string;
      title: string;
    };
  };
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  maxScore: number;
  startedAt: string;
  submittedAt?: string;
  answersJson: string;
  quiz?: {
    title: string;
    topic: {
      title: string;
      section: {
        name: string;
        title: string;
      };
    };
  };
}

export interface TeacherStats {
  totalStudents: number;
  pendingSubmissionsCount: number;
  publishedExamsCount: number;
  totalTopicsCount: number;
}

export interface StudentStats {
  availableExamsCount: number;
  completedQuizzesCount: number;
  latestResult: {
    examTitle: string;
    totalScore: number;
    letterGrade: LetterGrade;
    checkedAt: string;
  } | null;
}
