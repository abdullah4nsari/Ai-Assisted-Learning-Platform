import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Spinner from '../../components/common/Spinner';
import progressService from '../../services/progressService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
    FileText, BookOpen, BrainCircuit, TrendingUp,
    Star, CheckCircle, Flame, BarChart2, Clock,
    ChevronRight, Award, Layers, Sparkles, ArrowUpRight,
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] } },
});

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, gradient, shadowColor, delay = 0 }) => (
    <motion.div
        {...fadeUp(delay)}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 flex items-center gap-4 hover:shadow-md transition-shadow duration-300"
    >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadowColor} flex-shrink-0`}>
            <Icon size={20} className="text-white" strokeWidth={2} />
        </div>
        <div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{value ?? 0}</p>
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
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-150 group cursor-default"
    >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/20">
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
        }`}>
            {doc.status}
        </span>
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
    const navigate = useNavigate();
    const score    = quiz.score ?? 0;
    const total    = quiz.totalQuestions || 0;
    const attempted = !quiz.completedAt ? getLocalAttempted(quiz._id) : 0;
    const inProgress = !quiz.completedAt && attempted > 0;
    const progressPct = total > 0 ? Math.round((attempted / total) * 100) : 0;

    let badgeText, badgeCls;
    if (quiz.completedAt)   { badgeText = 'Completed'; badgeCls = 'bg-emerald-50 text-emerald-600'; }
    else if (inProgress)    { badgeText = `${progressPct}%`; badgeCls = 'bg-amber-50 text-amber-600'; }
    else                    { badgeText = 'Not Started'; badgeCls = 'bg-slate-100 text-slate-500'; }

    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onClick={() => navigate(quiz.completedAt ? `/quizzes/${quiz._id}/results` : `/quizzes/${quiz._id}`)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-150 cursor-pointer group"
        >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-violet-500/20">
                <BrainCircuit size={15} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{quiz.documentId?.title || quiz.title || 'Quiz'}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                    {total} questions
                    {quiz.completedAt ? ` · Score: ${score}%` : inProgress ? ` · ${attempted}/${total} answered` : ''}
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

    useEffect(() => {
        progressService.getDashboardData()
            .then(r => setDashboardData(r.data))
            .catch(() => toast.error('Failed to fetch dashboard data.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner />;

    if (!dashboardData?.overview) return (
        <motion.div {...fadeUp()} className="flex flex-col items-center justify-center h-full py-24 text-center">
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
        { label: 'Total Documents',   value: overview.totalDocuments,    icon: FileText,    gradient: 'from-blue-400 to-cyan-500',    shadowColor: 'shadow-blue-500/25',    delay: 0    },
        { label: 'Flashcard Sets',    value: overview.totalFlashcardSets, icon: BookOpen,    gradient: 'from-purple-400 to-pink-500',  shadowColor: 'shadow-purple-500/25',  delay: 0.05 },
        { label: 'Total Quizzes',     value: overview.totalQuizzes,       icon: BrainCircuit,gradient: 'from-violet-400 to-indigo-500',shadowColor: 'shadow-violet-500/25',  delay: 0.1  },
        { label: 'Avg Quiz Score',    value: `${overview.averageScore}%`, icon: BarChart2,   gradient: 'from-orange-400 to-amber-500', shadowColor: 'shadow-orange-500/25',  delay: 0.15 },
        { label: 'Cards Reviewed',    value: overview.reviewFlashcards,   icon: CheckCircle, gradient: 'from-teal-400 to-green-500',   shadowColor: 'shadow-teal-500/25',    delay: 0.2  },
        { label: 'Starred Cards',     value: overview.starredFlashcards,  icon: Star,        gradient: 'from-yellow-400 to-orange-400',shadowColor: 'shadow-yellow-500/25',  delay: 0.25 },
        { label: 'Quizzes Completed', value: overview.completedQuiz,      icon: Award,       gradient: 'from-rose-400 to-pink-500',    shadowColor: 'shadow-rose-500/25',    delay: 0.3  },
        { label: 'Study Streak',      value: `${overview.studyStreak}d`,  icon: Flame,       gradient: 'from-red-400 to-orange-500',   shadowColor: 'shadow-red-500/25',     delay: 0.35 },
    ];

    return (
        <div className="space-y-6 pb-8 max-w-7xl mx-auto">

            {/* Welcome Banner */}
            <motion.div
                {...fadeUp(0)}
                className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/25"
            >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 pointer-events-none" />

                <div className="relative flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={14} className="text-emerald-200" />
                            <p className="text-emerald-100 text-sm font-medium">Welcome back,</p>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            {user?.displayName || user?.username || 'Learner'} 👋
                        </h1>
                        <p className="text-emerald-100 text-sm mt-2">
                            You have{' '}
                            <span className="text-white font-bold">{overview.totalDocuments}</span> documents and{' '}
                            <span className="text-white font-bold">{overview.totalFlashcardSets}</span> flashcard sets ready.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20">
                        <Flame size={18} className="text-orange-200" />
                        <div>
                            <p className="text-xs text-emerald-100 font-medium">Study Streak</p>
                            <p className="text-lg font-bold leading-none">{overview.studyStreak} days</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div>
                <SectionHeader title="Overview" />
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
                </div>
            </div>

            {/* Flashcard Progress */}
            {overview.totalFlashcards > 0 && (
                <motion.div {...fadeUp(0.2)} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80">
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
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round((overview.reviewFlashcards / overview.totalFlashcards) * 100)}%` }}
                            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full"
                        />
                    </div>
                </motion.div>
            )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <motion.div {...fadeUp(0.25)} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80">
                    <SectionHeader title="Recent Documents" linkTo="/documents" linkLabel="View all" />
                    {recentDocs.length > 0 ? (
                        <div className="space-y-0.5">
                            {recentDocs.map((doc, i) => <DocumentRow key={doc._id} doc={doc} index={i} />)}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
                                <FileText size={22} className="text-slate-300" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium">No documents yet</p>
                            <Link to="/documents" className="mt-2 text-xs font-semibold text-emerald-600 hover:underline">Upload one</Link>
                        </div>
                    )}
                </motion.div>

                <motion.div {...fadeUp(0.3)} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80">
                    <SectionHeader title="Recent Quizzes" linkTo="/documents" linkLabel="View all" />
                    {recentQuizzes.length > 0 ? (
                        <div className="space-y-0.5">
                            {recentQuizzes.map((quiz, i) => <QuizRow key={quiz._id} quiz={quiz} index={i} />)}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
                                <BrainCircuit size={22} className="text-slate-300" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium">No quizzes yet</p>
                            <Link to="/documents" className="mt-2 text-xs font-semibold text-emerald-600 hover:underline">Start a quiz</Link>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Quick Actions */}
            <div>
                <SectionHeader title="Quick Actions" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Upload Document', to: '/documents', icon: FileText,    gradient: 'from-blue-400 to-cyan-500',    delay: 0    },
                        { label: 'My Flashcards',   to: '/flashcards', icon: BookOpen,   gradient: 'from-purple-400 to-pink-500',  delay: 0.05 },
                        { label: 'Take a Quiz',     to: '/documents', icon: BrainCircuit,gradient: 'from-violet-400 to-indigo-500',delay: 0.1  },
                        { label: 'My Profile',      to: '/profile',   icon: Clock,       gradient: 'from-orange-400 to-amber-500', delay: 0.15 },
                    ].map(({ label, to, icon: Icon, gradient, delay }) => (
                        <motion.div key={label} {...fadeUp(delay)} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                            <Link
                                to={to}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 flex flex-col items-center gap-2.5 hover:shadow-md transition-all duration-200 group block"
                            >
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
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
