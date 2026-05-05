import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import authService from '../../services/authService';
import {BrainCircuit, Mail, Lock, User, ArrowRight} from 'lucide-react';
import toast from 'react-hot-toast';



const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // 🔐 password validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

  if (!passwordRegex.test(password)) {
    setError(
      'Password must be at least 6 characters and include uppercase, lowercase, and a number'
    );
    setLoading(false);
    return;
  }

  try {
    const response = await authService.register(username, email, password);
    const user = response.data.user;
    const token = response.data.token;

    if (!user || !token) {
      throw new Error('Invalid response from server');
    }

    toast.success('Account created successfully! Please Login');
    navigate('/login', { replace: true });

  } catch (error) {
    const errorMessage =
      error?.error || error?.data?.message || 'Registration failed, please try again.';

    setError(errorMessage);
    toast.error(errorMessage);

  } finally {
    setLoading(false);
  }
};
  return (
    <div className='flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50'>
          <div className='absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30'/>
          <div className='relative w-full max-w-md px-6'>
            <div className='bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10'>
            {/* header  */}
              <div className='text-center mb-10'>
                <div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-6'>
                  <BrainCircuit className="" strokeWidth={2} />
                </div>
                <h1 className='text-2xl font-medium text-slate-900 tracking-tight mb-2'>Create an account</h1>
                <p className='text-slate-500 text-sm'>Start your AI-powered learning experience</p>
              </div>
              
    
              {/* form */}
              <form onSubmit={handleSubmit} className='space-y-5'>
                {/* username */}
                <div className='space-y-2'>
                  <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>Username</label>
                  <div className='relative group'>
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField==='username' ? 'text-emerald-500' : 'text-slate-400'}`}>
                      <User className='h-5 w-5' strokeWidth={2}/>
                    </div>
                    <input type='text'
                      value={username}
                      onChange={(e)=>setUsername(e.target.value)}
                      onFocus={()=>setFocusedField('username')}
                      onBlur={()=>setFocusedField(null)}
                      className='w-full py-4 pl-12 pr-4 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10'
                      placeholder='johndoe'
                      required
                    />
                  </div>
                </div>

                {/* email */}
                <div className='space-y-2'>
                  <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>Email</label>
                  <div className='relative group'>
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField==='email' ? 'text-emerald-500' : 'text-slate-400'}`}>
                      <Mail className='h-5 w-5' strokeWidth={2}/>
                    </div>
                    <input type='email'
                      value={email}
                      onChange={(e)=>setEmail(e.target.value)}
                      onFocus={()=>setFocusedField('email')}
                      onBlur={()=>setFocusedField(null)}
                      className='w-full py-4 pl-12 pr-4 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10'
                      placeholder='example@gmail.com'
                      required
                    />
                  </div>
                </div>

                {/* password */}
                <div className='space-y-2'>
                  <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>Password</label>
                  <div className='relative group'>
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField==='password' ? 'text-emerald-500' : 'text-slate-400'}`}>
                      <Lock className='h-5 w-5' strokeWidth={2}/>
                    </div>
                    <input type='password'
                      value={password}
                      onChange={(e)=>setPassword(e.target.value)}
                      onFocus={()=>setFocusedField('password')}
                      onBlur={()=>setFocusedField(null)}
                      className='w-full py-4 pl-12 pr-4 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10'
                      placeholder='Min 6 chars, upper, lower & number'
                      required
                    />
                  </div>
                </div>

                {/* error */}
                {error && (
                  <div className='rounded-lg bg-red-50 border border-red-200 p-3'>
                    <p className='text-xs text-red-600 font-medium text-center'>{error}</p>
                  </div>
                )}

                {/* submit */}
                <button
                  type='submit'
                  disabled={loading}
                  className='group relative w-full h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden'>
                  <span className='relative z-10 flex items-center justify-center'>
                    {loading ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'/>
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className='w-4 h-4' strokeWidth={3}/>
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* footer */}
              <div className='mt-8 pt-6 border-t border-slate-200/60'>
                <p className='text-center text-sm text-slate-600'>
                  Already have an account? {' '}
                  <Link to="/login" className='font-semibold text-emerald-600 hover:text-emerald-700 transition-color duration-200'>Sign In</Link>
                </p>
              </div>
            </div>
    
            {/* subtle footer text  */}
            <p className='text-center text-sm text-slate-400 mt-6'>
              By continuing, you are agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
  )
}

export default RegisterPage
