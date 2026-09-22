import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  FileEdit,
  BookOpen,
  Award,
  PenTool,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isTeacher } = useAuth();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    if (isTeacher) {
      api.get('/teacher/stats')
        .then(res => setPendingCount(res.data.stats?.pendingSubmissionsCount || 0))
        .catch(() => {});
    }
  }, [isTeacher]);

  interface NavItem {
    to: string;
    label: string;
    icon: any;
    badge?: number | null;
  }

  const teacherNav: NavItem[] = [
    { to: '/teacher', label: 'Басты бет', icon: LayoutDashboard },
    { to: '/teacher/students', label: 'Оқушылар', icon: Users },
    { to: '/teacher/exams', label: 'Сынақ емтихандар', icon: FileEdit },
    {
      to: '/teacher/grading',
      label: 'Тексеру',
      icon: FileCheck2,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { to: '/teacher/materials', label: 'Жаттығулар мен теория', icon: BookOpen },
  ];

  const studentNav: NavItem[] = [
    { to: '/student', label: 'Басты бет', icon: LayoutDashboard },
    { to: '/student/materials', label: 'Жаттығулар (Оқылым / Жазылым)', icon: BookOpen },
    { to: '/student/exams', label: 'Сынақ емтихан', icon: PenTool },
    { to: '/student/results', label: 'Нәтижелер мен прогресс', icon: Award },
  ];

  const navItems: NavItem[] = isTeacher ? teacherNav : studentNav;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <nav className="space-y-1.5">
        <div className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {isTeacher ? 'Мұғалім бөлімі' : 'Оқушы бөлімі'}
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/teacher' || item.to === '/student'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-nis-navy-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-nis-navy-800 hover:bg-slate-100'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white shadow-xs">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Info card footer */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">НИШ 10-сынып Т1</p>
        <p>Сыртқы жиынтық бағалау спецификациясына сай (60 балл, 135 мин).</p>
      </div>
    </aside>
  );
};
