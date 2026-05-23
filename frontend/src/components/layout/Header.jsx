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
                    className="md:hidden inline-flex items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
                    aria-label="Toggle Sidebar"
                >
                    <Menu size={20} />
                </motion.button>

                <div className="hidden md:block" />

                <div className="flex items-center gap-2">

                    {/* Theme toggle */}
                    <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={toggleTheme}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        className={`relative inline-flex items-center w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                            isDark ? 'bg-slate-700' : 'bg-slate-200'
                        }`}
                    >
                        <Sun
                            size={12}
                            className={`absolute left-1.5 transition-opacity duration-200 ${isDark ? 'opacity-30 text-amber-400' : 'opacity-100 text-amber-500'}`}
                        />
                        <Moon
                            size={12}
                            className={`absolute right-1.5 transition-opacity duration-200 ${isDark ? 'opacity-100 text-slate-300' : 'opacity-30 text-slate-400'}`}
                        />
                        <motion.span
                            layout
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            className={`absolute w-5 h-5 rounded-full shadow-md flex items-center justify-center ${
                                isDark ? 'bg-slate-900 left-[30px]' : 'bg-white left-[3px]'
                            }`}
                        >
                            {isDark
                                ? <Moon size={10} className="text-emerald-400" />
                                : <Sun  size={10} className="text-amber-500" />
                            }
                        </motion.span>
                    </motion.button>


                    {/* Divider */}
                    <div className="w-px h-6 bg-slate-200/80 mx-1" />

                    {/* User profile */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
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
