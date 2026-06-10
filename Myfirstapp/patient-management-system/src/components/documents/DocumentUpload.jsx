import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { Upload, X } from 'lucide-react';
import Button from '../ui/Button';

const DocumentUpload = ({ patientId, onSuccess, onCancel }) => {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('other');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${patientId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('patient-documents')
        .getPublicUrl(fileName);

      // Save to documents table
      const { error: dbError } = await supabase
        .from('documents')
        .insert([{
          patient_id: patientId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          document_type: documentType
        }]);

      if (dbError) throw dbError;

      onSuccess();
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Document Type
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="prescription">Prescription</option>
          <option value="lab_report">Lab Report</option>
          <option value="xray">X-Ray/Imaging</option>
          <option value="medical_history">Medical History</option>
          <option value="insurance">Insurance</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          id="file-upload"
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload size={40} className="text-gray-400 mb-2" />
          <p className="text-gray-600">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-500 mt-1">
            PDF, JPG, PNG, DOC (Max 10MB)
          </p>
        </label>
      </div>

      {file && (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div>
            <p className="font-medium text-gray-800">{file.name}</p>
            <p className="text-sm text-gray-500">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-red-600 hover:text-red-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUpload;