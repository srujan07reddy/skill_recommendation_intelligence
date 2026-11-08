import React, { useState } from 'react';
import { ShieldCheck, Lock, User as UserIcon, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { changePassword } from '../../api/auth.api';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { login, error, clearError } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forced password rotation modal state (ADR-003)
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rotationError, setRotationError] = useState<string | null>(null);
  const [rotationSuccess, setRotationSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setSubmitting(true);
    clearError();

    const ok = await login(username, password);
    setSubmitting(false);

    if (ok) {
      const state = useAuthStore.getState();
      if (state.user?.must_change_password) {
        setShowRotationModal(true);
      } else if (onLoginSuccess) {
        onLoginSuccess();
      }
    }
  };

  const handlePasswordRotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setRotationError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setRotationError('Password must be at least 8 characters long');
      return;
    }

    try {
      await changePassword({
        current_password: password,
        new_password: newPassword,
      });
      setRotationSuccess(true);
      setTimeout(() => {
        setShowRotationModal(false);
        if (onLoginSuccess) onLoginSuccess();
      }, 1500);
    } catch (err: any) {
      setRotationError(err.response?.data?.error?.message || err.message || 'Failed to update password');
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    clearError();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl mx-auto mb-4">
          SSIP
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Jeppiaar University
        </h2>
        <p className="mt-1 text-sm text-slate-600 font-medium">
          Student Skill Intelligence Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 flex items-start space-x-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username or Institutional Email
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. dean or hod_cse"
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helpers for Development / Testing */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2.5 text-center uppercase tracking-wider">
              Quick Dev Roles (ADR-003 Seeded)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('dean', 'DeanPassword123!')}
                className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-medium border border-blue-200 transition"
              >
                Dean
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('hod_cse', 'HodCsePassword123!')}
                className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium border border-emerald-200 transition"
              >
                HOD (CSE)
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin', 'AdminPassword123!')}
                className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-xs font-medium border border-purple-200 transition"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Stateless zero-retention session security active</span>
        </div>
      </div>

      {/* Mandatory Initial Password Rotation Dialog (ADR-003) */}
      {showRotationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-amber-600 mb-3">
              <KeyRound className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Password Update Required</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              In accordance with institutional security policy (ADR-003), initial seeded accounts must update their temporary password before proceeding.
            </p>

            {rotationError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700">
                {rotationError}
              </div>
            )}

            {rotationSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                <p className="text-sm font-semibold text-emerald-800">Password changed successfully!</p>
                <p className="text-xs text-emerald-600 mt-1">Redirecting to application workspace...</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordRotation} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow transition"
                >
                  Save New Password & Continue
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
