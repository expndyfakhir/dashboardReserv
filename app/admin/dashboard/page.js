'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { BellIcon, CogIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format current time and date
  const formatDateTime = () => {
    const now = new Date();
    return {
      time: now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      date: now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    };
  };

  const [currentDateTime, setCurrentDateTime] = useState(formatDateTime());

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentDateTime(formatDateTime());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch reservation counts
        const countsRes = await fetch('/api/reservations/count');
        const countsData = await countsRes.json();

        if (!countsRes.ok) {
          throw new Error(countsData.error || 'Failed to fetch reservation counts');
        }

        // Fetch total tables count
        const tablesRes = await fetch('/api/tables/count');
        const tablesData = await tablesRes.json();

        if (!tablesRes.ok) {
          throw new Error(tablesData.error || 'Failed to fetch tables count');
        }

        // Fetch admin count (only for SUPER_ADMIN)
        let adminCount = 0;
        if (session?.user?.role === 'SUPER_ADMIN') {
          const adminsRes = await fetch('/api/users/count');
          const adminsData = await adminsRes.json();

          if (!adminsRes.ok) {
            throw new Error(adminsData.message || 'Failed to fetch admin count');
          }

          adminCount = adminsData.count;
        }

        // Prepare stats data
        const statsData = {
          totalReservations: { value: countsData.totalReservations.toString(), change: '+8.2%', trend: 'up' },
          confirmedReservations: { value: countsData.confirmedReservations.toString(), change: '+10.5%', trend: 'up' },
          pendingReservations: { value: countsData.pendingReservations.toString(), change: '-2.3%', trend: 'down' },
          totalTables: { value: tablesData.count.toString(), change: '+4.3%', trend: 'up' },
          ...(session?.user?.role === 'SUPER_ADMIN' && {
            totalAdmins: { value: adminCount.toString(), change: '+20%', trend: 'up' }
          })
        };

        // Fetch recent reservations
        const recentReservations = [
          { id: '#RES-001', customer: 'Emma Thompson', date: 'Today, 19:30', guests: 4, status: 'Confirmed', phone: '(555) 123-4567' },
          { id: '#RES-002', customer: 'Michael Johnson', date: 'Today, 20:00', guests: 2, status: 'Pending', phone: '(555) 234-5678' },
          { id: '#RES-003', customer: 'Sophia Davis', date: 'Today, 21:15', guests: 6, status: 'Confirmed', phone: '(555) 345-6789' }
        ];

        // Fetch notifications
        const recentNotifications = [
          { id: 1, message: 'New reservation by Emma Thompson for 4 guests', time: '5 min ago', type: 'success' },
          { id: 2, message: 'Reservation #RES-004 cancelled', time: '15 min ago', type: 'warning' },
          { id: 3, message: 'Low inventory alert: Truffle Pasta', time: '1 hr ago', type: 'error' }
        ];

        setStats(statsData);
        setReservations(recentReservations);
        setNotifications(recentNotifications);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#316160]/5 to-[#316160]/10 flex items-center justify-center">
        <div className="p-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-[#316160]/10 relative">
          <div className="w-16 h-16 relative animate-spin">
            <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-[#316160] border-l-[#316160]/50 border-r-[#316160]/30"></div>
            <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-[#316160]/80 border-l-[#316160]/40 border-r-[#316160]/20 animate-spin"></div>
          </div>
          <div className="mt-4 text-[#316160]/70 text-sm font-medium">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex items-center justify-between bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-slate-200/50 p-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#316160] to-[#316160]/60 bg-clip-text text-transparent">Dashboard Overview</h1>
          <p className="mt-3 text-sm text-slate-500 flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#316160]/10 text-[#316160] ring-1 ring-inset ring-[#316160]/20">
              {currentDateTime.date}
            </span>
            <span>•</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#316160]/10 text-[#316160] ring-1 ring-inset ring-[#316160]/20">
              {currentDateTime.time}
            </span>
          </p>
          <p className="mt-3 text-sm font-medium text-slate-700 flex items-center gap-3">
            Welcome back, <span className="text-indigo-600 font-semibold">{session?.user?.name}</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20">
              {session?.user?.role || 'Admin'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 text-slate-600 hover:text-indigo-600 transition-colors duration-200 bg-slate-50 rounded-xl hover:bg-slate-100"
          >
            <BellIcon className="h-6 w-6" />
          </motion.button>
          {session?.user?.role === 'SUPER_ADMIN' && (
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 text-slate-600 hover:text-indigo-600 transition-colors duration-200 bg-slate-50 rounded-xl hover:bg-slate-100"
            >
              <UserIcon className="h-6 w-6" />
            </motion.button>
          )}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 text-slate-600 hover:text-indigo-600 transition-colors duration-200 bg-slate-50 rounded-xl hover:bg-slate-100"
          >
            <CogIcon className="h-6 w-6" />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
        {Object.entries(stats).map(([key, stat], index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            key={key}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-slate-200/50 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <span className="text-2xl">
                  {key === 'totalReservations' ? '📊' : 
                   key === 'confirmedReservations' ? '✅' : 
                   key === 'pendingReservations' ? '⏳' : 
                   key === 'totalTables' ? '🪑' : 
                   key === 'totalAdmins' ? '👥' : '📈'}
                </span>
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-2">{stat.value}</h3>
            <p className="text-sm font-medium text-slate-500">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reservations */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/50 overflow-hidden transform transition-all duration-300 hover:shadow-xl"
        >
          <div className="p-6 border-b border-slate-200/50">
            <h2 className="text-xl font-semibold text-slate-800">Recent Reservations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {reservations.map((reservation, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    key={reservation.id} 
                    className="hover:bg-slate-50/50 transition-all duration-300 ease-in-out transform hover:scale-[1.01]"
                  >
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{reservation.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{reservation.customer}</div>
                          <div className="text-sm text-slate-500">{reservation.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{reservation.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset
                        ${reservation.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                          reservation.status === 'Pending' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' :
                          'bg-rose-50 text-rose-700 ring-rose-600/20'}`}>
                        {reservation.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Side Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Notifications */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/50 overflow-hidden">
            <div className="p-6 border-b border-slate-200/50">
              <h2 className="text-xl font-semibold text-slate-800">Recent Notifications</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    key={notification.id} 
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50/50 transition-colors duration-200"
                  >
                    <div className={`p-2 rounded-xl
                      ${notification.type === 'success' ? 'bg-emerald-50' :
                        notification.type === 'warning' ? 'bg-amber-50' :
                        'bg-rose-50'}`}>
                      <BellIcon className={`h-5 w-5
                        ${notification.type === 'success' ? 'text-emerald-600' :
                          notification.type === 'warning' ? 'text-amber-600' :
                          'text-rose-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{notification.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}