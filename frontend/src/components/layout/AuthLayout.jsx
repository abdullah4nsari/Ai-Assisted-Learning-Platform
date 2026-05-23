import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AuthLayout = ({ children }) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className='auth-page-bg relative flex items-center justify-center min-h-screen transition-colors duration-300'>
            {/* dot grid background */}
            <div className='auth-page-dots absolute inset-0 opacity-30' />

            {/* Theme toggle — top right corner */}
            <div className='absolute top-4 right-4 z-10'>
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
            </div>

            {/* Page content */}
            <div className='relative w-full'>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
