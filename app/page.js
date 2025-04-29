'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, UserGroupIcon, ClockIcon, PhoneIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (formData) => {
    try {
      const reservationData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        date: formData.date,
        time: formData.time,
        partySize: parseInt(formData.partySize),
        specialRequests: formData.specialRequests || '',
        reservationType: 'normal', // Default reservation type
        status: 'pending'
      };

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create reservation');
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Reservation Error:', error);
      alert(`Reservation failed: ${error.message}`);
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/restaurant-bg.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-r from-[#316160]/90 to-[#2a5251]/90 backdrop-blur-sm"></div>
        </div>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32"
        >
          <motion.div variants={fadeInUp} className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-400">
                El Manzah
              </span><br/>
              <span className="text-3xl sm:text-4xl font-light">Mediterranean Cuisine</span>
            </h1>
            <motion.p variants={fadeInUp} className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Where tradition meets modern gastronomy
            </motion.p>
            <motion.div variants={fadeInUp}>
              <button className="inline-flex items-center px-8 py-3 bg-amber-400 hover:bg-amber-500 text-[#316160] font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-400/30">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Book Experience
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Reservation Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto px-4 py-16 lg:py-24"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-[#316160]/10 p-8 lg:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#316160] mb-3">
              Reserve Your Table
            </h2>
            <p className="text-[#316160]/80 text-lg">
              Experience culinary excellence - Secure your spot today
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-medium text-[#316160]/80 mb-2">Full Name</label>
                <div className="relative">
                  <input
                    {...register('name', { required: true })}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-[#316160]/20 focus:border-[#316160]/40 focus:ring-2 focus:ring-[#316160]/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="John Doe"
                  />
                  <UserGroupIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#316160]/60" />
                </div>
              </motion.div>

              {/* Email Field */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-medium text-[#316160]/80 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                    type="email"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-[#316160]/20 focus:border-[#316160]/40 focus:ring-2 focus:ring-[#316160]/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="john@example.com"
                  />
                  <svg 
                    className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#316160]/60" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </motion.div>

              {/* Date Field */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-medium text-[#316160]/80 mb-2">Reservation Date</label>
                <div className="relative">
                  <input
                    {...register('date', { required: true })}
                    type="date"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-[#316160]/20 focus:border-[#316160]/40 focus:ring-2 focus:ring-[#316160]/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                  <CalendarIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#316160]/60" />
                </div>
              </motion.div>

              {/* Time Field */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-medium text-[#316160]/80 mb-2">Preferred Time</label>
                <div className="relative">
                  <input
                    {...register('time', { required: true })}
                    type="time"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-[#316160]/20 focus:border-[#316160]/40 focus:ring-2 focus:ring-[#316160]/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                  <ClockIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#316160]/60" />
                </div>
              </motion.div>

              {/* Party Size */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-medium text-[#316160]/80 mb-2">Guests</label>
                <div className="relative">
                  <input
                    {...register('partySize', { required: true, min: 1 })}
                    type="number"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-[#316160]/20 focus:border-[#316160]/40 focus:ring-2 focus:ring-[#316160]/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="2"
                    min="1"
                  />
                  <UserGroupIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#316160]/60" />
                </div>
              </motion.div>

              {/* Phone Field */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-medium text-[#316160]/80 mb-2">Contact Number</label>
                <div className="relative">
                  <input
                    {...register('phone', { required: true })}
                    type="tel"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-[#316160]/20 focus:border-[#316160]/40 focus:ring-2 focus:ring-[#316160]/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="+212 600-000000"
                  />
                  <PhoneIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#316160]/60" />
                </div>
              </motion.div>
            </div>

            {/* Special Requests */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-[#316160]/80 mb-2">Special Requests</label>
              <div className="relative">
                <textarea
                  {...register('specialRequests')}
                  rows="4"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-[#316160]/20 focus:border-[#316160]/40 focus:ring-2 focus:ring-[#316160]/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Dietary restrictions, celebrations, or special accommodations..."
                ></textarea>
                <ChatBubbleOvalLeftIcon className="w-5 h-5 absolute left-4 top-4 text-[#316160]/60" />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div 
              variants={fadeInUp}
              className="pt-6"
            >
              <button
                type="submit"
                className="w-full py-4 px-6 bg-gradient-to-r from-[#316160] to-[#2a5251] hover:from-[#2a5251] hover:to-[#316160] text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.01] shadow-lg hover:shadow-[#316160]/30"
              >
                Confirm Reservation
              </button>
            </motion.div>

            {/* Success Message */}
            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3"
              >
                <svg 
                  className="w-5 h-5 text-emerald-600 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-emerald-700">Reservation received! We'll send confirmation to your email shortly.</p>
              </motion.div>
            )}
          </form>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-6 bg-white rounded-2xl border border-[#316160]/10 hover:border-[#316160]/20 transition-all"
          >
            <div className="w-12 h-12 bg-[#316160]/10 rounded-xl flex items-center justify-center mb-4">
              <CalendarIcon className="w-6 h-6 text-[#316160]" />
            </div>
            <h3 className="text-xl font-semibold text-[#316160] mb-2">Flexible Booking</h3>
            <p className="text-[#316160]/80">Easy online reservations with instant confirmation</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="p-6 bg-white rounded-2xl border border-[#316160]/10 hover:border-[#316160]/20 transition-all"
          >
            <div className="w-12 h-12 bg-[#316160]/10 rounded-xl flex items-center justify-center mb-4">
              <UserGroupIcon className="w-6 h-6 text-[#316160]" />
            </div>
            <h3 className="text-xl font-semibold text-[#316160] mb-2">Group Events</h3>
            <p className="text-[#316160]/80">Special arrangements for parties and celebrations</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="p-6 bg-white rounded-2xl border border-[#316160]/10 hover:border-[#316160]/20 transition-all"
          >
            <div className="w-12 h-12 bg-[#316160]/10 rounded-xl flex items-center justify-center mb-4">
              <svg 
                className="w-6 h-6 text-[#316160]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#316160] mb-2">Open Late</h3>
            <p className="text-[#316160]/80">Nightly service until 11 PM for late dining</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
