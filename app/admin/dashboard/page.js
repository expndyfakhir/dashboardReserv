'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { BellIcon, TrashIcon } from '@heroicons/react/24/outline';
import NotificationSound from '../../components/NotificationSound';
import { motion } from 'framer-motion';
export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState({
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  });
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedNotifications = localStorage.getItem('dashboardNotifications');
      return savedNotifications ? JSON.parse(savedNotifications) : [];
    }
    return [];
  });

  const clearNotifications = () => {
    setNotifications([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dashboardNotifications');
    }
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastExternalReservationId, setLastExternalReservationId] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Handle click outside notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('notifications-dropdown');
      const button = document.getElementById('notifications-button');
      if (dropdown && !dropdown.contains(event.target) && !button.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Removed date/time formatting as it's no longer needed

  // Check for new external reservations every 30 seconds
  useEffect(() => {
    const checkReservations = async () => {
      try {
        const response = await fetch('/api/reservations');
        if (!response.ok) throw new Error('Failed to fetch reservations');
        const data = await response.json();
        
        // Get all new reservations (both external and normal)
        const latestReservations = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (latestReservations.length > 0) {
          const latestReservation = latestReservations[0];
          
          // If we have a new reservation
          if (lastExternalReservationId !== latestReservation.id) {
            setLastExternalReservationId(latestReservation.id);
            
            // Play notification sound
            try {
              if (typeof window !== 'undefined' && window.playReservationNotification) {
                window.playReservationNotification();
              }
            } catch (error) {
              console.error('Error playing notification sound:', error);
            }
            
            // Format time
            const timeString = new Date().toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
            
            // Add notification with more details
            const newNotification = {
              id: Date.now(),
              message: `New ${latestReservation.reservationType} reservation by ${latestReservation.customerName} for ${latestReservation.partySize} guests at ${timeString}`,
              time: 'Just now',
              type: latestReservation.status === 'confirmed' ? 'success' : 'warning'
            };
            
            // Update notifications list with max 10 items, preventing duplicates
            setNotifications(prev => {
              // Check if notification with same message already exists
              const isDuplicate = prev.some(notification => 
                notification.message === newNotification.message
              );
              
              // Only add if not a duplicate
              if (!isDuplicate) {
                const updatedNotifications = [newNotification, ...prev].slice(0, 10);
                // Save to localStorage
                if (typeof window !== 'undefined') {
                  localStorage.setItem('dashboardNotifications', JSON.stringify(updatedNotifications));
                }
                return updatedNotifications;
              }
              return prev;
            });
          }
        }
      } catch (error) {
        console.error('Error checking reservations:', error);
      }
    };

    // Initial check
    checkReservations();

    // Set up interval for more frequent checks (every 10 seconds)
    const timer = setInterval(checkReservations, 10000);

    return () => clearInterval(timer);
  }, [lastExternalReservationId]);

  // Update date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime({
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      });
    }, 60000); // Update every minute

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

        // Fetch reservations for today and next hour
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000));
        
        const reservationsRes = await fetch('/api/reservations/upcoming');
        if (!reservationsRes.ok) {
          throw new Error('Failed to fetch upcoming reservations');
        }
        let upcomingReservations = await reservationsRes.json();
        
        // No need to filter here since the API already returns correctly filtered data
        upcomingReservations = upcomingReservations.sort((a, b) => {
          const timeA = new Date(`${a.date}T${a.time}`);
          const timeB = new Date(`${b.date}T${b.time}`);
          return timeA - timeB;
        });

        setStats(statsData);
        setReservations(upcomingReservations);
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
    <div className="min-h-screen bg-gradient-to-br from-[#316160]/5 to-[#316160]/10 p-8">
      <div className="flex items-center justify-end mb-8">
        <div className="relative">
          <button
            id="notifications-button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 relative group shadow-lg border border-[#316160]/10"
          >
            <BellIcon className="h-6 w-6 text-[#316160]" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {isNotificationsOpen && notifications.length > 0 && (
            <div id="notifications-dropdown" className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-[#316160]/10 overflow-hidden z-50">
              <div className="p-4 border-b border-[#316160]/10 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-[#316160]">Notifications</h3>
                <button
                  onClick={clearNotifications}
                  className="text-rose-500 hover:text-rose-600 transition-colors duration-200 flex items-center gap-1 text-sm font-medium"
                >
                  <TrashIcon className="h-4 w-4" />
                  Clear All
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 hover:bg-[#316160]/5 transition-colors duration-200 border-b border-[#316160]/10 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl ${notification.type === 'success' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                        <BellIcon className={`h-5 w-5 ${notification.type === 'success' ? 'text-emerald-600' : 'text-amber-600'}`} />
                      </div>
                      <div>
                        <p className="text-sm text-[#316160]">{notification.message}</p>
                        <p className="text-xs text-[#316160]/60 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <NotificationSound />
      {/* Header Section */}
    

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
        {/* Tables Status Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/50 overflow-hidden transform transition-all duration-300 hover:shadow-xl"
        >
          <div className="p-6 border-b border-slate-200/50">
            <h2 className="text-xl font-semibold text-slate-800">Tables Status</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: parseInt(stats?.totalTables?.value || 0) }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-[#316160]/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2"
                >
                  <div className="text-2xl">🪑</div>
                  <div className="text-lg font-semibold text-[#316160]">Table {index + 1}</div>
                  <div className="text-sm text-[#316160]/70">Capacity: 4-6</div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    Available
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        {/* Recent Reservations */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/50 overflow-hidden transform transition-all duration-300 hover:shadow-xl"
        >
          <div className="p-6 border-b border-slate-200/50">
            <h2 className="text-xl font-semibold text-slate-800">Today's Upcoming Reservations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact Info</th>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{reservation.customerName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-500">{reservation.customerPhone}</div>
                      <div className="text-sm text-slate-500">{reservation.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(reservation.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {reservation.time}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset
                        ${reservation.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                          reservation.status === 'pending' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' :
                          'bg-rose-50 text-rose-700 ring-rose-600/20'}`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>


      </div>
    </div>
  );
}
