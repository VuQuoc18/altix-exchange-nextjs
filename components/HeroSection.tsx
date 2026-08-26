'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InteractiveCaseStage from '@/components/hero/InteractiveCaseStage';
import { ArrowRight, ShieldCheck, Scale, FileCheck, Lock, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onOpenSubmit?: () => void;
  onOpenAccess?: () => void;
}

export default function HeroSection({ onOpenSubmit, onOpenAccess }: HeroSectionProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden bg-[#17192b] text-white"
    >
      {/* Interactive Mouse Parallax Spotlight Glow */}
      <div
        className={`pointer-events-none absolute -inset-px transition-opacity duration-500 ${
          isHovered ? 'opacity-70' : 'opacity-35'
        }`}
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(230, 70, 58, 0.22), transparent 45%), radial-gradient(500px circle at ${mousePos.x - 100}px ${mousePos.y + 100}px, rgba(56, 189, 248, 0.18), transparent 45%)`,
        }}
      />

      {/* Cyber Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#24263f]/50 via-sky-500/5 to-transparent blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Headline and Content */}
          <div className="lg:col-span-6 space-y-7 text-left">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono font-semibold tracking-wider uppercase"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Litigation finance & global asset recovery</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.08]"
            >
              Preparing qualified legal claims for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">
                professional capital.
              </span>
            </motion.h1>

            {/* Lead Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal"
            >
              <strong className="text-white font-semibold">ALTIX helps claimants and law firms turn complex disputes into funder-ready opportunities.</strong> We coordinate case screening, evidence organization, financial analysis, financial-crime intelligence, collectability work, investor materials and ongoing administration.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                onClick={onOpenSubmit}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#e6463a] to-[#d1372b] hover:from-[#f38d84] hover:to-[#e6463a] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <span>Submit a Matter for Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAccess}
                className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 hover:border-sky-400/40 font-semibold text-sm tracking-wide transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-sky-400" />
                <span>Request Institutional Access</span>
              </button>
            </motion.div>

            {/* Microproof Badges */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>Structured Diligence</span>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>Jurisdiction Assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Encrypted Data Rooms</span>
              </div>
            </motion.div>

            <p className="text-xs text-slate-400 italic pt-1">
              Submission does not guarantee acceptance, funding, recovery, liquidity or any particular outcome.
            </p>
          </div>

          {/* Right Column: Interactive Diligence Visualizer Stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-6 w-full"
          >
            <InteractiveCaseStage />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
