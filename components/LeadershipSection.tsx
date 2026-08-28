'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import EditableText from '@/components/cms/EditableText';
import EditableImage from '@/components/cms/EditableImage';
import { User, Award, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LeadershipSection() {
  return (
    <section className="section bg-white border-t border-slate-200">
      <div className="container">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="eyebrow mb-2"
        >
          <User className="w-4 h-4 text-[#e6463a]" />
          <EditableText
            pageSlug="home"
            path="leadership.eyebrow"
            fallback="Leadership"
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
              path="leadership.title"
              fallback="Experience across banking risk, financial crime and technology."
            />
          </h2>
          <p>
            <EditableText
              pageSlug="home"
              path="leadership.body"
              fallback="ALTIX was founded by Elke Biechele, whose management biography describes more than 25 years across financial services, risk, financial crime, technology and entrepreneurship, followed by a focus on international financial-crime investigations and asset recovery."
            />
          </p>
        </motion.div>

        {/* Leadership Feature Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          <div className="md:col-span-4 max-w-[280px] mx-auto md:mx-0">
            <div className="relative rounded-xl overflow-hidden shadow-xl border-2 border-white">
              <EditableImage
                pageSlug="home"
                path="leadership.photoUrl"
                fallback="/assets/img/elke-biechele.webp"
                alt="Elke Biechele, founder and CEO of ALTIX Exchange"
                className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80 pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                <span className="text-xs font-mono font-bold uppercase text-red-400">
                  Founder & CEO
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 space-y-5">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-[#e6463a] uppercase">
                <EditableText
                  pageSlug="home"
                  path="leadership.kicker"
                  fallback="EXECUTIVE BIOGRAPHY"
                />
              </span>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                <EditableText
                  pageSlug="home"
                  path="leadership.name"
                  fallback="Elke Biechele"
                />
              </h3>
              <p className="text-slate-600 font-medium text-sm">
                <EditableText
                  pageSlug="home"
                  path="leadership.role"
                  fallback="Founder & CEO, ALTIX Exchange"
                />
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3">
                <Award className="w-5 h-5 text-[#e6463a] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    <EditableText
                      pageSlug="home"
                      path="leadership.stat1Title"
                      fallback="25+ Years Experience"
                    />
                  </h4>
                  <p className="text-xs text-slate-500">
                    <EditableText
                      pageSlug="home"
                      path="leadership.stat1Body"
                      fallback="Across financial services, risk, technology & asset recovery."
                    />
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    <EditableText
                      pageSlug="home"
                      path="leadership.stat2Title"
                      fallback="Financial Crime Focus"
                    />
                  </h4>
                  <p className="text-xs text-slate-500">
                    <EditableText
                      pageSlug="home"
                      path="leadership.stat2Body"
                      fallback="Specializing in cross-border investigations & litigation capital."
                    />
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link className="button button--secondary" href="/about/leadership/elke-biechele">
                <EditableText
                  pageSlug="home"
                  path="leadership.cta"
                  fallback="View Leadership Profile"
                />
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
