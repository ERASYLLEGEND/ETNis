import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  BookOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

export const StudentMaterials: React.FC = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'oqylym' | 'jazylym'>('oqylym');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/theory/sections')
      .then(res => setSections(res.data.sections || []))
      .catch(err => console.error('Fetch materials error:', err))
      .finally(() => setLoading(false));
  }, []);

  const currentSection = sections.find(s => s.name === activeTab);
  const rootTopics = currentSection?.topics?.filter((t: any) => !t.parentTopicId) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Жаттығулар мен теориялық ережелер</h1>
        <p className="text-xs text-slate-500 mt-1">
          Оқылым және Жазылым бөлімдері бойынша емтиханға қажетті негізгі тақырыптар мен тесттер
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('oqylym')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'oqylym'
              ? 'bg-nis-navy-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Оқылым бөлімі</span>
        </button>

        <button
          onClick={() => setActiveTab('jazylym')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'jazylym'
              ? 'bg-nis-navy-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Жазылым бөлімі</span>
        </button>
      </div>

      {/* Topics List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nis-navy-800 mx-auto" />
        </div>
      ) : rootTopics.length > 0 ? (
        <div className="space-y-4">
          {rootTopics.map((topic: any) => {
            const subTopics = currentSection?.topics?.filter((t: any) => t.parentTopicId === topic.id) || [];
            const hasQuiz = topic.quizzes && topic.quizzes.length > 0;
            const quiz = hasQuiz ? topic.quizzes[0] : null;
            const latestAttempt = quiz?.attempts?.[0] || null;

            let badge = {
              text: 'Өтілмеген',
              color: 'bg-slate-100 text-slate-600 border-slate-200',
            };

            if (latestAttempt) {
              const pct = latestAttempt.maxScore > 0 ? Math.round((latestAttempt.score / latestAttempt.maxScore) * 100) : 0;
              if (pct >= 80) {
                badge = { text: `${pct}% (Өте жақсы)`, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
              } else if (pct >= 50) {
                badge = { text: `${pct}% (Орташа)`, color: 'bg-amber-100 text-amber-800 border-amber-300' };
              } else {
                badge = { text: `${pct}% (Қайталау керек)`, color: 'bg-rose-100 text-rose-800 border-rose-300' };
              }
            }

            return (
              <div
                key={topic.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden hover:border-nis-navy-300 transition-colors"
              >
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-extrabold text-slate-900 text-base">{topic.title}</h3>
                      {hasQuiz && (
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                          {badge.text}
                        </span>
                      )}
                    </div>
                    {topic.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">{topic.description}</p>
                    )}
                  </div>

                  <Link
                    to={`/student/materials/${topic.id}`}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-nis-navy-800 hover:bg-nis-navy-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
                  >
                    <span>Теорияны оқу</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Subtopics */}
                {subTopics.length > 0 && (
                  <div className="bg-slate-50/60 p-4 px-6 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Ішкі бөлімдер:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {subTopics.map((sub: any) => (
                        <Link
                          key={sub.id}
                          to={`/student/materials/${sub.id}`}
                          className="p-3 bg-white rounded-xl border border-slate-200 hover:border-nis-navy-400 transition-all flex items-center justify-between text-xs font-bold text-slate-800"
                        >
                          <span>{sub.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
          Әзірге тақырыптар қосылмаған
        </div>
      )}
    </div>
  );
};
