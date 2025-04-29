'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import FormField from './FormField';

export default function ReservationForm() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    partySize: '',
    date: '',
    time: '',
    specialRequests: '',
    tableId: ''
  });

  const [availableTables, setAvailableTables] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formData.partySize && formData.date && formData.time) {
      fetchAvailableTables();
    }
  }, [formData.partySize, formData.date, formData.time]);

  const fetchAvailableTables = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/tables/available?partySize=${formData.partySize}&date=${formData.date}&time=${formData.time}`
      );
      const data = await response.json();
      if (response.ok) {
        setAvailableTables(data);
      } else {
        toast.error('Failed to fetch available tables');
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Error fetching available tables');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Reservation created successfully!');
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          partySize: '',
          date: '',
          time: '',
          specialRequests: '',
          tableId: ''
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create reservation');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Error creating reservation');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-[#316160]/10">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#316160]">New Reservation</h2>
          {loading && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#316160]"></div>
              <span className="text-sm text-[#316160]/70">Loading...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#316160]/80">Customer Information</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                label="Customer Name"
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                placeholder="Enter customer name"
              />
              <FormField
                label="Email Address"
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                required
                placeholder="Enter email address"
              />
              <FormField
                label="Phone Number"
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                required
                placeholder="Enter phone number"
              />
              <FormField
                label="Party Size"
                type="number"
                name="partySize"
                value={formData.partySize}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="Enter party size"
              />
            </div>
          </div>

          {/* Reservation Details Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#316160]/80">Reservation Details</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                label="Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
              <FormField
                label="Time"
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Table Selection Section */}
          {formData.partySize && formData.date && formData.time && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#316160]/80">Table Selection</h3>
              <div className="bg-[#316160]/5 rounded-2xl p-6">
                <select
                  name="tableId"
                  value={formData.tableId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#316160]/20 bg-white shadow-sm focus:ring-2 focus:ring-[#316160] focus:border-transparent transition duration-200"
                >
                  <option value="">Select a table</option>
                  {availableTables.map(table => (
                    <option key={table.id} value={table.id}>
                      Table {table.tableNumber} - {table.capacity} seats
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Special Requests Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#316160]/80">Additional Information</h3>
            <FormField
              label="Special Requests"
              type="textarea"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows="4"
              placeholder="Any special requirements or notes..."
              className="w-full px-4 py-3 rounded-xl border-2 border-[#316160]/20"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-[#316160] text-white rounded-xl font-medium shadow-lg shadow-[#316160]/20 hover:shadow-[#316160]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Reservation...' : 'Create Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}