'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon } from '@heroicons/react/24/outline';

export default function NotificationSound() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playNotification = () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0; // Reset audio to start
        audioRef.current.volume = 0.4; // Set volume to 40%
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          setIsPlaying(true);
          playPromise
            .then(() => {
              // Audio played successfully
              setTimeout(() => setIsPlaying(false), 1000); // Reset animation after 1s
            })
            .catch(error => {
              console.error('Error playing notification sound:', error);
              setIsPlaying(false);
            });
        }
      } catch (error) {
        console.error('Error initializing notification sound:', error);
        setIsPlaying(false);
      }
    }
  };

  // Expose the playNotification function globally
  useEffect(() => {
    window.playReservationNotification = playNotification;
    return () => {
      delete window.playReservationNotification;
    };
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        src="/sounds/notification.mp3"
        preload="auto"
      />
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="fixed bottom-4 left-4 z-50"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, -10, 0]
              }}
              transition={{ duration: 0.5 }}
              className="bg-[#316160] text-white p-3 rounded-full shadow-lg"
            >
              <BellIcon className="h-6 w-6" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}