import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2,
  XCircle, ClipboardList, Loader2, BookOpen, Lightbulb,
} from 'lucide-react';
import quizService from '../../services/quizService';
import Spinner     from '../../components/common/Spinner';
import toast       from 'react-hot-toast';
import { QUIZ_PROGRESS_KEY } from '../../components/quizes/QuizzesTab';

// ── localStorage helpers ──────────────────────────────────────────────────────
const saveProgress = (quizId, answers, confirmed, qIndex) => {
  try {
    localStorage.setItem(QUIZ_PROGRESS_KEY(quizId), JSON.stringify({ answers, confirmed, qIndex }));
  } catch {}
};

const loadProgress = (quizId) => {
  try {
    const raw = localStorage.getItem(QUIZ_PROGRESS_KEY(quizId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const clearProgress = (quizId) => {
  try { localStorage.removeItem(QUIZ_PROGRESS_KEY(quizId)); } catch {}
};

// ── difficulty styles ─────────────────────────────────────────────────────────
const DIFF_STYLE = {
  easy:   'bg-emerald-50 text-emerald-600',
  medium: 'bg-amber-50 text-amber-600',
  hard:   'bg-red-50 text-red-500',
};

// ── ProgressBar ───────────────────────────────────────────────────────────────
const ProgressBar = ({ current, total }) => {
  const pct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-400">
        <span>Question {current + 1} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-violet-400 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ── normalize for comparison — trims whitespace and lowercases ────────────────
const norm = (s) => (s || '').trim().toLowerCase();

// ── QuestionCard ──────────────────────────────────────────────────────────────
const QuestionCard = ({ question, qIndex, selected, confirmed, onSelect, onConfirm }) => {
  const diff    = question.difficulty || 'medium';
  const diffCls = DIFF_STYLE[diff] || DIFF_STYLE.medium;
  const correct = question.correctAnswer;

  // find the option whose normalized text matches the normalized correctAnswer
  const correctOpt = question.options.find(o => norm(o) === norm(correct)) ?? correct;
  const isCorrectOpt  = (opt) => norm(opt) === norm(correct);
  const isSelectedOpt = (opt) => norm(opt) === norm(selected);

  const optionStyle = (opt) => {
    const base = 'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-150 ';
    if (!confirmed) {
      return base + (isSelectedOpt(opt)
        ? 'border-violet-400 bg-violet-50 text-violet-800 cursor-pointer'
        : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/40 cursor-pointer');
    }
    if (isCorrectOpt(opt))  return base + 'border-emerald-500 bg-emerald-50 text-emerald-800';
    if (isSelectedOpt(opt)) return base + 'border-red-400 bg-red-50 text-red-700';
    return base + 'border-slate-200 opacity-40 cursor-default';
  };

  const optionIcon = (opt) => {
    if (!confirmed) return (
      <span className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${isSelectedOpt(opt) ? 'border-violet-500 bg-violet-500' : 'border-slate-300'}`}>
        {isSelectedOpt(opt) && <span className="w-2 h-2 rounded-full bg-white" />}
      </span>
    );
    if (isCorrectOpt(opt))  return <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />;
    if (isSelectedOpt(opt)) return <XCircle      size={18} className="text-red-500 shrink-0" />;
    return <span className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0" />;
  };

  const isRight = norm(selected) === norm(correct);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 animate-fadeInLeft">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {qIndex + 1}</span>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${diffCls}`}>{diff}</span>
        </div>
        <p className="text-base font-semibold text-slate-800 leading-relaxed">{question.question}</p>
      </div>

      <div className="space-y-2.5">
        {question.options.map((opt, i) => (
          <div key={i} className={optionStyle(opt)} onClick={() => !confirmed && onSelect(opt)}>
            {optionIcon(opt)}
            <span className="flex-1">{opt}</span>
            {confirmed && isCorrectOpt(opt) && (
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide shrink-0">Correct</span>
            )}
            {confirmed && isSelectedOpt(opt) && !isCorrectOpt(opt) && (
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide shrink-0">Your Answer</span>
            )}
          </div>
        ))}
      </div>

      {confirmed && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${
          isRight ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
        }`}>
          {isRight
            ? <><CheckCircle2 size={16} /> Correct! Well done.</>
            : <><XCircle size={16} /> Incorrect — correct answer: <span className="font-bold ml-1">{correctOpt}</span></>
          }
        </div>
      )}

      {confirmed && question.explanation && (
        <div className="flex gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
          <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {!confirmed && (
        <button
          onClick={onConfirm}
          disabled={!selected}
          className="w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl hover:from-violet-600 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          Confirm Answer
        </button>
      )}
    </div>
  );
};

// ── Main QuizTakePage ─────────────────────────────────────────────────────────
const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate   = useNavigate();

  const [quiz,       setQuiz]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [qIndex,     setQIndex]     = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [confirmed,  setConfirmed]  = useState({});
  const [submitting, setSubmitting] = useState(false);
  const submitted = useRef(false);

  useEffect(() => {
    quizService.getQuizByID(quizId)
      .then(res => {
        const q = res?.data;
        if (!q) throw new Error('Quiz not found');
        setQuiz(q);

        // If already completed, redirect straight to results
        if (q.completedAt) {
          navigate(`/quizzes/${quizId}/results`, { replace: true });
          return;
        }

        // Restore progress from localStorage
        const saved = loadProgress(quizId);
        if (saved?.answers && Object.keys(saved.answers).length > 0) {
          setAnswers(saved.answers);
          setConfirmed(saved.confirmed || {});
          setQIndex(saved.qIndex ?? 0);
        }
      })
      .catch(err => setError(err?.message || 'Failed to load quiz.'))
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner /></div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-500">
      <ClipboardList size={48} className="opacity-20" />
      <p className="text-red-500 font-medium">{error}</p>
      <button onClick={() => navigate(-1)} className="text-sm text-violet-600 hover:underline flex items-center gap-1">
        <ArrowLeft size={13} /> Go back
      </button>
    </div>
  );

  const questions   = quiz.questions || [];
  const total       = questions.length;
  const question    = questions[qIndex];
  const isLast      = qIndex === total - 1;
  const isConfirmed = !!confirmed[qIndex];
  const allAnswered = Object.keys(confirmed).length === total;
  const docId       = quiz.documentId?._id || quiz.documentId;

  const handleSelect = (opt) => {
    if (confirmed[qIndex]) return;
    setAnswers(prev => ({ ...prev, [qIndex]: opt }));
  };

  const handleConfirm = () => {
    if (!answers[qIndex]) return;
    const nextConfirmed = { ...confirmed, [qIndex]: true };
    setConfirmed(nextConfirmed);
    // persist to localStorage so QuizzesTab can read in-progress state
    saveProgress(quizId, { ...answers }, nextConfirmed, qIndex);
  };

  const handleNext = async () => {
    if (!isLast) {
      const nextIndex = qIndex + 1;
      setQIndex(nextIndex);
      saveProgress(quizId, answers, confirmed, nextIndex);
      return;
    }
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([idx, selectedAnswer]) => ({
        questionIndex: parseInt(idx, 10),
        selectedAnswer,
      }));
      await quizService.submitQuiz(quizId, payload);
      clearProgress(quizId);
      toast.success('Quiz submitted!');
      navigate(`/quizzes/${quizId}/results`, { replace: true });
    } catch (e) {
      toast.error(e?.message || 'Failed to submit quiz.');
      submitted.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10 space-y-6">

      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(docId ? `/documents/${docId}` : -1)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={15} /> Back to Document
        </button>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <BookOpen size={13} />
          <span className="truncate max-w-[180px]">{quiz.title || 'Quiz'}</span>
        </div>
      </div>

      <ProgressBar current={qIndex} total={total} />

      {question && (
        <QuestionCard
          key={qIndex}
          question={question}
          qIndex={qIndex}
          selected={answers[qIndex] || null}
          confirmed={isConfirmed}
          onSelect={handleSelect}
          onConfirm={handleConfirm}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => { const i = qIndex - 1; setQIndex(i); saveProgress(quizId, answers, confirmed, i); }}
          disabled={qIndex === 0}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <div className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl min-w-[90px] text-center tabular-nums">
          {qIndex + 1} / {total}
        </div>

        {isLast ? (
          <button
            onClick={handleNext}
            disabled={!isConfirmed || submitting || !allAnswered}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <>Submit Quiz <CheckCircle2 size={15} /></>}
          </button>
        ) : (
          <button
            onClick={() => { const i = qIndex + 1; setQIndex(i); saveProgress(quizId, answers, confirmed, i); }}
            disabled={!isConfirmed}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>

      {isLast && isConfirmed && !allAnswered && (
        <p className="text-center text-xs text-amber-500">Answer all questions before submitting.</p>
      )}
    </div>
  );
};

export default QuizTakePage;
