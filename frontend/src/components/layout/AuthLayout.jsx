import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ isDark, toggleTheme }) => (
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
);

const AuthLayout = ({ children }) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <div
            style={{
                minHeight: '100vh',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                transition: 'background-color 0.3s ease',
                backgroundColor: isDark ? '#0a0f1e' : '#f8fafc',
                backgroundImage: isDark
                    ? 'linear-gradient(135deg, #0a0f1e 0%, #0d1526 50%, #0a0f1e 100%)'
                    : 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #eff6ff 100%)',
            }}
        >
            {/* Dot grid */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.4,
                    backgroundImage: isDark
                        ? 'radial-gradient(#1e2d45 1px, transparent 1px)'
                        : 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    pointerEvents: 'none',
                }}
            />

            {/* Floating orbs */}
            <div className="absolute top-[-10%] left-[-5%] w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl animate-float pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-blue-400/8 blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-[40%] right-[10%] w-48 h-48 rounded-full bg-purple-400/6 blur-2xl animate-float pointer-events-none" style={{ animationDelay: '0.8s' }} />

            {/* Theme toggle — top right */}
            <div className="absolute top-4 right-4 z-20">
                <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            </div>

            {/* Content */}
            <div className="relative w-full z-10">
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
