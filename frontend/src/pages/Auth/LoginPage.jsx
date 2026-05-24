import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService.js';
import { BrainCircuit, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import AuthLayout from '../../components/layout/AuthLayout.jsx';

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
);

const InputField = ({ label, id, type = 'text', value, onChange, onFocus, onBlur, icon: Icon, focused, placeholder, rightSlot, isDark }) => (
    <div className="space-y-1.5">
        <label htmlFor={id} style={{ color: isDark ? '#94a3b8' : '#475569' }} className="block text-xs font-semibold uppercase tracking-wider">
            {label}
        </label>
        <div className="relative">
            <div
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200"
                style={{ color: focused ? '#10b981' : isDark ? '#475569' : '#94a3b8' }}
            >
                <Icon size={16} strokeWidth={2} />
            </div>
            <input
                id={id} type={type} value={value} onChange={onChange}
                onFocus={onFocus} onBlur={onBlur} placeholder={placeholder}
                style={{
                    backgroundColor: isDark ? (focused ? '#1e293b' : '#111827') : (focused ? '#ffffff' : 'rgba(255,255,255,0.8)'),
                    borderColor: focused ? '#10b981' : isDark ? '#1e2d45' : '#e2e8f0',
                    color: isDark ? '#f1f5f9' : '#0f172a',
                    boxShadow: focused ? '0 0 0 3px rgba(16,185,129,0.12)' : 'none',
                }}
                className={`w-full py-3 pl-10 ${rightSlot ? 'pr-10' : 'pr-4'} border-2 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none`}
            />
            {rightSlot && (
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">{rightSlot}</div>
            )}
        </div>
    </div>
);

const LoginPage = () => {
    const [email,        setEmail]        = useState('');
    const [password,     setPassword]     = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error,        setError]        = useState('');
    const [loading,      setLoading]      = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const navigate    = useNavigate();
    const { login }   = useAuth();
    const { isDark }  = useTheme();

    const handleGoogleSuccess = async (tokenResponse) => {
        try {
            const res = await authService.googleAuth(tokenResponse.access_token);
            login(res.data.user, res.data.token);
            toast.success('Signed in with Google!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err?.error || 'Google sign-in failed.');
        }
    };

    const signInWithGoogle = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError:   () => toast.error('Google sign-in was cancelled.'),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await authService.login(email, password);
            const { user, token } = response.data;
            if (!user || !token) throw new Error('Invalid response from server');
            login(user, token);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            if (err?.needsVerification) {
                setError('Please verify your email before logging in.');
                toast.error('Email not verified.');
            } else {
                setError(err?.error || 'Invalid credentials. Please try again.');
                toast.error(err?.error || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const cardBg    = isDark ? 'rgba(17,24,39,0.92)' : 'rgba(255,255,255,0.88)';
    const cardBorder = isDark ? 'rgba(30,45,69,0.7)' : 'rgba(255,255,255,0.6)';
    const textPrimary   = isDark ? '#f1f5f9' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#64748b';
    const dividerColor  = isDark ? '#1e2d45' : '#e2e8f0';
    const dividerBg     = isDark ? '#111827' : '#ffffff';

    const itemVariants = {
        hidden:  { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    };

    return (
        <AuthLayout>
            <div className="flex items-center justify-center min-h-screen px-4 py-12">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div
                        style={{
                            backgroundColor: cardBg,
                            borderColor: cardBorder,
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                        }}
                        className="border rounded-3xl shadow-2xl shadow-slate-900/15 p-8 md:p-10"
                    >
                        {/* Header */}
                        <motion.div
                            className="text-center mb-8"
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                        >
                            <motion.div variants={itemVariants} className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/30 mb-5">
                                <BrainCircuit size={26} className="text-white" strokeWidth={2} />
                            </motion.div>
                            <motion.h1 variants={itemVariants} style={{ color: textPrimary }} className="text-2xl font-bold tracking-tight">
                                Welcome back
                            </motion.h1>
                            <motion.p variants={itemVariants} style={{ color: textSecondary }} className="text-sm mt-1.5">
                                Sign in to continue your learning journey
                            </motion.p>
                        </motion.div>

                        {/* Google button */}
                        <motion.button
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            whileHover={{ scale: 1.01, backgroundColor: isDark ? '#1e2d45' : '#f8fafc' }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => signInWithGoogle()}
                            style={{
                                backgroundColor: isDark ? '#1a2235' : '#ffffff',
                                borderColor: isDark ? '#1e2d45' : '#e2e8f0',
                                color: isDark ? '#e2e8f0' : '#374151',
                            }}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 rounded-xl text-sm font-semibold transition-all duration-200 mb-5"
                        >
                            <GoogleIcon />
                            Continue with Google
                        </motion.button>

                        {/* Divider */}
                        <div className="relative mb-5">
                            <div className="absolute inset-0 flex items-center">
                                <div style={{ borderColor: dividerColor }} className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span style={{ backgroundColor: dividerBg, color: textSecondary }} className="px-3 font-medium">
                                    or sign in with email
                                </span>
                            </div>
                        </div>

                        {/* Form */}
                        <motion.form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                        >
                            <motion.div variants={itemVariants}>
                                <InputField
                                    label="Email" id="email" type="email" value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                                    icon={Mail} focused={focusedField === 'email'}
                                    placeholder="you@example.com" isDark={isDark}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <InputField
                                    label="Password" id="password" type={showPassword ? 'text' : 'password'} value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                                    icon={Lock} focused={focusedField === 'password'}
                                    placeholder="Enter your password" isDark={isDark}
                                    rightSlot={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(s => !s)}
                                            style={{ color: isDark ? '#475569' : '#94a3b8' }}
                                            className="hover:text-emerald-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    }
                                />
                            </motion.div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                                        borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#fecaca',
                                    }}
                                    className="rounded-xl border px-4 py-3"
                                >
                                    <p className="text-xs text-red-500 font-medium">{error}</p>
                                    {error.includes('verify') && (
                                        <p className="text-xs mt-1.5">
                                            <Link to="/resend-verification" className="font-semibold text-emerald-500 hover:text-emerald-400 underline">
                                                Resend verification email
                                            </Link>
                                        </p>
                                    )}
                                </motion.div>
                            )}

                            <motion.button
                                variants={itemVariants}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="relative w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {loading ? (
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                                    ) : (
                                        <>Sign in <ArrowRight size={16} strokeWidth={2.5} /></>
                                    )}
                                </span>
                            </motion.button>
                        </motion.form>

                        {/* Footer */}
                        <p style={{ color: textSecondary }} className="text-center text-sm mt-6">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-emerald-500 hover:text-emerald-400 transition-colors duration-200">
                                Sign up free
                            </Link>
                        </p>
                    </div>

                    <p style={{ color: isDark ? '#475569' : '#94a3b8' }} className="text-center text-xs mt-5">
                        By continuing, you agree to our Terms & Privacy Policy
                    </p>
                </motion.div>
            </div>
        </AuthLayout>
    );
};

export default LoginPage;
