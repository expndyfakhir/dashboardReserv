'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EditTableModal from '@/app/components/EditTableModal';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function TablesManagement() {
  const router = useRouter();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    isDivisible: false,
    tableType: 'normal'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const handleEditClick = (table) => {
    setSelectedTable(table);
    setIsEditModalOpen(true);
  };

  const handleUpdateTable = (updatedTable) => {
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === updatedTable.id ? updatedTable : table
      )
    );
    fetchTables(); // Refresh table list
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
  
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
  
      setSuccess('Table added successfully!');
      setFormData({ tableNumber: '', capacity: '', isDivisible: false, tableType: 'normal' });
      await fetchTables();
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    
    try {
      const response = await fetch(`/api/tables?id=${tableId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete table');
      }
  
      setTables(prevTables => prevTables.filter(table => table.id !== tableId));
      setSuccess('Table deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#316160]/5 to-[#316160]/10 p-8">
      <div className="flex items-center justify-between mb-8">
      
        
      </div>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-[#316160]/10 p-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#316160] to-[#316160]/70 bg-clip-text text-transparent">Table Management</h1>
            <p className="mt-2 text-[#316160]/60">Manage your restaurant's table layout and settings</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-4 py-2 rounded-xl bg-[#316160]/10 text-[#316160] font-medium">
              {tables.length} Tables
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add New Table Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-[#316160]/10 p-8 sticky top-8">
              <h2 className="text-2xl font-semibold text-[#316160] mb-6">Add New Table</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  <div className="relative group">
                    <label 
                      htmlFor="tableNumber" 
                      className="absolute left-3 -top-2.5 bg-white px-2 text-sm font-medium text-[#316160]/80 transition-all duration-200 group-focus-within:text-[#316160]"
                    >
                      Table Number
                    </label>
                    <input
                      type="number"
                      id="tableNumber"
                      name="tableNumber"
                      value={formData.tableNumber}
                      onChange={handleChange}
                      required
                      min="1"
                      className="block w-full px-4 py-3 rounded-xl border-2 border-[#316160]/20 bg-white shadow-sm focus:border-[#316160] focus:ring focus:ring-[#316160]/20 sm:text-sm transition-all duration-200 hover:border-[#316160]/40 placeholder-[#316160]/40"
                      placeholder="Enter table number"
                    />
                  </div>

                  <div className="relative group">
                    <label 
                      htmlFor="capacity" 
                      className="absolute left-3 -top-2.5 bg-white px-2 text-sm font-medium text-[#316160]/80 transition-all duration-200 group-focus-within:text-[#316160]"
                    >
                      Capacity
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
                      min="1"
                      className="block w-full px-4 py-3 rounded-xl border-2 border-[#316160]/20 bg-white shadow-sm focus:border-[#316160] focus:ring focus:ring-[#316160]/20 sm:text-sm transition-all duration-200 hover:border-[#316160]/40 placeholder-[#316160]/40"
                      placeholder="Enter seating capacity"
                    />
                  </div>

                  <div className="relative group">
                    <label 
                      htmlFor="tableType" 
                      className="absolute left-3 -top-2.5 bg-white px-2 text-sm font-medium text-[#316160]/80 transition-all duration-200 group-focus-within:text-[#316160]"
                    >
                      Table Type
                    </label>
                    <select
                      id="tableType"
                      name="tableType"
                      value={formData.tableType}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 rounded-xl border-2 border-[#316160]/20 bg-white shadow-sm focus:border-[#316160] focus:ring focus:ring-[#316160]/20 sm:text-sm transition-all duration-200 hover:border-[#316160]/40 appearance-none cursor-pointer"
                    >
                      <option value="normal">Normal</option>
                      <option value="business">Business</option>
                      <option value="dinner">Dinner</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-[#316160]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center p-4 rounded-xl border-2 border-[#316160]/20 hover:border-[#316160]/40 transition-all duration-200 cursor-pointer group/checkbox">
                    <input
                      type="checkbox"
                      id="isDivisible"
                      name="isDivisible"
                      checked={formData.isDivisible}
                      onChange={handleChange}
                      className="h-5 w-5 text-[#316160] focus:ring-2 focus:ring-[#316160]/20 border-2 border-[#316160]/30 rounded transition-colors duration-200 cursor-pointer"
                    />
                    <label htmlFor="isDivisible" className="ml-3 text-sm text-[#316160]/80 group-hover/checkbox:text-[#316160] transition-colors duration-200 cursor-pointer select-none">
                      Is Divisible
                    </label>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm"
                  >
                    {success}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-gradient-to-r from-[#316160] to-[#316160]/80 hover:from-[#316160]/90 hover:to-[#316160]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#316160] transform transition-all duration-200 hover:scale-[1.02] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Adding...' : 'Add Table'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Tables Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/50 p-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Table Layout</h2>
              <div className="relative w-full h-[600px] bg-[#f8f9fa] rounded-2xl p-6 overflow-auto">
                <div className="grid grid-cols-4 gap-8 p-4">
                  {tables.map(table => {
                    const isRound = table.tableType === 'dinner';
                    const isRectangle = table.tableType === 'business';
                    const tableSize = table.capacity > 6 ? 'w-48 h-32' : 'w-40 h-28';
                    
                    return (
                      <motion.div 
                        key={table.id}
                        whileHover={{ scale: 1.02 }}
                        className="relative"
                      >
                        <div 
                          className={`
                            ${tableSize}
                            ${isRound ? 'rounded-full' : isRectangle ? 'rounded-[2rem]' : 'rounded-xl'}
                            bg-[#e8d5b7] border-2 border-[#8b7355]
                            shadow-lg cursor-pointer
                            flex items-center justify-center
                            transform transition-all duration-300
                            relative
                          `}
                          onClick={() => handleEditClick(table)}
                        >
                          {/* Table surface pattern */}
                          <div className="absolute inset-0 bg-[url('/wood-pattern.png')] opacity-30 rounded-inherit" />
                          
                          {/* Status indicator */}
                          <div className={`absolute top-0 left-0 right-0 h-1.5 ${table.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          
                          {/* Chairs */}
                          {[...Array(Math.min(table.capacity, 8))].map((_, index) => {
                            const angle = (index * (360 / Math.min(table.capacity, 8))) * (Math.PI / 180);
                            const radius = isRound ? 32 : 28;
                            const left = 50 + Math.cos(angle) * radius;
                            const top = 50 + Math.sin(angle) * radius;
                            
                            return (
                              <div
                                key={index}
                                className="absolute w-4 h-4 bg-[#6b5b45] rounded-full transform -translate-x-1/2 -translate-y-1/2"
                                style={{
                                  left: `${left}%`,
                                  top: `${top}%`,
                                }}
                              />
                            );
                          })}
                          
                          {/* Table information */}
                          <div className="z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm text-center">
                            <p className="font-semibold text-slate-800">Table {table.tableNumber}</p>
                            <p className="text-xs text-slate-600">{table.capacity} Seats</p>
                          </div>
                        </div>
                        
                        {/* Table status badge */}
                        <div className="absolute -top-2 -right-2">
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium shadow-sm
                            ${table.isAvailable ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/20'}
                          `}>
                            {table.isAvailable ? 'Available' : 'Occupied'}
                          </span>
                        </div>
                        
                        {/* Delete Button */}
                        <div className="absolute -bottom-2 -right-2 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTable(table.id);
                            }}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-rose-50 text-rose-600 hover:text-rose-700 transition-colors duration-200 border border-slate-200 hover:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                            title="Delete table"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <EditTableModal
        table={selectedTable}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdateTable}
      />
    </div>
  );
}