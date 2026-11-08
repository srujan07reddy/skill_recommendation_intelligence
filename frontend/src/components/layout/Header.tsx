import { LogOut, User, Building2 } from 'lucide-react';
import { useAuthStore } from '../../features/auth/useAuthStore';

export function Header() {
  const { user, logout } = useAuthStore();

  const getRoleBadgeColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'dean':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'hod':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'administrator':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const primaryRole = user?.roles[0] || 'User';

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand Identification */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
            SSIP
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              Student Skill Intelligence Platform
            </h1>
            <p className="text-xs text-slate-500 font-medium">Jeppiaar University</p>
          </div>
        </div>

        {/* User Identity & Logout Actions */}
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-3 text-right">
              <div>
                <p className="text-sm font-semibold text-slate-900 leading-tight">{user.full_name}</p>
                <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getRoleBadgeColor(primaryRole)}`}>
                    {primaryRole}
                  </span>
                  {user.department_name && (
                    <span className="inline-flex items-center text-[11px] text-slate-500 font-medium">
                      <Building2 className="w-3 h-3 mr-0.5 text-slate-400" />
                      {user.department_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <User className="w-4 h-4" />
              </div>
            </div>
          )}

          <div className="h-6 w-px bg-slate-200" />

          <button
            onClick={logout}
            title="Sign out"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
