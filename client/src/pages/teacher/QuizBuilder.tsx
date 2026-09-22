import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Save,
  CheckSquare,
  ListOrdered,
} from 'lucide-react';
import { QuestionType } from '../../types';

export const QuizBuilder: React.FC = () => {
  const { id: topicId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (topicId) {
      api.get(`/theory/topics/${topicId}`)
        .then(res => {
          const t = res.data.topic;
          setTopic(t);
          setTitle(`«${t.title}» бойынша мини-тест`);

          if (t.quizzes && t.quizzes.length > 0) {
            const existingQuiz = t.quizzes[0];
            // fetch full quiz details
            api.get(`/quizzes/${existingQuiz.id}`)
              .then(qRes => {
                const q = qRes.data.quiz;
                setTitle(q.title);
                setPassingScore(q.passingScore || 70);
                setQuestions(q.questions || []);
              })
              .catch(() => {});
          } else {
            // Default first question
            setQuestions([
              {
                questionText: 'Сұрақ мәтінін жазыңыз',
                questionType: 'single_choice',
                points: 1,
                options: [
                  { optionText: '1-нұсқа', isCorrect: true, orderIndex: 0 },
                  { optionText: '2-нұсқа', isCorrect: false, orderIndex: 1 },
                ],
              },
            ]);
          }
        })
        .catch(err => console.error('Fetch topic error:', err))
        .finally(() => setLoading(false));
    }
  }, [topicId]);

  const addQuestion = (type: QuestionType) => {
    if (type === 'matching') {
      setQuestions([
        ...questions,
        {
          questionText: 'Сәйкестендіру тапсырмасы',
          questionType: 'matching',
          points: 2,
          matchingPairs: [
            { leftItemText: '1-ұғым', rightItemText: '1-анықтама', orderIndex: 0 },
            { leftItemText: '2-ұғым', rightItemText: '2-анықтама', orderIndex: 1 },
          ],
        },
      ]);
    } else {
      setQuestions([
        ...questions,
        {
          questionText: 'Жаңа сұрақ',
          questionType: type,
          points: 1,
          options: [
            { optionText: 'Дұрыс нұсқа', isCorrect: true, orderIndex: 0 },
            { optionText: 'Бұрыс нұсқа', isCorrect: false, orderIndex: 1 },
          ],
        },
      ]);
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].questionText = text;
    setQuestions(updated);
  };

  const updateQuestionPoints = (index: number, pts: number) => {
    const updated = [...questions];
    updated[index].points = pts;
    setQuestions(updated);
  };

  // Option actions
  const addOption = (qIndex: number) => {
    const updated = [...questions];
    const opts = updated[qIndex].options || [];
    opts.push({ optionText: `Жаңа нұсқа`, isCorrect: false, orderIndex: opts.length });
    updated[qIndex].options = opts;
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.filter((_: any, i: number) => i !== optIndex);
    setQuestions(updated);
  };

  const toggleOptionCorrect = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    const q = updated[qIndex];
    if (q.questionType === 'single_choice') {
      q.options.forEach((opt: any, i: number) => {
        opt.isCorrect = i === optIndex;
      });
    } else {
      q.options[optIndex].isCorrect = !q.options[optIndex].isCorrect;
    }
    setQuestions(updated);
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex].optionText = text;
    setQuestions(updated);
  };

  // Matching pair actions
  const addMatchingPair = (qIndex: number) => {
    const updated = [...questions];
    const pairs = updated[qIndex].matchingPairs || [];
    pairs.push({
      leftItemText: `Жаңа ұғым`,
      rightItemText: `Жаңа анықтама`,
      orderIndex: pairs.length,
    });
    updated[qIndex].matchingPairs = pairs;
    setQuestions(updated);
  };

  const removeMatchingPair = (qIndex: number, pairIndex: number) => {
    const updated = [...questions];
    updated[qIndex].matchingPairs = updated[qIndex].matchingPairs.filter((_: any, i: number) => i !== pairIndex);
    setQuestions(updated);
  };

  const updatePair = (qIndex: number, pairIndex: number, field: 'leftItemText' | 'rightItemText', val: string) => {
    const updated = [...questions];
    updated[qIndex].matchingPairs[pairIndex][field] = val;
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Тест атауын енгізіңіз');
      return;
    }

    if (questions.length === 0) {
      alert('Кемінде бір сұрақ қосыңыз');
      return;
    }

    setSaving(true);
    try {
      await api.post('/teacher/quizzes', {
        topicId,
        title,
        passingScore,
        questions,
      });

      alert('Мини-тест сәтті сақталды!');
      navigate('/teacher/materials');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Тестті сақтау кезінде қате орын алды');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nis-navy-800" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/teacher/materials"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-nis-navy-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Материалдарға оралу</span>
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-nis-navy-800 hover:bg-nis-navy-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Сақталуда...' : 'Тестті сақтау'}</span>
        </button>
      </div>

      {/* Quiz Config Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Тақырып:</span>
          <h2 className="text-base font-extrabold text-slate-900">{topic?.title}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Мини-тест атауы
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Өту балы (%)
            </label>
            <input
              type="number"
              value={passingScore}
              onChange={e => setPassingScore(parseInt(e.target.value) || 70)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Сұрақтар тізімі ({questions.length})
          </h3>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => addQuestion('single_choice')}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all"
            >
              + Бір жауапты
            </button>
            <button
              type="button"
              onClick={() => addQuestion('multiple_choice')}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all"
            >
              + Көп жауапты
            </button>
            <button
              type="button"
              onClick={() => addQuestion('matching')}
              className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold transition-all"
            >
              + Сәйкестендіру
            </button>
          </div>
        </div>

        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4"
          >
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-xl bg-nis-navy-800 text-white flex items-center justify-center text-xs font-black">
                  {qIndex + 1}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                  {q.questionType === 'single_choice'
                    ? 'Бір дұрыс жауап'
                    : q.questionType === 'multiple_choice'
                    ? 'Көп дұрыс жауап'
                    : 'Сәйкестендіру'}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-slate-400">Балл:</span>
                  <input
                    type="number"
                    min={1}
                    value={q.points}
                    onChange={e => updateQuestionPoints(qIndex, parseInt(e.target.value) || 1)}
                    className="w-12 px-1.5 py-0.5 text-xs text-center border border-slate-200 rounded-md font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Сұрақ мәтіні
              </label>
              <input
                type="text"
                value={q.questionText}
                onChange={e => updateQuestionText(qIndex, e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
              />
            </div>

            {/* Options for Choice questions */}
            {q.questionType !== 'matching' && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Жауап нұсқалары:</span>
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="text-xs font-bold text-nis-navy-700 hover:text-nis-navy-900"
                  >
                    + Нұсқа қосу
                  </button>
                </div>

                {q.options?.map((opt: any, optIndex: number) => (
                  <div key={optIndex} className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => toggleOptionCorrect(qIndex, optIndex)}
                      title={opt.isCorrect ? 'Дұрыс жауап' : 'Дұрыс деп белгілеу'}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        opt.isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={opt.optionText}
                      onChange={e => updateOptionText(qIndex, optIndex, e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(qIndex, optIndex)}
                      className="text-slate-300 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Matching Pairs */}
            {q.questionType === 'matching' && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Сәйкестік жұптары:</span>
                  <button
                    type="button"
                    onClick={() => addMatchingPair(qIndex)}
                    className="text-xs font-bold text-nis-navy-700 hover:text-nis-navy-900"
                  >
                    + Жұп қосу
                  </button>
                </div>

                {q.matchingPairs?.map((pair: any, pIndex: number) => (
                  <div key={pIndex} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Сол жақ ұғым"
                      value={pair.leftItemText}
                      onChange={e => updatePair(qIndex, pIndex, 'leftItemText', e.target.value)}
                      className="sm:col-span-5 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <div className="sm:col-span-2 text-center text-xs text-slate-400 font-bold">
                      ↔
                    </div>
                    <input
                      type="text"
                      placeholder="Оң жақ сәйкестік"
                      value={pair.rightItemText}
                      onChange={e => updatePair(qIndex, pIndex, 'rightItemText', e.target.value)}
                      className="sm:col-span-4 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <div className="sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeMatchingPair(qIndex, pIndex)}
                        className="text-slate-300 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
