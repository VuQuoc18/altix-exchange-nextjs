'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Compass, Layers } from 'lucide-react';

const roadmapItems = [
  {
    status: 'NOW',
    badgeStyle: 'bg-red-500/10 text-red-600 border-red-500/30',
    dotColor: 'bg-red-500',
    icon: Sparkles,
    title: 'Current platform functions',
    description:
      'Management reports guided claimant intake, case browsing, filters, structured opportunity profiles and separate claimant and investor journeys.',
  },
  {
    status: 'NEXT',
    badgeStyle: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
    dotColor: 'bg-sky-500',
    icon: Clock,
    title: 'Institutional development',
    description:
      'Secure evidence rooms, role-based access, audit trails, case workflow, KYC/AML integration, investor diligence, milestone tracking, digital closing and reporting.',
  },
  {
    status: 'FUTURE / SUBJECT TO APPROVAL',
    badgeStyle: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    dotColor: 'bg-amber-500',
    icon: Compass,
    title: 'Digital ownership and transfers',
    description:
      'Any future digital ownership records or transfer functionality will require valid legal rights, compliant structures and appropriate regulatory permissions.',
  },
];

export default function RoadmapSection() {
  return (
    <section className="section bg-[#f8fafc]">
      <div className="container">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="eyebrow mb-2"
        >
          <Layers className="w-4 h-4 text-[#e6463a]" />
          <span>Product clarity</span>
        </motion.div>

        {/* Section Head */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="section-head"
        >
          <h2>Current platform and development roadmap.</h2>
          <p>
            ALTIX distinguishes what management reports as available today from future functions requiring further product, legal and regulatory work.
          </p>
        </motion.div>

        {/* Roadmap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roadmapItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="bg-white border border-slate-200 border-t-4 border-t-[#e6463a] p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider border ${item.badgeStyle}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${item.dotColor} animate-pulse`} />
                      {item.status}
                    </span>
                    <Icon className="w-5 h-5 text-slate-400" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
