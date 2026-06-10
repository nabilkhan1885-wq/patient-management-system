import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, FileText, TrendingUp } from 'lucide-react';
import { supabase } from '../services/supabase';
import StatsCard from '../components/dashboard/StatsCard';
import RecentPatients from '../components/dashboard/RecentPatients';
import RecentVisits from '../components/dashboard/RecentVisits';
import Chatbot from '../components/chatbot/Chatbot';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalVisits: 0,
    totalDocuments: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total patients
      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Get total visits
      const { count: visitCount } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true });

      // Get total documents
      const { count: documentCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalPatients: patientCount || 0,
        totalVisits: visitCount || 0,
        totalDocuments: documentCount || 0,
        monthlyGrowth: 12
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Total Visits',
      value: stats.totalVisits,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Documents',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'bg-purple-500',
      change: '+23%',
      changeType: 'increase'
    },
    {
      title: 'Growth Rate',
      value: `${stats.monthlyGrowth}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+5%',
      changeType: 'increase'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your practice overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentPatients />
        <RecentVisits />
      </div>

      {/* AI Chatbot Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowChatbot(!showChatbot)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition z-20"
      >
        <MessageSquare size={24} />
      </motion.button>

      {/* Chatbot Panel */}
      {showChatbot && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl z-20 overflow-hidden border border-gray-200">
          <Chatbot onClose={() => setShowChatbot(false)} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;