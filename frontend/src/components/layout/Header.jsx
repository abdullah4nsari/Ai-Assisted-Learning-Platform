import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Menu, Sun, Moon } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
    const { user }                = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const displayName = user?.displayName || user?.username || 'User';
    const initials    = displayName
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <header className='sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-5 py-2 transition-colors duration-300'>
            <div className='flex items-center justify-between'>

                {/* Mobile menu */}
                <button
                    onClick={toggleSidebar}
                    className='md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200'
                    aria-label='Toggle Sidebar'
                >
                    <Menu size={24} />
                </button>

                <div className='hidden md:block' />

                <div className='flex items-center gap-3'>

                    {/* ── Theme toggle pill ── */}
                    <button
                        onClick={toggleTheme}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        style={{
                            position:        'relative',
                            display:         'inline-flex',
                            alignItems:      'center',
                            width:           '56px',
                            height:          '28px',
                            borderRadius:    '9999px',
                            backgroundColor: isDark ? '#334155' : '#e2e8f0',
                            transition:      'background-color 0.3s ease',
                            cursor:          'pointer',
                            border:          'none',
                            outline:         'none',
                            flexShrink:      0,
                        }}
                    >
                        {/* Sun icon — left side */}
                        <Sun
                            size={13}
                            style={{
                                position:   'absolute',
                                left:       '6px',
                                color:      '#f59e0b',
                                opacity:    isDark ? 0.3 : 1,
                                transition: 'opacity 0.2s ease',
                            }}
                        />
                        {/* Moon icon — right side */}
                        <Moon
                            size={13}
                            style={{
                                position:   'absolute',
                                right:      '6px',
                                color:      '#94a3b8',
                                opacity:    isDark ? 1 : 0.3,
                                transition: 'opacity 0.2s ease',
                            }}
                        />
                        {/* Sliding thumb */}
                        <span
                            style={{
                                position:        'absolute',
                                width:           '20px',
                                height:          '20px',
                                borderRadius:    '9999px',
                                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                boxShadow:       '0 1px 4px rgba(0,0,0,0.25)',
                                display:         'flex',
                                alignItems:      'center',
                                justifyContent:  'center',
                                transform:       isDark ? 'translateX(30px)' : 'translateX(4px)',
                                transition:      'transform 0.3s ease, background-color 0.3s ease',
                            }}
                        >
                            {isDark
                                ? <Moon size={11} style={{ color: '#34d399' }} />
                                : <Sun  size={11} style={{ color: '#f59e0b' }} />
                            }
                        </span>
                    </button>

                    

                    {/* User profile */}
                    <div className='flex items-center gap-3 pl-3 border-l border-slate-200/60'>
                        <div className='flex items-center gap-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors duration-200 cursor-pointer group'>
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt={displayName}
                                    className='w-9 h-9 rounded-xl object-cover shadow-md shadow-emerald-500/20'
                                />
                            ) : (
                                <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-emerald-500/20'>
                                    {initials}
                                </div>
                            )}
                            <div>
                                <p className='text-sm font-semibold text-slate-900'>{displayName}</p>
                                <p className='text-xs text-slate-500'>{user?.email || 'example@gmail.com'}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </header>
    );
};

export default Header;
