import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Bell, Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
    const { user } = useAuth();

    const displayName = user?.displayName || user?.username || 'User';
    const initials    = displayName
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <header className='sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-5 py-2'>
            <div className='flex items-center justify-between'>
                {/* Mobile menu button */}
                <button
                    onClick={toggleSidebar}
                    className='md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200'
                    aria-label='Toggle Sidebar'
                >
                    <Menu size={24} />
                </button>

                <div className='hidden md:block' />

                <div className='flex items-center gap-3'>
                    <button className='relative inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 group'>
                        <Bell size={20} className='group hover:scale-110 transition-transform duration-200' />
                        <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white' />
                    </button>

                    {/* user profile */}
                    <div className='flex items-center gap-3 pl-3 border-l border-slate-200/60'>
                        <div className='flex items-center gap-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors duration-200 cursor-pointer group'>
                            {/* avatar — image if available, else initials */}
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt={displayName}
                                    className='w-9 h-9 rounded-xl object-cover shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-200'
                                />
                            ) : (
                                <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-200'>
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
