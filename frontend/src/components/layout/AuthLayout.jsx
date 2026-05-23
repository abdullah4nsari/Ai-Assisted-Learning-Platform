import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AuthLayout = ({ children }) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="auth-page-bg relative flex items-center justify-center min-h-screen overflow-hidden transition-colors duration-300">
            {/* Dot grid */}
            <div className="auth-page-dots absolute inset-0 opacity-40" />

            {/* Floating gradient orbs */}
            <div className="absolute top-[-10%] left-[-5%] w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl animate-float pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-blue-400/8 blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-[40%] right-[10%] w-48 h-48 rounded-full bg-purple-400/6 blur-2xl animate-float pointer-events-none" style={{ animationDelay: '0.8s' }} />

            {/* Theme toggle */}
            <div className="absolute top-4 right-4 z-10">
                <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={toggleTheme}
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    className={`relative inline-flex items-center w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${
                        isDark ? 'bg-slate-700' : 'bg-slate-200'
                    }`}
                >
                    <Sun size={12} className={`absolute left-1.5 transition-opacity duration-200 ${isDark ? 'opacity-30 text-amber-400' : 'opacity-100 text-amber-500'}`} />
                    <Moon size={12} className={`absolute right-1.5 transition-opacity duration-200 ${isDark ? 'opacity-100 text-slate-300' : 'opacity-30 text-slate-400'}`} />
                    <motion.span
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className={`absolute w-5 h-5 rounded-full shadow-md flex items-center justify-center ${
                            isDark ? 'bg-slate-900 left-[30px]' : 'bg-white left-[3px]'
                        }`}
                    >
                        {isDark ? <Moon size={10} className="text-emerald-400" /> : <Sun size={10} className="text-amber-500" />}
                    </motion.span>
                </motion.button>
            </div>

            {/* Content */}
            <div className="relative w-full z-10">
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
