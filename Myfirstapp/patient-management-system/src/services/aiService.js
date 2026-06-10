import { supabase } from './supabase';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const aiService = {
  async sendMessage(message, patientId = null, userId) {
    try {
      // First, get context from database if patientId is provided
      let context = '';
      
      if (patientId) {
        // Get patient information
        const { data: patient } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        // Get recent visits
        const { data: visits } = await supabase
          .from('visits')
          .select('*')
          .eq('patient_id', patientId)
          .order('visit_date', { ascending: false })
          .limit(10);

        context = `
          Patient Information:
          Name: ${patient?.full_name}
          Age: ${patient?.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : 'Unknown'}
          Blood Group: ${patient?.blood_group || 'Unknown'}
          Medical History: ${patient?.medical_history || 'None recorded'}
          Allergies: ${patient?.allergies || 'None recorded'}
          
          Recent Visits:
          ${visits?.map(v => `- ${v.visit_date}: ${v.diagnosis || 'No diagnosis'} | Symptoms: ${v.symptoms || 'None'} | Prescription: ${v.prescription || 'None'}`).join('\n')}
        `;
      }

      // Prepare the prompt for OpenAI
      const systemPrompt = `You are a helpful medical assistant for a patient management system. 
        You help healthcare providers with patient information, visit summaries, and recommendations.
        Always maintain professional and ethical standards. Do not provide medical advice or diagnoses.
        Instead, help summarize information and suggest follow-ups based on the data provided.
        
        ${context}
        
        Based on the above patient data, answer the following question:`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error('AI service error');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Save conversation to database
      await supabase
        .from('ai_conversations')
        .insert([{
          user_id: userId,
          patient_id: patientId,
          message: message,
          response: aiResponse,
          context: { patientId }
        }]);

      return { success: true, response: aiResponse };
    } catch (error) {
      console.error('AI service error:', error);
      return { 
        success: false, 
        response: "I'm sorry, I'm having trouble processing your request. Please try again later." 
      };
    }
  },

  async getPatientSummary(patientId) {
    try {
      // Get patient data
      const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      // Get all visits
      const { data: visits } = await supabase
        .from('visits')
        .select('*')
        .eq('patient_id', patientId)
        .order('visit_date', { ascending: false });

      // Generate summary using OpenAI
      const prompt = `Generate a concise medical summary for the following patient based on their records:
        
        Patient: ${patient?.full_name}
        Age: ${patient?.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : 'Unknown'}
        Blood Group: ${patient?.blood_group || 'Unknown'}
        Medical History: ${patient?.medical_history || 'None'}
        Allergies: ${patient?.allergies || 'None'}
        
        Visit History (${visits?.length || 0} visits):
        ${visits?.map(v => `- ${v.visit_date}: ${v.diagnosis || 'No diagnosis'}`).join('\n')}
        
        Create a professional summary highlighting key medical information and visit patterns.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 300
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Unable to generate summary at this time.';
    }
  }
};