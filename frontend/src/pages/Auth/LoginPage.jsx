import React, { useState }  from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import {Link, useNavigate} from 'react-router-dom'
import authService from '../../services/authService.js'
import {BrainCircuit, Mail, Lock, ArrowRight} from 'lucide-react'
import toast from 'react-hot-toast'
import { useGoogleLogin } from '@react-oauth/google'
import AuthLayout from '../../components/layout/AuthLayout.jsx'

const LoginPage = () => {

  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError]=useState('');
  const [loading, setLoading]=useState(false);
  const [focusedField, setFocusedField]= useState(null)

  const navigate = useNavigate();
  const {login} = useAuth();

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const res = await authService.googleAuth(tokenResponse.access_token);
      login(res.data.user, res.data.token);
      toast.success('Signed in with Google!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.error || 'Google sign-in failed. Please try again.');
    }
  };

  const handleGoogleError = () => toast.error('Google sign-in was cancelled.');

  const signInWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError:   handleGoogleError,
  });

  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(email, password);
      const user = response.data.user;
      const token = response.data.token;
      
      if(!user || !token){
        throw new Error('Invalid response from server');
      }
      login(user, token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      // If backend says email not verified, show specific message + resend link
      if (err?.needsVerification) {
        setError('Please verify your email before logging in.');
        toast.error('Email not verified. Check your inbox or resend the link.');
      } else {
        setError(err?.error || 'Failed to login. Please check your credentials.');
        toast.error(err?.error || 'Login failed');
      }
    } finally{
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className='flex items-center justify-center min-h-screen'>
      <div className='relative w-full max-w-md px-6'>
        <div className='auth-card bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10'>
        {/* header  */}
          <div className='text-center mb-10'>
            <div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-6'>
              <BrainCircuit className="" strokeWidth={2} />
            </div>
            <h1 className='text-2xl font-medium text-slate-900 tracking-tight mb-2'>Welcome Back</h1>
            <p className='text-slate-500 text-sm'>Sign in to continue your journey</p>
          </div>
          {/* form */}
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div className=' space-y-5'>
            {/* email field */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                Email
              </label>
              <div className='relative group'>
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField==='email'? 'text-emerald-500' : 'text-slate-400'}`}>
                  <Mail className="h-5 w-5" strokeWidth={2}/>
                </div>
                <input type="email"
                value={email}
                onChange={(e)=>{
                  setEmail(e.target.value);
                // console.log(e.target.value);
              }}
                onFocus={()=>setFocusedField('email')}
                onBlur={()=>setFocusedField(null)} 
                className='w-full h-full py-4 pl-12 pr-4 border-2 border-slate-200 rounded-xl border-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10'
                placeholder = 'example@gmail.com'
                />
              </div>
            </div>
            {/* password field */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                Password
              </label>
              <div className='relative group'>
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField==='password'? 'text-emerald-500' : 'text-slate-400'}`}>
                  <Lock className="h-5 w-5" strokeWidth={2}/>
                </div>
                <input type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                onFocus={()=>setFocusedField('password')}
                onBlur={()=>setFocusedField(null)} 
                className='w-full h-full py-4 pl-12 pr-4 border-2 border-slate-200 rounded-xl border-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10'
                placeholder = 'Enter your Password'
                />
              </div>
            </div>
            {/* error message  */}
            {error && (
              <div className='rounded-lg bg-red-50 border border-red-200 p-3'>
                <p className='text-xs text-red-600 font-medium text-center'>{error}</p>
                {error.includes('verify') && (
                  <p className='text-xs text-center mt-1.5'>
                    <Link to='/resend-verification' className='font-semibold text-emerald-600 hover:text-emerald-700 underline'>
                      Resend verification email
                    </Link>
                  </p>
                )}
              </div>
            )}

            {/* submit button  */}
            <button
            type='submit'
            disabled={loading}
            className='group relative w-full h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled::active:scale-100 overflow-hidden'>
              <span className='relative z-10 flex items-center justify-center'>
                {loading? (
                  <>
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'/>
                  Signing in...
                  </>
                ):(
                  <>
                  Sign in
                  <ArrowRight className="w-4 h-4 group-hove:translate-x-1 transition-transform duration-200" strokeWidth={3}/>
                  </>
                )}
              </span>
              <div className='absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition:transform duration-700' />
            </button>
          </div>
          </form>

          {/* footer */}
          <div className='mt-8 pt-6 border-t border-slate-200/60'>
            {/* Google sign-in */}
            <button
              type='button'
              onClick={() => signInWithGoogle()}
              className='w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 mb-4'
            >
              <svg width='18' height='18' viewBox='0 0 48 48'>
                <path fill='#EA4335' d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'/>
                <path fill='#4285F4' d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'/>
                <path fill='#FBBC05' d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'/>
                <path fill='#34A853' d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'/>
              </svg>
              Continue with Google
            </button>
            <p className='text-center text-sm text-slate-600'>
              Don't have an account? {' '}
              <Link to="/register" className='font-semibold text-emerald-600 hover:text-emerald-700 transition-color duration-200'>Sign up</Link>
            </p>
          </div>
        </div>

        {/* subtle footer text  */}
        <p className='text-center text-sm text-slate-400 mt-6'>
          By continuing, you are agree to our Terms & Privacy Policy
        </p>
      </div>
      </div>
    </AuthLayout>
  )
}

export default LoginPage