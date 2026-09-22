import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  FileEdit,
  PlusCircle,
  Clock,
  Award,
  Archive,
  CheckCircle,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const ExamList: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/exams');
      setExams(res.data.exams || []);
    } catch (err) {
      console.error('Fetch exams error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/exams/${id}/status`, { status: newStatus });
      fetchExams();
    } catch (err) {
      alert('Статусты өзгерту мүмкін болмады');
    }
  };

  const filtered = exams.filter(e => {
    if (statusFilter === 'all') return true;
    return e.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Сынақ емтихандар</h1>
          <p className="text-xs text-slate-500 mt-1">
            НИШ форматындағы сынақ емтихандарын құру, өңдеу және жариялау
          </p>
        </div>
        <Link
          to="/teacher/exams/new"
          className="inline-flex items-center space-x-2 bg-nis-navy-800 hover:bg-nis-navy-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Жаңа сынақ емтихан құру</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs w-fit">
        {[
          { key: 'all', label: 'Барлығы' },
          { key: 'published', label: 'Жарияланған' },
          { key: 'draft', label: 'Черновик' },
          { key: 'archived', label: 'Архив' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === tab.key
                ? 'bg-nis-navy-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Exams Grid / Cards */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nis-navy-800 mx-auto" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(exam => {
            const totalMax = exam.task1aMaxScore + exam.task1aeMaxScore + exam.task2MaxScore;
            return (
              <div
                key={exam.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        exam.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : exam.status === 'draft'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {exam.status === 'published'
                        ? 'Жарияланған'
                        : exam.status === 'draft'
                        ? 'Черновик'
                        : 'Архив'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(exam.createdAt).toLocaleDateString('kk-KZ')}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
                    {exam.title}
                  </h3>

                  <div className="mt-4 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Уақыт шегі: <strong className="text-slate-700">{exam.timeLimitMinutes} минут</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>Жалпы балл: <strong className="text-slate-700">{totalMax} балл</strong> (15 + 20 + 25)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileEdit className="w-3.5 h-3.5 text-slate-400" />
                      <span>Тапсырылған жұмыстар: <strong className="text-slate-700">{exam._count?.submissions || 0}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <select
                    value={exam.status}
                    onChange={e => handleStatusChange(exam.id, e.target.value)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="published">Жариялау</option>
                    <option value="draft">Черновик</option>
                    <option value="archived">Архивтеу</option>
                  </select>

                  <Link
                    to={`/exams/${exam.id}`}
                    className="text-xs font-bold text-nis-navy-700 hover:text-nis-navy-900"
                  >
                    Толық қарау →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
          <p className="text-sm font-bold text-slate-700">Сынақ емтихандары табылмады</p>
          <p className="text-xs text-slate-400 mt-1">
            Алғашқы сынақ емтиханды құру үшін жоғарыдағы батырманы басыңыз.
          </p>
        </div>
      )}
    </div>
  );
};
