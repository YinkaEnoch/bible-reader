import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export function usePWA() {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [swRegistered, setSwRegistered] = useState<boolean>(false);

  useEffect(() => {
    // Online/Offline status listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // In native Capacitor apps, assets are already embedded inside the APK (https://localhost).
    // Service worker caching in WebView can trap users on stale assets across APK updates.
    if (Capacitor.isNativePlatform()) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
    } else if ('serviceWorker' in navigator) {
      // Register Service Worker for Web PWA offline reading
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
