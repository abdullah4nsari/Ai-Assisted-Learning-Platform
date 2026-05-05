import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ClipboardList, Plus, Trash2, CheckCircle2,
  Clock, PlayCircle, BarChart2, X, Loader2, Hash,
} from 'lucide-react';
import quizService from '../../services/quizService';
import aiService   from '../../services/aiService';
import Spinner     from '../common/Spinner';
import toast       from 'react-hot-toast';

// ── localStorage helpers ──────────────────────────────────────────────────────
// QuizTakePage saves progress here; we read it to show resume state on the card
export const QUIZ_PROGRESS_KEY = (quizId) => `quiz_progress_${quizId}`;

const getLocalProgress = (quizId) => {
  try {
    const raw = localStorage.getItem(QUIZ_PROGRESS_KEY(quizId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

// ── helpers ───────────────────────────────────────────────────────────────────
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : '—';

// Status: completed = backend completedAt, in_progress = local answers saved, not_started = nothing
const quizStatus = (quiz) => {
  if (quiz.completedAt) return 'completed';
  const progress = getLocalProgress(quiz._id);
  if (progress && Object.keys(progress.answers || {}).length > 0) return 'in_progress';
  return 'not_started';
};

const getAttempted = (quiz) => {
  const progress = getLocalProgress(quiz._id);
  return Object.keys(progress?.answers || {}).length;
};

// ── GenerateModal ─────────────────────────────────────────────────────────────
const GenerateModal = ({ documentId, docTitle, onClose, onGenerated }) => {
  const [count,      setCount]      = useState(5);
  const [input,      setInput]      = useState('5');
  const [generating, setGenerating] = useState(false);
  const [error,      setError]      = useState('');

  const handleInput = (v) => {
    setInput(v);
    const n = parseInt(v, 10);
    if (!v || isNaN(n) || n < 1) { setError('Enter a number greater than 0'); setCount(0); }
    else if (n > 20)              { setError('Maximum 20 questions allowed');  setCount(0); }
    else                          { setError(''); setCount(n); }
  };

  const handleGenerate = async () => {
    if (!count || error) return;
    setGenerating(true);
    try {
      const res = await aiService.generateQuiz(documentId, count, docTitle || 'Quiz');
      toast.success('Quiz generated!');
      const quizId = res?.data?._id || res?.data?.quiz?._id || res?._id;
      onGenerated(quizId);
      onClose();
    } catch (e) {
      toast.error(e?.message || 'Failed to generate quiz.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fadeInLeft">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <ClipboardList size={15} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Generate New Quiz</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Number of Questions
            </label>
            <div className="relative">
              <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min={1}
                max={20}
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                className={`w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-colors ${
                  error ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-violet-400 focus:bg-violet-50/30'
                }`}
                placeholder="e.g. 5"
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2 pt-1">
              {[3, 5, 10, 15].map(n => (
                <button
                  key={n}
                  onClick={() => { setInput(String(n)); handleInput(String(n)); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 ${
                    count === n
                      ? 'border-violet-400 bg-violet-50 text-violet-700'
                      : 'border-slate-200 text-slate-600 hover:border-violet-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!count || !!error || generating}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl hover:from-violet-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {generating ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : 'Generate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── QuizCard ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  not_started: { label: 'Start Quiz',   icon: PlayCircle, cls: 'from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600' },
  in_progress:  { label: 'Resume Quiz', icon: Clock,      cls: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'   },
  completed:    { label: 'View Results',icon: BarChart2,  cls: 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'   },
};

const QuizCard = ({ quiz, onOpen, onDelete, index, deleting }) => {
  const status    = quizStatus(quiz);
  const { label, icon: Icon, cls } = STATUS_CONFIG[status];
  const title     = quiz.title || `Quiz ${index + 1}`;
  const total     = quiz.totalQuestions || quiz.questions?.length || 0;
  const attempted = status === 'in_progress' ? getAttempted(quiz) : 0;
  const remaining = total - attempted;
  const pct       = total > 0 ? Math.round((attempted / total) * 100) : 0;

  return (
    <div
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-5 flex flex-col gap-4 animate-fadeInLeft"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* hover delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(quiz._id); }}
        disabled={deleting === quiz._id}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-200 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150 disabled:opacity-40"
        title="Delete quiz"
      >
        {deleting === quiz._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      </button>

      {/* top row */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
          <ClipboardList size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-0.5">
            {status === 'completed' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={9} /> Score: {quiz.score ?? 0}%
              </span>
            )}
            {status === 'in_progress' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                <Clock size={9} /> In Progress
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-800 truncate leading-snug">{title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">CREATED {formatDate(quiz.createdAt)}</p>
        </div>
      </div>

      {/* meta badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">
          <ClipboardList size={11} /> {total} Questions
        </span>
        {status === 'in_progress' && (
          <>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
              <CheckCircle2 size={11} /> {attempted} Attempted
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
              <Clock size={11} /> {remaining} Left
            </span>
          </>
        )}
      </div>

      {/* progress bar — only for in_progress */}
      {status === 'in_progress' && total > 0 && (
        <div className="space-y-1">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 text-right">{pct}% done</p>
        </div>
      )}

      {/* CTA */}
      <div className="pt-1 border-t border-slate-100">
        <button
          onClick={() => onOpen(quiz)}
          className={`w-full py-2 text-sm font-semibold text-white bg-gradient-to-r ${cls} rounded-xl transition-all duration-150 shadow-sm flex items-center justify-center gap-2`}
        >
          <Icon size={14} /> {label}
        </button>
      </div>
    </div>
  );
};

// ── Main QuizzesTab ───────────────────────────────────────────────────────────
const QuizzesTab = ({ questions, loading: parentLoading, onGenerate }) => {
  const { id: documentId } = useParams();
  const navigate = useNavigate();

  const [quizzes,     setQuizzes]     = useState([]);
  const [quizLoading, setQuizLoading] = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [deleting,    setDeleting]    = useState(null);
  const [docTitle,    setDocTitle]    = useState('');

  useEffect(() => {
    const h1 = document.querySelector('h1');
    if (h1) setDocTitle(h1.textContent || '');
  }, []);

  const fetchQuizzes = useCallback(() => {
    if (!documentId) return;
    setQuizLoading(true);
    quizService.getQuizzesForDocument(documentId)
      .then(res => setQuizzes(res?.data || []))
      .catch(() => {})
      .finally(() => setQuizLoading(false));
  }, [documentId]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const handleOpen = (quiz) => {
    if (quiz.completedAt) {
      navigate(`/quizzes/${quiz._id}/results`);
    } else {
      navigate(`/quizzes/${quiz._id}`);
    }
  };

  const handleDelete = async (quizId) => {
    setDeleting(quizId);
    try {
      await quizService.deleteQuiz(quizId);
      toast.success('Quiz deleted.');
      localStorage.removeItem(QUIZ_PROGRESS_KEY(quizId));
      setQuizzes(prev => prev.filter(q => q._id !== quizId));
    } catch {
      toast.error('Failed to delete quiz.');
    } finally {
      setDeleting(null);
    }
  };

  const handleGenerated = (newQuizId) => {
    fetchQuizzes();
    if (newQuizId) navigate(`/quizzes/${newQuizId}`);
  };

  const isLoading = quizLoading || parentLoading;

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Your Quizzes</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {isLoading ? 'Loading…' : `${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''} available`}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl hover:from-violet-600 hover:to-indigo-600 transition-all duration-200 shadow-md shadow-violet-500/20"
          >
            <Plus size={15} strokeWidth={2.5} /> Generate Quiz
          </button>
        </div>
      </div>

      {isLoading && <Spinner />}

      {!isLoading && quizzes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
            <ClipboardList size={26} className="text-violet-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No quizzes yet</p>
          <p className="text-xs mt-1">Click &quot;Generate Quiz&quot; to test your knowledge.</p>
        </div>
      )}

      {!isLoading && quizzes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quizzes.map((quiz, i) => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              index={i}
              onOpen={handleOpen}
              onDelete={handleDelete}
              deleting={deleting}
            />
          ))}
        </div>
      )}

      {showModal && (
        <GenerateModal
          documentId={documentId}
          docTitle={docTitle}
          onClose={() => setShowModal(false)}
          onGenerated={handleGenerated}
        />
      )}
    </div>
  );
};

export default QuizzesTab;
