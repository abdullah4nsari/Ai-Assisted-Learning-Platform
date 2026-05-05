import React, { useEffect, useRef, useState } from 'react';
import {
  Layers, ArrowLeft, Star, RotateCcw,
  ChevronLeft, ChevronRight, BrainCircuit, Trash2, Plus, Loader2,
} from 'lucide-react';
import flashcardService from '../../services/flashcardService';
import Spinner from '../common/Spinner';
import toast from 'react-hot-toast';

// ── helpers ───────────────────────────────────────────────────────────────────
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : '—';

const DIFF_STYLE = {
  easy:   'bg-emerald-50 text-emerald-600',
  medium: 'bg-amber-50 text-amber-600',
  hard:   'bg-red-50 text-red-500',
};

// ── inject slide animation styles once ───────────────────────────────────────
const STYLE_ID = 'fc-tab-slide-styles';
if (!document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes fc-in-right { from { opacity:0; transform: translateX(44px) rotateY(-8deg) scale(0.97); } to { opacity:1; transform: translateX(0) rotateY(0deg) scale(1); } }
    @keyframes fc-in-left  { from { opacity:0; transform: translateX(-44px) rotateY(8deg) scale(0.97); } to { opacity:1; transform: translateX(0) rotateY(0deg) scale(1); } }
    .fc-in-right { animation: fc-in-right 0.38s cubic-bezier(0.23,1,0.32,1) both; }
    .fc-in-left  { animation: fc-in-left  0.38s cubic-bezier(0.23,1,0.32,1) both; }
  `;
  document.head.appendChild(s);
}

// ── FlipCard ──────────────────────────────────────────────────────────────────
const FlipCard = ({ card, animClass, onStarToggle }) => {
  const [flipped, setFlipped] = useState(false);
  const diff = card.difficulty || 'medium';
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
            <p className="text-lg font-bold text-slate-800 leading-relaxed max-w-md">{card.question}</p>
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
            <p className="text-lg font-bold text-slate-800 leading-relaxed max-w-md">{card.answer}</p>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <RotateCcw size={12} /> Click to see question
          </div>
        </div>

      </div>
    </div>
  );
};

// ── SetCard ───────────────────────────────────────────────────────────────────
const SetCard = ({ set, onStudy, onDelete, index, deleting }) => {
  const title   = set.documentId?.title || 'Untitled Document';
  const count   = set.cards?.length || 0;
  const starred = set.cards?.filter(c => c.isStarred).length || 0;

  return (
    <div
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-5 flex flex-col gap-4 animate-fadeInLeft cursor-pointer"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onStudy(set)}
    >
      {/* hover delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(set._id); }}
        disabled={deleting === set._id}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-200 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150 disabled:opacity-40"
        title="Delete set"
      >
        {deleting === set._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      </button>

      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
          <BrainCircuit size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0 pr-6">
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

      <div className="pt-1 border-t border-slate-100">
        <span className="block w-full py-2 text-sm font-semibold text-center text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-150 shadow-sm shadow-emerald-500/20">
          Study Now
        </span>
      </div>
    </div>
  );
};

// ── StudyView ─────────────────────────────────────────────────────────────────
const StudyView = ({ set, onBack }) => {
  const [cards,     setCards]     = useState(set.cards || []);
  const [index,     setIndex]     = useState(0);
  const [cardKey,   setCardKey]   = useState(0);
  const [animClass, setAnimClass] = useState('fc-in-right');
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
    setAnimClass(dir === 'right' ? 'fc-in-right' : 'fc-in-left');
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
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Layers size={36} className="mb-3 opacity-30" />
      <p className="text-sm">No cards in this set.</p>
      <button onClick={onBack} className="mt-3 text-sm text-emerald-600 hover:underline flex items-center gap-1">
        <ArrowLeft size={13} /> Back to Sets
      </button>
    </div>
  );

  const starredCount = cards.filter(c => c.isStarred).length;

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Sets
        </button>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {starredCount > 0 && (
            <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /> {starredCount} starred</span>
          )}
          <span className="flex items-center gap-1"><Layers size={12} /> {total} cards</span>
        </div>
      </div>

      <h2 className="text-base font-bold text-slate-800 truncate">{set.documentId?.title || 'Flashcard Set'}</h2>

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

      {/* animated flip card */}
      <FlipCard
        key={cardKey}
        card={card}
        animClass={animClass}
        onStarToggle={handleStarToggle}
      />

      {/* nav controls */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => goTo(index - 1, 'left')}
          disabled={index === 0}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <div className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl min-w-[90px] text-center tabular-nums">
          {index + 1} / {total}
        </div>
        <button
          onClick={() => goTo(index + 1, 'right')}
          disabled={index === total - 1}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      <p className="text-center text-xs text-slate-400 pb-2">
        <kbd className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-[11px]">←</kbd>{' '}
        <kbd className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-[11px]">→</kbd>{' '}
        arrow keys · Click card to flip
      </p>
    </div>
  );
};

// ── Main FlashcardsTab ────────────────────────────────────────────────────────
const FlashcardsTab = ({ documentId, cards, loading, onGenerate }) => {
  const [sets,        setSets]        = useState([]);
  const [setsLoading, setSetsLoading] = useState(true);
  const [activeSet,   setActiveSet]   = useState(null);
  const [deleting,    setDeleting]    = useState(null);

  const fetchSets = () => {
    if (!documentId) return;
    flashcardService.getFLashcardsForDocument(documentId)
      .then(res => setSets(res?.data || []))
      .catch(() => {})
      .finally(() => setSetsLoading(false));
  };

  useEffect(() => {
    setSetsLoading(true);
    fetchSets();
  }, [documentId]);

  // refresh after generation
  useEffect(() => {
    if (!documentId || loading) return;
    flashcardService.getFLashcardsForDocument(documentId)
      .then(res => setSets(res?.data || []))
      .catch(() => {});
  }, [cards, loading]);

  const handleDelete = async (setId) => {
    setDeleting(setId);
    try {
      await flashcardService.deleteFlashcardSet(setId);
      toast.success('Flashcard set deleted.');
      setSets(prev => prev.filter(s => s._id !== setId));
    } catch {
      toast.error('Failed to delete set.');
    } finally {
      setDeleting(null);
    }
  };

  // ── Study view ──
  if (activeSet) {
    return (
      <StudyView
        set={activeSet}
        onBack={() => { setActiveSet(null); fetchSets(); }}
      />
    );
  }

  // ── Sets view ──
  return (
    <div className="space-y-5">
      {/* section header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Your Flashcard Sets</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {setsLoading ? 'Loading…' : `${sets.length} set${sets.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
          <button
            onClick={onGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-emerald-500/20"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Generating…</>
            ) : (
              <><Plus size={15} strokeWidth={2.5} /> Generate New Set</>
            )}
          </button>
        </div>
      </div>

      {/* loading */}
      {(setsLoading || loading) && <Spinner />}

      {/* empty state */}
      {!setsLoading && !loading && sets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <Layers size={26} className="text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No flashcard sets yet</p>
          <p className="text-xs mt-1">Click &quot;Generate New Set&quot; to create one.</p>
        </div>
      )}

      {/* sets grid */}
      {!setsLoading && sets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sets.map((set, i) => (
            <SetCard
              key={set._id}
              set={set}
              index={i}
              onStudy={setActiveSet}
              onDelete={handleDelete}
              deleting={deleting}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardsTab;
