'use client';

import { useState, useEffect } from 'react';
import CurrencyCalculator from '@/components/calculator/CurrencyCalculator';

/**
 * Floating currency calculator — accessible from any page via a FAB button.
 * Opens as a slide-up modal on mobile, a bottom-right panel on desktop.
 */
export default function CurrencyCalculatorModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open on mobile
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* FAB Button — always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 group ${
          isOpen
            ? 'bg-card border border-card-border rotate-0 shadow-xl'
            : 'bg-gradient-to-br from-gold-500 to-gold-600 shadow-gold-500/30 hover:shadow-gold-500/50 hover:scale-105'
        }`}
        aria-label="Currency Calculator"
        id="calculator-fab"
      >
        {isOpen ? (
          <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Modal Panel */}
      <div
        className={`fixed z-35 transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-8 pointer-events-none'
        } bottom-24 right-6 w-[380px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl shadow-2xl`}
        id="calculator-modal"
      >
        {/* Header with title */}
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-card-border bg-gradient-to-r from-gold-500/5 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gold-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-gold-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <span className="text-sm font-bold">Currency Calculator</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg bg-muted hover:bg-gold-500/10 flex items-center justify-center transition-colors"
              aria-label="Close calculator"
            >
              <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-0">
            <CurrencyCalculator compact />
          </div>
        </div>
      </div>
    </>
  );
}
