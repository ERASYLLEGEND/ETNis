import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  FileCheck2,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';

export const GradingList: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'checked'>('submitted');
  const [search, setSearch] = useState('');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/submissions');
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error('Fetch submissions error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filtered = submissions.filter(sub => {
    if (filter !== 'all' && sub.status !== filter) return false;
    if (!search) return true;
    const matchName = sub.student?.fullName?.toLowerCase().includes(search.toLowerCase());
    const matchExam = sub.mockExam?.title?.toLowerCase().includes(search.toLowerCase());
    return matchName || matchExam;
  });

  const pendingCount = submissions.filter(s => s.status === 'submitted').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-800">Жұмыстарды тексеру</h1>
            {pendingCount > 0 && (
              <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-rose-500 text-white shadow-xs animate-pulse">
                {pendingCount} тексеру күтуде
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Оқушылар жіберген сынақ емтихандарды ресми бағалау критерийлері бойынша тексеру
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs w-fit">
          {[
            { key: 'submitted', label: `Тексеруді күтуде (${pendingCount})` },
            { key: 'checked', label: 'Тексерілген жұмыстар' },
            { key: 'all', label: 'Барлығы' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab.key
                  ? 'bg-nis-navy-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-2 flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Оқушы немесе сынақ атауы..."
            className="w-full text-xs bg-transparent border-none focus:outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nis-navy-800 mx-auto" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filtered.map(sub => (
              <div
                key={sub.id}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {sub.student?.fullName}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        sub.status === 'submitted'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {sub.status === 'submitted' ? 'Тексеруді күтуде' : 'Тексерілді'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-600 mt-1">
                    {sub.mockExam?.title}
                  </p>

                  <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Тапсырылған: {new Date(sub.submittedAt || sub.startedAt).toLocaleString('kk-KZ')}
                    </span>
                  </p>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-center">
                  {sub.status === 'checked' && (
                    <div className="text-right">
                      <span className="text-base font-black text-slate-900">
                        {sub.totalScore} / 60
                      </span>
                      <span className="ml-2 px-2.5 py-1 rounded-lg bg-nis-navy-100 text-nis-navy-800 text-xs font-extrabold">
                        {sub.letterGrade}
                      </span>
                    </div>
                  )}

                  <Link
                    to={`/teacher/grading/${sub.id}`}
                    className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all ${
                      sub.status === 'submitted'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-nis-navy-800 hover:bg-nis-navy-700 text-white'
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>{sub.status === 'submitted' ? 'Тексеруге кірісу' : 'Бағасын көру / өңдеу'}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-slate-700">Жұмыстар табылмады</p>
            <p className="text-xs text-slate-400 mt-1">
              {filter === 'submitted'
                ? 'Тексеруді күтіп тұрған жұмыстар жоқ.'
                : 'Сәйкес келетін жұмыстар табылмады.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
