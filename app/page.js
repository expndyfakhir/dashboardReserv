'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { CalendarIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          date: new Date(data.date).toISOString()
        })
      });
      if (response.ok) setSubmitted(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/restaurant-bg.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">El Manzah Restaurant</h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Experience the finest Mediterranean cuisine in an elegant and welcoming atmosphere</p>
            <button className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full transition-all duration-200 transform hover:scale-105">
              View Menu
            </button>
          </div>
        </div>
      </div>

      {/* Reservation Form Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl border border-amber-100/50 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Make a Reservation</h2>
            <p className="text-gray-600">Book your table for an unforgettable dining experience</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  {...register('name', { required: true })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  placeholder="Your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <div className="relative">
                  <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('date', { required: true })}
                    type="date"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <div className="relative">
                  <ClockIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('time', { required: true })}
                    type="time"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Party Size</label>
                <div className="relative">
                  <UserGroupIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('partySize', { required: true, min: 1 })}
                    type="number"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                    placeholder="Number of guests"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  {...register('phone', { required: true })}
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  placeholder="Your phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
              <textarea
                {...register('specialRequests')}
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                placeholder="Any special requirements or notes..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.01] focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              Book Table
            </button>

            {submitted && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-center">
                Thank you for your reservation! We'll confirm your booking shortly.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}