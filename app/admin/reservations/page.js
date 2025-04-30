'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CalendarIcon, ListBulletIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import ReservationListTable from '../../components/ReservationListTable';
import ReservationForm from '../../components/ReservationForm';

const initialFormState = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  partySize: '',
  date: '',
  time: '',
  specialRequests: '',
  tableId: '',
  reservationType: 'normal'
};

export default function ReservationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [availableTables, setAvailableTables] = useState([]);
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { 
    fetchReservations(); 
  }, []);

  useEffect(() => {
    if (formData.partySize && formData.date && formData.time) {
      fetchAvailableTables();
    }
  }, [formData.partySize, formData.date, formData.time]);

  const fetchReservations = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/reservations');
      if (!response.ok) throw new Error('Failed to fetch reservations');
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async (reservationId) => {
    const toastId = toast.custom(
      (t) => (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => toast.dismiss(t.id)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 relative z-10 border border-red-100"
          >
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center shadow-inner">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">Delete Reservation</h3>
                <p className="text-gray-600 text-lg">Are you sure you want to delete this reservation?</p>
                <p className="text-red-500 text-sm font-medium">This action cannot be undone.</p>
              </div>
              <div className="flex gap-4 w-full">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toast.dismiss(t.id)}
                  className="flex-1 px-6 py-4 text-base font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors shadow-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    toast.dismiss(t.id);
                    handleConfirmDelete(reservationId);
                  }}
                  className="flex-1 px-6 py-4 text-base font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleConfirmDelete = async (reservationId) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete reservation');
      }

      toast.success('Reservation deleted successfully');
      fetchReservations(); // Refresh the reservations list
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update reservation status');
      }

      toast.success('Reservation status updated successfully');
      fetchReservations(); // Refresh the reservations list
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchAvailableTables = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        partySize: formData.partySize,
        date: formData.date,
        time: formData.time
      });
      
      const response = await fetch(`/api/tables/available?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tables');
      
      const data = await response.json();
      setAvailableTables(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create reservation');

      toast.success('Reservation created successfully');
      setFormData(initialFormState);
      fetchReservations();
      setView('list');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#316160]/5 to-[#316160]/10 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-[#316160]/10 p-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#316160] to-[#316160]/70 bg-clip-text text-transparent">
                Manage Reservations
              </h1>
              <p className="mt-2 text-[#316160]/60">
                Create and manage your restaurant's reservations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fetchReservations()}
                className="p-2 text-[#316160] hover:bg-[#316160]/5 rounded-xl transition-colors"
                disabled={refreshing}
              >
                <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>
              <div className="bg-[#316160]/5 rounded-xl p-1 flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${view === 'list' ? 'bg-[#316160] text-white' : 'text-[#316160] hover:bg-[#316160]/10'}`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                  List View
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('form')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${view === 'form' ? 'bg-[#316160] text-white' : 'text-[#316160] hover:bg-[#316160]/10'}`}
                >
                  <PlusIcon className="w-5 h-5" />
                  New Reservation
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <motion.div 
          key={view}
          initial={{ opacity: 0, x: view === 'list' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {view === 'list' ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-[#316160]/10 overflow-hidden">
              <ReservationListTable 
                reservations={reservations} 
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-[#316160]/10">
              <ReservationForm
                loading={loading}
                formData={formData}
                availableTables={availableTables}
                handleSubmit={handleSubmit}
                handleInputChange={handleInputChange}
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}