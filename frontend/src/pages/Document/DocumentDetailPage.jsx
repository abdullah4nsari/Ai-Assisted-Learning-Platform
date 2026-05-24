import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, MessageSquare, Zap, Layers, ClipboardList } from 'lucide-react';
import documentService from '../../services/documentService';
import aiService from '../../services/aiService';
import Spinner from '../../components/common/Spinner';
import DocumentViewer from '../../components/documents/DocumentViewer';
import ChatInterface from '../../components/documents/ChatInterface';
import AIActions from '../../components/documents/AIActions';
import FlashcardsTab from '../../components/flashcards/FlashcardsTab';
import QuizzesTab from '../../components/quizes/QuizzesTab';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TABS = [
    { name: 'Content',    icon: BookOpen,      color: 'text-blue-500'   },
    { name: 'Chat',       icon: MessageSquare, color: 'text-emerald-500' },
    { name: 'AI Actions', icon: Zap,           color: 'text-amber-500'  },
    { name: 'Flashcards', icon: Layers,        color: 'text-purple-500' },
    { name: 'Quizzes',    icon: ClipboardList, color: 'text-violet-500' },
];

// Everything else (summary, explanation, flashcards, quiz) uses sessionStorage as before.
const ssGet = (key, fallback) => {
    try { const v = sessionStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
    catch { return fallback; }
};
const ssSet = (key, value) => {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
};

const DocumentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [document,    setDocument]   = useState(null);
    const [loading,     setLoading]    = useState(true);
    const [error,       setError]      = useState(null);
    const [activeTab,   setActiveTab]  = useState(() => ssGet(`tab_${id}`, 'Content'));

    // Chat — loaded from DB on mount, saved to DB on every send
    const [messages,     setMessages]      = useState([]);
    const [chatInput,    setChatInput]     = useState('');
    const [chatLoading,  setChatLoading]   = useState(false);
    const [chatInitialized, setChatInitialized] = useState(false);
    const chatInFlight = React.useRef(false);

    const [summary,        setSummary]        = useState(() => ssGet(`summary_${id}`, null));
    const [summaryLoading, setSummaryLoading] = useState(false);
    const summaryInFlight = React.useRef(false);

    const [explanation,    setExplanation]    = useState(() => ssGet(`explanation_${id}`, null));
    const [explainLoading, setExplainLoading] = useState(false);
    const explainInFlight = React.useRef(false);

    const [flashcards,        setFlashcards]        = useState(() => ssGet(`flashcards_${id}`, []));
    const [flashcardsLoading, setFlashcardsLoading] = useState(false);
    const flashcardsInFlight = React.useRef(false);

    const [questions,   setQuestions]  = useState(() => ssGet(`quiz_${id}`, []));
    const [quizLoading, setQuizLoading] = useState(false);
    const quizInFlight = React.useRef(false);

    useEffect(() => { ssSet(`tab_${id}`, activeTab); }, [id, activeTab]);
    useEffect(() => { ssSet(`summary_${id}`, summary); }, [id, summary]);
    useEffect(() => { ssSet(`explanation_${id}`, explanation); }, [id, explanation]);
    useEffect(() => { ssSet(`flashcards_${id}`, flashcards); }, [id, flashcards]);
    useEffect(() => { ssSet(`quiz_${id}`, questions); }, [id, questions]);

    useEffect(() => {
        documentService.getDocumentById(id)
            .then(data => setDocument(data))
            .catch(err => { setError(err?.message || 'Failed to load document.'); toast.error('Failed to load document.'); })
            .finally(() => setLoading(false));
    }, [id]);

    // Load chat history from DB once document is ready
    useEffect(() => {
        if (chatInitialized) return;
        setChatInitialized(true);
        aiService.getChatHistory(id)
            .then(res => {
                const msgs = res?.data?.messages || [];
                // Map DB schema (role:'assistant', content) → UI schema (role:'ai', text)
                setMessages(msgs.map(m => ({
                    role: m.role === 'assistant' ? 'ai' : 'user',
                    text: m.content,
                })));
            })
            .catch(() => {
                // 404 = no history yet, that's fine — start fresh
                setMessages([]);
            });
    }, [id, chatInitialized]);

    const handleSendMessage = async () => {
        const text = chatInput.trim();
        if (!text || chatInFlight.current) return;
        chatInFlight.current = true;
        setChatInput('');
        setChatLoading(true);
        setMessages(prev => [...prev, { role: 'user', text }]);
        try {
            const res = await aiService.chat(text, id);
            setMessages(prev => [...prev, { role: 'ai', text: res?.data?.answer || res?.data?.reply || 'No response received.' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Failed to get a response. Please try again.' }]);
        } finally { setChatLoading(false); chatInFlight.current = false; }
    };

    const handleSummarize = async () => {
        if (summaryInFlight.current || summary) return;
        summaryInFlight.current = true;
        setSummaryLoading(true);
        try {
            const res = await aiService.generateSummary(id);
            setSummary(res?.data?.summary || 'No summary returned.');
        } catch { toast.error('Failed to generate summary.'); }
        finally { setSummaryLoading(false); summaryInFlight.current = false; }
    };

    const handleExplainConcept = async (concept) => {
        if (explainInFlight.current) return;
        explainInFlight.current = true;
        setExplanation(null);
        setExplainLoading(true);
        try {
            const res = await aiService.explainConcept(id, concept);
            setExplanation(res?.data?.explanation || 'No explanation returned.');
        } catch { toast.error('Failed to explain concept.'); }
        finally { setExplainLoading(false); explainInFlight.current = false; }
    };

    const handleGenerateFlashcards = async (count = 10) => {
        if (flashcardsInFlight.current) return;
        flashcardsInFlight.current = true;
        setFlashcardsLoading(true);
        try {
            const res = await aiService.generateFlashcards(id, count);
            const data = res?.data?.cards || res?.data?.flashcards || [];
            setFlashcards(data);
            if (!data.length) toast('No flashcards returned.');
        } catch { toast.error('Failed to generate flashcards.'); }
        finally { setFlashcardsLoading(false); flashcardsInFlight.current = false; }
    };

    const handleGenerateQuiz = async () => {
        if (quizInFlight.current) return;
        quizInFlight.current = true;
        setQuizLoading(true);
        try {
            const res = await aiService.generateQuiz(id, 5, document?.data?.title || 'Quiz');
            const data = res?.data?.questions || [];
            setQuestions(data);
            if (!data.length) toast('No quiz questions returned.');
        } catch { toast.error('Failed to generate quiz.'); }
        finally { setQuizLoading(false); quizInFlight.current = false; }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><Spinner /></div>;

    if (error) return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
            <p className="text-lg font-medium text-red-500">{error}</p>
            <button onClick={() => navigate(-1)} className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
                <ArrowLeft size={14} /> Go back
            </button>
        </div>
    );

    if (!document?.data) return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
            <BookOpen size={48} className="opacity-20" />
            <p className="text-lg font-medium">Document not found.</p>
            <button onClick={() => navigate(-1)} className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
                <ArrowLeft size={14} /> Go back
            </button>
        </div>
    );

    const doc = document.data;

    return (
        <div className="max-w-5xl mx-auto space-y-5 pb-8">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-3"
            >
                <button
                    onClick={() => navigate(-1)}
                    className="mt-1 p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all duration-200 flex-shrink-0"
                >
                    <ArrowLeft size={17} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 leading-tight">{doc.title || 'Untitled Document'}</h1>
                    {doc.description && <p className="text-sm text-slate-500 mt-1">{doc.description}</p>}
                </div>
            </motion.div>

            {/* Tab Bar */}
            <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="w-full overflow-x-auto scrollbar-none"
            >
                <div className="flex gap-1 bg-slate-100/80 p-1 rounded-2xl w-max min-w-full">
                    {TABS.map(({ name, icon: Icon, color }) => (
                        <button
                            key={name}
                            onClick={() => setActiveTab(name)}
                            className={`relative flex items-center justify-center gap-1.5 flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 min-w-[56px] ${
                                activeTab === name ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {activeTab === name && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 rounded-xl shadow-sm"
                                    style={{ backgroundColor: 'var(--tab-pill-bg, #ffffff)' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <Icon size={14} className={`relative z-10 shrink-0 ${activeTab === name ? color : ''}`} />
                            <span className="relative z-10 hidden xs:inline sm:inline">{name}</span>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Tab Panels — visibility:hidden keeps DOM alive but removes from layout flow so scroll height is correct */}
            <div className="relative">
                <div style={{ display: activeTab === 'Content'    ? 'block' : 'none' }}><DocumentViewer filePath={doc.filepath || doc.filePath} documentId={id} /></div>
                <div style={{ display: activeTab === 'Chat'       ? 'block' : 'none' }}><ChatInterface messages={messages} input={chatInput} loading={chatLoading} onInputChange={setChatInput} onSend={handleSendMessage} /></div>
                <div style={{ display: activeTab === 'AI Actions' ? 'block' : 'none' }}><AIActions summary={summary} summaryLoading={summaryLoading} onSummarize={handleSummarize} explanation={explanation} explainLoading={explainLoading} onExplain={handleExplainConcept} /></div>
                <div style={{ display: activeTab === 'Flashcards' ? 'block' : 'none' }}><FlashcardsTab documentId={id} cards={flashcards} loading={flashcardsLoading} onGenerate={handleGenerateFlashcards} /></div>
                <div style={{ display: activeTab === 'Quizzes'    ? 'block' : 'none' }}><QuizzesTab questions={questions} loading={quizLoading} onGenerate={handleGenerateQuiz} /></div>
            </div>
        </div>
    );
};

export default DocumentDetailPage;
