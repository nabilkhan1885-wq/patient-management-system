import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';
import { supabase } from '../../services/supabase';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm your AI assistant. I can help you with:\n\n• Finding patient information\n• Summarizing visit histories\n• Generating patient reports\n• Providing follow-up recommendations\n\nHow can I help you today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPatients();
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select('id, full_name, patient_id')
      .limit(20);
    
    if (data) setPatients(data);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Check if user wants to select a patient
    const patientMatch = patients.find(p => 
      inputValue.toLowerCase().includes(p.full_name.toLowerCase()) ||
      inputValue.toLowerCase().includes(p.patient_id.toLowerCase())
    );

    const patientId = selectedPatientId || (patientMatch ? patientMatch.id : null);

    const response = await aiService.sendMessage(
      inputValue,
      patientId,
      user?.id
    );

    const aiMessage = {
      id: Date.now() + 1,
      type: 'assistant',
      content: response.response
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl">
        <div className="flex items-center space-x-2">
          <MessageSquare size={20} />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white/20 rounded-lg p-1 transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Patient Selector */}
      <div className="p-3 border-b bg-gray-50">
        <select
          value={selectedPatientId || ''}
          onChange={(e) => setSelectedPatientId(e.target.value || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Patients (General Query)</option>
          {patients.map(patient => (
            <option key={patient.id} value={patient.id}>
              {patient.full_name} ({patient.patient_id})
            </option>
          ))}
        </select>
        {selectedPatientId && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Currently analyzing: {patients.find(p => p.id === selectedPatientId)?.full_name}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} {...message} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
              <Loader size={16} className="animate-spin" />
              <span className="text-sm text-gray-600">AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        disabled={isLoading}
      />

      {/* Suggestions */}
      <div className="p-3 border-t bg-gray-50">
        <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Show me patients who visited recently",
            "What are common diagnoses?",
            "Generate a summary report",
            "List follow-ups needed"
          ].map(suggestion => (
            <button
              key={suggestion}
              onClick={() => setInputValue(suggestion)}
              className="text-xs bg-white border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-100 transition"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;