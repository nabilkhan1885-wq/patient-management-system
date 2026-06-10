import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Calendar, FileText, Upload, Plus } from 'lucide-react';
import { supabase } from '../services/supabase';
import Button from '../components/ui/Button';
import VisitForm from '../components/visits/VisitForm';
import VisitHistory from '../components/visits/VisitHistory';
import DocumentUpload from '../components/documents/DocumentUpload';
import DocumentList from '../components/documents/DocumentList';
import Modal from '../components/ui/Modal';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      // Fetch patient details
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch visits
      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select('*')
        .eq('patient_id', id)
        .order('visit_date', { ascending: false });

      if (visitsError) throw visitsError;
      setVisits(visitsData || []);

      // Fetch documents
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('patient_id', id)
        .order('uploaded_at', { ascending: false });

      if (docsError) throw docsError;
      setDocuments(docsData || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'info', label: 'Information', icon: User },
    { id: 'visits', label: 'Visits', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/patients')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{patient?.full_name}</h1>
          <p className="text-gray-600">Patient ID: {patient?.patient_id}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setShowVisitModal(true)}>
          <Plus size={18} className="mr-2" />
          Add Visit
        </Button>
        <Button variant="outline" onClick={() => setShowDocumentModal(true)}>
          <Upload size={18} className="mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'info' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="space-y-3">
                  <p><strong>Full Name:</strong> {patient?.full_name}</p>
                  <p><strong>Gender:</strong> {patient?.gender || '-'}</p>
                  <p><strong>Date of Birth:</strong> {patient?.date_of_birth || '-'}</p>
                  <p><strong>Blood Group:</strong> {patient?.blood_group || '-'}</p>
                  <p><strong>Phone:</strong> {patient?.phone || '-'}</p>
                  <p><strong>Email:</strong> {patient?.email || '-'}</p>
                  <p><strong>Address:</strong> {patient?.address || '-'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
                <div className="space-y-3">
                  <p><strong>Emergency Contact:</strong> {patient?.emergency_contact || '-'}</p>
                  <p><strong>Emergency Phone:</strong> {patient?.emergency_phone || '-'}</p>
                  <p><strong>Medical History:</strong></p>
                  <p className="text-gray-600">{patient?.medical_history || 'No medical history recorded'}</p>
                  <p><strong>Allergies:</strong></p>
                  <p className="text-gray-600">{patient?.allergies || 'No allergies recorded'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visits' && (
          <VisitHistory visits={visits} onRefresh={fetchPatientData} />
        )}

        {activeTab === 'documents' && (
          <DocumentList documents={documents} onRefresh={fetchPatientData} />
        )}
      </motion.div>

      {/* Modals */}
      <Modal
        isOpen={showVisitModal}
        onClose={() => setShowVisitModal(false)}
        title="Add New Visit"
      >
        <VisitForm
          patientId={id}
          onSuccess={() => {
            setShowVisitModal(false);
            fetchPatientData();
          }}
          onCancel={() => setShowVisitModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        title="Upload Document"
      >
        <DocumentUpload
          patientId={id}
          onSuccess={() => {
            setShowDocumentModal(false);
            fetchPatientData();
          }}
          onCancel={() => setShowDocumentModal(false)}
        />
      </Modal>
    </div>
  );
};

export default PatientDetails;