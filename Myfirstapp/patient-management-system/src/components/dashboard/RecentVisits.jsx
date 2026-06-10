import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Activity, Calendar } from 'lucide-react';

const RecentVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentVisits();
  }, []);

  const fetchRecentVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          patients:patient_id (
            full_name,
            patient_id
          )
        `)
        .order('visit_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setVisits(data || []);
    } catch (error) {
      console.error('Error fetching visits:', error);
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
        <h2 className="text-xl font-semibold text-gray-800">Recent Visits</h2>
        <a href="/visits" className="text-blue-600 hover:text-blue-700 text-sm">
          View All
        </a>
      </div>
      
      <div className="space-y-3">
        {visits.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No visits recorded</p>
        ) : (
          visits.map((visit) => (
            <div key={visit.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Activity size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{visit.patients?.full_name}</p>
                  <p className="text-sm text-gray-500">{visit.diagnosis || 'No diagnosis'}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar size={14} className="mr-1" />
                {new Date(visit.visit_date).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentVisits;