import React, { useState, useEffect, useMemo } from 'react';
import { adminApi, SchoolItem, StaffCredentialItem } from '../../api/admin.api';
import { useAuthStore } from '../auth/useAuthStore';
import {
  Building2,
  GraduationCap,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  BookOpen,
  UserPlus,
  KeyRound,
  Mail,
  Plus,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
  Pencil,
} from 'lucide-react';

export function DepartmentManagementPage() {
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [deans, setDeans] = useState<StaffCredentialItem[]>([]);
  const [hods, setHods] = useState<StaffCredentialItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const { user } = useAuthStore();
  const userRoles = useMemo(() => user?.roles.map((r) => r.toLowerCase()) || [], [user]);
  const isAdmin = userRoles.includes('administrator');
  const isDean = userRoles.includes('dean');

  // Modal state
  const [activeModal, setActiveModal] = useState<
    null | 'school' | 'department' | 'dean' | 'hod' | 'reset_password'
  >(null);

  // School form
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolDesc, setSchoolDesc] = useState('');

  // Department form
  const [deptSchoolId, setDeptSchoolId] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [progCode, setProgCode] = useState('');
  const [progName, setProgName] = useState('');
  const [progQual, setProgQual] = useState('B.Tech');

  // Dean / HOD Credential form (Create or Edit)
  const [editingStaff, setEditingStaff] = useState<StaffCredentialItem | null>(null);
  const [targetSchoolId, setTargetSchoolId] = useState('');
  const [targetDeptId, setTargetDeptId] = useState('');
  const [staffFullName, setStaffFullName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffStatus, setStaffStatus] = useState<'Active' | 'Disabled'>('Active');
  const [showPassword, setShowPassword] = useState(false);
  const [replaceExistingDean, setReplaceExistingDean] = useState(false);

  // Reset password modal state
  const [resetTargetUser, setResetTargetUser] = useState<StaffCredentialItem | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [schoolsData, hodsData] = await Promise.all([
        adminApi.getAcademicStructure(),
        adminApi.listHods(),
      ]);
      setSchools(schoolsData);
      setHods(hodsData);

      if (isAdmin) {
        const deansData = await adminApi.listDeans();
        setDeans(deansData);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load academic structure and accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const allDepartments = useMemo(() => {
    return schools.flatMap((s) =>
      s.departments.map((d) => ({
        ...d,
        school_id: s.school_id,
        school_name: s.school_name,
        school_code: s.school_code,
      }))
    );
  }, [schools]);

  const resetFormStates = () => {
    setFormError(null);
    setEditingStaff(null);
    setSchoolCode('');
    setSchoolName('');
    setSchoolDesc('');
    setDeptCode('');
    setDeptName('');
    setProgCode('');
    setProgName('');
    setProgQual('B.Tech');
    setStaffFullName('');
    setStaffEmail('');
    setStaffUsername('');
    setStaffPassword('');
    setStaffStatus('Active');
    setShowPassword(false);
    setReplaceExistingDean(false);
    setResetPasswordValue('');
  };

  const openCreateSchool = () => {
    resetFormStates();
    setActiveModal('school');
  };

  const openCreateDepartment = (preselectedSchoolId?: string) => {
    resetFormStates();
    setDeptSchoolId(preselectedSchoolId || schools[0]?.school_id || '');
    setActiveModal('department');
  };

  const openCreateDean = (preselectedSchoolId?: string) => {
    resetFormStates();
    setTargetSchoolId(preselectedSchoolId || schools[0]?.school_id || '');
    setActiveModal('dean');
  };

  const openCreateHod = (preselectedDeptId?: string) => {
    resetFormStates();
    setTargetDeptId(preselectedDeptId || allDepartments[0]?.department_id || '');
    setActiveModal('hod');
  };

  const openEditStaff = (staff: StaffCredentialItem) => {
    resetFormStates();
    setEditingStaff(staff);
    setStaffFullName(staff.full_name);
    setStaffEmail(staff.email);
    setStaffUsername(staff.username);
    setStaffStatus(staff.account_status === 'Disabled' ? 'Disabled' : 'Active');
    setTargetSchoolId(staff.school_id || schools[0]?.school_id || '');
    setTargetDeptId(staff.department_id || allDepartments[0]?.department_id || '');
    setActiveModal(staff.role.toLowerCase() === 'dean' ? 'dean' : 'hod');
  };

  const openResetPassword = (staff: StaffCredentialItem) => {
    resetFormStates();
    setResetTargetUser(staff);
    setActiveModal('reset_password');
  };

  const generateRandomPassword = (setter: (val: string) => void) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setter(pwd);
    setShowPassword(true);
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const created = await adminApi.createSchool({
        school_code: schoolCode,
        school_name: schoolName,
        description: schoolDesc || undefined,
      });
      setSuccessBanner(`Created school "${created.school_name}" (${created.school_code}).`);
      setActiveModal(null);
      await loadData();
    } catch (err: any) {
      setFormError(err?.response?.data?.error?.message || 'Failed to create school.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const created = await adminApi.createDepartment({
        school_id: deptSchoolId,
        department_code: deptCode,
        department_name: deptName,
        program_code: progCode.trim() || undefined,
        program_name: progName.trim() || undefined,
        qualification: progQual || 'B.Tech',
      });
      setSuccessBanner(
        `Added department "${created.department_name}" (${created.department_code}) successfully.`
      );
      setActiveModal(null);
      await loadData();
    } catch (err: any) {
      setFormError(err?.response?.data?.error?.message || 'Failed to create department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDean = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (editingStaff) {
        const updated = await adminApi.updateDean(editingStaff.user_id, {
          school_id: targetSchoolId,
          full_name: staffFullName,
          email: staffEmail,
          username: staffUsername.trim() || undefined,
          password: staffPassword.trim() || undefined,
          account_status: staffStatus,
          replace_existing: replaceExistingDean,
        });
        setSuccessBanner(
          `Updated Dean "${updated.full_name}" (${updated.email}) for ${updated.school_name}.`
        );
      } else {
        const created = await adminApi.createDean({
          school_id: targetSchoolId,
          full_name: staffFullName,
          email: staffEmail,
          username: staffUsername.trim() || undefined,
          password: staffPassword,
          must_change_password: false,
          replace_existing: replaceExistingDean,
        });
        setSuccessBanner(
          `Dean credentials provisioned for ${created.school_name}: Email "${created.email}" / Username "${created.username}".`
        );
      }
      setActiveModal(null);
      setEditingStaff(null);
      await loadData();
    } catch (err: any) {
      setFormError(err?.response?.data?.error?.message || 'Failed to save Dean details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveHod = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (editingStaff) {
        const updated = await adminApi.updateHod(editingStaff.user_id, {
          department_id: targetDeptId,
          full_name: staffFullName,
          email: staffEmail,
          username: staffUsername.trim() || undefined,
          password: staffPassword.trim() || undefined,
          account_status: staffStatus,
        });
        setSuccessBanner(
          `Updated HOD "${updated.full_name}" (${updated.email}) under ${updated.department_name}.`
        );
      } else {
        const created = await adminApi.createHod({
          department_id: targetDeptId,
          full_name: staffFullName,
          email: staffEmail,
          username: staffUsername.trim() || undefined,
          password: staffPassword,
          must_change_password: false,
        });
        setSuccessBanner(
          `HOD credentials ready for ${created.department_name}: Sign in using Email "${created.email}" or Username "${created.username}".`
        );
      }
      setActiveModal(null);
      setEditingStaff(null);
      await loadData();
    } catch (err: any) {
      setFormError(err?.response?.data?.error?.message || 'Failed to save HOD details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (staff: StaffCredentialItem) => {
    const nextStatus = staff.account_status === 'Active' ? 'Disabled' : 'Active';
    try {
      await adminApi.updateUserStatus(staff.user_id, nextStatus);
      setSuccessBanner(`${staff.full_name} (${staff.role}) is now ${nextStatus}.`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to update account status.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      await adminApi.resetUserPassword(resetTargetUser.user_id, resetPasswordValue, false);
      setSuccessBanner(
        `Updated login password for ${resetTargetUser.full_name} (${resetTargetUser.email}).`
      );
      setActiveModal(null);
      setResetTargetUser(null);
    } catch (err: any) {
      setFormError(err?.response?.data?.error?.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalDepts = allDepartments.length;
  const totalPrograms = schools.reduce(
    (acc, s) => acc + s.departments.reduce((dAcc, d) => dAcc + d.programs.length, 0),
    0
  );

  const filteredSchools = schools
    .map((school) => {
      const q = searchTerm.toLowerCase();
      const filteredDepts = school.departments.filter(
        (dept) =>
          dept.department_name.toLowerCase().includes(q) ||
          dept.department_code.toLowerCase().includes(q) ||
          dept.programs.some((p) => p.program_name.toLowerCase().includes(q)) ||
          hods.some(
            (h) =>
              h.department_id === dept.department_id &&
              (h.full_name.toLowerCase().includes(q) || h.email.toLowerCase().includes(q))
          )
      );
      return {
        ...school,
        departments: filteredDepts,
      };
    })
    .filter(
      (school) =>
        school.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.school_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.departments.length > 0
    );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {isAdmin
                ? 'University Administration'
                : `${user?.school_name || 'School'} Dean Workspace`}
            </span>
            <span className="text-xs text-slate-400">
              {isAdmin
                ? 'Schools, Departments & Dean Provisioning'
                : 'School Departments & HOD Credentials'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {isAdmin
              ? 'Schools, Departments & Dean Accounts'
              : `${user?.school_name || 'School'} — Departments & HOD Credentials`}
          </h2>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? 'Create University Schools, add Departments under each School, and provision Dean credentials (One Dean per School).'
              : 'Manage departments under your assigned school and provision HOD email IDs & login credentials.'}
          </p>
        </div>

        {/* Role-Specific Primary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={openCreateSchool}
                className="flex items-center space-x-1.5 px-3 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5 text-purple-600" />
                <span>Add School</span>
              </button>
              <button
                onClick={() => openCreateDepartment()}
                className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Add Department</span>
              </button>
              <button
                onClick={() => openCreateDean()}
                className="flex items-center space-x-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add School Dean</span>
              </button>
            </>
          )}

          {(isDean || isAdmin) && (
            <button
              onClick={() => openCreateHod()}
              disabled={allDepartments.length === 0}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add HOD Credentials</span>
            </button>
          )}

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 border border-slate-200 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {successBanner && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isDean && !isAdmin && (
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>School-Scoped Governance:</strong> You manage HOD accounts strictly for departments within{' '}
            <strong>{user?.school_name || 'your designated school'}</strong>. Created HODs sign in immediately using their registered Email ID or Username.
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Schools</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{schools.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isAdmin ? 'University-wide' : 'Assigned to you'}
            </p>
          </div>
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <Building2 className="w-5 h-5 text-blue-700" />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Departments</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalDepts}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{totalPrograms} Degree Programmes</p>
          </div>
          <div className="p-2.5 bg-indigo-100 rounded-xl">
            <Layers className="w-5 h-5 text-indigo-700" />
          </div>
        </div>

        {isAdmin && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">School Deans</p>
              <p className="text-2xl font-black text-purple-800 mt-0.5">{deans.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">One Dean per School</p>
            </div>
            <div className="p-2.5 bg-purple-100 rounded-xl">
              <GraduationCap className="w-5 h-5 text-purple-700" />
            </div>
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Provisioned HODs</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{hods.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Active email login accounts</p>
          </div>
          <div className="p-2.5 bg-emerald-100 rounded-xl">
            <Users className="w-5 h-5 text-emerald-700" />
          </div>
        </div>
      </div>

      {/* Admin Only: School Deans Directory */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-purple-50/50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-purple-700" />
              <h3 className="text-xs font-bold text-slate-900">
                School Deans Directory ({deans.length} Assigned)
              </h3>
            </div>
            <button
              onClick={() => openCreateDean()}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign School Dean</span>
            </button>
          </div>

          {deans.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No Dean accounts provisioned yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Dean Name</th>
                    <th className="py-2.5 px-4">Login Email / Username</th>
                    <th className="py-2.5 px-4">Assigned School</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deans.map((d) => (
                    <tr key={d.user_id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{d.full_name}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center space-x-1.5 text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{d.email}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">@{d.username}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-slate-800">{d.school_name}</span>{' '}
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                          {d.school_code}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.account_status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {d.account_status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditStaff(d)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 border border-purple-200 bg-purple-50 text-purple-800 rounded text-[11px] font-semibold hover:bg-purple-100 transition"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit Details</span>
                        </button>
                        <button
                          onClick={() => openResetPassword(d)}
                          className="px-2 py-1 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => handleToggleStatus(d)}
                          className="px-2 py-1 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          {d.account_status === 'Active' ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* HOD Credentials Directory (Visible to Dean for their School, and Admin overall) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-indigo-50/50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-indigo-700" />
            <h3 className="text-xs font-bold text-slate-900">
              {isDean && !isAdmin
                ? `Department HOD Credentials Under ${user?.school_name || 'Your School'} (${hods.length})`
                : `Department HOD Credentials Across University (${hods.length})`}
            </h3>
          </div>
          <button
            onClick={() => openCreateHod()}
            disabled={allDepartments.length === 0}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add HOD Credentials</span>
          </button>
        </div>

        {hods.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No HOD accounts provisioned in this scope yet. Click &ldquo;Add HOD Credentials&rdquo; to create login access for a department.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">HOD Name</th>
                  <th className="py-2.5 px-4">HOD Email ID / Username</th>
                  <th className="py-2.5 px-4">Assigned Department</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hods.map((h) => (
                  <tr key={h.user_id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{h.full_name}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center space-x-1.5 text-slate-800 font-medium">
                        <Mail className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{h.email}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">Username: {h.username}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-semibold text-slate-800">{h.department_name}</span>{' '}
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {h.department_code}
                      </span>
                      {isAdmin && h.school_code && (
                        <span className="ml-1.5 text-[10px] text-slate-400">({h.school_code})</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          h.account_status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {h.account_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditStaff(h)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 border border-indigo-200 bg-indigo-50 text-indigo-800 rounded text-[11px] font-semibold hover:bg-indigo-100 transition"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit Details</span>
                      </button>
                      <button
                        onClick={() => openResetPassword(h)}
                        className="px-2 py-1 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleToggleStatus(h)}
                        className="px-2 py-1 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        {h.account_status === 'Active' ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by school, department name, code (e.g. CSE, ECE), HOD name/email, or programme..."
          className="w-full text-xs pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Hierarchical Schools & Departments Cards */}
      <div className="space-y-4">
        {filteredSchools.map((school) => {
          const assignedDean = deans.find((d) => d.school_id === school.school_id);
          return (
            <div key={school.school_id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">{school.school_name}</h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    {school.school_code}
                  </span>
                  {isAdmin && (
                    assignedDean ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                        Dean: {assignedDean.full_name} ({assignedDean.email})
                      </span>
                    ) : (
                      <button
                        onClick={() => openCreateDean(school.school_id)}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 font-bold transition"
                      >
                        + Assign Dean
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {isAdmin && (
                    <button
                      onClick={() => openCreateDepartment(school.school_id)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Department</span>
                    </button>
                  )}
                  <span className="text-[11px] text-slate-500 font-medium">
                    {school.departments.length} Department{school.departments.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="p-5 divide-y divide-slate-100">
                {school.departments.map((dept) => {
                  const deptHods = hods.filter((h) => h.department_id === dept.department_id);
                  return (
                    <div key={dept.department_id} className="py-3.5 first:pt-0 last:pb-0 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs">{dept.department_name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{dept.department_code}</span>
                          {deptHods.map((h) => (
                            <span
                              key={h.user_id}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 font-medium"
                            >
                              HOD: {h.full_name} ({h.email})
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openCreateHod(dept.department_id)}
                            className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-semibold transition"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>+ Add HOD</span>
                          </button>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pl-2">
                        {dept.programs.map((prog) => (
                          <span
                            key={prog.program_id}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700"
                          >
                            <BookOpen className="w-3 h-3 text-slate-400" />
                            <span>
                              {prog.qualification} {prog.program_name}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">({prog.program_code})</span>
                          </span>
                        ))}
                        {dept.programs.length === 0 && (
                          <span className="text-[11px] text-slate-400 italic">No degree programmes linked yet.</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {school.departments.length === 0 && (
                  <p className="text-center py-4 text-xs text-slate-400">
                    No departments under this school yet.
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {filteredSchools.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No schools or departments found matching &ldquo;{searchTerm}&rdquo;.
          </div>
        )}
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {activeModal === 'school' && 'Create New University School'}
                {activeModal === 'department' && 'Add Department Under School'}
                {activeModal === 'dean' &&
                  (editingStaff
                    ? `Edit Dean Details — ${editingStaff.full_name}`
                    : 'Provision School Dean Credentials')}
                {activeModal === 'hod' &&
                  (editingStaff
                    ? `Edit HOD Details — ${editingStaff.full_name}`
                    : 'Add HOD Email & Login Credentials')}
                {activeModal === 'reset_password' && `Reset Password — ${resetTargetUser?.full_name}`}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {formError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Create School Form */}
              {activeModal === 'school' && (
                <form onSubmit={handleCreateSchool} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">School Code *</label>
                    <input
                      type="text"
                      required
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value)}
                      placeholder="e.g. SCH-LAW"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">School Name *</label>
                    <input
                      type="text"
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. School of Law"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={schoolDesc}
                      onChange={(e) => setSchoolDesc(e.target.value)}
                      placeholder="Optional description"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating...' : 'Create School'}
                    </button>
                  </div>
                </form>
              )}

              {/* Create Department Form */}
              {activeModal === 'department' && (
                <form onSubmit={handleCreateDepartment} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Parent School *</label>
                    <select
                      required
                      value={deptSchoolId}
                      onChange={(e) => setDeptSchoolId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {schools.map((s) => (
                        <option key={s.school_id} value={s.school_id}>
                          {s.school_name} ({s.school_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Dept Code *</label>
                      <input
                        type="text"
                        required
                        value={deptCode}
                        onChange={(e) => setDeptCode(e.target.value)}
                        placeholder="e.g. DEPT-AI"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Dept Name *</label>
                      <input
                        type="text"
                        required
                        value={deptName}
                        onChange={(e) => setDeptName(e.target.value)}
                        placeholder="e.g. AI & Data Science"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <p className="font-semibold text-slate-700 text-[11px]">Optional Initial Degree Programme</p>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={progQual}
                        onChange={(e) => setProgQual(e.target.value)}
                        placeholder="B.Tech"
                        className="px-2 py-1.5 border border-slate-300 rounded bg-white"
                      />
                      <input
                        type="text"
                        value={progCode}
                        onChange={(e) => setProgCode(e.target.value)}
                        placeholder="PRG-SET-AI"
                        className="px-2 py-1.5 border border-slate-300 rounded bg-white"
                      />
                      <input
                        type="text"
                        value={progName}
                        onChange={(e) => setProgName(e.target.value)}
                        placeholder="AI & DS"
                        className="px-2 py-1.5 border border-slate-300 rounded bg-white"
                      />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : 'Create Department'}
                    </button>
                  </div>
                </form>
              )}

              {/* Provision / Edit Dean or HOD Credentials Form */}
              {(activeModal === 'dean' || activeModal === 'hod') && (
                <form
                  onSubmit={activeModal === 'dean' ? handleSaveDean : handleSaveHod}
                  className="space-y-3 text-xs"
                >
                  {activeModal === 'dean' ? (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Assign to School * (One Dean per School)
                      </label>
                      <select
                        required
                        value={targetSchoolId}
                        onChange={(e) => setTargetSchoolId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        {schools.map((s) => (
                          <option key={s.school_id} value={s.school_id}>
                            {s.school_name} ({s.school_code})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Assign to Department *
                      </label>
                      <select
                        required
                        value={targetDeptId}
                        onChange={(e) => setTargetDeptId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        {allDepartments.map((d) => (
                          <option key={d.department_id} value={d.department_id}>
                            {d.department_name} ({d.department_code}) — {d.school_code}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={staffFullName}
                      onChange={(e) => setStaffFullName(e.target.value)}
                      placeholder={activeModal === 'dean' ? 'e.g. Dr. Ramesh Krishnan' : 'e.g. Dr. Priya Sundaram'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Institutional Email ID * (Used to Log In)
                    </label>
                    <input
                      type="email"
                      required
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder={
                        activeModal === 'dean'
                          ? 'dean.law@jeppiaaruniversity.ac.in'
                          : 'hod.ece@jeppiaaruniversity.ac.in'
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className={editingStaff ? 'grid grid-cols-2 gap-3' : ''}>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Login Username{' '}
                        {!editingStaff && (
                          <span className="text-slate-400 font-normal">(optional)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        required={Boolean(editingStaff)}
                        value={staffUsername}
                        onChange={(e) => setStaffUsername(e.target.value)}
                        placeholder={activeModal === 'dean' ? 'e.g. dean_law' : 'e.g. hod_ece'}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    {editingStaff && (
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Account Status
                        </label>
                        <select
                          value={staffStatus}
                          onChange={(e) =>
                            setStaffStatus(e.target.value === 'Disabled' ? 'Disabled' : 'Active')
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Active">Active</option>
                          <option value="Disabled">Disabled</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">
                        {editingStaff
                          ? 'New Password (optional — leave blank to keep current)'
                          : 'Login Password * (min 8 chars)'}
                      </label>
                      <button
                        type="button"
                        onClick={() => generateRandomPassword(setStaffPassword)}
                        className="text-[11px] font-semibold text-indigo-600 hover:underline"
                      >
                        Generate Strong Password
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required={!editingStaff}
                        minLength={8}
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        placeholder={
                          editingStaff
                            ? 'Leave blank to keep unchanged'
                            : 'Minimum 8 characters'
                        }
                        className="w-full px-3 py-2 pr-9 border border-slate-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {activeModal === 'dean' && (
                    <label className="flex items-center space-x-2 text-slate-600 pt-1">
                      <input
                        type="checkbox"
                        checked={replaceExistingDean}
                        onChange={(e) => setReplaceExistingDean(e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      <span>Replace existing Dean if the target school already has one assigned</span>
                    </label>
                  )}

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-4 py-2 text-white rounded-lg font-semibold disabled:opacity-50 ${
                        activeModal === 'dean'
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {isSubmitting
                        ? 'Saving...'
                        : editingStaff
                        ? 'Save Changes'
                        : activeModal === 'dean'
                        ? 'Create Dean Account'
                        : 'Create HOD Credentials'}
                    </button>
                  </div>
                </form>
              )}

              {/* Reset Password Modal */}
              {activeModal === 'reset_password' && resetTargetUser && (
                <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
                  <p className="text-slate-600">
                    Updating login password for <strong>{resetTargetUser.email}</strong> (@
                    {resetTargetUser.username}).
                  </p>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">New Password * (min 8 chars)</label>
                      <button
                        type="button"
                        onClick={() => generateRandomPassword(setResetPasswordValue)}
                        className="text-[11px] font-semibold text-indigo-600 hover:underline"
                      >
                        Generate Strong Password
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={resetPasswordValue}
                      onChange={(e) => setResetPasswordValue(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold disabled:opacity-50"
                    >
                      {isSubmitting ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
