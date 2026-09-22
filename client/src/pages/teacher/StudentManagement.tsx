import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Modal } from '../../components/common/Modal';
import {
  UserPlus,
  Search,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Copy,
  Check,
  Eye,
  RefreshCw,
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add student modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Success modal for initial credentials reveal
  const [createdCredentials, setCreatedCredentials] = useState<{
    fullName: string;
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset password modal
  const [resetStudent, setResetStudent] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/students');
      setStudents(res.data.students || []);
    } catch (err) {
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let pass = 'Nis';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '25!';
    return pass;
  };

  const handleOpenAdd = () => {
    setFullName('');
    setEmail('');
    setPassword(generateRandomPassword());
    setAddError(null);
    setIsAddOpen(true);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);

    try {
      const res = await api.post('/teacher/students', {
        fullName,
        email,
        password,
      });

      setIsAddOpen(false);
      setCreatedCredentials({
        fullName,
        email,
        password: res.data.initialPassword,
      });
      fetchStudents();
    } catch (err: any) {
      setAddError(err.response?.data?.error || 'Оқушыны қосу кезінде қате орын алды');
    } finally {
      setAddLoading(false);
    }
  };

  const handleToggleActive = async (student: any) => {
    const confirmText = student.isActive
      ? `«${student.fullName}» аккаунтын бұғаттағыңыз келе ме?`
      : `«${student.fullName}» аккаунтын қайта белсендіруді қалайсыз ба?`;

    if (!window.confirm(confirmText)) return;

    try {
      await api.patch(`/teacher/students/${student.id}/status`);
      fetchStudents();
    } catch (err) {
      alert('Күйді жаңарту мүмкін болмады');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetStudent) return;
    setResetLoading(true);

    try {
      await api.post(`/teacher/students/${resetStudent.id}/reset-password`, {
        newPassword,
      });
      setResetSuccess(newPassword);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Құпиясөзді жаңарту кезінде қате шықты');
    } finally {
      setResetLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = students.filter(
    s =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Оқушыларды басқару</h1>
          <p className="text-xs text-slate-500 mt-1">
            Бекітілген оқушылар тізімі, аккаунт қосу, прогресс бақылау
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 bg-nis-navy-800 hover:bg-nis-navy-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Жаңа оқушы қосу</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Оқушының аты-жөні немесе email бойынша іздеу..."
          className="w-full text-sm bg-transparent border-none focus:outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nis-navy-800 mx-auto" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Оқушы (ФИО)</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Сынақ емтихандар</th>
                  <th className="py-3.5 px-6">Орташа балл</th>
                  <th className="py-3.5 px-6">Мини-тест орташасы</th>
                  <th className="py-3.5 px-6">Күйі</th>
                  <th className="py-3.5 px-6 text-right">Әрекеттер</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        to={`/teacher/students/${student.id}`}
                        className="font-bold text-slate-900 hover:text-nis-navy-700 block"
                      >
                        {student.fullName}
                      </Link>
                      <span className="text-[11px] text-slate-400">
                        Тіркелген: {new Date(student.createdAt).toLocaleDateString('kk-KZ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                      {student.email}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                        {student.checkedExamsCount} тексерілген
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {student.avgExamScore !== null ? (
                        <span className="font-bold text-slate-800">
                          {student.avgExamScore} / 60
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {student.avgQuizPct !== null ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          student.avgQuizPct >= 80 ? 'bg-emerald-100 text-emerald-800' :
                          student.avgQuizPct >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {student.avgQuizPct}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          student.isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        <span>{student.isActive ? 'Белсенді' : 'Бұғатталған'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        to={`/teacher/students/${student.id}`}
                        title="Толық профиль мен график"
                        className="p-1.5 inline-block text-slate-500 hover:text-nis-navy-800 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => {
                          setResetStudent(student);
                          setNewPassword(generateRandomPassword());
                          setResetSuccess(null);
                        }}
                        title="Құпиясөзді жаңарту"
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleActive(student)}
                        title={student.isActive ? 'Бұғаттау' : 'Белсендіру'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          student.isActive
                            ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {student.isActive ? (
                          <ShieldAlert className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-slate-700">Оқушылар табылмады</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm ? 'Іздеу талабына сай оқушы жоқ' : 'Әзірге оқушылар жоқ. Алғашқы оқушыны қосыңыз.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal: Add student */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Жаңа оқушы қосу">
        {addError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
            {addError}
          </div>
        )}
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Оқушының аты-жөні (ФИО)
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Мысалы: Арман Болатұлы"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Электрондық пошта (Email)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="arman.b@nis.edu.kz"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Бастапқы құпиясөз
              </label>
              <button
                type="button"
                onClick={() => setPassword(generateRandomPassword())}
                className="text-[11px] font-bold text-nis-navy-700 hover:text-nis-navy-900 inline-flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Генерациялау</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-nis-navy-600 focus:bg-white"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Бас тарту
            </button>
            <button
              type="submit"
              disabled={addLoading}
              className="px-5 py-2 bg-nis-navy-800 hover:bg-nis-navy-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {addLoading ? 'Қосылуда...' : 'Оқушыны қосу'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Initial Credentials Reveal */}
      <Modal
        isOpen={!!createdCredentials}
        onClose={() => setCreatedCredentials(null)}
        title="Оқушы сәтті тіркелді!"
      >
        {createdCredentials && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <strong>Маңызды ескерту:</strong> Құпиясөзді қауіпсіздік мақсатында қазір көшіріп алыңыз. Ол жүйеде хэштеліп сақталады және қайта ашық түрде көрсетілмейді.
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="text-slate-500">Аты-жөні:</span>
                <p className="font-bold text-slate-900 text-sm">{createdCredentials.fullName}</p>
              </div>
              <div>
                <span className="text-slate-500">Логин (Email):</span>
                <p className="font-mono font-bold text-slate-900">{createdCredentials.email}</p>
              </div>
              <div>
                <span className="text-slate-500">Құпиясөз:</span>
                <p className="font-mono font-bold text-emerald-700 text-sm">
                  {createdCredentials.password}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `Логин: ${createdCredentials.email}\nҚұпиясөз: ${createdCredentials.password}`
                  )
                }
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Көшірілді!' : 'Деректерді көшіру'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
              >
                Жабу
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Reset Password */}
      <Modal
        isOpen={!!resetStudent}
        onClose={() => setResetStudent(null)}
        title={`Құпиясөзді жаңарту: ${resetStudent?.fullName}`}
      >
        {resetSuccess ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
              Құпиясөз сәтті өзгертілді! Жаңа құпиясөзді оқушыға хабарлаңыз:
            </div>
            <div className="p-3 bg-slate-100 rounded-xl font-mono text-center font-bold text-slate-900 text-base">
              {resetSuccess}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setResetStudent(null)}
                className="px-4 py-2 bg-nis-navy-800 text-white rounded-xl text-xs font-bold"
              >
                Түсінікті
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Жаңа құпиясөз
                </label>
                <button
                  type="button"
                  onClick={() => setNewPassword(generateRandomPassword())}
                  className="text-[11px] font-bold text-nis-navy-700 inline-flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Генерациялау</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-nis-navy-600"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setResetStudent(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Бас тарту
              </button>
              <button
                type="submit"
                disabled={resetLoading}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {resetLoading ? 'Жаңартылуда...' : 'Құпиясөзді сақтау'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
