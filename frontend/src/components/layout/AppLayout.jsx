import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: {
        opacity: 1, y: 0,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
        opacity: 0, y: -6,
        transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
    },
};

const AppLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const location = useLocation();

    // Scroll to top on route change
    useEffect(() => {
        const main = document.getElementById('main-scroll');
        if (main) main.scrollTop = 0;
    }, [location.pathname]);

    return (
        <div className="flex h-screen mesh-bg text-slate-900 transition-colors duration-300 overflow-hidden">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex-1 flex flex-col min-h-0">
                <Header toggleSidebar={toggleSidebar} />

                <main
                    id="main-scroll"
                    className="flex-1 overflow-y-auto overflow-x-hidden"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="p-5 md:p-6 pb-10"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
