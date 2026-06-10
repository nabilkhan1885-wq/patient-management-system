import React from 'react';
import { FileText, Download, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../services/supabase';

const DocumentList = ({ documents, onRefresh }) => {
  const handleDownload = async (doc) => {
    try {
      // For public URLs, just open in new tab
      window.open(doc.file_url, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async (doc) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      // Extract file path from URL
      const urlParts = doc.file_url.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('patient-documents') + 1).join('/');
      
      // Delete from storage
      await supabase.storage
        .from('patient-documents')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const getDocumentIcon = (type) => {
    if (type === 'prescription') return '💊';
    if (type === 'lab_report') return '🔬';
    if (type === 'xray') return '🩻';
    if (type === 'medical_history') return '📋';
    return '📄';
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <FileText size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-200">
        {documents.map((doc) => (
          <div key={doc.id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {getDocumentIcon(doc.document_type)}
              </div>
              <div>
                <p className="font-medium text-gray-800">{doc.file_name}</p>
                <p className="text-sm text-gray-500">
                  {doc.document_type?.replace('_', ' ')} • 
                  {(doc.file_size / 1024).toFixed(2)} KB • 
                  {new Date(doc.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleDownload(doc)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <Download size={18} />
              </button>
              <button
                onClick={() => handleDelete(doc)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;