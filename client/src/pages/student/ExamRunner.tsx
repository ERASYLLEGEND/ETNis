import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { WordCounterBadge } from '../../components/common/WordCounterBadge';
import { Modal } from '../../components/common/Modal';
import {
  Clock,
  Save,
  Send,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export const ExamRunner: React.FC = () => {
  const { id: mockExamId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<any | null>(null);
  const [submission, setSubmission] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);

  // Student Answers
  const [answer1a, setAnswer1a] = useState('');
  const [answer1ae, setAnswer1ae] = useState('');
  const [task2Option, setTask2Option] = useState<number | null>(null);
  const [answer2, setAnswer2] = useState('');

  // Timer
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(135 * 60);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);

  // Autosave status
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modals
  const [showFiveMinWarning, setShowFiveMinWarning] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Collapsible text panels
  const [showTextA, setShowTextA] = useState(true);
  const [showTextB, setShowTextB] = useState(true);

  // Refs for autosave interval
  const answersRef = useRef({ answer1a, answer1ae, task2Option, answer2, timeSpentSeconds });
  answersRef.current = { answer1a, answer1ae, task2Option, answer2, timeSpentSeconds };

  // 1. Fetch or Start Exam
  useEffect(() => {
    if (!mockExamId) return;

    api.post('/submissions/start', { mockExamId })
      .then(res => {
        const sub = res.data.submission;
        const ex = res.data.exam;
        setExam(ex);
        setSubmission(sub);

        setAnswer1a(sub.answer1aText || '');
        setAnswer1ae(sub.answer1aeText || '');
        setTask2Option(sub.task2ChosenOption || null);
        setAnswer2(sub.answer2Text || '');

        const spent = sub.timeSpentSeconds || 0;
        setTimeSpentSeconds(spent);
        const total = (ex.timeLimitMinutes || 135) * 60;
        const remaining = Math.max(0, total - spent);
        setTimeLeftSeconds(remaining);

        // If previously started, resume immediately
        if (spent > 0 || sub.answer1aText || sub.answer1aeText || sub.answer2Text) {
          setIsStarted(true);
        }
      })
      .catch(err => {
        alert(err.response?.data?.error || 'Сынақты жүктеу кезінде қате орын алды');
        navigate('/student/exams');
      })
      .finally(() => setLoading(false));
  }, [mockExamId, navigate]);

  // 2. Timer Countdown & Auto-Save Interval
  useEffect(() => {
    if (!isStarted || !submission || submission.status !== 'in_progress') return;

    const timerInterval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          handleAutoSubmit();
          return 0;
        }

        if (prev === 5 * 60) {
          setShowFiveMinWarning(true);
        }

        return prev - 1;
      });

      setTimeSpentSeconds(prev => prev + 1);
    }, 1000);

    // Autosave interval every 30 seconds
    const autosaveInterval = setInterval(() => {
      triggerAutosave();
    }, 30000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(autosaveInterval);
    };
  }, [isStarted, submission]);

  const triggerAutosave = async () => {
    if (!submission?.id) return;
    setIsSaving(true);
    try {
      await api.patch(`/submissions/${submission.id}/autosave`, {
        answer1aText: answersRef.current.answer1a,
        answer1aeText: answersRef.current.answer1ae,
        task2ChosenOption: answersRef.current.task2Option,
        answer2Text: answersRef.current.answer2,
        timeSpentSeconds: answersRef.current.timeSpentSeconds,
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Autosave error', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartExam = () => {
    setIsStarted(true);
  };

  const handleAutoSubmit = async () => {
    if (!submission?.id) return;
    setIsSubmitting(true);
    try {
      await api.post(`/submissions/${submission.id}/submit`, {
        answer1aText: answersRef.current.answer1a,
        answer1aeText: answersRef.current.answer1ae,
        task2ChosenOption: answersRef.current.task2Option,
        answer2Text: answersRef.current.answer2,
        timeSpentSeconds: answersRef.current.timeSpentSeconds,
      });
      alert('Уақыт аяқталды! Жұмысыңыз тексеруге автоматты түрде жіберілді.');
      navigate('/student/exams');
    } catch (err) {
      console.error('Auto submit error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!submission?.id) return;
    setIsSubmitting(true);
    try {
      await api.post(`/submissions/${submission.id}/submit`, {
        answer1aText: answer1a,
        answer1aeText: answer1ae,
        task2ChosenOption: task2Option,
        answer2Text: answer2,
        timeSpentSeconds,
      });
      setShowSubmitConfirm(false);
      alert('Жұмысыңыз мұғалімге тексеруге сәтті жіберілді!');
      navigate('/student/exams');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Жұмысты тапсыру кезінде қате орын алды');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nis-navy-800" />
      </div>
    );
  }

  if (!exam || !submission) {
    return null;
  }

  // Format timer MM:SS
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const isTimeCritical = timeLeftSeconds < 10 * 60; // < 10 min

  // =================== PRE-EXAM BRIEFING SCREEN ===================
  if (!isStarted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20">
        <div>
          <Link
            to="/student/exams"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-nis-navy-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Сынақтар тізіміне қайту</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-nis-navy-800 text-white flex items-center justify-center mx-auto shadow-md">
            <Clock className="w-8 h-8 text-emerald-400" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Сыртқы жиынтық бағалау спецификациясы
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {exam.title}
            </h1>
          </div>

          {/* Exam Rules Card */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3 text-xs leading-relaxed text-slate-700">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Емтихан ережелері мен нұсқаулық:</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Орындау уақыты:</strong> 135 минут (2 сағат 15 минут). Уақыт басталған сәттен бастап кері саналады.
              </li>
              <li>
                <strong>Тапсырма құрылымы:</strong>
                <ul className="list-circle pl-5 mt-1 space-y-0.5 text-slate-600">
                  <li>1(а) тапсырма: Екі мәтінді салыстырмалы талдау (15 балл).</li>
                  <li>1(ә) тапсырма: Бағытталған жазылым (150-180 сөз, 20 балл).</li>
                  <li>2-тапсырма: Шығармашылық жазылым (350-450 сөз, 25 балл, 3 тақырыптың бірін таңдау).</li>
                </ul>
              </li>
              <li>
                <strong>Жалпы балл:</strong> 60 балл (рейтингтік буквенді шкала: A*, A, B, C, D, E, U).
              </li>
              <li className="text-rose-700 font-bold">
                ⚠️ Сөздіктер мен қосымша көмекші құралдарды пайдалануға қатаң тыйым салынады!
              </li>
              <li>
                <strong>Автосақтау:</strong> Жазған жауаптарыңыз әр 30 секунд сайын серверде автоматты сақталып отырады.
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <button
              onClick={handleStartExam}
              className="px-8 py-3.5 bg-nis-navy-800 hover:bg-nis-navy-700 text-white rounded-2xl text-sm font-black shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
            >
              <span>Сынақ емтиханды бастау</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =================== ACTIVE EXAM TAKING VIEW ===================
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-28">
      {/* Sticky Top Header: Countdown Timer & Save Status */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md p-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-mono text-base sm:text-lg font-black tracking-wider transition-all ${
              isTimeCritical
                ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                : 'bg-nis-navy-50 text-nis-navy-900 border border-nis-navy-200'
            }`}
          >
            <Clock className={`w-5 h-5 ${isTimeCritical ? 'text-rose-600' : 'text-nis-navy-700'}`} />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <div className="hidden sm:block text-[11px] text-slate-400">
            {isSaving ? (
              <span className="text-amber-600 font-bold">Сақталуда...</span>
            ) : lastSaved ? (
              <span>Соңғы сақтау: {lastSaved.toLocaleTimeString('kk-KZ')}</span>
            ) : (
              <span>Автосақтау қосулы</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={triggerAutosave}
            disabled={isSaving}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors hidden sm:inline-flex items-center space-x-1"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Сақтау</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSubmitConfirm(true)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Жұмысты тапсыру</span>
          </button>
        </div>
      </div>

      {/* Accordion Source Texts A and B */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-nis-navy-800" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Оқылым мәтіндері (А және Ә)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Жауап жазу кезінде ыңғайлы болу үшін панельдерді ашып-жаба аласыз
          </span>
        </div>

        {/* Text A */}
        <div className="border-b border-slate-100">
          <button
            type="button"
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
            <div className="p-5 bg-slate-50/50 text-xs text-slate-700 leading-relaxed border-t border-slate-100 whitespace-pre-wrap">
              {exam.textAContent}
            </div>
          )}
        </div>

        {/* Text B */}
        <div>
          <button
            type="button"
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
            <div className="p-5 bg-slate-50/50 text-xs text-slate-700 leading-relaxed border-t border-slate-100 whitespace-pre-wrap">
              {exam.textBContent}
            </div>
          )}
        </div>
      </div>

      {/* Task 1(a): Comparative Analysis */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-nis-navy-100 text-nis-navy-800 mr-2">
              1(а) тапсырма
            </span>
            <span className="text-xs font-bold text-slate-700">Мәтіндерді салыстырмалы талдау (15 балл)</span>
          </div>
          <WordCounterBadge text={answer1a} />
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
          <strong>Нұсқаулық:</strong> {exam.task1aInstruction}
        </div>

        <textarea
          rows={7}
          value={answer1a}
          onChange={e => setAnswer1a(e.target.value)}
          placeholder="Екі мәтіннің мақсаты мен стилін, тілдік құралдарын, ұқсастығы мен айырмашылығын салыстырып жазыңыз..."
          className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white leading-relaxed font-sans"
        />
      </div>

      {/* Task 1(ae): Directed Writing (150-180 words) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-nis-navy-100 text-nis-navy-800 mr-2">
              1(ә) тапсырма
            </span>
            <span className="text-xs font-bold text-slate-700">Бағытталған жазылым (20 балл, 150-180 сөз)</span>
          </div>
          <WordCounterBadge
            text={answer1ae}
            minWords={exam.task1aeWordMin}
            maxWords={exam.task1aeWordMax}
          />
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
          <strong>Тақырып:</strong> {exam.task1aeInstruction}
        </div>

        <textarea
          rows={8}
          value={answer1ae}
          onChange={e => setAnswer1ae(e.target.value)}
          placeholder="Берілген аудиторияға арнап мақала/эссе жазыңыз (150-180 сөз аралығында)..."
          className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white leading-relaxed font-sans"
        />
      </div>

      {/* Task 2: Creative Writing (350-450 words) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-nis-navy-100 text-nis-navy-800 mr-2">
              2-тапсырма
            </span>
            <span className="text-xs font-bold text-slate-700">Шығармашылық жазылым (25 балл, 350-450 сөз)</span>
          </div>
          <WordCounterBadge
            text={answer2}
            minWords={exam.task2WordMin}
            maxWords={exam.task2WordMax}
          />
        </div>

        {/* 3 Prompts Options Radio Cards */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-700">
            Ұсынылған үш тақырыптың біреуін таңдаңыз:
          </p>

          {[
            { num: 1, text: exam.task2Option1 },
            { num: 2, text: exam.task2Option2 },
            { num: 3, text: exam.task2Option3 },
          ].map(opt => (
            <label
              key={opt.num}
              className={`flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                task2Option === opt.num
                  ? 'border-nis-navy-800 bg-nis-navy-50/60 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="task2_prompt"
                checked={task2Option === opt.num}
                onChange={() => setTask2Option(opt.num)}
                className="mt-0.5 text-nis-navy-800 focus:ring-nis-navy-600"
              />
              <span className="text-xs font-medium text-slate-800 leading-relaxed">
                {opt.text}
              </span>
            </label>
          ))}
        </div>

        <textarea
          rows={12}
          value={answer2}
          onChange={e => setAnswer2(e.target.value)}
          placeholder="Таңдалған тақырып бойынша шығармашылық ой-толғау жазыңыз (350-450 сөз)..."
          className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white leading-relaxed font-sans"
        />
      </div>

      {/* 5-minute Warning Modal */}
      <Modal
        isOpen={showFiveMinWarning}
        onClose={() => setShowFiveMinWarning(false)}
        title="Уақыт туралы ескерту"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">
            Сынақ емтиханның аяқталуына 5 минут қалды!
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Жазған жұмысыңызды тексеріп, сөз сандарын бақылаңыз. Уақыт аяқталған соң жұмыс автоматты түрде тапсырылады.
          </p>
          <button
            onClick={() => setShowFiveMinWarning(false)}
            className="px-6 py-2 bg-nis-navy-800 text-white rounded-xl text-xs font-bold"
          >
            Жалғастыру
          </button>
        </div>
      </Modal>

      {/* Manual Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        title="Жұмысты тексеруге жіберуді растайсыз ба?"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs leading-relaxed">
            <strong>Ескерту:</strong> Сіз жұмысты тапсырғаннан кейін оны қайта өзгерте немесе толықтыра алмайсыз. Мұғалім жұмысыңызды тексергеннен кейін баға қойылады.
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
            <div>• 1(а) тапсырма: <strong className="text-slate-800">{answer1a ? 'Орындалды' : 'Бос'}</strong></div>
            <div>• 1(ә) тапсырма: <strong className="text-slate-800">{answer1ae ? 'Орындалды' : 'Бос'}</strong></div>
            <div>• 2-тапсырма: <strong className="text-slate-800">{answer2 ? `${task2Option || '?'}-нұсқа бойынша орындалды` : 'Бос'}</strong></div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setShowSubmitConfirm(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Қайтып қарау
            </button>
            <button
              onClick={handleManualSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Жіберілуде...' : 'Иә, жұмысты тапсырамын'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
