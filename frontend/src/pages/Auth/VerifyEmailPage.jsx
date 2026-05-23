import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BrainCircuit, CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import authService from '../../services/authService';
import AuthLayout from '../../components/layout/AuthLayout.jsx';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const called    = useRef(false);

  const [status,  setStatus]  = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link.');
      return;
    }

    authService.verifyEmail(token)
      .then(() => { setStatus('success'); setMessage('Your email has been verified successfully!'); })
      .catch((err) => { setStatus('error'); setMessage(err?.error || 'Verification link is invalid or has expired.'); });
  }, [token]);

  return (
    <AuthLayout>
      <div className='flex items-center justify-center min-h-screen'>
        <div className='relative w-full max-w-md px-6'>
          <div className='auth-card bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10 text-center'>

            <div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-6'>
              <BrainCircuit strokeWidth={2} className='text-white' />
            </div>

            {status === 'loading' && (
              <>
                <Loader2 size={48} className='text-emerald-500 animate-spin mx-auto mb-4' />
                <h1 className='text-xl font-bold text-slate-900 mb-2'>Verifying your email…</h1>
                <p className='text-sm text-slate-500'>Please wait a moment.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className='w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4'>
                  <CheckCircle2 size={36} className='text-emerald-500' />
                </div>
                <h1 className='text-xl font-bold text-slate-900 mb-2'>Email Verified!</h1>
                <p className='text-sm text-slate-500 mb-8'>{message}</p>
                <Link to='/login' className='inline-flex items-center justify-center gap-2 w-full h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200'>
                  Continue to Login
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className='w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4'>
                  <XCircle size={36} className='text-red-500' />
                </div>
                <h1 className='text-xl font-bold text-slate-900 mb-2'>Verification Failed</h1>
                <p className='text-sm text-slate-500 mb-8'>{message}</p>
                <div className='space-y-3'>
                  <Link to='/resend-verification' className='inline-flex items-center justify-center gap-2 w-full h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200'>
                    <Mail size={16} /> Resend Verification Email
                  </Link>
                  <Link to='/login' className='inline-flex items-center justify-center w-full h-11 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-200'>
                    Back to Login
                  </Link>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
