import { useState, useEffect } from 'react';

export function usePWA() {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [swRegistered, setSwRegistered] = useState<boolean>(false);

  useEffect(() => {
    // Online/Offline status listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[SW] Registered successfully:', reg.scope);
          setSwRegistered(true);
        })
        .catch((err) => {
          console.warn('[SW] Registration failed:', err);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOffline,
    swRegistered,
  };
}
