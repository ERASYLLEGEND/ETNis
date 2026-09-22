import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  PenTool,
  Clock,
  Award,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const StudentExams: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/exams')
      .then(res => setExams(res.data.exams || []))
      .catch(err => console.error('Fetch student exams error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Сынақ емтихандар</h1>
        <p className="text-xs text-slate-500 mt-1">
          Мұғаліміңіз жариялаған ресми форматтағы сынақ емтихандары
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nis-navy-800 mx-auto" />
        </div>
      ) : exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map(exam => {
            const sub = exam.latestSubmission;
            const isInProgress = sub && sub.status === 'in_progress';
            const isSubmitted = sub && sub.status === 'submitted';
            const isChecked = sub && sub.status === 'checked';

            return (
              <div
                key={exam.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        isChecked
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isSubmitted
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : isInProgress
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isChecked
                        ? 'Тексерілді'
                        : isSubmitted
                        ? 'Тексерілуде'
                        : isInProgress
                        ? 'Аяқталмаған (Жалғастыру)'
                        : 'Жаңа сынақ'}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      {new Date(exam.createdAt).toLocaleDateString('kk-KZ')}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
                    {exam.title}
                  </h3>

                  <div className="mt-4 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Уақыт шегі: <strong className="text-slate-800">{exam.timeLimitMinutes} минут</strong> (кері санақ)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-slate-400" />
                      <span>Жалпы балл: <strong className="text-slate-800">{exam.totalMaxScore} балл</strong> (1а: 15, 1ә: 20, 2: 25)</span>
                    </div>
                  </div>

                  {isChecked && (
                    <div className="mt-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                      <span className="text-xs text-emerald-900 font-bold">Сіздің нәтижеңіз:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-black text-emerald-900">{sub.totalScore} / 60</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 text-xs font-black">
                          {sub.letterGrade}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {isChecked ? (
                    <Link
                      to="/student/results"
                      className="w-full inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
                    >
                      <span>Толық бағалауды қарау</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : isSubmitted ? (
                    <span className="text-xs text-slate-500 italic">
                      Жұмыс мұғалім тексеруінде...
                    </span>
                  ) : (
                    <Link
                      to={`/student/exams/${exam.id}/take`}
                      className="w-full inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-nis-navy-800 hover:bg-nis-navy-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                    >
                      <PenTool className="w-4 h-4" />
                      <span>{isInProgress ? 'Сынақты жалғастыру' : 'Сынақ емтиханды бастау'}</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
          Әзірге мұғалім сынақ емтихан жарияламаған.
        </div>
      )}
    </div>
  );
};
