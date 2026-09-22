-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "teacherId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MockExam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "textATitle" TEXT NOT NULL,
    "textAContent" TEXT NOT NULL,
    "textBTitle" TEXT NOT NULL,
    "textBContent" TEXT NOT NULL,
    "task1aInstruction" TEXT NOT NULL,
    "task1aMaxScore" INTEGER NOT NULL DEFAULT 15,
    "task1aeInstruction" TEXT NOT NULL,
    "task1aeWordMin" INTEGER NOT NULL DEFAULT 150,
    "task1aeWordMax" INTEGER NOT NULL DEFAULT 180,
    "task1aeMaxScore" INTEGER NOT NULL DEFAULT 20,
    "task2Option1" TEXT NOT NULL,
    "task2Option2" TEXT NOT NULL,
    "task2Option3" TEXT NOT NULL,
    "task2WordMin" INTEGER NOT NULL DEFAULT 350,
    "task2WordMax" INTEGER NOT NULL DEFAULT 450,
    "task2MaxScore" INTEGER NOT NULL DEFAULT 25,
    "timeLimitMinutes" INTEGER NOT NULL DEFAULT 135,
    "scoringCriteriaJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MockExam_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExamSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mockExamId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" DATETIME,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "answer1aText" TEXT NOT NULL DEFAULT '',
    "answer1aeText" TEXT NOT NULL DEFAULT '',
    "task2ChosenOption" INTEGER,
    "answer2Text" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "score1a" INTEGER,
    "score1ae" INTEGER,
    "score2" INTEGER,
    "totalScore" INTEGER,
    "letterGrade" TEXT,
    "teacherComment1a" TEXT,
    "teacherComment1ae" TEXT,
    "teacherComment2" TEXT,
    "checkedAt" DATETIME,
    "checkedById" TEXT,
    CONSTRAINT "ExamSubmission_mockExamId_fkey" FOREIGN KEY ("mockExamId") REFERENCES "MockExam" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExamSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExamSubmission_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TheorySection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    CONSTRAINT "TheorySection_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TheoryTopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "parentTopicId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "theoryContentHtml" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TheoryTopic_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "TheorySection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TheoryTopic_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "TheoryTopic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TheoryFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TheoryFile_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "TheoryTopic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "passingScore" INTEGER DEFAULT 70,
    "timeLimitMinutes" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Quiz_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "TheoryTopic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quizId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "QuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizMatchingPair" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "leftItemText" TEXT NOT NULL,
    "rightItemText" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "QuizMatchingPair_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quizId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" DATETIME,
    "score" INTEGER NOT NULL DEFAULT 0,
    "maxScore" INTEGER NOT NULL DEFAULT 0,
    "answersJson" TEXT NOT NULL,
    CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
