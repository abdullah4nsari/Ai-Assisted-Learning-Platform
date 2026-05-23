import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import {
    FileText, Upload, Trash2, Eye, Search, X,
    BookOpen, BrainCircuit, AlertCircle, Plus,
    CheckCircle, Clock, XCircle, FolderOpen,
} from 'lucide-react';

const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const StatusBadge = ({ status }) => {
    const map = {
        ready:      { icon: CheckCircle, cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Ready'      },
        processing: { icon: Clock,       cls: 'bg-amber-50 text-amber-600 border-amber-100',       label: 'Processing' },
        failed:     { icon: XCircle,     cls: 'bg-red-50 text-red-500 border-red-100',             label: 'Failed'     },
    };
    const { icon: Icon, cls, label } = map[status] || map.processing;
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
            <Icon size={10} strokeWidth={2.5} /> {label}
        </span>
    );
};

// ── Upload Modal ──────────────────────────────────────────────────────────────
const UploadModal = ({ onClose, onSuccess }) => {
    const [uploadFile,  setUploadFile]  = useState(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploading,   setUploading]   = useState(false);
    const [dragOver,    setDragOver]    = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (file) => {
        if (!file || file.type !== 'application/pdf') { toast.error('Only PDF files are supported'); return; }
        setUploadFile(file);
        if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!uploadFile || !uploadTitle.trim()) { toast.error('Please provide a file and title'); return; }
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('title', uploadTitle.trim());
            await documentService.uploadDocuments(formData);
            toast.success('Document uploaded! Processing in background…');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error?.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/25">
                            <Upload size={15} className="text-white" />
                        </div>
                        <h2 className="text-sm font-bold text-slate-800">Upload Document</h2>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-150">
                        <X size={15} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all duration-200 ${
                            dragOver ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80'
                        }`}
                    >
                        <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileSelect(e.target.files[0])} />
                        {uploadFile ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <FileText size={16} className="text-emerald-500" />
                                </div>
                                <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{uploadFile.name}</span>
                                <span className="text-xs text-slate-400">({formatFileSize(uploadFile.size)})</span>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                    <Upload size={22} className="text-slate-400" />
                                </div>
                                <p className="text-sm font-semibold text-slate-600">Drop PDF here or <span className="text-emerald-600">browse</span></p>
                                <p className="text-xs text-slate-400 mt-1">PDF files only · Max 50MB</p>
                            </>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Document Title</label>
                        <input
                            type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)}
                            placeholder="Enter a title…"
                            className="w-full py-2.5 px-3.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200 bg-white"
                        />
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors duration-150">
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={uploading || !uploadFile}
                            className="flex-1 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
                        >
                            {uploading ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</> : 'Upload'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

// ── Delete Modal ──────────────────────────────────────────────────────────────
const DeleteModal = ({ document, onClose, onConfirm, deleting }) => (
    <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-100"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={20} className="text-red-500" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-800">Delete Document</h2>
                    <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone</p>
                </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
                Delete <span className="font-semibold text-slate-800">"{document?.title}"</span>? All associated flashcards and quizzes will also be removed.
            </p>
            <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors duration-150">Cancel</button>
                <button onClick={onConfirm} disabled={deleting}
                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-60 transition-colors duration-150 flex items-center justify-center gap-2">
                    {deleting ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting…</> : 'Delete'}
                </button>
            </div>
        </motion.div>
    </motion.div>
);

// ── Document Card ─────────────────────────────────────────────────────────────
const DocumentCard = ({ doc, index, onDelete }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="bg-white rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-lg transition-all duration-300 p-5 flex flex-col gap-4"
    >
        <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                <FileText size={18} className="text-white" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-800 truncate">{doc.title}</h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">{doc.filename || '—'}</p>
            </div>
            <StatusBadge status={doc.status} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
            {[
                { label: 'Size',       value: formatFileSize(doc.filesize) },
                { label: 'Flashcards', value: doc.flashcardCount ?? 0 },
                { label: 'Quizzes',    value: doc.quizCount ?? 0 },
            ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl py-2 px-1">
                    <p className="text-sm font-bold text-slate-800">{value}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{label}</p>
                </div>
            ))}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium">{formatDate(doc.uploadDate || doc.createdAt)}</span>
            <div className="flex items-center gap-1.5">
                <Link to={`/documents/${doc._id}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors duration-150">
                    <Eye size={12} /> View
                </Link>
                <Link to={`/documents/${doc._id}/flashcards`}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-150">
                    <BookOpen size={12} /> Cards
                </Link>
                <button onClick={() => onDelete(doc)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-150">
                    <Trash2 size={12} /> Delete
                </button>
            </div>
        </div>
    </motion.div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const DocumentListPage = () => {
    const [documents,         setDocuments]         = useState([]);
    const [loading,           setLoading]           = useState(true);
    const [search,            setSearch]            = useState('');
    const [statusFilter,      setStatusFilter]      = useState('all');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDocument,  setSelectedDocument]  = useState(null);
    const [deleting,          setDeleting]          = useState(false);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await documentService.getDocuments();
            setDocuments(response.data || []);
        } catch { toast.error('Failed to load documents'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDocuments(); }, []);

    const handleConfirmDelete = async () => {
        if (!selectedDocument) return;
        try {
            setDeleting(true);
            await documentService.deleteDocument(selectedDocument._id);
            toast.success('Document deleted');
            setIsDeleteModalOpen(false);
            setSelectedDocument(null);
            fetchDocuments();
        } catch { toast.error('Failed to delete document'); }
        finally { setDeleting(false); }
    };

    const filtered = documents.filter(doc => {
        const matchSearch = doc.title?.toLowerCase().includes(search.toLowerCase()) || doc.filename?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || doc.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-6 pb-8 max-w-7xl mx-auto">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between flex-wrap gap-3"
            >
                <div>
                    <h1 className="text-xl font-bold text-slate-900">My Documents</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{documents.length} document{documents.length !== 1 ? 's' : ''} uploaded</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
                >
                    <Plus size={16} strokeWidth={2.5} /> Upload Document
                </motion.button>
            </motion.div>

            {/* Search + Filter */}
            <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex flex-col sm:flex-row gap-3"
            >
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search documents…"
                        className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200 bg-white"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="flex gap-1.5">
                    {['all', 'ready', 'processing', 'failed'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-2.5 text-xs font-bold rounded-xl capitalize transition-all duration-150 ${
                                statusFilter === s
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Content */}
            {loading ? (
                <Spinner />
            ) : filtered.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <FolderOpen size={28} className="text-slate-300" />
                    </div>
                    <p className="text-slate-700 font-semibold text-sm">
                        {search || statusFilter !== 'all' ? 'No documents match your filters' : 'No documents yet'}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                        {search || statusFilter !== 'all' ? 'Try adjusting your search or filter' : 'Upload a PDF to get started'}
                    </p>
                    {!search && statusFilter === 'all' && (
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={() => setIsUploadModalOpen(true)}
                            className="mt-5 flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200"
                        >
                            <Plus size={15} /> Upload Document
                        </motion.button>
                    )}
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((doc, i) => (
                        <DocumentCard key={doc._id} doc={doc} index={i} onDelete={(d) => { setSelectedDocument(d); setIsDeleteModalOpen(true); }} />
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isUploadModalOpen && <UploadModal onClose={() => setIsUploadModalOpen(false)} onSuccess={fetchDocuments} />}
                {isDeleteModalOpen && (
                    <DeleteModal
                        document={selectedDocument}
                        onClose={() => { setIsDeleteModalOpen(false); setSelectedDocument(null); }}
                        onConfirm={handleConfirmDelete}
                        deleting={deleting}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DocumentListPage;
