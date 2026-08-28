'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import EditableText from '@/components/cms/EditableText';
import { Users, Briefcase, Landmark, SearchCode, ArrowRight } from 'lucide-react';

const ecosystemItems = [
  {
    no: '01',
    icon: Users,
    link: '/claimants-and-businesses',
    fallbacks: {
      title: 'Claimants & Businesses',
      description:
        'Individuals, SMEs, companies, insolvency estates and claimant groups with significant legal or recovery rights.',
      linkText: 'For claimants',
      points: [
        'Portfolio dispute assessment',
        'Non-recourse legal capital',
        'Damages & budget modeling',
      ],
    },
  },
  {
    no: '02',
    icon: Briefcase,
    link: '/law-firms',
    fallbacks: {
      title: 'Law Firms',
      description:
        'Legal teams seeking a structured route to prepare and present suitable client matters to professional capital.',
      linkText: 'For law firms',
      points: ['Streamlined funder intake', 'Fee budget structure', 'Workload & liability sharing'],
    },
  },
  {
    no: '03',
    icon: Landmark,
    link: '/funding-participants',
    fallbacks: {
      title: 'Funding Participants',
      description:
        'Litigation funders, family offices, special-situations investors, private-credit firms and other eligible professional capital providers.',
      linkText: 'For funding participants',
      points: [
        'Permission-based Data Room',
        'Pre-screened claim merit',
        'Enforcement collectability review',
      ],
    },
  },
  {
    no: '04',
    icon: SearchCode,
    link: '/forensic-experts',
    fallbacks: {
      title: 'Forensic Experts',
      description:
        'Investigators, forensic accountants, asset tracers, cyber intelligence professionals and other specialists.',
      linkText: 'Forensic network',
      points: [
        'Cross-border asset tracing',
        'Financial-crime intelligence',
        'Solvency & recovery analytics',
      ],
    },
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
          <EditableText
            pageSlug="home"
            path="ecosystem.eyebrow"
            fallback="Who we work with"
          />
        </motion.div>

        {/* Section Head */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="section-head"
        >
          <h2>
            <EditableText
              pageSlug="home"
              path="ecosystem.title"
              fallback="Built for the full recovery ecosystem."
            />
          </h2>
          <p>
            <EditableText
              pageSlug="home"
              path="ecosystem.body"
              fallback="ALTIX coordinates the parties needed to assess, fund and execute selected matters."
            />
          </p>
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

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    <EditableText
                      pageSlug="home"
                      path={`ecosystem.items[${index}].title`}
                      fallback={item.fallbacks.title}
                    />
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    <EditableText
                      pageSlug="home"
                      path={`ecosystem.items[${index}].description`}
                      fallback={item.fallbacks.description}
                    />
                  </p>

                  <ul className="space-y-1.5 mb-6 text-xs text-slate-500 border-t border-slate-200 pt-3">
                    {item.fallbacks.points.map((pt, pointIndex) => (
                      <li key={pointIndex} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e6463a]" />
                        <EditableText
                          pageSlug="home"
                          path={`ecosystem.items[${index}].points[${pointIndex}]`}
                          fallback={pt}
                        />
                      </li>
                    ))}
                  </ul>
                </div>

                <Link className="text-link text-sm" href={item.link}>
                  <EditableText
                    pageSlug="home"
                    path={`ecosystem.items[${index}].linkText`}
                    fallback={item.fallbacks.linkText}
                  />
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
