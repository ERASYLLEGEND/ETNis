import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, BookOpen, GraduationCap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isTeacher } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-nis-navy-800 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-nis-navy-800 text-lg tracking-tight">НИШ ЕТ</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-nis-navy-100 text-nis-navy-800">Т1</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Қазақ тілі мен әдебиеті • 10-сынып</p>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800">{user?.fullName}</span>
              <span className="text-xs text-slate-500">
                {isTeacher ? 'Мұғалім' : '10-сынып оқушысы'}
              </span>
            </div>

            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              isTeacher ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {isTeacher ? 'Мұғалім' : 'Оқушы'}
            </span>

            <button
              onClick={logout}
              title="Шығу"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
