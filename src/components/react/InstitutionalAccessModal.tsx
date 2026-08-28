'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface InstitutionalAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_FORM_DATA = {
  institutionName: '',
  workEmail: '',
  participantCategory: 'Litigation Funder',
  jurisdiction: '',
};

export default function InstitutionalAccessModal({ isOpen, onClose }: InstitutionalAccessModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetState = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setSubmitted(false);
    setFormData(INITIAL_FORM_DATA);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  // Clear timer and reset state on unmount or when isOpen becomes false
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isOpen, resetState]);

  // Handle Escape key listener to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      handleClose();
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-200"
          >
            {/* Header */}
            <div className="bg-[#17192b] text-white p-6 sm:p-8 relative">
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-semibold uppercase tracking-wider mb-3">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                Eligible Capital Access
              </div>
              <h2 id="modal-title" className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Request Institutional Access
              </h2>
              <p className="text-slate-300 text-sm mt-2">
                Controlled, permission-based access to structured legal finance opportunities and data rooms.
              </p>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Request Registered</h3>
                  <p className="text-slate-600 max-w-md mx-auto text-sm">
                    Our compliance team will verify institutional eligibility and accreditation credentials before issuing access credentials.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Institution / Firm Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.institutionName}
                      onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                      placeholder="e.g. Apex Legal Capital Management"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Institutional Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.workEmail}
                      onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                      placeholder="e.g. investment@apexcapital.com"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Capital Provider Category
                    </label>
                    <select
                      value={formData.participantCategory}
                      onChange={(e) => setFormData({ ...formData, participantCategory: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white"
                    >
                      <option>Litigation Funder</option>
                      <option>Special Situations Fund</option>
                      <option>Family Office</option>
                      <option>Private Credit / Multi-Strategy Firm</option>
                      <option>Institutional Investor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Primary Investment Regions / Domicile
                    </label>
                    <input
                      type="text"
                      value={formData.jurisdiction}
                      onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                      placeholder="e.g. North America, UK, Singapore, EU"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Access is restricted to accredited institutional investors and verified litigation funding participants. Eligibility restrictions apply.
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-[#24263f] hover:bg-[#17192b] text-white text-sm font-bold flex items-center gap-2 shadow-lg transition-all"
                    >
                      <span>Request Access Credentials</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
