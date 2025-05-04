'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * EditTableModal - Component for managing table configuration
 * @param {Object} props - Component props
 * @param {Table} props.table - Table data to edit
 * @param {boolean} props.isOpen - Modal visibility state
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onUpdate - Success callback
 */
export default function EditTableModal({ table, isOpen, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    isAvailable: true,
    isDivisible: false,
    splitStatus: null,
    tableType: 'normal'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (table) {
      setFormData({
        tableNumber: table.tableNumber.toString(),
        capacity: table.capacity.toString(),
        isAvailable: table.isAvailable,
        isDivisible: table.isDivisible || false,
        splitStatus: table.splitStatus || null,
        tableType: table.tableType || 'normal'
      });
    }
  }, [table]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/tables/${table.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      onUpdate(data);
      onClose();
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#316160]/20"
        >
          <div className="p-8 bg-gradient-to-br from-[#316160]/5 to-[#316160]/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#316160] to-[#316160]/70 bg-clip-text text-transparent">
                Table Configuration
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#316160]/10 rounded-full transition-colors duration-200 text-[#316160]/60 hover:text-[#316160]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="absolute left-3 -top-2.5 bg-white/80 px-2 text-sm font-medium text-[#316160]/80">
                    Table Number
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="tableNumber"
                      value={formData.tableNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#316160]/20 bg-white/80 focus:border-[#316160] focus:ring-2 focus:ring-[#316160]/20 transition-all pr-12"
                      min="1"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${formData.isAvailable ? 'bg-emerald-500/90' : 'bg-rose-500/90'} shadow-inner`} />
                      <span className="text-xs font-medium text-[#316160]/60">
                        {formData.isAvailable ? 'Available' : 'Occupied'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <label className="absolute left-3 -top-2.5 bg-white/80 px-2 text-sm font-medium text-[#316160]/80">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#316160]/20 bg-white/80 focus:border-[#316160] focus:ring-2 focus:ring-[#316160]/20 transition-all"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-[#316160]/80 mb-2">
                  Table Type
                </label>
                <select
                  name="tableType"
                  value={formData.tableType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#316160]/20 bg-white/80 focus:border-[#316160] focus:ring-2 focus:ring-[#316160]/20 transition-all appearance-none"
                >
                  <option value="normal">Standard Table</option>
                  <option value="business">Business Booth</option>
                  <option value="dinner">Fine Dining</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/80 border border-[#316160]/10 hover:border-[#316160]/30 transition-all cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id="isAvailable"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#316160] rounded focus:ring-[#316160]"
                  />
                  <span className="text-sm text-[#316160]/80">Available</span>
                </motion.label>

                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/80 border border-[#316160]/10 hover:border-[#316160]/30 transition-all cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id="isDivisible"
                    name="isDivisible"
                    checked={formData.isDivisible}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#316160] rounded focus:ring-[#316160]"
                  />
                  <span className="text-sm text-[#316160]/80">Divisible</span>
                </motion.label>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50/80 text-red-600 rounded-lg text-sm border border-red-100"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex justify-end gap-3 pt-6">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-3 text-sm font-medium text-[#316160] bg-white/80 hover:bg-[#316160]/5 rounded-xl transition-all border border-[#316160]/10"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-br from-[#316160] to-[#316160]/90 hover:from-[#316160]/90 hover:to-[#316160] rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-white/80 border-t-transparent rounded-full" />
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

EditTableModal.propTypes = {
  table: PropTypes.shape({
    id: PropTypes.string.isRequired,
    tableNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    capacity: PropTypes.number.isRequired,
    isAvailable: PropTypes.bool,
    isDivisible: PropTypes.bool,
    tableType: PropTypes.oneOf(['normal', 'business', 'dinner'])
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired
};
