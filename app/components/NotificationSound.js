'use client';

import { useEffect, useRef } from 'react';

export default function NotificationSound() {
  const audioRef = useRef(null);

  const playNotification = () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0; // Reset audio to start
        audioRef.current.volume = 0.4; // Set volume to 40%
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing notification sound:', error);
          });
        }
      } catch (error) {
        console.error('Error initializing notification sound:', error);
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
    <audio
      ref={audioRef}
      src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAGAAADAABgYGBgYGBgYGBgYGBgYGBggICAgICAgICAgICAgICAgICgoKCgoKCgoKCgoKCgoKCgwMDAwMDAwMDAwMDAwMDAwMDg4ODg4ODg4ODg4ODg4ODg//////////////////////////8AAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAYAAAAAAAAAAwDVxttG//sUZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAE//sUZB4P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAE//sUZDwP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAE//sUZFoP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAE"
      preload="auto"
    />
  );
}