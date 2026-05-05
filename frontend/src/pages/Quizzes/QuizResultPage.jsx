import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, XCircle, Trophy,
  ClipboardList, BarChart2, Target, Lightbulb,
} from 'lucide-react';
import quizService from '../../services/quizService';
import Spinner     from '../../components/common/Spinner';

// ── ScoreRing ─────────────────────────────────────────────────────────────────
const ScoreRing = ({ pct }) => {
  const r   = 40;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="rotate-[-90deg]">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease-out' }}
      />
    </svg>
  );
};

// ── StatCard ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, iconCls, bgCls }) => (
  <div className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border border-slate-100 shadow-sm ${bgCls}`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconCls}`}>
      <Icon size={20} />
    </div>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">{label}</p>
  </div>
);

// ── ResultItem ────────────────────────────────────────────────────────────────
const ResultItem = ({ result, index }) => {
  const isCorrect = result.isCorrect;

  return (
    <div className={`rounded-2xl border p-5 space-y-3 animate-fadeInLeft ${isCorrect ? 'border-emerald-200 bg-emerald-50/40' : 'border-red-200 bg-red-50/30'}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* question */}
      <div className="flex items-start gap-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isCorrect ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {isCorrect
            ? <CheckCircle2 size={15} className="text-emerald-600" />
            : <XCircle      size={15} className="text-red-500" />
          }
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Question {index + 1}</p>
          <p className="text-sm font-semibold text-slate-800 leading-relaxed">{result.question}</p>
        </div>
      </div>

      {/* answers */}
      <div className="pl-10 space-y-1.5">
        {result.selectedAnswer && result.selectedAnswer !== result.correctAnswer && (
          <div className="flex items-center gap-2 text-sm">
            <XCircle size={13} className="text-red-400 shrink-0" />
            <span className="text-red-600">Your answer: <span className="font-semibold">{result.selectedAnswer}</span></span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
          <span className="text-emerald-700">Correct: <span className="font-semibold">{result.correctAnswer}</span></span>
        </div>
      </div>

      {/* explanation */}
      {result.explanation && (
        <div className="pl-10 flex gap-2 px-3 py-2.5 bg-white/70 rounded-xl border border-slate-200">
          <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">{result.explanation}</p>
        </div>
      )}
    </div>
  );
};

// ── Main QuizResultPage ───────────────────────────────────────────────────────
const QuizResultPage = () => {
  const { quizId } = useParams();
  const navigate   = useNavigate();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    quizService.getQuizResults(quizId)
      .then(res => {
        if (!res?.data) throw new Error('No results found');
        setData(res.data);
      })
      .catch(err => setError(err?.message || 'Failed to load results.'))
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner /></div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-500">
      <BarChart2 size={48} className="opacity-20" />
      <p className="text-red-500 font-medium">{error}</p>
      <button onClick={() => navigate(-1)} className="text-sm text-violet-600 hover:underline flex items-center gap-1">
        <ArrowLeft size={13} /> Go back
      </button>
    </div>
  );

  const { quiz, results = [] } = data;
  const pct      = quiz?.percentage ?? quiz?.score ?? 0;
  const total    = quiz?.totalQuestions || results.length;
  const correct  = results.filter(r => r.isCorrect).length;
  const wrong    = total - correct;
  const docId    = quiz?.document?._id || quiz?.document;
  const grade    = pct >= 90 ? 'Excellent!' : pct >= 70 ? 'Good Job!' : pct >= 50 ? 'Keep Practicing' : 'Needs Improvement';
  const gradeColor = pct >= 70 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="max-w-2xl mx-auto pb-10 space-y-6">

      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(docId ? `/documents/${docId}` : -1)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={15} /> Return to Document
        </button>
        <span className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{quiz?.title || 'Quiz Results'}</span>
      </div>

      {/* score hero */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <ScoreRing pct={pct} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-800">{pct}%</span>
          </div>
        </div>
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
            <Trophy size={18} className="text-amber-400" />
            <h1 className="text-xl font-bold text-slate-900">Quiz Complete!</h1>
          </div>
          <p className={`text-lg font-bold ${gradeColor}`}>{grade}</p>
          <p className="text-sm text-slate-500 mt-1">{quiz?.title || 'Quiz'}</p>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={Target}
          label="Score"
          value={`${pct}%`}
          iconCls="bg-violet-100 text-violet-600"
          bgCls="bg-white"
        />
        <StatCard
          icon={CheckCircle2}
          label="Correct"
          value={correct}
          iconCls="bg-emerald-100 text-emerald-600"
          bgCls="bg-white"
        />
        <StatCard
          icon={XCircle}
          label="Wrong"
          value={wrong}
          iconCls="bg-red-100 text-red-500"
          bgCls="bg-white"
        />
      </div>

      {/* question breakdown */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={15} className="text-slate-400" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Question Breakdown</h2>
          </div>
          {results.map((r, i) => (
            <ResultItem key={i} result={r} index={i} />
          ))}
        </div>
      )}

      {/* back button */}
      <button
        onClick={() => navigate(docId ? `/documents/${docId}` : -1)}
        className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl hover:from-violet-600 hover:to-indigo-600 transition-all shadow-md shadow-violet-500/20"
      >
        Return to Document
      </button>
    </div>
  );
};

export default QuizResultPage;
