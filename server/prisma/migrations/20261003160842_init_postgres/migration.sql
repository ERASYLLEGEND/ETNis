-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "teacherId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockExam" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSubmission" (
    "id" TEXT NOT NULL,
    "mockExamId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
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
    "checkedAt" TIMESTAMP(3),
    "checkedById" TEXT,

    CONSTRAINT "ExamSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TheorySection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "TheorySection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TheoryTopic" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "parentTopicId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "theoryContentHtml" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TheoryTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TheoryFile" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TheoryFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "passingScore" INTEGER DEFAULT 70,
    "timeLimitMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuizOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizMatchingPair" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "leftItemText" TEXT NOT NULL,
    "rightItemText" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuizMatchingPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "score" INTEGER NOT NULL DEFAULT 0,
    "maxScore" INTEGER NOT NULL DEFAULT 0,
    "answersJson" TEXT NOT NULL,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExam" ADD CONSTRAINT "MockExam_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubmission" ADD CONSTRAINT "ExamSubmission_mockExamId_fkey" FOREIGN KEY ("mockExamId") REFERENCES "MockExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubmission" ADD CONSTRAINT "ExamSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSubmission" ADD CONSTRAINT "ExamSubmission_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TheorySection" ADD CONSTRAINT "TheorySection_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TheoryTopic" ADD CONSTRAINT "TheoryTopic_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "TheorySection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TheoryTopic" ADD CONSTRAINT "TheoryTopic_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "TheoryTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TheoryFile" ADD CONSTRAINT "TheoryFile_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "TheoryTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "TheoryTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizOption" ADD CONSTRAINT "QuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizMatchingPair" ADD CONSTRAINT "QuizMatchingPair_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
