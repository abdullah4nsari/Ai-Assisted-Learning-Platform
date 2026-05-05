import React, { useState, useEffect } from 'react';
import {
  User, Mail, Lock, Eye, EyeOff,
  CheckCircle2, Loader2, ShieldCheck, Pencil, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

// ── Reusable input field ──────────────────────────────────────────────────────
const InputField = ({
  label, id, type = 'text', value, onChange,
  icon: Icon, disabled, placeholder, rightSlot, error,
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          size={15}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${disabled ? 'text-slate-300' : 'text-slate-400'}`}
        />
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full py-2.5 text-sm rounded-xl border outline-none transition-all duration-200
          ${Icon ? 'pl-10' : 'pl-4'}
          ${rightSlot ? 'pr-11' : 'pr-4'}
          ${disabled
            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
            : error
              ? 'bg-red-50 border-red-300 text-slate-800 focus:border-red-400 focus:ring-2 focus:ring-red-500/10'
              : 'bg-white border-slate-200 text-slate-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10'
          }
        `}
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ── Section card wrapper ──────────────────────────────────────────────────────
const Card = ({ icon: Icon, iconGradient, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 animate-fadeInLeft">
    <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-md flex-shrink-0`}>
        <Icon size={18} className="text-white" strokeWidth={2} />
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

// ── Password input with show/hide toggle ──────────────────────────────────────
const PasswordInput = ({ label, id, value, onChange, placeholder, error }) => {
  const [show, setShow] = useState(false);
  return (
    <InputField
      label={label}
      id={id}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      icon={Lock}
      placeholder={placeholder}
      error={error}
      rightSlot={
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      }
    />
  );
};

// ── Avatar initials ───────────────────────────────────────────────────────────
const Avatar = ({ name }) => {
  const initials = (name || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
      <span className="text-2xl font-bold text-white">{initials}</span>
    </div>
  );
};

// ── Main ProfilePage ──────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  // ── Profile section state ──
  const [username,       setUsername]       = useState('');
  const [email,          setEmail]          = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors,  setProfileErrors]  = useState({});

  // ── Password section state ──
  const [currentPassword,  setCurrentPassword]  = useState('');
  const [newPassword,      setNewPassword]      = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [passwordLoading,  setPasswordLoading]  = useState(false);
  const [passwordErrors,   setPasswordErrors]   = useState({});

  // Seed fields from context on mount / user change
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // ── Profile update ────────────────────────────────────────────────────────
  const validateProfile = () => {
    const errs = {};
    if (!username.trim()) errs.username = 'Username is required.';
    else if (username.trim().length < 3) errs.username = 'Username must be at least 3 characters.';
    return errs;
  };

  const handleProfileSave = async () => {
    const errs = validateProfile();
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }
    setProfileErrors({});
    setProfileLoading(true);
    try {
      const res = await authService.updateProfile(username.trim(), email);
      // backend returns { data: { usernmae, email, ... } } — note the typo in controller
      const updated = res?.data;
      updateUser({
        username: updated?.usernmae || updated?.username || username.trim(),
        email:    updated?.email    || email,
      });
      toast.success('Profile updated successfully!');
      setEditingProfile(false);
    } catch (err) {
      const msg = err?.error || err?.message || 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileCancel = () => {
    setUsername(user?.username || '');
    setEmail(user?.email || '');
    setProfileErrors({});
    setEditingProfile(false);
  };

  // ── Password change ───────────────────────────────────────────────────────
  const validatePassword = () => {
    const errs = {};
    if (!currentPassword)          errs.currentPassword = 'Current password is required.';
    if (!newPassword)              errs.newPassword     = 'New password is required.';
    else if (newPassword.length < 6) errs.newPassword   = 'Password must be at least 6 characters.';
    if (!confirmPassword)          errs.confirmPassword = 'Please confirm your new password.';
    else if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length) { setPasswordErrors(errs); return; }
    setPasswordErrors({});
    setPasswordLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err?.error || err?.message || 'Failed to change password.';
      if (msg.toLowerCase().includes('incorrect') || msg.toLowerCase().includes('invalid')) {
        setPasswordErrors({ currentPassword: 'Current password is incorrect.' });
      } else {
        toast.error(msg);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account information and security</p>
      </div>

      {/* Identity hero strip */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-emerald-500/20 animate-fadeInLeft">
        <Avatar name={user?.username} />
        <div className="min-w-0">
          <p className="text-white/80 text-xs font-medium">Signed in as</p>
          <h2 className="text-white text-lg font-bold truncate capitalize">{user?.username || '—'}</h2>
          <p className="text-emerald-100 text-sm truncate">{user?.email || '—'}</p>
          {memberSince && (
            <p className="text-emerald-200 text-xs mt-0.5">Member since {memberSince}</p>
          )}
        </div>
      </div>

      {/* ── User Information ── */}
      <Card
        icon={User}
        iconGradient="from-blue-400 to-cyan-500"
        title="User Information"
        subtitle="Update your display name"
      >
        <div className="space-y-4">
          <InputField
            label="Username"
            id="username"
            value={username}
            onChange={e => { setUsername(e.target.value); setProfileErrors(p => ({ ...p, username: '' })); }}
            icon={User}
            placeholder="Your username"
            disabled={!editingProfile}
            error={profileErrors.username}
          />
          <InputField
            label="Email Address"
            id="email"
            type="email"
            value={email}
            icon={Mail}
            disabled
            placeholder="your@email.com"
          />
        </div>

        {/* action row */}
        <div className="flex items-center gap-2 pt-1">
          {!editingProfile ? (
            <button
              onClick={() => setEditingProfile(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md shadow-emerald-500/20"
            >
              <Pencil size={14} /> Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleProfileSave}
                disabled={profileLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-emerald-500/20"
              >
                {profileLoading
                  ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                  : <><CheckCircle2 size={14} /> Save Changes</>
                }
              </button>
              <button
                onClick={handleProfileCancel}
                disabled={profileLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors duration-200"
              >
                <X size={14} /> Cancel
              </button>
            </>
          )}
        </div>
      </Card>

      {/* ── Change Password ── */}
      <Card
        icon={ShieldCheck}
        iconGradient="from-violet-500 to-indigo-500"
        title="Change Password"
        subtitle="Use a strong password you don't use elsewhere"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4" noValidate>
          <PasswordInput
            label="Current Password"
            id="currentPassword"
            value={currentPassword}
            onChange={e => { setCurrentPassword(e.target.value); setPasswordErrors(p => ({ ...p, currentPassword: '' })); }}
            placeholder="Enter current password"
            error={passwordErrors.currentPassword}
          />
          <PasswordInput
            label="New Password"
            id="newPassword"
            value={newPassword}
            onChange={e => { setNewPassword(e.target.value); setPasswordErrors(p => ({ ...p, newPassword: '' })); }}
            placeholder="At least 6 characters"
            error={passwordErrors.newPassword}
          />
          <PasswordInput
            label="Confirm New Password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={e => { setConfirmPassword(e.target.value); setPasswordErrors(p => ({ ...p, confirmPassword: '' })); }}
            placeholder="Repeat new password"
            error={passwordErrors.confirmPassword}
          />

          {/* strength hint */}
          {newPassword.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      newPassword.length >= i * 3
                        ? newPassword.length >= 12 ? 'bg-emerald-400'
                          : newPassword.length >= 8  ? 'bg-amber-400'
                          : 'bg-red-400'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400">
                {newPassword.length < 6  ? 'Too short'
                  : newPassword.length < 8  ? 'Weak'
                  : newPassword.length < 12 ? 'Good'
                  : 'Strong'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl hover:from-violet-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-violet-500/20 flex items-center justify-center gap-2"
          >
            {passwordLoading
              ? <><Loader2 size={14} className="animate-spin" /> Changing Password…</>
              : <><ShieldCheck size={14} /> Change Password</>
            }
          </button>
        </form>
      </Card>

    </div>
  );
};

export default ProfilePage;
