import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const QuizRunner: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [quiz, setQuiz] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Student answers: { [questionId: string]: string | string[] | { [pairId: string]: string } }
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [result, setResult] = useState<any | null>(null);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setResult(null);
      setAnswers({});
      const res = await api.get(`/quizzes/${id}`);
      setQuiz(res.data.quiz);
    } catch (err) {
      console.error('Fetch quiz error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchQuiz();
  }, [id]);

  const handleSingleSelect = (questionId: string, optionId: string) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleMultipleSelect = (questionId: string, optionId: string) => {
    const current = answers[questionId] || [];
    let updated = [];
    if (current.includes(optionId)) {
      updated = current.filter((item: string) => item !== optionId);
    } else {
      updated = [...current, optionId];
    }
    setAnswers({ ...answers, [questionId]: updated });
  };

  const handleMatchingSelect = (questionId: string, pairId: string, rightText: string) => {
    const current = answers[questionId] || {};
    setAnswers({
      ...answers,
      [questionId]: {
        ...current,
        [pairId]: rightText,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.post(`/quizzes/${id}/submit`, { answers });
      setResult(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert('Тестті тексеру кезінде қате орын алды');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nis-navy-800" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 font-bold">Тест табылмады</p>
        <Link to="/student/materials" className="mt-3 text-xs text-nis-navy-700 underline">
          Материалдарға оралу
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Back button */}
      <div>
        <Link
          to={`/student/materials/${quiz.topic?.id}`}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-nis-navy-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Тақырыпқа оралу</span>
        </Link>
      </div>

      {/* Result Banner if submitted */}
      {result && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-4 text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-md ${
              result.passed
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-rose-100 text-rose-600'
            }`}
          >
            {result.passed ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : (
              <XCircle className="w-8 h-8" />
            )}
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Тест нәтижесі
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-0.5">
              {result.percentage}% ({result.score} / {result.maxScore} балл)
            </h2>
            <p className="text-xs font-semibold mt-1">
              {result.passed ? (
                <span className="text-emerald-700">Тамаша! Сынақтан сәтті өттіңіз.</span>
              ) : (
                <span className="text-rose-700">Шекті балл жиналмады (Өту балы: {quiz.passingScore}%). Қайталап көріңіз.</span>
              )}
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={fetchQuiz}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-nis-navy-800 hover:bg-nis-navy-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Қайта тапсыру</span>
            </button>
          </div>
        </div>
      )}

      {/* Quiz Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Мини-тест • {quiz.questions?.length} сұрақ
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{quiz.title}</h1>
      </div>

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {quiz.questions?.map((q: any, qIndex: number) => {
          const feedback = result?.feedback?.find((f: any) => f.questionId === q.id);

          return (
            <div
              key={q.id}
              className={`bg-white rounded-3xl border p-6 space-y-4 transition-all ${
                feedback
                  ? feedback.isCorrect
                    ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                    : 'border-rose-300 bg-rose-50/20 shadow-xs'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="w-7 h-7 rounded-xl bg-nis-navy-800 text-white flex items-center justify-center text-xs font-black shrink-0">
                    {qIndex + 1}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                    {q.questionType === 'single_choice'
                      ? 'Бір жауапты'
                      : q.questionType === 'multiple_choice'
                      ? 'Көп жауапты'
                      : 'Сәйкестендіру'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500">{q.points} балл</span>
                  {feedback && (
                    <span className="block text-[11px] font-extrabold text-emerald-700">
                      {feedback.pointsEarned} балл алынды
                    </span>
                  )}
                </div>
              </div>

              {/* Question text */}
              <p className="text-sm font-bold text-slate-900 leading-relaxed">{q.questionText}</p>

              {/* Single Choice Options */}
              {q.questionType === 'single_choice' && (
                <div className="space-y-2 pt-2">
                  {q.options?.map((opt: any) => {
                    const isSelected = answers[q.id] === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center space-x-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-nis-navy-800 bg-nis-navy-50/50 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value={opt.id}
                          disabled={!!result}
                          checked={isSelected}
                          onChange={() => handleSingleSelect(q.id, opt.id)}
                          className="w-4 h-4 text-nis-navy-800 focus:ring-nis-navy-600"
                        />
                        <span className="text-xs font-medium text-slate-800">{opt.optionText}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Multiple Choice Options */}
              {q.questionType === 'multiple_choice' && (
                <div className="space-y-2 pt-2">
                  {q.options?.map((opt: any) => {
                    const currentSelected = answers[q.id] || [];
                    const isSelected = currentSelected.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center space-x-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-nis-navy-800 bg-nis-navy-50/50 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={opt.id}
                          disabled={!!result}
                          checked={isSelected}
                          onChange={() => handleMultipleSelect(q.id, opt.id)}
                          className="w-4 h-4 text-nis-navy-800 rounded-md focus:ring-nis-navy-600"
                        />
                        <span className="text-xs font-medium text-slate-800">{opt.optionText}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Matching Pairs */}
              {q.questionType === 'matching' && (
                <div className="space-y-3 pt-2">
                  <p className="text-[11px] text-slate-500">
                    Әрбір сол жақтағы ұғымға сәйкес оң жақтағы анықтаманы таңдаңыз:
                  </p>
                  {q.leftItems?.map((left: any) => (
                    <div
                      key={left.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <span className="text-xs font-bold text-slate-900 sm:w-1/2">
                        {left.leftText}
                      </span>
                      <select
                        disabled={!!result}
                        value={answers[q.id]?.[left.id] || ''}
                        onChange={e => handleMatchingSelect(q.id, left.id, e.target.value)}
                        className="w-full sm:w-1/2 p-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-nis-navy-600"
                      >
                        <option value="">Сәйкестікті таңдаңыз...</option>
                        {q.shuffledRightItems?.map((right: any) => (
                          <option key={right.id} value={right.rightText}>
                            {right.rightText}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Post-submit Feedback Details */}
              {feedback && (
                <div className="mt-4 p-3 rounded-2xl bg-white border text-xs space-y-1">
                  <p className="font-bold text-slate-700">
                    Нәтиже: {feedback.isCorrect ? '✅ Дұрыс' : '❌ Қате'}
                  </p>
                  {feedback.correctAnswer && !feedback.isCorrect && (
                    <p className="text-slate-600">
                      <strong>Дұрыс жауап:</strong> {Array.isArray(feedback.correctAnswer) ? feedback.correctAnswer.join(', ') : feedback.correctAnswer}
                    </p>
                  )}
                  {feedback.pairsBreakdown && (
                    <div className="space-y-1 pt-1">
                      {feedback.pairsBreakdown.map((p: any, pIdx: number) => (
                        <div key={pIdx} className="text-[11px]">
                          <span>• {p.leftText}: </span>
                          <strong className={p.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                            {p.studentRightText}
                          </strong>
                          {!p.isCorrect && (
                            <span className="text-slate-500"> (Дұрысы: {p.rightText})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {!result && (
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-nis-navy-800 hover:bg-nis-navy-700 text-white rounded-2xl text-xs font-black shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Тексерілуде...' : 'Тестті аяқтау'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
