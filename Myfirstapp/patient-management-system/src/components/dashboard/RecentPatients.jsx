import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { User, Calendar } from 'lucide-react';

const RecentPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentPatients();
  }, []);

  const fetchRecentPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Recent Patients</h2>
        <Link to="/patients" className="text-blue-600 hover:text-blue-700 text-sm">
          View All
        </Link>
      </div>
      
      <div className="space-y-3">
        {patients.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No patients yet</p>
        ) : (
          patients.map((patient) => (
            <Link
              key={patient.id}
              to={`/patients/${patient.id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 group-hover:text-blue-600">
                    {patient.full_name}
                  </p>
                  <p className="text-sm text-gray-500">{patient.patient_id}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar size={14} className="mr-1" />
                {new Date(patient.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentPatients;