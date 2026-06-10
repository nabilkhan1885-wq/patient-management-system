import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Users, Activity } from 'lucide-react';

const Analytics = () => {
  const [monthlyPatients, setMonthlyPatients] = useState([]);
  const [monthlyVisits, setMonthlyVisits] = useState([]);
  const [topDiagnoses, setTopDiagnoses] = useState([]);
  const [stats, setStats] = useState({
    newPatients: 0,
    totalVisits: 0,
    avgVisitsPerPatient: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch monthly patient registrations
      const { data: patients } = await supabase
        .from('patients')
        .select('created_at')
        .order('created_at');

      const monthlyPatientData = processMonthlyData(patients, 'created_at');
      setMonthlyPatients(monthlyPatientData);

      // Fetch visits data
      const { data: visits } = await supabase
        .from('visits')
        .select('visit_date, diagnosis');

      const monthlyVisitData = processMonthlyData(visits, 'visit_date');
      setMonthlyVisits(monthlyVisitData);

      // Process top diagnoses
      const diagnosisCount = {};
      visits?.forEach(visit => {
        if (visit.diagnosis) {
          diagnosisCount[visit.diagnosis] = (diagnosisCount[visit.diagnosis] || 0) + 1;
        }
      });
      
      const topDiagnosesData = Object.entries(diagnosisCount)
        .map(([name, value]) => ({ name: name.substring(0, 20), value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      
      setTopDiagnoses(topDiagnosesData);

      // Calculate stats
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      
      const newPatientsCount = patients?.filter(p => 
        new Date(p.created_at) > last30Days
      ).length || 0;

      const totalVisitsCount = visits?.length || 0;
      const uniquePatients = new Set(visits?.map(v => v.patient_id)).size;
      const avgVisits = uniquePatients > 0 ? (totalVisitsCount / uniquePatients).toFixed(1) : 0;

      setStats({
        newPatients: newPatientsCount,
        totalVisits: totalVisitsCount,
        avgVisitsPerPatient: avgVisits
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (data, dateField) => {
    const months = {};
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleString('default', { month: 'short' });
      months[monthKey] = { month: monthName, count: 0 };
      last6Months.push(monthKey);
    }
    
    data?.forEach(item => {
      const date = new Date(item[dateField]);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (months[monthKey]) {
        months[monthKey].count++;
      }
    });
    
    return last6Months.map(key => months[key]);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-600 mt-1">Track your practice performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">New Patients (30 days)</p>
              <p className="text-3xl font-bold text-gray-800">{stats.newPatients}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Visits</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalVisits}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Activity size={24} className="text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Visits/Patient</p>
              <p className="text-3xl font-bold text-gray-800">{stats.avgVisitsPerPatient}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Monthly Patient Registrations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyPatients}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Monthly Visit Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyVisits}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold mb-4">Top Diagnoses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topDiagnoses}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topDiagnoses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;