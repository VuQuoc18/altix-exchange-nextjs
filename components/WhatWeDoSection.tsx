'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import EditableText from '@/components/cms/EditableText';
import { FolderCheck, Coins, BarChart3, ArrowRight, Shield } from 'lucide-react';

const cards = [
  {
    no: '01',
    icon: FolderCheck,
    link: '/case-readiness',
    fallbacks: {
      title: 'Case Readiness',
      description:
        'Organize authority, evidence, damages, budget, jurisdiction and collectability into a coherent funding package.',
      linkText: 'Explore Case Readiness',
      badge: 'STAGE 1: PREPARATION',
    },
  },
  {
    no: '02',
    icon: Coins,
    link: '/litigation-funding',
    fallbacks: {
      title: 'Professional Funding Process',
      description:
        'Suitable matters may be presented to eligible funding participants through a permission-based process.',
      linkText: 'How funding works',
      badge: 'STAGE 2: CAPITAL ACCESS',
    },
  },
  {
    no: '03',
    icon: BarChart3,
    link: '/case-administration',
    fallbacks: {
      title: 'Administration & Reporting',
      description:
        'Support agreed budgets, milestones, controlled information access and reporting through the life of a matter.',
      linkText: 'Case administration',
      badge: 'STAGE 3: EXECUTION',
    },
  },
];

export default function WhatWeDoSection() {
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
          <Shield className="w-4 h-4 text-[#e6463a]" />
          <EditableText
            pageSlug="home"
            path="whatWeDo.eyebrow"
            fallback="What ALTIX does"
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
              path="whatWeDo.title"
              fallback="A more structured route from case to capital."
            />
          </h2>
          <p>
            <EditableText
              pageSlug="home"
              path="whatWeDo.body"
              fallback="Legal merit alone is not enough for a funding decision. Professional capital also needs clear evidence, realistic budgets, supported damages, jurisdiction analysis, collectability information, enforcement planning and appropriate terms."
            />
          </p>
        </motion.div>

        {/* Card Grid */}
        <div className="card-grid">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.no}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="card group hover:border-[#e6463a]/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="card-no">{card.no}</span>
                  <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    <EditableText
                      pageSlug="home"
                      path={`whatWeDo.cards[${index}].badge`}
                      fallback={card.fallbacks.badge}
                    />
                  </span>
                </div>

                <h3>
                  <span className="p-2 rounded-lg bg-red-50 text-[#e6463a] group-hover:bg-[#e6463a] group-hover:text-white transition-colors duration-300">
                    <Icon className="w-5 h-5" />
                  </span>
                  <EditableText
                    pageSlug="home"
                    path={`whatWeDo.cards[${index}].title`}
                    fallback={card.fallbacks.title}
                  />
                </h3>

                <p>
                  <EditableText
                    pageSlug="home"
                    path={`whatWeDo.cards[${index}].description`}
                    fallback={card.fallbacks.description}
                  />
                </p>

                <Link className="text-link" href={card.link}>
                  <EditableText
                    pageSlug="home"
                    path={`whatWeDo.cards[${index}].linkText`}
                    fallback={card.fallbacks.linkText}
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
