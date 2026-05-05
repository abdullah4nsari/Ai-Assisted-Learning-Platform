import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit, Plus, ArrowLeft, Star, RotateCcw,
  ChevronLeft, ChevronRight, Layers, Trash2,
  X, FileText, Loader2,
} from 'lucide-react';
import flashcardService from '../../services/flashcardService';
import aiService        from '../../services/aiService';
import documentService  from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import toast   from 'react-hot-toast';

// ── helpers ───────────────────────────────────────────────────────────────────
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : '—';

const DIFF_STYLE = {
  easy:   'bg-emerald-50 text-emerald-600',
  medium: 'bg-amber-50 text-amber-600',
  hard:   'bg-red-50 text-red-500',
};

// ── inject slide animation styles once ───────────────────────────────────────
const STYLE_ID = 'fc-list-slide-styles';
if (!document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes fcl-in-right { from { opacity:0; transform: translateX(44px) rotateY(-8deg) scale(0.97); } to { opacity:1; transform: translateX(0) rotateY(0deg) scale(1); } }
    @keyframes fcl-in-left  { from { opacity:0; transform: translateX(-44px) rotateY(8deg) scale(0.97); } to { opacity:1; transform: translateX(0) rotateY(0deg) scale(1); } }
    .fcl-in-right { animation: fcl-in-right 0.38s cubic-bezier(0.23,1,0.32,1) both; }
    .fcl-in-left  { animation: fcl-in-left  0.38s cubic-bezier(0.23,1,0.32,1) both; }
  `;
  document.head.appendChild(s);
}

// ── GenerateModal ─────────────────────────────────────────────────────────────
const GenerateModal = ({ onClose, onGenerated }) => {
  const [docs,        setDocs]        = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [selected,    setSelected]    = useState(null);
  const [count,       setCount]       = useState(10);
  const [generating,  setGenerating]  = useState(false);

  useEffect(() => {
    documentService.getDocuments()
      .then(r => setDocs(r?.data || []))
      .catch(() => toast.error('Failed to load documents.'))
      .finally(() => setDocsLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!selected) return;
    setGenerating(true);
    try {
      await aiService.generateFlashcards(selected, count);
      toast.success('Flashcard set generated!');
      onGenerated();
      onClose();
    } catch (e) {
      toast.error(e?.message || 'Failed to generate flashcards.');
    } finally {
      setGenerating(false);
    }
  };

  const readyDocs = docs.filter(d => d.status === 'ready');
  const pendingCount = docs.length - readyDocs.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeInLeft">

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <BrainCircuit size={15} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Generate New Flashcard Set</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* document picker */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Select Document</label>
            {docsLoading ? (
              <Spinner />
            ) : readyDocs.length === 0 ? (
              <p className="text-sm text-slate-400">No ready documents found. Upload one first.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {readyDocs.map(doc => (
                  <button
                    key={doc._id}
                    onClick={() => setSelected(doc._id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 ${
                      selected === doc._id
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <FileText size={15} className={selected === doc._id ? 'text-emerald-600' : 'text-slate-400'} />
                    <span className={`text-sm font-medium truncate ${selected === doc._id ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {doc.title}
                    </span>
                  </button>
                ))}
                {pendingCount > 0 && (
                  <p className="text-xs text-slate-400 pt-1">{pendingCount} document(s) still processing — not shown.</p>
                )}
              </div>
            )}
          </div>

          {/* card count */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Number of Cards</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map(n => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition-all duration-150 ${
                    count === n
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:border-emerald-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!selected || generating}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {generating ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : 'Generate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── DeleteModal ───────────────────────────────────────────────────────────────
const DeleteModal = ({ onClose, onConfirm, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fadeInLeft">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <Trash2 size={18} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">Delete Flashcard Set</h2>
          <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone</p>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-5">Are you sure you want to delete this flashcard set?</p>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ── SetCard ───────────────────────────────────────────────────────────────────
const SetCard = ({ set, onStudy, onDeleteClick, index }) => {
  const title   = set.documentId?.title || 'Untitled Document';
  const count   = set.cards?.length || 0;
  const starred = set.cards?.filter(c => c.isStarred).length || 0;

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-5 flex flex-col gap-4 animate-fadeInLeft"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
          <BrainCircuit size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Flashcard Set</p>
          <h3 className="text-sm font-bold text-slate-800 truncate leading-snug">{title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">CREATED {formatDate(set.createdAt)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
          <Layers size={11} /> {count} cards
        </span>
        {starred > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
            <Star size={11} /> {starred} starred
          </span>
        )}
      </div>

      <div className="flex gap-2 pt-1 border-t border-slate-100">
        <button
          onClick={() => onStudy(set)}
          className="flex-1 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-150 shadow-sm shadow-emerald-500/20"
        >
          Study Now
        </button>
        <button
          onClick={() => onDeleteClick(set._id)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all duration-150"
          title="Delete set"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// ── FlipCard ──────────────────────────────────────────────────────────────────
const FlipCard = ({ card, animClass, onStarToggle }) => {
  const [flipped, setFlipped] = useState(false);
  const diff    = card.difficulty || 'medium';
  const diffCls = DIFF_STYLE[diff] || DIFF_STYLE.medium;

  return (
    <div className={`card-scene w-full ${animClass}`} style={{ height: '300px' }}>
      <div className={`card-inner ${flipped ? 'is-flipped' : ''}`}>

        {/* FRONT */}
        <div
          className="card-face w-full h-full bg-white rounded-2xl border border-slate-200 shadow-lg p-8 flex flex-col justify-between cursor-pointer"
          onClick={() => setFlipped(true)}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${diffCls}`}>{diff}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onStarToggle(card._id, card.isStarred); }}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Star size={18} className={card.isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-500">Question</span>
            <p className="text-xl font-bold text-slate-800 leading-relaxed max-w-lg">{card.question}</p>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <RotateCcw size={12} /> Click to reveal answer
          </div>
        </div>

        {/* BACK */}
        <div
          className="card-face card-face-back w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 shadow-lg p-8 flex flex-col justify-between cursor-pointer"
          onClick={() => setFlipped(false)}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${diffCls}`}>{diff}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onStarToggle(card._id, card.isStarred); }}
              className="p-1.5 rounded-lg hover:bg-white/60 transition-colors"
            >
              <Star size={18} className={card.isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-teal-100 text-teal-700">Answer</span>
            <p className="text-xl font-bold text-slate-800 leading-relaxed max-w-lg">{card.answer}</p>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <RotateCcw size={12} /> Click to see question
          </div>
        </div>

      </div>
    </div>
  );
};

// ── StudyView ─────────────────────────────────────────────────────────────────
const StudyView = ({ set, onBack }) => {
  const [cards,     setCards]     = useState(set.cards || []);
  const [index,     setIndex]     = useState(0);
  const [cardKey,   setCardKey]   = useState(0);
  const [animClass, setAnimClass] = useState('fcl-in-right');
  const [visited,   setVisited]   = useState(() => new Set([0]));
  const inFlight = useRef(false);

  const total       = cards.length;
  const card        = cards[index];
  const progressPct = total > 0 ? Math.round((visited.size / total) * 100) : 0;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' && index < total - 1) goTo(index + 1, 'right');
      if (e.key === 'ArrowLeft'  && index > 0)         goTo(index - 1, 'left');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [index, total]);

  const goTo = (next, dir = 'right') => {
    setAnimClass(dir === 'right' ? 'fcl-in-right' : 'fcl-in-left');
    setIndex(next);
    setCardKey(k => k + 1);
    setVisited(prev => new Set([...prev, next]));
  };

  const handleStarToggle = async (cardId, isStarred) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setCards(prev => prev.map(c => c._id === cardId ? { ...c, isStarred: !c.isStarred } : c));
    try {
      await flashcardService.toggleStarFlashcard(cardId);
    } catch {
      setCards(prev => prev.map(c => c._id === cardId ? { ...c, isStarred } : c));
      toast.error('Failed to update star.');
    } finally {
      inFlight.current = false;
    }
  };

  if (!card) return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
      <Layers size={40} className="mb-3 opacity-30" />
      <p className="font-medium">No cards in this set.</p>
      <button onClick={onBack} className="mt-4 text-sm text-emerald-600 hover:underline flex items-center gap-1">
        <ArrowLeft size={13} /> Back to Sets
      </button>
    </div>
  );

  const starredCount = cards.filter(c => c.isStarred).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={15} /> Back to Sets
        </button>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {starredCount > 0 && (
            <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /> {starredCount} starred</span>
          )}
          <span className="flex items-center gap-1"><Layers size={12} /> {total} cards</span>
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-800 truncate">{set.documentId?.title || 'Flashcard Set'}</h2>

      {/* progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Card {index + 1} of {total}</span>
          <span>{progressPct}% visited</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <FlipCard
        key={cardKey}
        card={card}
        animClass={animClass}
        onStarToggle={handleStarToggle}
      />

      <div className="flex items-center justify-between gap-3">
        <button onClick={() => goTo(index - 1, 'left')} disabled={index === 0}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
          <ChevronLeft size={16} /> Previous
        </button>
        <div className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl min-w-[90px] text-center tabular-nums">
          {index + 1} / {total}
        </div>
        <button onClick={() => goTo(index + 1, 'right')} disabled={index === total - 1}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
          Next <ChevronRight size={16} />
        </button>
      </div>

      <p className="text-center text-xs text-slate-400 pb-2">
        Use{' '}
        <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[11px]">←</kbd>{' '}
        <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[11px]">→</kbd>{' '}
        arrow keys · Click card to flip
      </p>
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = ({ sets, loading, onStudy, onDeleteClick, onGenerateClick }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Your Flashcard Sets</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? 'Loading…' : `${sets.length} set${sets.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
        <button
          onClick={onGenerateClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md shadow-emerald-500/20"
        >
          <Plus size={15} strokeWidth={2.5} /> Generate New Set
        </button>
      </div>
    </div>

    {loading ? (
      <Spinner />
    ) : sets.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
          <Layers size={28} className="text-emerald-400" />
        </div>
        <p className="text-slate-700 font-semibold">No flashcard sets yet</p>
        <p className="text-slate-400 text-sm mt-1">Generate flashcards from a document to get started.</p>
        <button
          onClick={onGenerateClick}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md shadow-emerald-500/20"
        >
          <Plus size={15} /> Generate First Set
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sets.map((set, i) => (
          <SetCard
            key={set._id}
            set={set}
            index={i}
            onStudy={onStudy}
            onDeleteClick={onDeleteClick}
          />
        ))}
      </div>
    )}
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const FlashcardsListPage = () => {
  const navigate = useNavigate();
  const [sets,         setSets]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeSet,    setActiveSet]    = useState(null);
  const [showGenModal, setShowGenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const fetchSets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await flashcardService.getFlashcardSets();
      setSets(res?.data || []);
    } catch {
      toast.error('Failed to load flashcard sets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSets(); }, [fetchSets]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(deleteTarget);
      toast.success('Flashcard set deleted.');
      setSets(prev => prev.filter(s => s._id !== deleteTarget));
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete set.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Flashcards</h1>
        <p className="text-sm text-slate-500 mt-0.5">Study your AI-generated flashcard sets</p>
      </div>

      {activeSet ? (
        <StudyView
          set={activeSet}
          onBack={() => { setActiveSet(null); fetchSets(); }}
        />
      ) : (
        <Dashboard
          sets={sets}
          loading={loading}
          onStudy={setActiveSet}
          onDeleteClick={setDeleteTarget}
          onGenerateClick={() => setShowGenModal(true)}
        />
      )}

      {showGenModal && (
        <GenerateModal
          onClose={() => setShowGenModal(false)}
          onGenerated={fetchSets}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default FlashcardsListPage;
