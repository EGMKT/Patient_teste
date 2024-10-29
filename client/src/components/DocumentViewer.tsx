import React, { useState, useEffect } from 'react';

interface DocumentViewerProps {
  consultationId: string;
  fileType: 'transcription' | 'summary';
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ consultationId, fileType }) => {
  const [content, setContent] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/consultations/${consultationId}/file/${fileType}/`);
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error('Erro ao carregar documento:', error);
      }
    };

    fetchDocument();
  }, [consultationId, fileType]);

  return (
    <div className={`document-viewer ${isExpanded ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">
          {fileType === 'transcription' ? 'Transcrição' : 'Resumo'}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-700"
        >
          {isExpanded ? 'Minimizar' : 'Expandir'}
        </button>
      </div>
      <div className={`bg-gray-50 p-4 rounded ${isExpanded ? 'h-full overflow-auto' : 'max-h-96 overflow-auto'}`}>
        <pre className="whitespace-pre-wrap font-sans">{content}</pre>
      </div>
    </div>
  );
};

export default DocumentViewer;