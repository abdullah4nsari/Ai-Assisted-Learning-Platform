import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FileText, User, LogOut, BrainCircuit, BookOpen, X, Sparkles } from 'lucide-react';

const navLinks = [
    { to: '/dashboard',  icon: LayoutDashboard, text: 'Dashboard',  color: 'from-emerald-400 to-teal-500' },
    { to: '/documents',  icon: FileText,         text: 'Documents',  color: 'from-blue-400 to-cyan-500'    },
    { to: '/flashcards', icon: BookOpen,         text: 'Flashcards', color: 'from-purple-400 to-pink-500'  },
    { to: '/profile',    icon: User,             text: 'Profile',    color: 'from-orange-400 to-amber-500' },
];

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
    const { logout, user } = useAuth();
    const navigate         = useNavigate();
    const location         = useLocation();

    const handleLogOut = () => { logout(); navigate('/login'); };

    useEffect(() => {
        if (window.innerWidth < 768 && isSidebarOpen) toggleSidebar();
    }, [location.pathname]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape' && isSidebarOpen) toggleSidebar(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isSidebarOpen]);

    const displayName = user?.displayName || user?.username || 'User';
    const initials    = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <>
            {/* Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        aria-hidden="true"
                        onClick={toggleSidebar}
                        className="fixed inset-0 z-40 md:hidden bg-black/50 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full w-64 z-50 flex flex-col
                    bg-white border-r border-slate-200/60
                    shadow-2xl shadow-slate-900/10
                    transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0 md:static md:shadow-none
                `}
            >
                {/* Brand */}
                <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
                    <motion.div
                        className="flex items-center gap-2.5"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <BrainCircuit size={18} className="text-white" strokeWidth={2} />
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">AI Learning</h1>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Assistant</p>
                        </div>
                    </motion.div>
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Navigation</p>
                    {navLinks.map((link, index) => {
                        const Icon = link.icon;
                        return (
                            <motion.div
                                key={link.to}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <NavLink
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                        transition-all duration-200 ease-out
                                        ${isActive
                                            ? 'text-white shadow-lg'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeNav"
                                                    className={`absolute inset-0 rounded-xl bg-gradient-to-r ${link.color}`}
                                                    style={{ boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
                                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                />
                                            )}
                                            <div className={`relative z-10 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-white/20'
                                                    : `bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100`
                                            }`}>
                                                <Icon size={15} strokeWidth={2.5} className={isActive ? 'text-white' : 'text-white'} />
                                            </div>
                                            {!isActive && (
                                                <Icon size={15} strokeWidth={2.5} className="absolute left-[18px] z-10 text-slate-500 group-hover:opacity-0 transition-opacity duration-150" />
                                            )}
                                            <span className="relative z-10 ml-1">{link.text}</span>
                                            {isActive && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-white/70"
                                                />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            </motion.div>
                        );
                    })}
                </nav>

                {/* User + Logout */}
                <div className="p-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt={displayName} className="w-7 h-7 rounded-lg object-cover" />
                        ) : (
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                {initials}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">{displayName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user?.email || ''}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogOut}
                        className="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    >
                        <LogOut size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
