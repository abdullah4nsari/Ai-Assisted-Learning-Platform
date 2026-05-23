import React, { useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FileText, User, LogOut, BrainCircuit, BookOpen, X } from 'lucide-react';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
    const { logout } = useAuth();
    const navigate   = useNavigate();
    const location   = useLocation();
    const sidebarRef = useRef(null);

    const handleLogOut = () => { logout(); navigate('/login'); };

    const navLinks = [
        { to: '/dashboard',  icon: LayoutDashboard, text: 'Dashboard'  },
        { to: '/documents',  icon: FileText,         text: 'Documents'  },
        { to: '/flashcards', icon: BookOpen,         text: 'Flashcards' },
        { to: '/profile',    icon: User,             text: 'Profile'    },
    ];

    useEffect(() => {
        if (window.innerWidth < 768 && isSidebarOpen) toggleSidebar();
    }, [location.pathname]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape' && isSidebarOpen) toggleSidebar(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isSidebarOpen]);

    return (
        <>
            {/* Overlay — mobile */}
            <div
                aria-hidden="true"
                onClick={toggleSidebar}
                className={`fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm transition-all duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            />

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`
                    fixed top-0 left-0 h-full w-64 bg-white z-50
                    shadow-2xl shadow-slate-900/10 flex flex-col
                    transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0 md:static md:shadow-none md:border-r md:border-slate-200
                `}
            >
                {/* Brand */}
                <div className="flex items-center h-16 justify-between px-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                            <BrainCircuit size={18} strokeWidth={2} />
                        </div>
                        <h1 className="text-sm font-bold text-slate-900 tracking-tight">AI Learning</h1>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-200"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navLinks.map((link, index) => {
                        const Icon = link.icon;
                        return (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                style={{ animationDelay: `${index * 40}ms` }}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                    transition-all duration-200 ease-in-out animate-fadeInLeft
                                    ${isActive
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon size={18} strokeWidth={2.5} className={`transition-all duration-200 ${isActive ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-110'}`} />
                                        <span className="transition-all duration-200">{link.text}</span>
                                        {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-slate-200">
                    <button
                        onClick={handleLogOut}
                        className="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 hover:translate-x-1"
                    >
                        <LogOut size={18} className="transition-all duration-200 group-hover:scale-110 group-hover:rotate-12" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
