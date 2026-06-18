import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCalendar, FiDollarSign, FiImage, FiActivity, FiMail, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const res = await axios.get('/api/dashboard/stats', config);
        setData(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
        setLoading(false);
      }
    };
    if (user?.token) fetchStats();
  }, [user]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-luxury-gold">
        <div className="text-lg tracking-widest font-serif animate-pulse">Loading Analytics...</div>
      </div>
    );
  }

  const { metrics, statusDistribution, monthlyAnalytics, recentInquiries, recentActivities } = data;

  const stats = [
    { title: 'Total Bookings', value: metrics.totalBookings, icon: <FiCalendar className="text-3xl text-luxury-gold" /> },
    { title: 'Est. Revenue', value: `₹${metrics.totalRevenue.toLocaleString('en-IN')}`, icon: <FiDollarSign className="text-3xl text-luxury-gold" /> },
    { title: 'Portfolio Images', value: metrics.totalImages, icon: <FiImage className="text-3xl text-luxury-gold" /> },
    { title: 'Active Services', value: metrics.totalServices, icon: <FiUsers className="text-3xl text-luxury-gold" /> },
  ];

  // Revenue Line Chart Data
  const lineChartData = {
    labels: monthlyAnalytics.map(m => m.month),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: monthlyAnalytics.map(m => m.revenue),
        borderColor: '#d4af37',
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#f5f5f5', font: { family: 'serif' } } }
    },
    scales: {
      y: { ticks: { color: '#a3a3a3' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#a3a3a3' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  // Status Doughnut Chart Data
  const doughnutChartData = {
    labels: Object.keys(statusDistribution),
    datasets: [
      {
        data: Object.values(statusDistribution),
        backgroundColor: [
          'rgba(234, 179, 8, 0.7)',  // Yellow (New)
          'rgba(59, 130, 246, 0.7)',  // Blue (Reviewed)
          'rgba(99, 102, 241, 0.7)',  // Indigo (Contacted)
          'rgba(34, 197, 94, 0.7)',  // Green (Confirmed)
          'rgba(168, 85, 247, 0.7)',  // Purple (Completed)
          'rgba(239, 68, 68, 0.7)'    // Red (Cancelled)
        ],
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#f5f5f5', boxWidth: 12, font: { size: 11 } }
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-white mb-2 tracking-wide">Overview</h2>
        <p className="text-sm text-gray-400">Real-time statistics & business analytics</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass p-6 rounded-lg border border-white/10 flex items-center justify-between"
          >
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
            <div className="p-3 bg-luxury-gold/15 rounded-full border border-luxury-gold/20">
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass p-6 rounded-lg border border-white/10"
        >
          <h3 className="text-lg font-serif text-white mb-6 tracking-wide flex items-center">
            <FiActivity className="mr-2 text-luxury-gold" /> Est. Revenue Trend (Last 6 Months)
          </h3>
          <div className="h-72 w-full">
            <Line options={lineChartOptions} data={lineChartData} />
          </div>
        </motion.div>

        {/* Booking Statuses */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass p-6 rounded-lg border border-white/10"
        >
          <h3 className="text-lg font-serif text-white mb-6 tracking-wide flex items-center">
            <FiCheckCircle className="mr-2 text-luxury-gold" /> Booking Status Distribution
          </h3>
          <div className="h-72 w-full relative flex items-center justify-center">
            {metrics.totalBookings > 0 ? (
              <Doughnut options={doughnutChartOptions} data={doughnutChartData} />
            ) : (
              <div className="text-gray-500 text-sm text-center">No bookings recorded yet.</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity and Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass p-6 rounded-lg border border-white/10"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-serif text-white tracking-wide flex items-center">
              <FiMail className="mr-2 text-luxury-gold" /> Recent Inquiries
            </h3>
            <Link to="/admin/bookings" className="text-xs text-luxury-gold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-white/10 uppercase tracking-widest text-[10px] pb-2">
                  <th className="pb-3 font-normal">Customer</th>
                  <th className="pb-3 font-normal">Event</th>
                  <th className="pb-3 font-normal">Amount</th>
                  <th className="pb-3 font-normal text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.map((inq) => (
                  <tr key={inq._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 text-white">
                      <div>{inq.customerName}</div>
                      <div className="text-[10px] text-gray-500">{inq.referenceNumber}</div>
                    </td>
                    <td className="py-3 text-gray-300">{inq.eventType}</td>
                    <td className="py-3 text-luxury-gold">₹{inq.totalPrice.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 text-[10px] rounded-full border ${
                        inq.status === 'Confirmed' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                        inq.status === 'New Inquiry' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                        'border-gray-500/50 text-gray-400 bg-gray-500/10'
                      }`}>
                        {inq.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentInquiries.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">No recent inquiries.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Activity Log */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass p-6 rounded-lg border border-white/10"
        >
          <h3 className="text-lg font-serif text-white mb-6 tracking-wide flex items-center">
            <FiActivity className="mr-2 text-luxury-gold" /> System Activity Log
          </h3>
          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
            {recentActivities.map((act, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-xs">
                <div className={`mt-0.5 p-1 rounded-full ${
                  act.type === 'booking' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {act.type === 'booking' ? <FiCalendar size={12} /> : <FiMail size={12} />}
                </div>
                <div className="flex-1">
                  <p className="text-gray-300">{act.message}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {new Date(act.time).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <div className="py-8 text-center text-gray-500 text-sm">No activity recorded.</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
