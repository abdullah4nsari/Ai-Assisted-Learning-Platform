import React, { useState } from 'react';
import { Sparkles, BookOpen, X, Lightbulb } from 'lucide-react';
import Spinner from '../common/Spinner';

// ── Minimal markdown renderer ─────────────────────────────────────────────────
// Handles: **bold**, *italic*, `code`, ### headings, bullet lists, numbered lists
const MarkdownText = ({ text }) => {
  if (!text) return null;

  const renderInline = (str) => {
    const parts = [];
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let last = 0, match;
    while ((match = regex.exec(str)) !== null) {
      if (match.index > last) parts.push(str.slice(last, match.index));
      if (match[2]) parts.push(<strong key={match.index} className="font-semibold text-neutral-900">{match[2]}</strong>);
      else if (match[3]) parts.push(<em key={match.index} className="italic">{match[3]}</em>);
      else if (match[4]) parts.push(<code key={match.index} className="bg-neutral-200 text-emerald-700 rounded px-1 py-0.5 text-xs font-mono">{match[4]}</code>);
      last = match.index + match[0].length;
    }
    if (last < str.length) parts.push(str.slice(last));
    return parts;
  };

  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // headings
    const h3 = line.match(/^###\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) { elements.push(<h2 key={i} className="text-base font-bold text-neutral-900 mt-4 mb-1">{renderInline(h1[1])}</h2>); i++; continue; }
    if (h2) { elements.push(<h3 key={i} className="text-sm font-bold text-neutral-800 mt-3 mb-1">{renderInline(h2[1])}</h3>); i++; continue; }
    if (h3) { elements.push(<h4 key={i} className="text-sm font-semibold text-neutral-700 mt-2 mb-1">{renderInline(h3[1])}</h4>); i++; continue; }

    // bullet list
    if (line.match(/^[-*]\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        items.push(<li key={i} className="ml-4 list-disc">{renderInline(lines[i].replace(/^[-*]\s+/, ''))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="space-y-0.5 my-1 text-sm">{items}</ul>);
      continue;
    }

    // numbered list
    if (line.match(/^\d+\.\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        items.push(<li key={i} className="ml-4 list-decimal">{renderInline(lines[i].replace(/^\d+\.\s+/, ''))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="space-y-0.5 my-1 text-sm">{items}</ol>);
      continue;
    }

    // paragraph
    elements.push(<p key={i} className="text-sm text-neutral-700 leading-relaxed">{renderInline(line)}</p>);
    i++;
  }

  return <div className="space-y-1.5">{elements}</div>;
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ title, icon: Icon, iconClass, content, loading, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fadeInLeft">
      {/* header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
            <Icon size={15} className="text-white" />
          </div>
          <h2 className="text-sm font-bold text-neutral-800">{title}</h2>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      {/* body */}
      <div className="overflow-y-auto px-6 py-5">
        {loading ? (
          <Spinner />
        ) : (
          <MarkdownText text={content} />
        )}
      </div>
    </div>
  </div>
);

// ── AIActions ─────────────────────────────────────────────────────────────────
const AIActions = ({
  summary, summaryLoading, onSummarize,
  explanation, explainLoading, onExplain,
}) => {
  const [conceptInput, setConceptInput] = useState('');
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [explainModalOpen, setExplainModalOpen] = useState(false);

  const handleSummarize = async () => {
    setSummaryModalOpen(true);
    if (!summary) await onSummarize();
  };

  const handleExplain = async () => {
    if (!conceptInput.trim()) return;
    setExplainModalOpen(true);
    await onExplain(conceptInput.trim());
  };

  return (
    <div className="space-y-5">

      {/* Summarize */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-500" /> Summarize Document
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Generate a concise AI summary of the entire document.
            </p>
          </div>
          <button
            onClick={handleSummarize}
            disabled={summaryLoading}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {summaryLoading ? <span className="animate-pulse">Generating…</span> : summary ? 'View Summary' : 'Summarize'}
          </button>
        </div>
        {summary && (
          <p className="mt-3 text-xs text-emerald-600 font-medium">
            ✓ Summary ready — click "View Summary" to open
          </p>
        )}
      </div>

      {/* Explain Concept */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-neutral-800 flex items-center gap-2 mb-1">
          <Lightbulb size={16} className="text-amber-500" /> Explain a Concept
        </h3>
        <p className="text-sm text-neutral-500 mb-4">
          Enter any concept from the document and get a detailed AI explanation.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={conceptInput}
            onChange={(e) => setConceptInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
            placeholder="e.g. Neural Networks, Photosynthesis, Voter Registration…"
            className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
          <button
            onClick={handleExplain}
            disabled={explainLoading || !conceptInput.trim()}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {explainLoading ? <span className="animate-pulse">Explaining…</span> : 'Explain'}
          </button>
        </div>
      </div>

      {/* Summary Modal */}
      {summaryModalOpen && (
        <Modal
          title="Document Summary"
          icon={Sparkles}
          iconClass="bg-gradient-to-br from-emerald-400 to-teal-500"
          content={summary}
          loading={summaryLoading}
          onClose={() => setSummaryModalOpen(false)}
        />
      )}

      {/* Explain Modal */}
      {explainModalOpen && (
        <Modal
          title={`Explanation: ${conceptInput}`}
          icon={Lightbulb}
          iconClass="bg-gradient-to-br from-amber-400 to-orange-500"
          content={explanation}
          loading={explainLoading}
          onClose={() => setExplainModalOpen(false)}
        />
      )}
    </div>
  );
};

export { MarkdownText };
export default AIActions;
