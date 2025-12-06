'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, EAGLE_ICON } from '@/lib/store';
import { LogOut, ChevronDown } from 'lucide-react';

export default function ProfileMenu() {
  const router = useRouter();
  const { user, logout } = useStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    setShowConfirm(false);
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded transition"
      >
        <span className="text-lg" style={{ transform: 'scaleX(-1)', display: 'inline-block' }}>{EAGLE_ICON}</span>
        <span className="text-sm font-medium">{user.username}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-lg shadow-lg border border-slate-600 z-50">
          <div className="p-4 border-b border-slate-600">
            <p className="text-xs text-slate-400 mb-1">GUEST ACCOUNT</p>
            <p className="font-semibold">{user.username}</p>
            <p className="text-sm text-slate-400 mt-2">Score: {user.totalScore}</p>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="w-full px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-slate-600 transition flex items-center gap-2 border-t border-slate-600"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-sm border border-slate-700">
            <h2 className="text-xl font-bold mb-4">Confirm Logout?</h2>
            <p className="text-slate-300 mb-6">
              Are you sure you want to logout? Your current progress will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
