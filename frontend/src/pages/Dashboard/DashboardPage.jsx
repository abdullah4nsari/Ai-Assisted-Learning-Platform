import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import progressService from '../../services/progressService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
  FileText, BookOpen, BrainCircuit, TrendingUp,
  Star, CheckCircle, Flame, BarChart2, Clock,
  ChevronRight, Award, Layers
} from 'lucide-react';

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, gradient, shadowColor, delay = 0 }) => (
  <div
    className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 animate-fadeInLeft hover:shadow-md transition-shadow duration-200"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadowColor} flex-shrink-0`}>
      <Icon size={20} className="text-white" strokeWidth={2} />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900">{value ?? 0}</p>
      <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, linkTo, linkLabel }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h2>
    {linkTo && (
      <Link to={linkTo} className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200">
        {linkLabel} <ChevronRight size={14} />
      </Link>
    )}
  </div>
);

// ── Recent Document Row ───────────────────────────────────────────────────────
const DocumentRow = ({ doc, index }) => (
  <div
    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-150 animate-fadeInLeft"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
      <FileText size={16} className="text-blue-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-800 truncate">{doc.title}</p>
      <p className="text-xs text-slate-400 mt-0.5">
        {doc.lastAccessed
          ? new Date(doc.lastAccessed).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
          : '—'}
      </p>
    </div>
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${doc.status === 'ready'
        ? 'bg-emerald-50 text-emerald-600'
        : doc.status === 'processing'
          ? 'bg-amber-50 text-amber-600'
          : 'bg-red-50 text-red-500'
      }`}>
      {doc.status}
    </span>
  </div>
);

// ── Recent Quiz Row ───────────────────────────────────────────────────────────
const getLocalAttempted = (quizId) => {
  try {
    const raw = localStorage.getItem(`quiz_progress_${quizId}`);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Object.keys(parsed?.answers || {}).length;
  } catch { return 0; }
};

const QuizRow = ({ quiz, index }) => {
  const navigate = useNavigate();

  // score is already 0-100 from the backend — do NOT divide by totalQuestions again
  const score = quiz.score ?? 0;
  const total = quiz.totalQuestions || 0;

  const attempted = !quiz.completedAt ? getLocalAttempted(quiz._id) : 0;
  const inProgress = !quiz.completedAt && attempted > 0;
  const progressPct = total > 0 ? Math.round((attempted / total) * 100) : 0;

  // badge config
  let badgeText, badgeCls;
  if (quiz.completedAt) {
    badgeText = 'Completed';
    badgeCls  = 'bg-emerald-50 text-emerald-600';
  } else if (inProgress) {
    badgeText = `${progressPct}% In Progress`;
    badgeCls  = 'bg-amber-50 text-amber-600';
  } else {
    badgeText = 'Not Started';
    badgeCls  = 'bg-slate-100 text-slate-500';
  }

  const handleClick = () => {
    if (quiz.completedAt) {
      navigate(`/quizzes/${quiz._id}/results`);
    } else {
      navigate(`/quizzes/${quiz._id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-150 animate-fadeInLeft cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
        <BrainCircuit size={16} className="text-purple-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          {quiz.documentId?.title || quiz.title || 'Quiz'}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {total} questions
          {quiz.completedAt
            ? ` · Score: ${score}% · ${new Date(quiz.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            : inProgress ? ` · ${attempted} of ${total} answered` : ''}
        </p>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${badgeCls}`}>
        {badgeText}
      </span>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await progressService.getDashboardData();
        setDashboardData(response.data);
      } catch (error) {
        toast.error('Failed to fetch dashboard data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <Spinner />;

  if (!dashboardData?.overview) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-slate-600 text-sm font-medium">No dashboard data available.</p>
        <p className="text-slate-400 text-xs mt-1">Upload a document to get started.</p>
        <Link to="/documents" className="mt-4 px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors duration-200">
          Upload Document
        </Link>
      </div>
    );
  }

  const { overview, recentActivity } = dashboardData;

  const stats = [
    { label: 'Total Documents', value: overview.totalDocuments, icon: FileText, gradient: 'from-blue-400 to-cyan-500', shadowColor: 'shadow-blue-500/25', delay: 0 },
    { label: 'Flashcard Sets', value: overview.totalFlashcardSets, icon: BookOpen, gradient: 'from-purple-400 to-pink-500', shadowColor: 'shadow-purple-500/25', delay: 60 },
    { label: 'Total Quizzes', value: overview.totalQuizzes, icon: BrainCircuit, gradient: 'from-emerald-400 to-teal-500', shadowColor: 'shadow-emerald-500/25', delay: 120 },
    { label: 'Avg Quiz Score', value: `${overview.averageScore}%`, icon: BarChart2, gradient: 'from-orange-400 to-amber-500', shadowColor: 'shadow-orange-500/25', delay: 180 },
    { label: 'Cards Reviewed', value: overview.reviewFlashcards, icon: CheckCircle, gradient: 'from-teal-400 to-green-500', shadowColor: 'shadow-teal-500/25', delay: 240 },
    { label: 'Starred Cards', value: overview.starredFlashcards, icon: Star, gradient: 'from-yellow-400 to-orange-400', shadowColor: 'shadow-yellow-500/25', delay: 300 },
    { label: 'Quizzes Completed', value: overview.completedQuiz, icon: Award, gradient: 'from-rose-400 to-pink-500', shadowColor: 'shadow-rose-500/25', delay: 360 },
    { label: 'Study Streak', value: `${overview.studyStreak}d`, icon: Flame, gradient: 'from-red-400 to-orange-500', shadowColor: 'shadow-red-500/25', delay: 420 },
  ];

  const recentDocs = recentActivity?.documents || [];
  const recentQuizzes = recentActivity?.quizzes || [];

  return (
    <div className="space-y-6 pb-8">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 animate-fadeInLeft">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-emerald-100 text-sm font-medium">Welcome back,</p>
            <h1 className="text-2xl font-bold mt-0.5">{user?.displayName || user?.username || 'Learner'} 👋</h1>
            <p className="text-emerald-100 text-sm mt-1">
              You have <span className="text-white font-semibold">{overview.totalDocuments}</span> documents and <span className="text-white font-semibold">{overview.totalFlashcardSets}</span> flashcard sets ready to study.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
            <Flame size={18} className="text-orange-200" />
            <span className="text-sm font-bold">{overview.studyStreak} day streak</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <SectionHeader title="Overview" />
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      {/* Flashcard Progress Bar */}
      {overview.totalFlashcards > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-fadeInLeft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/25">
              <Layers size={16} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Flashcard Progress</p>
              <p className="text-xs text-slate-400">{overview.reviewFlashcards} of {overview.totalFlashcards} cards reviewed</p>
            </div>
            <span className="ml-auto text-sm font-bold text-purple-600">
              {Math.round((overview.reviewFlashcards / overview.totalFlashcards) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-purple-400 to-pink-500 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${Math.round((overview.reviewFlashcards / overview.totalFlashcards) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Documents */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <SectionHeader title="Recent Documents" linkTo="/documents" linkLabel="View all" />
          {recentDocs.length > 0 ? (
            <div className="space-y-1">
              {recentDocs.map((doc, i) => (
                <DocumentRow key={doc._id} doc={doc} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText size={32} className="text-slate-200 mb-2" />
              <p className="text-slate-400 text-xs">No documents yet.</p>
              <Link to="/documents" className="mt-2 text-xs font-semibold text-emerald-600 hover:underline">Upload one</Link>
            </div>
          )}
        </div>

        {/* Recent Quizzes */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <SectionHeader title="Recent Quizzes" linkTo="/documents" linkLabel="View all" />
          {recentQuizzes.length > 0 ? (
            <div className="space-y-1">
              {recentQuizzes.map((quiz, i) => (
                <QuizRow key={quiz._id} quiz={quiz} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BrainCircuit size={32} className="text-slate-200 mb-2" />
              <p className="text-slate-400 text-xs">No quizzes taken yet.</p>
              <Link to="/documents" className="mt-2 text-xs font-semibold text-emerald-600 hover:underline">Start a quiz</Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Upload Document', to: '/documents', icon: FileText, gradient: 'from-blue-400 to-cyan-500', delay: 0 },
            { label: 'My Flashcards', to: '/flashcards', icon: BookOpen, gradient: 'from-purple-400 to-pink-500', delay: 60 },
            { label: 'Take a Quiz', to: '/documents', icon: BrainCircuit, gradient: 'from-emerald-400 to-teal-500', delay: 120 },
            { label: 'My Profile', to: '/profile', icon: Clock, gradient: 'from-orange-400 to-amber-500', delay: 180 },
          ].map(({ label, to, icon: Icon, gradient, delay }) => (
            <Link
              key={label}
              to={to}
              style={{ animationDelay: `${delay}ms` }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fadeInLeft group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={18} className="text-white" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-slate-700 text-center">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
