'use client';

import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserGroupIcon, TableCellsIcon, EnvelopeIcon, PhoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function ReservationCalendar({ reservations: propReservations }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (propReservations) {
      transformReservations(propReservations);
    }
  }, [propReservations]);

  useEffect(() => {
    // Close modal when clicking outside
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedEvent(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalRef]);

  const transformReservations = (reservations) => {
    try {
      // Transform reservations into calendar events
      const transformedEvents = reservations.map(reservation => ({
        id: reservation.id,
        title: `${reservation.customerName} (${reservation.partySize} guests)`,
        start: `${format(new Date(reservation.date), 'yyyy-MM-dd')}T${reservation.time}`,
        end: calculateEndTime(reservation.time),
        extendedProps: {
          tableNumber: reservation.table?.tableNumber,
          status: reservation.status,
          customerEmail: reservation.customerEmail,
          customerPhone: reservation.customerPhone,
          specialRequests: reservation.specialRequests,
          partySize: reservation.partySize,
          customerName: reservation.customerName
        },
        backgroundColor: getStatusColor(reservation.status).bg,
        borderColor: getStatusColor(reservation.status).border,
        textColor: getStatusColor(reservation.status).text,
        classNames: ['modern-event']
      }));

      setEvents(transformedEvents);
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
      pending: {
        bg: 'linear-gradient(135deg, rgba(255,165,0,0.8) 0%, rgba(255,140,0,0.9) 100%)',
        border: '#ff8c00',
        text: '#ffffff'
      },
      confirmed: {
        bg: 'linear-gradient(135deg, rgba(76,175,80,0.8) 0%, rgba(56,142,60,0.9) 100%)',
        border: '#388e3c',
        text: '#ffffff'
      },
      cancelled: {
        bg: 'linear-gradient(135deg, rgba(244,67,54,0.8) 0%, rgba(211,47,47,0.9) 100%)',
        border: '#d32f2f',
        text: '#ffffff'
      },
      completed: {
        bg: 'linear-gradient(135deg, rgba(158,158,158,0.8) 0%, rgba(117,117,117,0.9) 100%)',
        border: '#757575',
        text: '#ffffff'
      }
    };
    return colors[status] || {
      bg: 'linear-gradient(135deg, rgba(33,150,243,0.8) 0%, rgba(30,136,229,0.9) 100%)',
      border: '#1e88e5',
      text: '#ffffff'
    };
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'bg-amber-100 text-amber-800 border-amber-300',
      confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      cancelled: 'bg-rose-100 text-rose-800 border-rose-300',
      completed: 'bg-slate-100 text-slate-800 border-slate-300'
    };
    return classes[status] || 'bg-blue-100 text-blue-800 border-blue-300';
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
    <div className="h-[800px] p-4 relative">
      {/* Custom CSS for FullCalendar */}
      <style jsx global>{`
        .fc {
          --fc-border-color: rgba(49, 97, 96, 0.1);
          --fc-today-bg-color: rgba(49, 97, 96, 0.05);
          --fc-neutral-bg-color: rgba(49, 97, 96, 0.02);
          --fc-page-bg-color: #fff;
          --fc-event-border-width: 0;
          font-family: inherit;
        }
        
        .fc .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #316160;
        }
        
        .fc .fc-button {
          background-color: rgba(49, 97, 96, 0.1);
          border: none;
          border-radius: 0.75rem;
          color: #316160;
          font-weight: 500;
          padding: 0.5rem 1rem;
          transition: all 0.2s ease;
        }
        
        .fc .fc-button:hover {
          background-color: rgba(49, 97, 96, 0.2);
        }
        
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #316160;
          color: white;
          box-shadow: 0 4px 6px -1px rgba(49, 97, 96, 0.1), 0 2px 4px -1px rgba(49, 97, 96, 0.06);
        }
        
        .fc .fc-col-header-cell {
          padding: 0.75rem 0;
          background-color: rgba(49, 97, 96, 0.05);
          border-radius: 0.5rem 0.5rem 0 0;
        }
        
        .fc .fc-col-header-cell-cushion {
          color: #316160;
          font-weight: 600;
          text-decoration: none;
          padding: 0.5rem;
        }
        
        .fc .fc-daygrid-day-number,
        .fc .fc-daygrid-day-top {
          padding: 0.5rem;
        }
        
        .fc .fc-daygrid-day-number {
          color: #316160;
          text-decoration: none;
          font-weight: 500;
        }
        
        .fc .fc-daygrid-day.fc-day-today {
          background-color: rgba(49, 97, 96, 0.05);
        }
        
        .fc .fc-timegrid-slot {
          height: 3rem;
          border-bottom: 1px dashed rgba(49, 97, 96, 0.1);
        }
        
        .fc .fc-timegrid-slot-lane {
          border-bottom: none;
        }
        
        .fc .fc-timegrid-slot-minor {
          border-bottom: none;
        }
        
        .fc .fc-timegrid-now-indicator-line {
          border-color: #316160;
        }
        
        .fc .fc-timegrid-now-indicator-arrow {
          border-color: #316160;
          border-width: 5px;
        }
        
        .fc-event {
          border-radius: 0.5rem;
          padding: 0.25rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .fc-event:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .fc-event-title {
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          white-space: normal;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .fc-event-time {
          font-weight: 500;
          padding: 0 0.5rem;
        }
        
        .fc-theme-standard .fc-scrollgrid {
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid rgba(49, 97, 96, 0.1);
        }
        
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: rgba(49, 97, 96, 0.1);
        }
      `}</style>

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
        events={events}
        eventClick={handleEventClick}
        height="100%"
        allDaySlot={false}
        slotDuration="00:30:00"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }}
        nowIndicator={true}
        dayMaxEvents={true}
        eventMaxStack={3}
        eventDisplay="block"
        eventContent={(eventInfo) => {
          return (
            <div className="w-full h-full p-1 overflow-hidden">
              <div className="text-xs font-semibold">{eventInfo.timeText}</div>
              <div className="text-sm font-medium truncate">{eventInfo.event.title}</div>
              {eventInfo.view.type !== 'timeGridDay' && (
                <div className="text-xs truncate mt-1">
                  Table: {eventInfo.event.extendedProps.tableNumber || 'Not assigned'}
                </div>
              )}
            </div>
          );
        }}
      />

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div 
                className="p-6 relative"
                style={{ 
                  background: getStatusColor(selectedEvent.extendedProps.status).bg,
                  borderBottom: `1px solid ${getStatusColor(selectedEvent.extendedProps.status).border}`
                }}
              >
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                <h3 className="text-xl font-bold text-white">{selectedEvent.extendedProps.customerName}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(selectedEvent.extendedProps.status)}`}>
                    {selectedEvent.extendedProps.status.charAt(0).toUpperCase() + selectedEvent.extendedProps.status.slice(1)}
                  </span>
                  <span className="text-white/90 text-sm">
                    {format(new Date(selectedEvent.start), 'MMM d, yyyy')} at {format(new Date(selectedEvent.start), 'h:mm a')}
                  </span>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-5 w-5 text-[#316160]/70" />
                    <div>
                      <p className="text-sm text-[#316160]/70">Party Size</p>
                      <p className="font-medium text-[#316160]">{selectedEvent.extendedProps.partySize} guests</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TableCellsIcon className="h-5 w-5 text-[#316160]/70" />
                    <div>
                      <p className="text-sm text-[#316160]/70">Table</p>
                      <p className="font-medium text-[#316160]">{selectedEvent.extendedProps.tableNumber || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-5 w-5 text-[#316160]/70" />
                    <div>
                      <p className="text-sm text-[#316160]/70">Email</p>
                      <p className="font-medium text-[#316160]">{selectedEvent.extendedProps.customerEmail || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-5 w-5 text-[#316160]/70" />
                    <div>
                      <p className="text-sm text-[#316160]/70">Phone</p>
                      <p className="font-medium text-[#316160]">{selectedEvent.extendedProps.customerPhone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                {selectedEvent.extendedProps.specialRequests && (
                  <div className="mt-4 p-4 bg-[#316160]/5 rounded-xl">
                    <div className="flex items-start gap-2">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-[#316160]/70 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[#316160]">Special Requests</p>
                        <p className="text-[#316160]/80 mt-1">{selectedEvent.extendedProps.specialRequests}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 bg-[#316160] text-white rounded-xl hover:bg-[#316160]/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
