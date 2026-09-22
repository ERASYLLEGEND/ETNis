import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Login } from './pages/auth/Login';
import { Layout } from './components/common/Layout';

// Teacher pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { StudentManagement } from './pages/teacher/StudentManagement';
import { StudentDetail } from './pages/teacher/StudentDetail';
import { ExamList } from './pages/teacher/ExamList';
import { ExamWizard } from './pages/teacher/ExamWizard';
import { GradingList } from './pages/teacher/GradingList';
import { GradingWorkbench } from './pages/teacher/GradingWorkbench';
import { MaterialsManagement } from './pages/teacher/MaterialsManagement';
import { QuizBuilder } from './pages/teacher/QuizBuilder';

// Student pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentMaterials } from './pages/student/StudentMaterials';
import { TopicDetailView } from './pages/student/TopicDetailView';
import { QuizRunner } from './pages/student/QuizRunner';
import { StudentExams } from './pages/student/StudentExams';
import { ExamRunner } from './pages/student/ExamRunner';
import { StudentResults } from './pages/student/StudentResults';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole?: 'teacher' | 'student';
}> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nis-navy-800" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nis-navy-800" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRole="teacher">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherDashboard />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="exams" element={<ExamList />} />
            <Route path="exams/new" element={<ExamWizard />} />
            <Route path="grading" element={<GradingList />} />
            <Route path="grading/:id" element={<GradingWorkbench />} />
            <Route path="materials" element={<MaterialsManagement />} />
            <Route path="topics/:id/quiz" element={<QuizBuilder />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRole="student">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="materials" element={<StudentMaterials />} />
            <Route path="materials/:id" element={<TopicDetailView />} />
            <Route path="quizzes/:id" element={<QuizRunner />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="exams/:id/take" element={<ExamRunner />} />
            <Route path="results" element={<StudentResults />} />
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
