import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, MessageSquare, Zap, Layers, ClipboardList } from 'lucide-react';
import documentService from '../../services/documentService';
import aiService from '../../services/aiService';
import Spinner from '../../components/common/Spinner';
import DocumentViewer from '../../components/documents/DocumentViewer';
import ChatInterface from '../../components/documents/ChatInterface';
import AIActions from '../../components/documents/AIActions';
import FlashcardsTab from '../../components/flashcards/FlashcardsTab';
import QuizzesTab from '../../components/quizes/QuizzesTab';
import toast from 'react-hot-toast';

const TABS = [
  { name: 'Content',    icon: BookOpen      },
  { name: 'Chat',       icon: MessageSquare },
  { name: 'AI Actions', icon: Zap           },
  { name: 'Flashcards', icon: Layers        },
  { name: 'Quizzes',    icon: ClipboardList },
];

// ── sessionStorage helpers ──────────────────────────────────────────────────
const ssGet = (key, fallback) => {
  try {
    const v = sessionStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};
const ssSet = (key, value) => {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
};

const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── Document ──
  const [document, setDocument]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState(() => ssGet(`tab_${id}`, 'Content'));

  // ── Chat ──
  const [messages, setMessages]       = useState(() => ssGet(`chat_messages_${id}`, []));
  const [chatInput, setChatInput]     = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatInFlight = React.useRef(false);

  // ── AI Actions ──
  const [summary, setSummary]               = useState(() => ssGet(`summary_${id}`, null));
  const [summaryLoading, setSummaryLoading] = useState(false);
  const summaryInFlight = React.useRef(false);

  // ── Explain Concept ──
  const [explanation, setExplanation]         = useState(() => ssGet(`explanation_${id}`, null));
  const [explainLoading, setExplainLoading]   = useState(false);
  const explainInFlight = React.useRef(false);

  // ── Flashcards ──
  const [flashcards, setFlashcards]               = useState(() => ssGet(`flashcards_${id}`, []));
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const flashcardsInFlight = React.useRef(false);

  // ── Quiz ──
  const [questions, setQuestions]     = useState(() => ssGet(`quiz_${id}`, []));
  const [quizLoading, setQuizLoading] = useState(false);
  const quizInFlight = React.useRef(false);

  // ── Persist state to sessionStorage on every change ──
  useEffect(() => { ssSet(`tab_${id}`, activeTab); }, [id, activeTab]);
  useEffect(() => { ssSet(`chat_messages_${id}`, messages); }, [id, messages]);
  useEffect(() => { ssSet(`summary_${id}`, summary); }, [id, summary]);
  useEffect(() => { ssSet(`explanation_${id}`, explanation); }, [id, explanation]);
  useEffect(() => { ssSet(`flashcards_${id}`, flashcards); }, [id, flashcards]);
  useEffect(() => { ssSet(`quiz_${id}`, questions); }, [id, questions]);

  // ── Fetch document ──
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (err) {
        setError(err?.message || 'Failed to load document.');
        toast.error('Failed to load document.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  // ── Handlers ──
  const handleSendMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatInFlight.current) return;
    chatInFlight.current = true;
    setChatInput('');
    setChatLoading(true);
    setMessages(prev => [...prev, { role: 'user', text }]);
    try {
      const res = await aiService.chat(text, id);
      const reply = res?.data?.answer || res?.data?.reply || res?.answer || 'No response received.';
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Failed to get a response. Please try again.' }]);
    } finally {
      setChatLoading(false);
      chatInFlight.current = false;
    }
  };

  const handleSummarize = async () => {
    if (summaryInFlight.current || summary) return;
    summaryInFlight.current = true;
    setSummaryLoading(true);
    try {
      const res = await aiService.generateSummary(id);
      setSummary(res?.data?.summary || res?.summary || 'No summary returned.');
    } catch {
      toast.error('Failed to generate summary.');
    } finally {
      setSummaryLoading(false);
      summaryInFlight.current = false;
    }
  };

  const handleExplainConcept = async (concept) => {
    if (explainInFlight.current) return;
    explainInFlight.current = true;
    setExplanation(null);
    setExplainLoading(true);
    try {
      const res = await aiService.explainConcept(id, concept);
      setExplanation(res?.data?.explanation || res?.explanation || 'No explanation returned.');
    } catch {
      toast.error('Failed to explain concept.');
    } finally {
      setExplainLoading(false);
      explainInFlight.current = false;
    }
  };

  const handleGenerateFlashcards = async () => {
    if (flashcardsInFlight.current) return;
    flashcardsInFlight.current = true;
    setFlashcardsLoading(true);
    try {
      const res = await aiService.generateFlashcards(id, 8);
      const data = res?.data?.cards || res?.data?.flashcards || res?.flashcards || [];
      setFlashcards(data);
      if (!data.length) toast('No flashcards returned.');
    } catch {
      toast.error('Failed to generate flashcards.');
    } finally {
      setFlashcardsLoading(false);
      flashcardsInFlight.current = false;
    }
  };

  const handleGenerateQuiz = async () => {
    if (quizInFlight.current) return;
    quizInFlight.current = true;
    setQuizLoading(true);
    try {
      const res = await aiService.generateQuiz(id, 5, document?.data?.title || 'Quiz');
      const data = res?.data?.questions || res?.questions || [];
      setQuestions(data);
      if (!data.length) toast('No quiz questions returned.');
    } catch {
      toast.error('Failed to generate quiz.');
    } finally {
      setQuizLoading(false);
      quizInFlight.current = false;
    }
  };

  // ── Page states ──
  if (loading) return <div className="flex items-center justify-center h-full"><Spinner /></div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-neutral-500">
      <p className="text-lg font-medium text-red-500">{error}</p>
      <button onClick={() => navigate(-1)} className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
        <ArrowLeft size={14} /> Go back
      </button>
    </div>
  );

  if (!document?.data) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-neutral-500">
      <BookOpen size={48} className="opacity-30" />
      <p className="text-lg font-medium">Document not found.</p>
      <button onClick={() => navigate(-1)} className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
        <ArrowLeft size={14} /> Go back
      </button>
    </div>
  );

  const doc = document.data;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate(-1)}
          className="mt-1 p-2 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 leading-tight">{doc.title || 'Untitled Document'}</h1>
          {doc.description && <p className="text-sm text-neutral-500 mt-1">{doc.description}</p>}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-2xl w-fit">
        {TABS.map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === name
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Icon size={14} />
            {name}
          </button>
        ))}
      </div>

      {/* Tab Panels — all in DOM, inactive ones hidden to preserve state */}
      <div>
        <div className={activeTab === 'Content' ? '' : 'hidden'}>
          <DocumentViewer filePath={doc.filepath || doc.filePath} documentId={id} />
        </div>

        <div className={activeTab === 'Chat' ? '' : 'hidden'}>
          <ChatInterface
            messages={messages}
            input={chatInput}
            loading={chatLoading}
            onInputChange={setChatInput}
            onSend={handleSendMessage}
          />
        </div>

        <div className={activeTab === 'AI Actions' ? '' : 'hidden'}>
          <AIActions
            summary={summary}
            summaryLoading={summaryLoading}
            onSummarize={handleSummarize}
            explanation={explanation}
            explainLoading={explainLoading}
            onExplain={handleExplainConcept}
          />
        </div>

        <div className={activeTab === 'Flashcards' ? '' : 'hidden'}>
          <FlashcardsTab
            documentId={id}
            cards={flashcards}
            loading={flashcardsLoading}
            onGenerate={handleGenerateFlashcards}
          />
        </div>

        <div className={activeTab === 'Quizzes' ? '' : 'hidden'}>
          <QuizzesTab
            questions={questions}
            loading={quizLoading}
            onGenerate={handleGenerateQuiz}
          />
        </div>
      </div>

    </div>
  );
};

export default DocumentDetailPage;
