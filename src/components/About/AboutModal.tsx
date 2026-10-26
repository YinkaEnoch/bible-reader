import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Heart,
  Globe,
  ExternalLink,
  BookOpen,
  User,
  Sparkles,
  Smartphone,
  Lock,
} from 'lucide-react';
import { APP_VERSION } from '../../version';
import { AppLogo } from '../Logo/AppLogo';

export type AboutTab = 'about' | 'privacy' | 'credits';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AboutTab;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'about',
}) => {
  const [activeTab, setActiveTab] = useState<AboutTab>(initialTab);

  // Sync tab when initialTab changes or modal re-opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="About Bible Reader"
    >
      <div className="modal-card-about">
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="navbar-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
              <AppLogo size={24} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Bible Reader
              </h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Offline Daily Scripture
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="modal-close"
            style={{ position: 'static' }}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="modal-nav-tabs">
          <button
            type="button"
            className={`modal-nav-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button
            type="button"
            className={`modal-nav-tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            className={`modal-nav-tab ${activeTab === 'credits' ? 'active' : ''}`}
            onClick={() => setActiveTab('credits')}
          >
            Credits
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* App Overview Card */}
            <div className="info-block" style={{ gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Daily Scripture Companion
                </span>
                <span className="badge-pill" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>
                  v{APP_VERSION}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                Bible Reader is an offline-first scripture devotional application built to help you engage with God&apos;s Word every day. Features structured yearly reading plans, audio playback, KJV and WEB translations, and custom reading themes.
              </p>
            </div>

            {/* Developer Spotlight Card */}
            <div className="developer-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} color="var(--accent-gold)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Developer &amp; Creator
                </span>
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Yinka Enoch Adedokun
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Software Engineer &amp; Product Creator
                </div>
              </div>
              <a
                href="https://yinkaenoch.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="developer-website-btn"
              >
                <Globe size={14} />
                <span>Visit Developer Website</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Feature Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <div className="info-block" style={{ padding: '0.75rem' }}>
                <h4>
                  <BookOpen size={14} color="var(--accent-gold)" />
                  Dual Translations
                </h4>
                <p>Complete KJV and WEB Bible texts bundled offline.</p>
              </div>

              <div className="info-block" style={{ padding: '0.75rem' }}>
                <h4>
                  <Smartphone size={14} color="var(--accent-gold)" />
                  100% Offline
                </h4>
                <p>Read scripture and track progress without internet.</p>
              </div>
            </div>

            {/* Legal / Policy Quick Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setActiveTab('privacy')}
                className="btn-secondary"
                style={{ flex: 1, fontSize: '0.78rem', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
              >
                <ShieldCheck size={14} />
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('credits')}
                className="btn-secondary"
                style={{ flex: 1, fontSize: '0.78rem', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
              >
                <Heart size={14} />
                Credits &amp; Tech
              </button>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)' }}>
              <ShieldCheck size={20} />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Privacy Policy
              </h4>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              Your privacy is of the utmost importance. Bible Reader is built with an uncompromising offline-first design philosophy.
            </p>

            <div className="info-block">
              <h4>
                <Lock size={14} color="#10b981" />
                Zero Personal Data Collection
              </h4>
              <p>
                We do not collect, transmit, sell, or share any personal information, reading history, highlights, or search queries.
              </p>
            </div>

            <div className="info-block">
              <h4>
                <Smartphone size={14} color="#10b981" />
                Local Storage Only
              </h4>
              <p>
                Your theme preferences, translation choices, and annual reading status are stored strictly in your browser or device&apos;s local storage. This data never leaves your phone or browser.
              </p>
            </div>

            <div className="info-block">
              <h4>
                <ShieldCheck size={14} color="#10b981" />
                No Ads or Trackers
              </h4>
              <p>
                Bible Reader contains no advertisements, analytics tracking SDKs, or third-party behavioral pixels.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'credits' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)' }}>
              <Heart size={20} color="#ef4444" fill="#ef4444" />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Credits &amp; Attributions
              </h4>
            </div>

            <div className="info-block">
              <h4>
                <BookOpen size={14} color="var(--accent-gold)" />
                Scripture Translations
              </h4>
              <p>
                <strong>King James Version (KJV)</strong>: Public Domain.<br />
                <strong>World English Bible (WEB)</strong>: Public Domain modern English translation by Rainbow Missions, Inc.
              </p>
            </div>

            <div className="info-block">
              <h4>
                <User size={14} color="var(--accent-gold)" />
                Developer
              </h4>
              <p>
                Created with care by <strong>Yinka Enoch Adedokun</strong>.<br />
                Website: <a href="https://yinkaenoch.netlify.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>yinkaenoch.netlify.app</a>
              </p>
            </div>

            <div className="info-block">
              <h4>
                <Sparkles size={14} color="var(--accent-gold)" />
                Open Source Technologies
              </h4>
              <p>
                Built with React 19, TypeScript, Vite, Lucide React icons, and Capacitor.
              </p>
            </div>
          </div>
        )}

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="btn-primary"
          style={{ width: '100%', fontSize: '0.88rem', marginTop: '0.25rem' }}
        >
          Close
        </button>
      </div>
    </div>
  );
};
