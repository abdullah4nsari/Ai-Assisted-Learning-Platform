import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const ResendVerificationPage = () => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authService.resendVerification(email.trim());
      setSent(true);
    } catch (err) {
      toast.error(err?.error || 'Failed to resend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50'>
      <div className='absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30' />

      <div className='relative w-full max-w-md px-6'>
        <div className='bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10'>

          {/* Brand */}
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-5'>
              <BrainCircuit strokeWidth={2} className='text-white' />
            </div>
            <h1 className='text-2xl font-bold text-slate-900 mb-2'>Resend Verification</h1>
            <p className='text-sm text-slate-500'>Enter your email and we'll send a new verification link.</p>
          </div>

          {sent ? (
            /* Success state */
            <div className='text-center'>
              <div className='w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4'>
                <CheckCircle2 size={32} className='text-emerald-500' />
              </div>
              <p className='text-sm text-slate-600 mb-6'>
                If <span className='font-semibold text-slate-800'>{email}</span> is registered and unverified, a new link has been sent. Check your inbox.
              </p>
              <Link
                to='/login'
                className='inline-flex items-center justify-center w-full h-11 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-200'
              >
                Back to Login
              </Link>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='space-y-2'>
                <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                  Email Address
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400'>
                    <Mail className='h-5 w-5' strokeWidth={2} />
                  </div>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='w-full py-4 pl-12 pr-4 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10'
                    placeholder='example@gmail.com'
                    required
                  />
                </div>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='group w-full h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <><div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' /> Sending…</>
                ) : (
                  <>Send Verification Link <ArrowRight className='w-4 h-4' strokeWidth={3} /></>
                )}
              </button>

              <p className='text-center text-sm text-slate-500'>
                Already verified?{' '}
                <Link to='/login' className='font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200'>
                  Sign in
                </Link>
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResendVerificationPage;
