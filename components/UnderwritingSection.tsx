'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Scale, TrendingUp, Building2, PieChart, ShieldAlert, CheckCircle2 } from 'lucide-react';

const assessmentItems = [
  {
    no: '01',
    title: 'Authority & Integrity',
    icon: ShieldCheck,
    description: 'Claimant authority, identity, KYC/AML, sanctions, conflicts and credibility.',
    badge: 'CORE REQUIREMENT',
  },
  {
    no: '02',
    title: 'Legal Position',
    icon: Scale,
    description: 'Cause of action, standing, jurisdiction, limitation, evidence and likely defences.',
    badge: 'MERIT REVIEW',
  },
  {
    no: '03',
    title: 'Economics',
    icon: TrendingUp,
    description: 'Supported damages, legal and expert budgets, duration, adverse costs and capital requirements.',
    badge: 'RETURN & RISK',
  },
  {
    no: '04',
    title: 'Collectability',
    icon: Building2,
    description: 'Defendant solvency, insurance, assets, enforcement venues and realistic recovery paths.',
    badge: 'ENFORCEMENT',
  },
  {
    no: '05',
    title: 'Structure',
    icon: PieChart,
    description: 'Investor eligibility, funding terms, governance, distribution mechanics and legal feasibility.',
    badge: 'LEGAL FEASIBILITY',
  },
  {
    no: '06',
    title: 'Portfolio Risk',
    icon: ShieldAlert,
    description: 'Concentration, jurisdiction, duration, legal theory and recovery-timetable exposure.',
    badge: 'RISK BALANCING',
  },
];

export default function UnderwritingSection() {
  return (
    <section className="section bg-white border-y border-slate-200">
      <div className="container">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="eyebrow mb-2"
        >
          <Scale className="w-4 h-4 text-[#e6463a]" />
          <span>Underwriting</span>
        </motion.div>

        {/* Section Head */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="section-head"
        >
          <h2>What we assess.</h2>
          <p>A funding decision depends on more than the headline claim value.</p>
        </motion.div>

        {/* Assessment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessmentItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.no}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="bg-slate-50 border border-slate-200 p-6 rounded-xl hover:bg-white hover:shadow-xl hover:border-[#e6463a]/40 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-[#e6463a] group-hover:bg-[#e6463a] group-hover:text-white transition-colors duration-300 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">{item.no}</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono text-[10px] font-bold text-slate-400">{item.badge}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
