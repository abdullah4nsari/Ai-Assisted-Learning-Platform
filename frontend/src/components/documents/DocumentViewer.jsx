import React, { useEffect, useState } from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';
import axiosInstance from '../../util/axiosInstance';
import { API_PATHS } from '../../util/apiPaths';
import Spinner from '../common/Spinner';

const DocumentViewer = ({ documentId }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!documentId) { setLoading(false); setError(true); return; }

    let objectUrl;
    axiosInstance.get(API_PATHS.DOCUMENTS.GET_PREVIEW_URL(documentId), { responseType: 'blob' })
      .then(res => {
        objectUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        setBlobUrl(objectUrl);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [documentId]);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  if (error || !blobUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
        <BookOpen size={40} className="mb-3 opacity-40" />
        <p className="font-medium">No file available for this document.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">PDF Preview</p>
        <a
          href={blobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <ExternalLink size={14} /> Open in new tab
        </a>
      </div>
      <iframe
        src={blobUrl}
        title="Document Preview"
        className="w-full rounded-2xl border border-slate-200 shadow-sm"
        style={{ height: '70vh' }}
      />
    </div>
  );
};

export default DocumentViewer;
