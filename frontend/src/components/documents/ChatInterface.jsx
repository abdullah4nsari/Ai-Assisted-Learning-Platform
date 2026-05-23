import React, { useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { MarkdownText } from './AIActions';

const ChatInterface = ({ messages, input, loading, onInputChange, onSend }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[70vh] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessageSquare size={36} className="mb-3 opacity-30" />
            <p className="text-sm">Ask anything about this document…</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div className="max-w-[75%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed bg-emerald-600 text-white">
                {msg.text}
              </div>
            ) : (
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 bg-slate-100 text-slate-800">
                <MarkdownText text={msg.text} />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-slate-500">
              <span className="animate-pulse">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-slate-200 p-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
          placeholder="Ask a question about this document…"
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all text-slate-800 placeholder-slate-400"
        />
        <button
          onClick={onSend}
          disabled={loading || !input.trim()}
          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
