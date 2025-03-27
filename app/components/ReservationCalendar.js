'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';

export default function ReservationCalendar() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations');
      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }
      const data = await response.json();
      
      // Transform reservations into calendar events
      const events = data.map(reservation => ({
        id: reservation.id,
        title: `${reservation.customerName} (${reservation.partySize} guests)`,
        start: `${format(new Date(reservation.date), 'yyyy-MM-dd')}T${reservation.time}`,
        end: calculateEndTime(reservation.time),
        extendedProps: {
          tableNumber: reservation.table?.tableNumber,
          status: reservation.status,
          customerEmail: reservation.customerEmail,
          customerPhone: reservation.customerPhone,
          specialRequests: reservation.specialRequests
        },
        backgroundColor: getStatusColor(reservation.status),
        borderColor: getStatusColor(reservation.status)
      }));

      setReservations(events);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    date.setHours(date.getHours() + 2); // Assuming 2-hour reservation slots
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffa500',
      confirmed: '#4CAF50',
      cancelled: '#f44336',
      completed: '#9e9e9e'
    };
    return colors[status] || '#2196F3';
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const props = event.extendedProps;
    
    alert(
      `Reservation Details:\n\n` +
      `Customer: ${event.title}\n` +
      `Table: ${props.tableNumber}\n` +
      `Status: ${props.status}\n` +
      `Email: ${props.customerEmail}\n` +
      `Phone: ${props.customerPhone}\n` +
      `Special Requests: ${props.specialRequests || 'None'}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-[#316160]/10 relative">
          <div className="w-12 h-12 relative animate-spin">
            <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-[#316160] border-l-[#316160]/50 border-r-[#316160]/30"></div>
            <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-[#316160]/80 border-l-[#316160]/40 border-r-[#316160]/20 animate-spin"></div>
          </div>
          <div className="mt-3 text-[#316160]/70 text-sm font-medium">Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[800px] p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        slotMinTime="09:00:00"
        slotMaxTime="23:00:00"
        events={reservations}
        eventClick={handleEventClick}
        height="100%"
        allDaySlot={false}
        slotDuration="00:30:00"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }}
      />
    </div>
  );
}