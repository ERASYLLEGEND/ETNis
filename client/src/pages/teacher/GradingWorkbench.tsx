import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { WordCounterBadge } from '../../components/common/WordCounterBadge';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Sparkles,
} from 'lucide-react';

export const GradingWorkbench: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Collapsible text panels
  const [showTextA, setShowTextA] = useState(false);
  const [showTextB, setShowTextB] = useState(false);

  // Scores and Comments
  const [score1a, setScore1a] = useState<number>(0);
  const [comment1a, setComment1a] = useState<string>('');

  const [score1ae, setScore1ae] = useState<number>(0);
  const [comment1ae, setComment1ae] = useState<string>('');

  const [score2, setScore2] = useState<number>(0);
  const [comment2, setComment2] = useState<string>('');

  useEffect(() => {
    if (id) {
      api.get(`/submissions/${id}`)
        .then(res => {
          const sub = res.data.submission;
          setData(res.data);
          setScore1a(sub.score1a ?? 0);
          setComment1a(sub.teacherComment1a ?? '');
          setScore1ae(sub.score1ae ?? 0);
          setComment1ae(sub.teacherComment1ae ?? '');
          setScore2(sub.score2 ?? 0);
          setComment2(sub.teacherComment2 ?? '');
        })
        .catch(err => console.error('Fetch submission error:', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nis-navy-800" />
      </div>
    );
  }

  if (!data?.submission) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 font-bold">Жұмыс табылмады</p>
        <Link to="/teacher/grading" className="mt-3 text-xs text-nis-navy-700 underline">
          Тексеру тізіміне оралу
        </Link>
      </div>
    );
  }

  const { submission } = data;
  const exam = submission.mockExam;

  let rubrics: any = {};
  try {
    rubrics = JSON.parse(exam.scoringCriteriaJson);
  } catch (e) {
    rubrics = {};
  }

  const totalScore = (score1a || 0) + (score1ae || 0) + (score2 || 0);
  const maxScore = exam.task1aMaxScore + exam.task1aeMaxScore + exam.task2MaxScore; // 60
  const percentage = Math.round((totalScore / maxScore) * 100);

  // Letter Grade calculation
  let letterGrade = 'U';
  let letterGradeColor = 'bg-gray-100 text-gray-800 border-gray-300';
  if (percentage >= 90) {
    letterGrade = 'A*';
    letterGradeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (percentage >= 80) {
    letterGrade = 'A';
    letterGradeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (percentage >= 70) {
    letterGrade = 'B';
    letterGradeColor = 'bg-blue-100 text-blue-800 border-blue-300';
  } else if (percentage >= 55) {
    letterGrade = 'C';
    letterGradeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (percentage >= 40) {
    letterGrade = 'D';
    letterGradeColor = 'bg-orange-100 text-orange-800 border-orange-300';
  } else if (percentage >= 25) {
    letterGrade = 'E';
    letterGradeColor = 'bg-rose-100 text-rose-800 border-rose-300';
  }

  const handleFinishGrading = async () => {
    setError(null);
    setSaving(true);

    try {
      await api.post(`/teacher/submissions/${id}/grade`, {
        score1a: Number(score1a),
        score1ae: Number(score1ae),
        score2: Number(score2),
        teacherComment1a: comment1a,
        teacherComment1ae: comment1ae,
        teacherComment2: comment2,
      });

      alert('Бағалау сәтті аяқталды және сақталды!');
      navigate('/teacher/grading');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Бағалауды сақтау кезінде қате шықты');
    } finally {
      setSaving(false);
    }
  };

  const chosenOptionText =
    submission.task2ChosenOption === 1
      ? exam.task2Option1
      : submission.task2ChosenOption === 2
      ? exam.task2Option2
      : submission.task2ChosenOption === 3
      ? exam.task2Option3
      : 'Тақырып белгіленбеген';

  return (
    <div className="space-y-6 pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-4">
          <Link
            to="/teacher/grading"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900">{submission.student?.fullName}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                submission.status === 'checked' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {submission.status === 'checked' ? 'Бағаланған' : 'Тексеру үстінде'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {exam.title} • Тапсырылған: {new Date(submission.submittedAt || submission.startedAt).toLocaleString('kk-KZ')}
            </p>
          </div>
        </div>

        {/* Live score summary widget */}
        <div className="flex items-center space-x-3 bg-slate-50 p-2.5 px-4 rounded-2xl border border-slate-200">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Жалпы балл</span>
            <span className="text-lg font-black text-nis-navy-800">
              {totalScore} <span className="text-xs font-normal text-slate-500">/ {maxScore}</span>
            </span>
          </div>
          <div className={`px-3 py-1 rounded-xl font-black text-sm border shadow-xs ${letterGradeColor}`}>
            {letterGrade}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT COLUMN: Student Work (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Collapsible Source Texts A & B */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Түпнұсқа мәтіндер (Анықтамалық)
              </span>
              <span className="text-[11px] text-slate-400">Салдарынан шаршамау үшін жинақтауға болады</span>
            </div>

            {/* Text A Accordion */}
            <div className="border-b border-slate-100">
              <button
                onClick={() => setShowTextA(!showTextA)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-blue-100 text-blue-800">А мәтіні</span>
                  <span className="text-xs font-bold text-slate-800">{exam.textATitle}</span>
                </div>
                {showTextA ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {showTextA && (
                <div className="p-4 bg-slate-50/60 text-xs text-slate-700 leading-relaxed border-t border-slate-100">
                  {exam.textAContent}
                </div>
              )}
            </div>

            {/* Text B Accordion */}
            <div>
              <button
                onClick={() => setShowTextB(!showTextB)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-purple-100 text-purple-800">Ә мәтіні</span>
                  <span className="text-xs font-bold text-slate-800">{exam.textBTitle}</span>
                </div>
                {showTextB ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {showTextB && (
                <div className="p-4 bg-slate-50/60 text-xs text-slate-700 leading-relaxed border-t border-slate-100">
                  {exam.textBContent}
                </div>
              )}
            </div>
          </div>

          {/* Task 1(a) Answer */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-nis-navy-100 text-nis-navy-800 mr-2">
                  1(а) тапсырма
                </span>
                <span className="text-xs text-slate-500 font-medium">Мәтіндерді салыстырмалы талдау</span>
              </div>
              <WordCounterBadge text={submission.answer1aText} />
            </div>

            <div className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
              «{exam.task1aInstruction}»
            </div>

            <div className="bg-slate-50/40 p-4 rounded-2xl border border-slate-200/80 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
              {submission.answer1aText || <span className="text-slate-400 italic">Оқушы жауап жазбаған</span>}
            </div>
          </div>

          {/* Task 1(ae) Answer */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-nis-navy-100 text-nis-navy-800 mr-2">
                  1(ә) тапсырма
                </span>
                <span className="text-xs text-slate-500 font-medium">Бағытталған жазылым (150-180 сөз)</span>
              </div>
              <WordCounterBadge
                text={submission.answer1aeText}
                minWords={exam.task1aeWordMin}
                maxWords={exam.task1aeWordMax}
              />
            </div>

            <div className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
              «{exam.task1aeInstruction}»
            </div>

            <div className="bg-slate-50/40 p-4 rounded-2xl border border-slate-200/80 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
              {submission.answer1aeText || <span className="text-slate-400 italic">Оқушы жауап жазбаған</span>}
            </div>
          </div>

          {/* Task 2 Answer */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-nis-navy-100 text-nis-navy-800 mr-2">
                  2-тапсырма
                </span>
                <span className="text-xs text-slate-500 font-medium">Шығармашылық жазылым (350-450 сөз)</span>
              </div>
              <WordCounterBadge
                text={submission.answer2Text}
                minWords={exam.task2WordMin}
                maxWords={exam.task2WordMax}
              />
            </div>

            <div className="text-xs text-slate-700 bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
              <span className="font-bold text-amber-900 block mb-1">
                Оқушы таңдаған тақырып ({submission.task2ChosenOption || '?'}-нұсқа):
              </span>
              «{chosenOptionText}»
            </div>

            <div className="bg-slate-50/40 p-4 rounded-2xl border border-slate-200/80 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
              {submission.answer2Text || <span className="text-slate-400 italic">Оқушы жауап жазбаған</span>}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Official Criteria & Grading (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          {/* 1(a) Criteria & Score */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">1(а) тапсырмасын бағалау</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400">Балл:</span>
                <input
                  type="number"
                  min={0}
                  max={exam.task1aMaxScore}
                  value={score1a}
                  onChange={e => setScore1a(Math.min(exam.task1aMaxScore, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-16 px-2.5 py-1 text-center font-black text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-nis-navy-600 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">/ {exam.task1aMaxScore}</span>
              </div>
            </div>

            {/* Criteria bands */}
            {rubrics.task1a?.ranges && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {rubrics.task1a.ranges.map((r: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => {
                      // auto pick mid of range
                      const parts = r.range.split('-').map((n: string) => parseInt(n));
                      if (parts.length === 2) setScore1a(parts[1]);
                      else setScore1a(parseInt(r.range) || 0);
                    }}
                    className="p-2 rounded-xl text-xs border border-slate-100 bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                      <span className="text-nis-navy-800">{r.range} балл</span>
                      <span className="text-[10px] text-slate-400">Басу арқылы қою</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight line-clamp-2">{r.desc}</p>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Мұғалім түсініктемесі (1а)
              </label>
              <textarea
                rows={2}
                value={comment1a}
                onChange={e => setComment1a(e.target.value)}
                placeholder="Талдаудың күшті тұстары мен ұсыныстар..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
              />
            </div>
          </div>

          {/* 1(ae) Criteria & Score */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">1(ә) тапсырмасын бағалау</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400">Балл:</span>
                <input
                  type="number"
                  min={0}
                  max={exam.task1aeMaxScore}
                  value={score1ae}
                  onChange={e => setScore1ae(Math.min(exam.task1aeMaxScore, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-16 px-2.5 py-1 text-center font-black text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-nis-navy-600 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">/ {exam.task1aeMaxScore}</span>
              </div>
            </div>

            {/* Criteria bands */}
            {rubrics.task1ae?.ranges && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {rubrics.task1ae.ranges.map((r: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const parts = r.range.split('-').map((n: string) => parseInt(n));
                      if (parts.length === 2) setScore1ae(parts[1]);
                      else setScore1ae(parseInt(r.range) || 0);
                    }}
                    className="p-2 rounded-xl text-xs border border-slate-100 bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                      <span className="text-nis-navy-800">{r.range} балл</span>
                      <span className="text-[10px] text-slate-400">Басу арқылы қою</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight line-clamp-2">{r.desc}</p>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Мұғалім түсініктемесі (1ә)
              </label>
              <textarea
                rows={2}
                value={comment1ae}
                onChange={e => setComment1ae(e.target.value)}
                placeholder="Сөз саны, стиль, орфография бойынша кері байланыс..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Task 2 Criteria & Score */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">2-тапсырманы бағалау</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400">Балл:</span>
                <input
                  type="number"
                  min={0}
                  max={exam.task2MaxScore}
                  value={score2}
                  onChange={e => setScore2(Math.min(exam.task2MaxScore, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-16 px-2.5 py-1 text-center font-black text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-nis-navy-600 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">/ {exam.task2MaxScore}</span>
              </div>
            </div>

            {/* Criteria bands */}
            {rubrics.task2?.ranges && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {rubrics.task2.ranges.map((r: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const parts = r.range.split('-').map((n: string) => parseInt(n));
                      if (parts.length === 2) setScore2(parts[1]);
                      else setScore2(parseInt(r.range) || 0);
                    }}
                    className="p-2 rounded-xl text-xs border border-slate-100 bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                      <span className="text-nis-navy-800">{r.range} балл</span>
                      <span className="text-[10px] text-slate-400">Басу арқылы қою</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight line-clamp-2">{r.desc}</p>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Мұғалім түсініктемесі (2-тапсырма)
              </label>
              <textarea
                rows={2}
                value={comment2}
                onChange={e => setComment2(e.target.value)}
                placeholder="Шығармашылық ой, сөз байлығы, көркемдегіш құралдар..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Жиынтық баға</span>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black text-slate-900">{totalScore} / {maxScore}</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${letterGradeColor}`}>
                  {letterGrade} ({percentage}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/teacher/grading')}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Кейінге қалдыру
            </button>
            <button
              onClick={handleFinishGrading}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-nis-navy-800 hover:bg-nis-navy-700 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{saving ? 'Сақталуда...' : 'Бағалауды аяқтау (Нәтижені бекіту)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
