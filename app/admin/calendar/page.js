'use client';

import { useState, useEffect } from 'react';
import ReservationCalendar from '../../components/ReservationCalendar';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  ArrowPathIcon, 
  FunnelIcon, // Using FunnelIcon instead of FilterIcon
  ChevronLeftIcon, 
  ChevronRightIcon 
} from '@heroicons/react/24/outline';

export default function CalendarPage() {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState('all');

  useEffect(() => { 
    fetchReservations(); 
  }, []);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reservations');
      if (!response.ok) throw new Error('Failed to fetch reservations');
      const data = await response.json();
      // Filter out completed reservations
      const filteredData = data.filter(reservation => reservation.status !== 'completed');
      setReservations(filteredData);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateRange = () => {
    const options = { month: 'long', year: 'numeric' };
    if (view === 'day') {
      return new Date(currentDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } else if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', options);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#316160]/5 to-[#316160]/10 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-[#316160]/10 p-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-8 w-8 text-[#316160]" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#316160] to-[#316160]/70 bg-clip-text text-transparent">
                  Reservation Calendar
                </h1>
              </div>
              <p className="mt-2 text-[#316160]/60">
                View and manage your restaurant's reservations in calendar format
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchReservations}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#316160]/10 text-[#316160] hover:bg-[#316160]/20 transition-colors"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-[#316160]/10 overflow-hidden">
              <div className="px-6 py-5 border-b border-[#316160]/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handlePrevious}
                      className="p-2 rounded-lg hover:bg-[#316160]/10 text-[#316160]"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={handleNext}
                      className="p-2 rounded-lg hover:bg-[#316160]/10 text-[#316160]"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <h2 className="text-xl font-semibold text-[#316160]">{formatDateRange()}</h2>
                </div>
                
                <button 
                  onClick={handleToday}
                  className="px-4 py-2 rounded-xl bg-[#316160]/10 text-[#316160] hover:bg-[#316160]/20 transition-colors text-sm font-medium"
                >
                  Today
                </button>
              </div>
              
              <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#316160]"></div>
            </div>
          ) : (
            <ReservationCalendar reservations={reservations} />
          )}
              </div>
            </div>
            
            <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-[#316160]/10 p-6">
              <h3 className="text-lg font-medium text-[#316160] mb-4">Upcoming Reservations</h3>
              
              <div className="space-y-3">
                {reservations
                  .filter(r => new Date(r.date) >= new Date() && r.status !== 'completed')
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 3)
                  .map((reservation, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 rounded-xl bg-[#316160]/5 hover:bg-[#316160]/10 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-[#316160]">{reservation.customerName}</p>
                        <p className="text-sm text-[#316160]/70">
                          {new Date(reservation.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          reservation.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                          reservation.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                
                {reservations.filter(r => new Date(r.date) >= new Date()).length === 0 && (
                  <div className="text-center py-6 text-[#316160]/60">
                    No upcoming reservations
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
