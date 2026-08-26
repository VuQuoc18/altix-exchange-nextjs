'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSearch,
  ShieldCheck,
  Building2,
  Lock,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

const stages = [
  {
    id: 'intake',
    no: 'STAGE 01',
    title: 'Case Intake & Identity',
    icon: ShieldCheck,
    color: 'from-rose-500 to-red-600',
    accent: 'text-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    tag: 'INTEGRITY VERIFIED',
    metrics: [
      { label: 'KYC / AML Status', value: 'Clear & Sanction-Free' },
      { label: 'Authority', value: 'Direct Claimant Rights' },
    ],
    description: 'Initial intake checks claimant authority, corporate standing, conflict checks, KYC/AML and integrity screening.',
  },
  {
    id: 'merit',
    no: 'STAGE 02',
    title: 'Evidence & Legal Merit',
    icon: FileSearch,
    color: 'from-sky-500 to-blue-600',
    accent: 'text-sky-400',
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/10',
    tag: 'LEGAL DILIGENCE',
    metrics: [
      { label: 'Cause of Action', value: 'Contractual & Breach' },
      { label: 'Limitation Period', value: 'Fully Within Venue' },
    ],
    description: 'Structure legal theories, evidentiary burden, damages model, budget allocation, and potential defense scenarios.',
  },
  {
    id: 'collectability',
    no: 'STAGE 03',
    title: 'Collectability Analysis',
    icon: Building2,
    color: 'from-amber-500 to-orange-600',
    accent: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    tag: 'ASSET TRACING',
    metrics: [
      { label: 'Enforcement Venues', value: 'Multi-Jurisdictional' },
      { label: 'Target Solvency', value: 'Unencumbered Assets' },
    ],
    description: 'Evaluate defendant solvency, asset location, insurance policies, and realistic international enforcement routes.',
  },
  {
    id: 'capital',
    no: 'STAGE 04',
    title: 'Investor Data Room',
    icon: Lock,
    color: 'from-emerald-500 to-teal-600',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    tag: 'FUNDING READY',
    metrics: [
      { label: 'Access Control', value: 'Permissioned VDR' },
      { label: 'Structure', value: 'Single Case / Portfolio' },
    ],
    description: 'Secure, encrypted data room access for accredited litigation funders and special-situations capital providers.',
  },
];

export default function InteractiveCaseStage() {
  const [activeStageId, setActiveStageId] = useState('intake');
  const activeStage = stages.find((s) => s.id === activeStageId) || stages[0];

  return (
    <div className="w-full bg-[#121424]/90 backdrop-blur-xl border border-white/15 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden text-white">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-red-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-bold">
            ALTIX Diligence Stage Visualizer
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-semibold">
          <Sparkles className="w-3 h-3" /> Live Coordination Model
        </span>
      </div>

      {/* Stepper Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = stage.id === activeStageId;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStageId(stage.id)}
              className={`relative p-3 rounded-xl border text-left transition-all duration-300 ${
                isActive
                  ? `${stage.bg} ${stage.border} border-2 shadow-lg shadow-black/40`
                  : 'bg-white/5 border-white/10 hover:bg-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] text-slate-400">{`0${idx + 1}`}</span>
                <Icon className={`w-4 h-4 ${isActive ? stage.accent : 'text-slate-400'}`} />
              </div>
              <p className="text-xs font-bold text-white truncate hidden sm:block">
                {stage.title.split(' ')[0]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Stage Details Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-5 bg-white/5 border border-white/10 rounded-xl p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                {activeStage.no}
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                {activeStage.title}
              </h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider ${activeStage.bg} ${activeStage.accent} border ${activeStage.border}`}
            >
              {activeStage.tag}
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {activeStage.description}
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {activeStage.metrics.map((m, i) => (
              <div key={i} className="bg-black/30 border border-white/10 rounded-lg p-3">
                <span className="block text-[11px] font-mono text-slate-400">{m.label}</span>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${activeStage.accent}`} />
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Footer Info */}
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
          Structured assessment before capital access
        </span>
        <span className="font-mono text-[11px] text-red-400 flex items-center gap-1">
          Permission-based <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
