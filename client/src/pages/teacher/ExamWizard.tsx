import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Clock,
  Award,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export const ExamWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: 'Сынақ емтихан №2 (10-сынып Т1)',
    timeLimitMinutes: 135,
    textATitle: 'А мәтіні (Көркем шығарма)',
    textAContent: `Тау бөктеріндегі ауыл табиғаты өзгеше бір тылсым күйге енгендей еді. Көкжиектен күн қызарып батып, салқын тау лебі есе бастады. Қарт диқан қолындағы күрегіне сүйеніп, ұшы-қиырсыз алқапқа көз жүгіртті. Ол осы топыраққа бар ғұмырын арнаған, әрбір дәннің қалай көктеп шыққанын жадында сақтаған жан болатын...`,
    textBTitle: 'Ә мәтіні (Публицистикалық мақала)',
    textBContent: `Бүгінде ауыл шаруашылығы мен дәстүрлі еңбек мәдениеті жаңа технологиялар дәуіріне қадам басуда. Алайда, еңбекке деген адалдық пен ата-баба аманаты ұмыт қалмауы тиіс. Қазіргі жастардың көбі қалалық жайлы өмірге ұмтылғанымен, жер-ананың қадірін түсіну — ұлттық қауіпсіздік пен тұрақтылықтың басты кепілі болып қала бермек...`,
    task1aInstruction: 'Екі мәтінді салыстырып, олардың мақсаты мен аудиториясын, тілі мен стилін, формасын, ұқсастығы мен айырмашылығын сараптаңыз.',
    task1aMaxScore: 15,
    task1aeInstruction: '«Ауыл шаруашылығы және жастар: туған жерге үлес қосу парыз ба?» тақырыбында жастарға арнап үндеу-мақала жазыңыз. (150-180 сөз)',
    task1aeWordMin: 150,
    task1aeWordMax: 180,
    task1aeMaxScore: 20,
    task2Option1: '1-тақырып: Таң алдындағы үміт. Ескі теміржол бекетінде болған ерекше оқиға... (Шығармашылық әңгіме)',
    task2Option2: '2-тақырып: «Еңбегіне қарай — құрметі» мақалының өмірлік мәні туралы ой толғаңыз.',
    task2Option3: '3-тақырып: Ақылды ауыл (Smart Village): болашақта қазақ ауылдары қалай өзгереді? (Эссе-болжам)',
    task2WordMin: 350,
    task2WordMax: 450,
    task2MaxScore: 25,
  });

  const steps = [
    { num: 1, label: 'Жалпы ақпарат' },
    { num: 2, label: 'Мәтін А' },
    { num: 3, label: 'Мәтін Ә' },
    { num: 4, label: '1(а) тапсырма' },
    { num: 5, label: '1(ә) тапсырма' },
    { num: 6, label: '2-тапсырма' },
    { num: 7, label: 'Алдын ала көру' },
  ];

  const handleNext = () => {
    if (currentStep < 7) setCurrentStep(c => c + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const handleSubmit = async (status: 'published' | 'draft') => {
    setError(null);
    setLoading(true);

    try {
      await api.post('/exams', {
        ...formData,
        status,
      });
      navigate('/teacher/exams');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Сынақты сақтау кезінде қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/teacher/exams"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-nis-navy-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Сынақтарға оралу</span>
        </Link>
        <div className="text-xs font-bold text-slate-400">
          Қадам {currentStep} / 7
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px]">
          {steps.map(s => {
            const isCompleted = s.num < currentStep;
            const isCurrent = s.num === currentStep;
            return (
              <div key={s.num} className="flex items-center flex-1 last:flex-none">
                <button
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className="flex items-center space-x-2 text-left group"
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-nis-navy-800 text-white ring-4 ring-nis-navy-100'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-bold whitespace-nowrap ${
                      isCurrent ? 'text-nis-navy-800' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
                {s.num < 7 && <div className="flex-1 h-0.5 bg-slate-100 mx-2" />}
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Step 1: General Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              1-қадам: Сынақ емтиханның негізгі параметрлері
            </h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Сынақ емтихан атауы
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Мысалы: Сынақ емтихан №2, 2025-2026 оқу жылы"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Орындау уақыты (минутпен, ресми стандарт: 135 минут)
              </label>
              <input
                type="number"
                value={formData.timeLimitMinutes}
                onChange={e => setFormData({ ...formData, timeLimitMinutes: parseInt(e.target.value) || 135 })}
                className="w-full sm:w-48 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* Step 2: Text A */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              2-қадам: Мәтін А (Көркем немесе публицистикалық мәтін)
            </h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Мәтін тақырыбы мен авторы
              </label>
              <input
                type="text"
                value={formData.textATitle}
                onChange={e => setFormData({ ...formData, textATitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Мәтіннің толық мазмұны
              </label>
              <textarea
                rows={8}
                value={formData.textAContent}
                onChange={e => setFormData({ ...formData, textAContent: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Step 3: Text B */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              3-қадам: Мәтін Ә (Салыстыруға арналған екінші мәтін)
            </h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Мәтін тақырыбы мен дереккөзі
              </label>
              <input
                type="text"
                value={formData.textBTitle}
                onChange={e => setFormData({ ...formData, textBTitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Мәтіннің толық мазмұны
              </label>
              <textarea
                rows={8}
                value={formData.textBContent}
                onChange={e => setFormData({ ...formData, textBContent: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Step 4: Task 1a */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              4-қадам: 1(а) тапсырмасы — Мәтіндерді салыстырмалы талдау
            </h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Тапсырма нұсқауы
              </label>
              <textarea
                rows={3}
                value={formData.task1aInstruction}
                onChange={e => setFormData({ ...formData, task1aInstruction: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ең жоғарғы балл (Ресми: 15 балл)
              </label>
              <input
                type="number"
                value={formData.task1aMaxScore}
                onChange={e => setFormData({ ...formData, task1aMaxScore: parseInt(e.target.value) || 15 })}
                className="w-full sm:w-48 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 5: Task 1ae */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              5-қадам: 1(ә) тапсырмасы — Бағытталған жазылым (150-180 сөз)
            </h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Тапсырма формулировкасы (тақырып + аудитория)
              </label>
              <textarea
                rows={3}
                value={formData.task1aeInstruction}
                onChange={e => setFormData({ ...formData, task1aeInstruction: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Минимум сөз (150)
                </label>
                <input
                  type="number"
                  value={formData.task1aeWordMin}
                  onChange={e => setFormData({ ...formData, task1aeWordMin: parseInt(e.target.value) || 150 })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Максимум сөз (180)
                </label>
                <input
                  type="number"
                  value={formData.task1aeWordMax}
                  onChange={e => setFormData({ ...formData, task1aeWordMax: parseInt(e.target.value) || 180 })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Макс балл (20)
                </label>
                <input
                  type="number"
                  value={formData.task1aeMaxScore}
                  onChange={e => setFormData({ ...formData, task1aeMaxScore: parseInt(e.target.value) || 20 })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Task 2 */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              6-қадам: 2-тапсырма — Шығармашылық жазылымның 3 тақырыбы (350-450 сөз)
            </h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                1-нұсқа тақырыбы (әңгіме немесе сюжетті мәтін)
              </label>
              <textarea
                rows={2}
                value={formData.task2Option1}
                onChange={e => setFormData({ ...formData, task2Option1: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                2-нұсқа тақырыбы (мақал-мәтел немесе нақыл сөз негізінде)
              </label>
              <textarea
                rows={2}
                value={formData.task2Option2}
                onChange={e => setFormData({ ...formData, task2Option2: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                3-нұсқа тақырыбы (эссе-толғау немесе болашаққа болжам)
              </label>
              <textarea
                rows={2}
                value={formData.task2Option3}
                onChange={e => setFormData({ ...formData, task2Option3: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Минимум сөз (350)
                </label>
                <input
                  type="number"
                  value={formData.task2WordMin}
                  onChange={e => setFormData({ ...formData, task2WordMin: parseInt(e.target.value) || 350 })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Максимум сөз (450)
                </label>
                <input
                  type="number"
                  value={formData.task2WordMax}
                  onChange={e => setFormData({ ...formData, task2WordMax: parseInt(e.target.value) || 450 })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Макс балл (25)
                </label>
                <input
                  type="number"
                  value={formData.task2MaxScore}
                  onChange={e => setFormData({ ...formData, task2MaxScore: parseInt(e.target.value) || 25 })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Live Preview */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-emerald-900 text-sm">
                  Сынақ емтиханды алдын ала көру
                </h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Оқушылар емтиханды дәл осы құрылымда көреді.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-800">Жалпы: 60 балл</span>
                <span className="block text-[11px] text-emerald-600">{formData.timeLimitMinutes} минут</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-4">
              <h1 className="text-xl font-extrabold text-slate-900">{formData.title}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 mb-2">{formData.textATitle}</h4>
                  <p className="text-slate-600 line-clamp-4 leading-relaxed">{formData.textAContent}</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 mb-2">{formData.textBTitle}</h4>
                  <p className="text-slate-600 line-clamp-4 leading-relaxed">{formData.textBContent}</p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900">1(а) тапсырма (15 балл):</span>
                <p className="text-slate-600">{formData.task1aInstruction}</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-900">1(ә) тапсырма (20 балл, 150-180 сөз):</span>
                <p className="text-slate-600">{formData.task1aeInstruction}</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-900">2-тапсырма (25 балл, 350-450 сөз):</span>
                <p className="text-slate-600">Оқушы келесі үш тақырыптың бірін таңдайды:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li>{formData.task2Option1}</li>
                  <li>{formData.task2Option2}</li>
                  <li>{formData.task2Option3}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={handlePrev}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Артқа</span>
          </button>

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-nis-navy-800 hover:bg-nis-navy-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
            >
              <span>Келесі қадам</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('draft')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 shadow-xs transition-all"
              >
                Черновик ретінде сақтау
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('published')}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Жариялау (Оқушыларға қолжетімді)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
