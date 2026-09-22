import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import {
  ArrowLeft,
  GraduationCap,
  Mail,
  Calendar,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.get(`/teacher/students/${id}`)
        .then(res => setData(res.data))
        .catch(err => console.error('Fetch student detail error:', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nis-navy-800" />
      </div>
    );
  }

  if (!data?.student) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 font-bold">Оқушы табылмады</p>
        <Link to="/teacher/students" className="mt-3 text-xs text-nis-navy-700 underline">
          Оқушылар тізіміне қайту
        </Link>
      </div>
    );
  }

  const { student, chartData } = data;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/teacher/students"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-nis-navy-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Оқушылар тізіміне оралу</span>
        </Link>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-nis-navy-800 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {student.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-extrabold text-slate-900">{student.fullName}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                student.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {student.isActive ? 'Белсенді' : 'Бұғатталған'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{student.email}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Тіркелген: {new Date(student.createdAt).toLocaleDateString('kk-KZ')}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Сынақтар</span>
            <span className="text-xl font-black text-slate-800">
              {student.submissions.filter((s: any) => s.status === 'checked').length}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Мини-тесттер</span>
            <span className="text-xl font-black text-slate-800">{student.quizAttempts.length}</span>
          </div>
        </div>
      </div>

      {/* Progress Line Chart */}
      {chartData && chartData.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Сынақ емтихан нәтижелерінің динамикасы</h2>
              <p className="text-xs text-slate-500">Әр сынақ бойынша жалпы балл өсімі (60 баллдық шкала)</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {chartData.length} жұмыс тексерілді
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis domain={[0, 60]} stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs space-y-1 shadow-lg">
                          <p className="font-bold">{d.title}</p>
                          <p>Күні: {d.date}</p>
                          <p className="text-emerald-400 font-extrabold text-sm">
                            Балл: {d.score} / 60 ({d.grade})
                          </p>
                          <p className="text-slate-300">
                            1(а): {d.score1a}/15 • 1(ә): {d.score1ae}/20 • 2: {d.score2}/25
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#1E3A5F"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Submissions History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Сынақ емтихан жұмыстары</h2>
        </div>

        {student.submissions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {student.submissions.map((sub: any) => (
              <div key={sub.id} className="p-5 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{sub.mockExam.title}</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        sub.status === 'checked'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'submitted'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sub.status === 'checked'
                        ? 'Тексерілді'
                        : sub.status === 'submitted'
                        ? 'Тексеруді күтуде'
                        : 'Орындалуда'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Басталған: {new Date(sub.startedAt).toLocaleString('kk-KZ')}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {sub.status === 'checked' && (
                    <div className="text-right">
                      <span className="text-base font-black text-slate-900">
                        {sub.totalScore} / 60
                      </span>
                      <span className="ml-2 px-2 py-0.5 rounded-md bg-nis-navy-100 text-nis-navy-800 text-xs font-bold">
                        {sub.letterGrade}
                      </span>
                    </div>
                  )}
                  <Link
                    to={`/teacher/grading/${sub.id}`}
                    className="px-4 py-2 bg-nis-navy-800 hover:bg-nis-navy-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    {sub.status === 'checked' ? 'Нәтижені көру' : 'Тексеру'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            Оқушы әлі ешқандай сынақ емтихан бастамаған
          </div>
        )}
      </div>

      {/* Quiz Attempts */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Мини-тесттер нәтижесі</h2>
        </div>

        {student.quizAttempts.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {student.quizAttempts.map((att: any) => {
              const pct = att.maxScore > 0 ? Math.round((att.score / att.maxScore) * 100) : 0;
              return (
                <div key={att.id} className="p-5 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {att.quiz.title}
                    </span>
                    <span className="text-xs text-slate-400">
                      Бөлім: {att.quiz.topic.section?.title} • {att.quiz.topic.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-500 font-semibold">
                      {att.score} / {att.maxScore} балл
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        pct >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : pct >= 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            Әзірге mini-тесттер тапсырылмаған
          </div>
        )}
      </div>
    </div>
  );
};
