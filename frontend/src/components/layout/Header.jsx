import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, Sun, Moon, Bell } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
    const { user }                = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const displayName = user?.displayName || user?.username || 'User';
    const initials    = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <motion.header
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`sticky top-0 z-40 w-full px-5 py-2.5 transition-all duration-300 ${
                scrolled
                    ? 'bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 shadow-sm shadow-slate-900/5'
                    : 'bg-white/60 backdrop-blur-xl border-b border-slate-200/40'
            }`}
        >
            <div className="flex items-center justify-between">

                {/* Mobile menu */}
                <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={toggleSidebar}
                    className="md:hidden inline-flex items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all duration-200"
                    aria-label="Toggle Sidebar"
                >
                    <Menu size={20} />
                </motion.button>

                <div className="hidden md:block" />

                <div className="flex items-center gap-2">

                    {/* Theme toggle — inline styles so thumb position always works */}
                    <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={toggleTheme}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        style={{
                            position: 'relative',
                            display: 'inline-flex',
                            alignItems: 'center',
                            width: '56px',
                            height: '28px',
                            borderRadius: '9999px',
                            backgroundColor: isDark ? '#334155' : '#e2e8f0',
                            transition: 'background-color 0.3s ease',
                            cursor: 'pointer',
                            border: 'none',
                            outline: 'none',
                            flexShrink: 0,
                        }}
                    >
                        <Sun
                            size={12}
                            style={{
                                position: 'absolute',
                                left: '6px',
                                color: '#f59e0b',
                                opacity: isDark ? 0.3 : 1,
                                transition: 'opacity 0.2s ease',
                            }}
                        />
                        <Moon
                            size={12}
                            style={{
                                position: 'absolute',
                                right: '6px',
                                color: '#94a3b8',
                                opacity: isDark ? 1 : 0.3,
                                transition: 'opacity 0.2s ease',
                            }}
                        />
                        <motion.span
                            animate={{ x: isDark ? 30 : 4 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            style={{
                                position: 'absolute',
                                width: '20px',
                                height: '20px',
                                borderRadius: '9999px',
                                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {isDark
                                ? <Moon size={10} style={{ color: '#34d399' }} />
                                : <Sun  size={10} style={{ color: '#f59e0b' }} />
                            }
                        </motion.span>
                    </motion.button>

                    

                    {/* Divider */}
                    <div className="w-px h-6 bg-slate-200/80 mx-1" />

                    {/* User profile */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all duration-200 cursor-pointer"
                    >
                        {user?.profileImage ? (
                            <img
                                src={user.profileImage}
                                alt={displayName}
                                className="w-8 h-8 rounded-xl object-cover ring-2 ring-emerald-500/20"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-500/25">
                                {initials}
                            </div>
                        )}
                        <div className="hidden sm:block">
                            <p className="text-xs font-semibold text-slate-800 leading-none">{displayName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]">{user?.email || ''}</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
