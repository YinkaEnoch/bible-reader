import './index.css';
import { initPWA } from './lib/pwa.js';
import { createApp } from './app.js';

// Initialize PWA service worker and event listeners
initPWA();

// Mount main Vanilla JS app to DOM
const rootContainer = document.getElementById('root');
if (rootContainer) {
  rootContainer.replaceChildren(createApp());
}
