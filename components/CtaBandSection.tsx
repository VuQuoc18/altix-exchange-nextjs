'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface CtaBandSectionProps {
  onOpenSubmit?: () => void;
}

export default function CtaBandSection({ onOpenSubmit }: CtaBandSectionProps) {
  return (
    <section className="cta-band">
      {/* Background Cyber Grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <span className="eyebrow eyebrow--light">
            <Sparkles className="w-3.5 h-3.5" />
            Start here
          </span>
          <h2>Start with a structured initial review.</h2>
          <p className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
            Do not send privileged or highly sensitive evidence through the initial contact form. ALTIX will provide secure upload instructions if further materials are required.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button
            onClick={onOpenSubmit}
            className="px-7 py-4 rounded-xl bg-[#e6463a] hover:bg-[#d1372b] text-white font-bold text-base shadow-xl shadow-red-500/30 flex items-center gap-2 transition-all hover:scale-105"
          >
            <span>Submit a Matter</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
