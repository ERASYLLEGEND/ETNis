import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Users,
  FileCheck2,
  FileEdit,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const [data, setData] = useState<{
    stats: {
      totalStudents: number;
      pendingSubmissionsCount: number;
      publishedExamsCount: number;
      totalTopicsCount: number;
    };
    recentSubmissions: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teacher/stats')
      .then(res => setData(res.data))
      .catch(err => console.error('Dashboard stats error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nis-navy-800" />
      </div>
    );
  }

  const stats = data?.stats || {
    totalStudents: 0,
    pendingSubmissionsCount: 0,
    publishedExamsCount: 0,
    totalTopicsCount: 0,
  };

  return (
    <div className="space-y-8">
      {/* Greeting banner */}
      <div className="bg-gradient-to-r from-nis-navy-900 to-nis-navy-700 text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Қош келдіңіз, әріптес!
          </h1>
          <p className="mt-2 text-slate-200 text-sm sm:text-base leading-relaxed">
            10-сынып оқушыларын НИШ «Қазақ тілі мен әдебиеті» (Т1) сыртқы жиынтық бағалауына жүйелі дайындау платформасы.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/teacher/exams/new"
              className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Жаңа сынақ емтихан құру</span>
            </Link>
            <Link
              to="/teacher/students"
              className="inline-flex items-center space-x-2 bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl backdrop-blur-xs transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Оқушыларды басқару</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Pending Submissions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Тексеруді күтуде</p>
              <p className="text-3xl font-black text-rose-600 mt-1">
                {stats.pendingSubmissionsCount}
              </p>
            </div>
            <div className={`p-3 rounded-2xl ${stats.pendingSubmissionsCount > 0 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
              <FileCheck2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/teacher/grading"
              className="text-xs font-semibold text-nis-navy-700 hover:text-nis-navy-900 inline-flex items-center space-x-1"
            >
              <span>Тексеруге өту</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Бекітілген оқушылар</p>
              <p className="text-3xl font-black text-slate-800 mt-1">{stats.totalStudents}</p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/teacher/students"
              className="text-xs font-semibold text-nis-navy-700 hover:text-nis-navy-900 inline-flex items-center space-x-1"
            >
              <span>Оқушылар тізімі</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Published Exams */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Сынақ емтихандар</p>
              <p className="text-3xl font-black text-slate-800 mt-1">{stats.publishedExamsCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <FileEdit className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/teacher/exams"
              className="text-xs font-semibold text-nis-navy-700 hover:text-nis-navy-900 inline-flex items-center space-x-1"
            >
              <span>Сынақтарды қарау</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Topics Count */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Оқу тақырыптары</p>
              <p className="text-3xl font-black text-slate-800 mt-1">{stats.totalTopicsCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/teacher/materials"
              className="text-xs font-semibold text-nis-navy-700 hover:text-nis-navy-900 inline-flex items-center space-x-1"
            >
              <span>Материалдарды басқару</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Submissions Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Тексеруді күтіп тұрған жұмыстар</h2>
              <p className="text-xs text-slate-500">Оқушылар тапсырған соңғы жұмыстар тізімі</p>
            </div>
          </div>
          <Link
            to="/teacher/grading"
            className="text-xs font-bold text-nis-navy-700 hover:text-nis-navy-900"
          >
            Барлығын көру →
          </Link>
        </div>

        {data?.recentSubmissions && data.recentSubmissions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {data.recentSubmissions.map(sub => (
              <div
                key={sub.id}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {sub.student?.fullName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                      Тексеруді күтуде
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 mt-1">
                    {sub.mockExam?.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Тапсырылған уақыты: {new Date(sub.submittedAt).toLocaleString('kk-KZ')}</span>
                  </p>
                </div>

                <Link
                  to={`/teacher/grading/${sub.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 bg-nis-navy-800 hover:bg-nis-navy-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Тексеру</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">Тексерілмеген жұмыс жоқ!</p>
            <p className="text-xs text-slate-400 mt-1">
              Барлық оқушылардың жұмыстары тексерілген немесе әлі жаңа жұмыстар жіберілмеген.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
