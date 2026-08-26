'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Briefcase, Landmark, SearchCode, ArrowRight } from 'lucide-react';

const ecosystemItems = [
  {
    no: '01',
    title: 'Claimants & Businesses',
    icon: Users,
    description: 'Individuals, SMEs, companies, insolvency estates and claimant groups with significant legal or recovery rights.',
    link: '/claimants-and-businesses',
    linkText: 'For claimants',
    points: ['Portfolio dispute assessment', 'Non-recourse legal capital', 'Damages & budget modeling'],
  },
  {
    no: '02',
    title: 'Law Firms',
    icon: Briefcase,
    description: 'Legal teams seeking a structured route to prepare and present suitable client matters to professional capital.',
    link: '/law-firms',
    linkText: 'For law firms',
    points: ['Streamlined funder intake', 'Fee budget structure', 'Workload & liability sharing'],
  },
  {
    no: '03',
    title: 'Funding Participants',
    icon: Landmark,
    description: 'Litigation funders, family offices, special-situations investors, private-credit firms and other eligible professional capital providers.',
    link: '/funding-participants',
    linkText: 'For funding participants',
    points: ['Permission-based Data Room', 'Pre-screened claim merit', 'Enforcement collectability review'],
  },
  {
    no: '04',
    title: 'Forensic Experts',
    icon: SearchCode,
    description: 'Investigators, forensic accountants, asset tracers, cyber intelligence professionals and other specialists.',
    link: '/forensic-experts',
    linkText: 'Forensic network',
    points: ['Cross-border asset tracing', 'Financial-crime intelligence', 'Solvency & recovery analytics'],
  },
];

export default function EcosystemSection() {
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
          <Users className="w-4 h-4 text-[#e6463a]" />
          <span>Who we work with</span>
        </motion.div>

        {/* Section Head */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="section-head"
        >
          <h2>Built for the full recovery ecosystem.</h2>
          <p>ALTIX coordinates the parties needed to assess, fund and execute selected matters.</p>
        </motion.div>

        {/* Ecosystem Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ecosystemItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.no}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex flex-col justify-between hover:bg-white hover:shadow-xl hover:border-[#e6463a]/40 transition-all duration-300 group"
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

                  <ul className="space-y-1.5 mb-6 text-xs text-slate-500 border-t border-slate-200 pt-3">
                    {item.points.map((pt, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e6463a]" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link className="text-link text-sm" href={item.link}>
                  <span>{item.linkText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
