import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  PenTool,
  BookOpen,
  Award,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<{
    stats: {
      availableExamsCount: number;
      completedQuizzesCount: number;
      latestResult: any;
    };
    recommendedTopics: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/stats')
      .then(res => setData(res.data))
      .catch(err => console.error('Student stats error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nis-navy-800" />
      </div>
    );
  }

  const stats = data?.stats || {
    availableExamsCount: 0,
    completedQuizzesCount: 0,
    latestResult: null,
  };

  const recommendedTopics = data?.recommendedTopics || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-nis-navy-900 to-nis-navy-700 text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
            10-сынып • Қазақ тілі мен әдебиеті (Т1)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Сәлем, {user?.fullName}!
          </h1>
          <p className="mt-2 text-slate-200 text-sm sm:text-base leading-relaxed">
            Сыртқы жиынтық бағалауға дайындықты бастаңыз: теориялық ережелерді оқып, сынақ емтихандарын тапсырыңыз.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/student/exams"
              className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all"
            >
              <PenTool className="w-4 h-4" />
              <span>Сынақ емтиханды бастау</span>
            </Link>
            <Link
              to="/student/materials"
              className="inline-flex items-center space-x-2 bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl backdrop-blur-xs transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Жаттығуларға өту</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Available Exams */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Қолжетімді сынақтар</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{stats.availableExamsCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <PenTool className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/student/exams"
              className="text-xs font-bold text-nis-navy-700 hover:text-nis-navy-900 inline-flex items-center space-x-1"
            >
              <span>Сынақ емтихандарға өту</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quizzes Completed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Орындалған мини-тесттер</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{stats.completedQuizzesCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/student/materials"
              className="text-xs font-bold text-nis-navy-700 hover:text-nis-navy-900 inline-flex items-center space-x-1"
            >
              <span>Теория мен жаттығулар</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Latest Checked Exam */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Соңғы тексерілген жұмыс</p>
              {stats.latestResult ? (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-3xl font-black text-slate-900">
                    {stats.latestResult.totalScore}
                    <span className="text-xs font-normal text-slate-400">/60</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs">
                    {stats.latestResult.letterGrade}
                  </span>
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-400 mt-2">Әзірге бағаланған жұмыс жоқ</p>
              )}
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/student/results"
              className="text-xs font-bold text-nis-navy-700 hover:text-nis-navy-900 inline-flex items-center space-x-1"
            >
              <span>Толық нәтижелерді көру</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Adaptive Recommendation Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Сізге қайталау керек тақырыптар
            </h2>
            <p className="text-xs text-slate-500">
              Мини-тесттер нәтижесі бойынша анықталған әлсіз немесе әлі өтілмеген тақырыптар
            </p>
          </div>
        </div>

        {recommendedTopics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {recommendedTopics.map(topic => (
              <div
                key={topic.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {topic.sectionTitle}
                  </span>
                  <span className="font-extrabold text-slate-800 text-sm block mt-0.5">
                    {topic.title}
                  </span>
                  {topic.lastScore !== null ? (
                    <span className="text-[11px] text-rose-600 font-bold mt-1 inline-block">
                      Соңғы нәтиже: {topic.lastScore}% (қайталау қажет)
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-700 font-medium mt-1 inline-block">
                      Әлі орындалмаған
                    </span>
                  )}
                </div>

                <Link
                  to={`/student/materials/${topic.id}`}
                  className="px-3 py-1.5 bg-nis-navy-800 hover:bg-nis-navy-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0 ml-3"
                >
                  Қайталау
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">
            Барлық тақырыптар жақсы меңгерілген!
          </div>
        )}
      </div>
    </div>
  );
};
