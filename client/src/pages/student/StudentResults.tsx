import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import {
  Award,
  Calendar,
  CheckCircle2,
  FileText,
  MessageSquare,
  Sparkles,
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

export const StudentResults: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/exams')
      .then(res => {
        const exams = res.data.exams || [];
        // Filter submissions with status checked
        const checkedList: any[] = [];
        exams.forEach((ex: any) => {
          if (ex.latestSubmission && ex.latestSubmission.status === 'checked') {
            checkedList.push({
              ...ex.latestSubmission,
              mockExam: { title: ex.title },
            });
          }
        });

        // Also fetch detailed submissions to get task breakdown
        Promise.all(checkedList.map(s => api.get(`/submissions/${s.id}`)))
          .then(responses => {
            setResults(responses.map(r => r.data.submission));
          })
          .catch(() => {
            setResults(checkedList);
          })
          .finally(() => setLoading(false));
      })
      .catch(err => {
        console.error('Fetch results error:', err);
        setLoading(false);
      });
  }, []);

  const chartData = results
    .filter(r => r.totalScore !== null && r.totalScore !== undefined)
    .map(r => ({
      date: new Date(r.checkedAt || r.startedAt).toLocaleDateString('kk-KZ', { month: 'short', day: 'numeric' }),
      title: r.mockExam?.title,
      score: r.totalScore,
      grade: r.letterGrade,
    }));

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Нәтижелер мен прогресс</h1>
        <p className="text-xs text-slate-500 mt-1">
          Тексерілген сынақ емтихандар, мұғалімнің кері байланысы және баллдар динамикасы
        </p>
      </div>

      {/* Progress Line Chart */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Баллдар өсімі (60 баллдық шкала)</h2>
              <p className="text-xs text-slate-500">Уақыт бойынша сынақ емтихандарының прогресі</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              {chartData.length} сынақ бағаланды
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

      {/* Graded Works List */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900">Тексерілген жұмыстар</h2>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nis-navy-800 mx-auto" />
          </div>
        ) : results.length > 0 ? (
          results.map(sub => (
            <div
              key={sub.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6"
            >
              {/* Exam Header & Grade */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{sub.mockExam?.title}</h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Тексерілген: {new Date(sub.checkedAt || sub.startedAt).toLocaleDateString('kk-KZ')}</span>
                    </span>
                    {sub.checkedBy && <span>• Тексерген: {sub.checkedBy.fullName}</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-slate-50 p-2.5 px-4 rounded-2xl border border-slate-200 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Нәтиже</span>
                    <span className="text-lg font-black text-slate-900">{sub.totalScore} / 60</span>
                  </div>
                  <span className="px-3 py-1 rounded-xl font-black text-sm bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {sub.letterGrade}
                  </span>
                </div>
              </div>

              {/* 3 Tasks Score Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1(a) */}
                <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">1(а) тапсырма</span>
                    <span className="text-xs font-black text-nis-navy-800">{sub.score1a} / 15</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Салыстырмалы талдау</p>
                  {sub.teacherComment1a ? (
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-700">
                      <span className="font-semibold text-slate-800 block text-[10px] uppercase text-slate-400">Мұғалім пікірі:</span>
                      «{sub.teacherComment1a}»
                    </div>
                  ) : null}
                </div>

                {/* 1(ae) */}
                <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">1(ә) тапсырма</span>
                    <span className="text-xs font-black text-nis-navy-800">{sub.score1ae} / 20</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Бағытталған жазылым</p>
                  {sub.teacherComment1ae ? (
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-700">
                      <span className="font-semibold text-slate-800 block text-[10px] uppercase text-slate-400">Мұғалім пікірі:</span>
                      «{sub.teacherComment1ae}»
                    </div>
                  ) : null}
                </div>

                {/* Task 2 */}
                <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">2-тапсырма</span>
                    <span className="text-xs font-black text-nis-navy-800">{sub.score2} / 25</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Шығармашылық жазылым</p>
                  {sub.teacherComment2 ? (
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-700">
                      <span className="font-semibold text-slate-800 block text-[10px] uppercase text-slate-400">Мұғалім пікірі:</span>
                      «{sub.teacherComment2}»
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
            Әзірге тексерілген сынақ емтихандары жоқ.
          </div>
        )}
      </div>
    </div>
  );
};
