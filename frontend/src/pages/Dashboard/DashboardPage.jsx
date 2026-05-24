import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import Spinner from '../../components/common/Spinner';
import ScrollReveal from '../../components/common/ScrollReveal';
import SceneBackground from '../../components/common/SceneBackground';
import progressService from '../../services/progressService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
    FileText, BookOpen, BrainCircuit, TrendingUp,
    Star, CheckCircle, Flame, BarChart2, Clock,
    ChevronRight, Award, Layers, Sparkles,
} from 'lucide-react';

// ── Animated counter ──────────────────────────────────────────────────────────
const AnimatedNumber = ({ value, suffix = '' }) => {
    const ref    = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const numVal = parseFloat(String(value).replace('%', '')) || 0;
    const isSuffix = String(value).includes('%') ? '%' : suffix;

    useEffect(() => {
        if (!inView || !ref.current) return;
        const obj = { val: 0 };
        gsap.to(obj, {
            val: numVal,
            duration: 1.4,
            ease: 'power2.out',
            onUpdate: () => {
                if (ref.current) {
                    ref.current.textContent = Math.round(obj.val) + isSuffix;
                }
            },
        });
    }, [inView, numVal]);

    return <span ref={ref}>0{isSuffix}</span>;
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, gradient, shadowColor, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex items-center gap-4 h-full group hover:shadow-lg hover:border-slate-200 transition-all duration-300"
    >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadowColor} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={20} className="text-white" strokeWidth={2} />
        </div>
        <div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">
                <AnimatedNumber value={value} />
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
        </div>
    </motion.div>
);

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, linkTo, linkLabel }) => (
    <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h2>
        {linkTo && (
            <Link to={linkTo} className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 group">
                {linkLabel} <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-150" />
            </Link>
        )}
    </div>
);

// ── Document Row ──────────────────────────────────────────────────────────────
const DocumentRow = ({ doc, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 group cursor-default hover:translate-x-1"
    >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <FileText size={15} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{doc.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">
                {doc.lastAccessed
                    ? new Date(doc.lastAccessed).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '—'}
            </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
            doc.status === 'ready' ? 'bg-emerald-50 text-emerald-600' :
            doc.status === 'processing' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
        }`}>{doc.status}</span>
    </motion.div>
);

// ── Quiz Row ──────────────────────────────────────────────────────────────────
const getLocalAttempted = (quizId) => {
    try {
        const raw = localStorage.getItem(`quiz_progress_${quizId}`);
        if (!raw) return 0;
        return Object.keys(JSON.parse(raw)?.answers || {}).length;
    } catch { return 0; }
};

const QuizRow = ({ quiz, index }) => {
    const navigate    = useNavigate();
    const score       = quiz.score ?? 0;
    const total       = quiz.totalQuestions || 0;
    const attempted   = !quiz.completedAt ? getLocalAttempted(quiz._id) : 0;
    const inProgress  = !quiz.completedAt && attempted > 0;
    const progressPct = total > 0 ? Math.round((attempted / total) * 100) : 0;

    let badgeText, badgeCls;
    if (quiz.completedAt)  { badgeText = 'Completed'; badgeCls = 'bg-emerald-50 text-emerald-600'; }
    else if (inProgress)   { badgeText = `${progressPct}%`; badgeCls = 'bg-amber-50 text-amber-600'; }
    else                   { badgeText = 'Not Started'; badgeCls = 'bg-slate-100 text-slate-500'; }

    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => navigate(quiz.completedAt ? `/quizzes/${quiz._id}/results` : `/quizzes/${quiz._id}`)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer group hover:translate-x-1"
        >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-violet-500/20 group-hover:scale-105 transition-transform duration-200">
                <BrainCircuit size={15} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{quiz.documentId?.title || quiz.title || 'Quiz'}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                    {total} questions{quiz.completedAt ? ` · Score: ${score}%` : inProgress ? ` · ${attempted}/${total} answered` : ''}
                </p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${badgeCls}`}>{badgeText}</span>
        </motion.div>
    );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const DashboardPage = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const bannerRef = useRef(null);

    useEffect(() => {
        progressService.getDashboardData()
            .then(r => setDashboardData(r.data))
            .catch(() => toast.error('Failed to fetch dashboard data.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner />;

    if (!dashboardData?.overview) return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full py-24 text-center"
        >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-700 font-semibold">No data yet</p>
            <p className="text-slate-400 text-sm mt-1">Upload a document to get started.</p>
            <Link to="/documents" className="mt-5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200">
                Upload Document
            </Link>
        </motion.div>
    );

    const { overview, recentActivity } = dashboardData;
    const recentDocs    = recentActivity?.documents || [];
    const recentQuizzes = recentActivity?.quizzes   || [];

    const stats = [
        { label: 'Total Documents',   value: overview.totalDocuments,    icon: FileText,    gradient: 'from-blue-400 to-cyan-500',     shadowColor: 'shadow-blue-500/25',    delay: 0    },
        { label: 'Flashcard Sets',    value: overview.totalFlashcardSets, icon: BookOpen,   gradient: 'from-purple-400 to-pink-500',   shadowColor: 'shadow-purple-500/25',  delay: 0.05 },
        { label: 'Total Quizzes',     value: overview.totalQuizzes,       icon: BrainCircuit,gradient: 'from-violet-400 to-indigo-500',shadowColor: 'shadow-violet-500/25',  delay: 0.1  },
        { label: 'Avg Quiz Score',    value: `${overview.averageScore}%`, icon: BarChart2,   gradient: 'from-orange-400 to-amber-500',  shadowColor: 'shadow-orange-500/25',  delay: 0.15 },
        { label: 'Cards Reviewed',    value: overview.reviewFlashcards,   icon: CheckCircle, gradient: 'from-teal-400 to-green-500',    shadowColor: 'shadow-teal-500/25',    delay: 0.2  },
        { label: 'Starred Cards',     value: overview.starredFlashcards,  icon: Star,        gradient: 'from-yellow-400 to-orange-400', shadowColor: 'shadow-yellow-500/25',  delay: 0.25 },
        { label: 'Quizzes Completed', value: overview.completedQuiz,      icon: Award,       gradient: 'from-rose-400 to-pink-500',     shadowColor: 'shadow-rose-500/25',    delay: 0.3  },
        { label: 'Study Streak',      value: `${overview.studyStreak}d`,  icon: Flame,       gradient: 'from-red-400 to-orange-500',    shadowColor: 'shadow-red-500/25',     delay: 0.35 },
    ];

    return (
        <div className="space-y-6 pb-8 max-w-7xl mx-auto">

            {/* ── Welcome Banner ── */}
            <motion.div
                ref={bannerRef}
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-2xl p-6 text-white shadow-2xl shadow-emerald-500/20"
                style={{
                    background: 'linear-gradient(135deg, #059669 0%, #0d9488 40%, #0891b2 100%)',
                }}
            >
                {/* Animated orbs */}
                <div className="banner-orb-1 absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/8 blur-2xl pointer-events-none" />
                <div className="banner-orb-2 absolute -bottom-8 left-1/4 w-40 h-40 rounded-full bg-white/6 blur-xl pointer-events-none" />
                <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-teal-400/20 blur-lg pointer-events-none" />

                {/* Animated background scene */}
                <SceneBackground />

                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                    }}
                />

                <div className="relative flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15, duration: 0.5 }}
                            className="flex items-center gap-2 mb-1"
                        >
                            <Sparkles size={14} className="text-emerald-200" />
                            <p className="text-emerald-100 text-sm font-medium">Welcome back,</p>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-2xl md:text-3xl font-bold tracking-tight"
                        >
                            {user?.displayName || user?.username || 'Learner'} 👋
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-emerald-100 text-sm mt-2"
                        >
                            You have{' '}
                            <span className="text-white font-bold">{overview.totalDocuments}</span> documents and{' '}
                            <span className="text-white font-bold">{overview.totalFlashcardSets}</span> flashcard sets ready.
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                        className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/20 transition-colors duration-200"
                    >
                        <Flame size={18} className="text-orange-200" />
                        <div>
                            <p className="text-xs text-emerald-100 font-medium">Study Streak</p>
                            <p className="text-lg font-bold leading-none">{overview.studyStreak} days</p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* ── Stats Grid ── */}
            <ScrollReveal stagger={0.05}>
                <div>
                    <SectionHeader title="Overview" />
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
                    </div>
                </div>
            </ScrollReveal>

            {/* ── Flashcard Progress ── */}
            {overview.totalFlashcards > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 hover:shadow-md transition-shadow duration-300"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/25">
                            <Layers size={16} className="text-white" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800">Flashcard Progress</p>
                            <p className="text-xs text-slate-400">{overview.reviewFlashcards} of {overview.totalFlashcards} cards reviewed</p>
                        </div>
                        <span className="text-sm font-bold text-purple-600">
                            {Math.round((overview.reviewFlashcards / overview.totalFlashcards) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.round((overview.reviewFlashcards / overview.totalFlashcards) * 100)}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full"
                        />
                    </div>
                </motion.div>
            )}

            {/* ── Recent Activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                    {
                        title: 'Recent Documents', linkTo: '/documents', linkLabel: 'View all',
                        items: recentDocs, empty: { icon: FileText, msg: 'No documents yet', link: '/documents', linkText: 'Upload one' },
                        Row: DocumentRow,
                    },
                    {
                        title: 'Recent Quizzes', linkTo: '/documents', linkLabel: 'View all',
                        items: recentQuizzes, empty: { icon: BrainCircuit, msg: 'No quizzes yet', link: '/documents', linkText: 'Start a quiz' },
                        Row: QuizRow,
                    },
                ].map(({ title, linkTo, linkLabel, items, empty, Row }, ci) => (
                    <motion.div
                        key={title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-30px' }}
                        transition={{ duration: 0.5, delay: ci * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 hover:shadow-md transition-shadow duration-300"
                    >
                        <SectionHeader title={title} linkTo={linkTo} linkLabel={linkLabel} />
                        {items.length > 0 ? (
                            <div className="space-y-0.5">
                                {items.map((item, i) => <Row key={item._id} {...(title.includes('Doc') ? { doc: item } : { quiz: item })} index={i} />)}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
                                    <empty.icon size={22} className="text-slate-300" />
                                </div>
                                <p className="text-slate-500 text-sm font-medium">{empty.msg}</p>
                                <Link to={empty.link} className="mt-2 text-xs font-semibold text-emerald-600 hover:underline">{empty.linkText}</Link>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* ── Quick Actions ── */}
            <div>
                <SectionHeader title="Quick Actions" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Upload Document', to: '/documents',  icon: FileText,     gradient: 'from-blue-400 to-cyan-500',     delay: 0    },
                        { label: 'My Flashcards',   to: '/flashcards', icon: BookOpen,     gradient: 'from-purple-400 to-pink-500',   delay: 0.05 },
                        { label: 'Take a Quiz',     to: '/documents',  icon: BrainCircuit, gradient: 'from-violet-400 to-indigo-500', delay: 0.1  },
                        { label: 'My Profile',      to: '/profile',    icon: Clock,        gradient: 'from-orange-400 to-amber-500',  delay: 0.15 },
                    ].map(({ label, to, icon: Icon, gradient, delay }) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                            <Link
                                to={to}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 flex flex-col items-center gap-2.5 hover:shadow-lg transition-all duration-300 group block"
                            >
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                                    <Icon size={18} className="text-white" strokeWidth={2} />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{label}</span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
