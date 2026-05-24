import React, { useEffect, useRef, useState } from 'react';
import {
  Layers, ArrowLeft, Star, RotateCcw,
  ChevronLeft, ChevronRight, BrainCircuit, Trash2, Plus, Loader2, X,
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

// ── GenerateModal ─────────────────────────────────────────────────────────────
const QUICK_COUNTS = [5, 8, 10, 15, 20];

const GenerateModal = ({ onClose, onConfirm, loading }) => {
  const [count,     setCount]     = useState(10);
  const [custom,    setCustom]    = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const finalCount = useCustom ? parseInt(custom, 10) : count;
  const isValid    = !isNaN(finalCount) && finalCount >= 1 && finalCount <= 50;

  const handleQuickPick = (n) => {
    setCount(n);
    setUseCustom(false);
    setCustom('');
  };

  const handleCustomChange = (v) => {
    setCustom(v);
    setUseCustom(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 animate-fadeInLeft">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/25">
              <BrainCircuit size={15} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Generate Flashcards</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Quick pick */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Number of Cards
            </label>
            <div className="flex gap-2">
              {QUICK_COUNTS.map(n => (
                <button
                  key={n}
                  onClick={() => handleQuickPick(n)}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl border transition-all duration-150 ${
                    !useCustom && count === n
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Custom input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Custom Amount <span className="normal-case font-normal text-slate-400">(1 – 50)</span>
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={custom}
              onChange={e => handleCustomChange(e.target.value)}
              placeholder="e.g. 12"
              className={`w-full py-2.5 px-3.5 border-2 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none ${
                useCustom && !isValid
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : useCustom
                  ? 'border-emerald-400 bg-emerald-50/50 text-slate-800'
                  : 'border-slate-200 text-slate-800 focus:border-emerald-400'
              }`}
            />
            {useCustom && !isValid && (
              <p className="text-xs text-red-500 font-medium">Enter a number between 1 and 50.</p>
            )}
          </div>

          {/* Summary */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <Layers size={14} className="text-emerald-500 shrink-0" />
            <p className="text-xs text-slate-600">
              Will generate{' '}
              <span className="font-bold text-slate-800">
                {isValid ? finalCount : '—'}
              </span>{' '}
              flashcard{finalCount !== 1 ? 's' : ''} from this document.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => isValid && onConfirm(finalCount)}
              disabled={!isValid || loading}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
                : <><BrainCircuit size={14} /> Generate</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              {visited.size} visited
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
              {total - visited.size} remaining
            </span>
          </div>
          <span className="text-xs font-bold text-slate-600 tabular-nums">{index + 1} / {total}</span>
        </div>
        <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden">
          {cards.map((_, i) => (
            <div
              key={i}
              onClick={() => goTo(i, i > index ? 'right' : 'left')}
              title={`Card ${i + 1}`}
              className={`flex-1 rounded-sm cursor-pointer transition-all duration-300 ${
                i === index
                  ? 'bg-emerald-500 scale-y-125'
                  : visited.has(i)
                  ? 'bg-emerald-300'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>{progressPct}% complete</span>
          {progressPct === 100 && <span className="text-emerald-600 font-bold">🎉 All cards visited!</span>}
        </div>
      </div>

      {/* Flip card */}
      <FlipCard
        key={cardKey}
        card={card}
        animClass={animClass}
        onStarToggle={handleStarToggle}
      />

      {/* Nav controls */}
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
  const [showModal,   setShowModal]   = useState(false);

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

  // Called when user confirms count in modal
  const handleConfirm = (count) => {
    setShowModal(false);
    onGenerate(count);
  };

  if (activeSet) {
    return (
      <StudyView
        set={activeSet}
        onBack={() => { setActiveSet(null); fetchSets(); }}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Your Flashcard Sets</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {setsLoading ? 'Loading…' : `${sets.length} set${sets.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
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

      {(setsLoading || loading) && <Spinner />}

      {!setsLoading && !loading && sets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <Layers size={26} className="text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No flashcard sets yet</p>
          <p className="text-xs mt-1">Click &quot;Generate New Set&quot; to create one.</p>
        </div>
      )}

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

      {showModal && (
        <GenerateModal
          loading={loading}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
};

export default FlashcardsTab;
