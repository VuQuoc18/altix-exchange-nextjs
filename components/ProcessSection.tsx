'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import EditableText from '@/components/cms/EditableText';
import { GitCommit, CheckCircle2, ChevronRight } from 'lucide-react';

const processSteps = [
  {
    no: '01',
    fallbacks: {
      title: 'Submit the opportunity',
      desc: 'Claimant or counsel submits initial non-confidential claim overview.',
    },
  },
  {
    no: '02',
    fallbacks: {
      title: 'Verify claimant & authority',
      desc: 'Identity verification, corporate standing, KYC/AML and conflict screening.',
    },
  },
  {
    no: '03',
    fallbacks: {
      title: 'Review legal merit & evidence',
      desc: 'Independent legal review of cause of action, evidence burden and defenses.',
    },
  },
  {
    no: '04',
    fallbacks: {
      title: 'Assess budget, duration & collectability',
      desc: 'Damages calculation, litigation cost budget, defendant asset & solvency audit.',
    },
  },
  {
    no: '05',
    fallbacks: {
      title: 'Prepare investment materials & VDR',
      desc: 'Structure funder executive summary and populate secure data room.',
    },
  },
  {
    no: '06',
    fallbacks: {
      title: 'Present to suitable funding participants',
      desc: 'Controlled, permissioned disclosure to eligible litigation capital providers.',
    },
  },
  {
    no: '07',
    fallbacks: {
      title: 'Structure and close vehicle',
      desc: 'Negotiate funding terms, governance rights, adverse cost & security agreements.',
    },
  },
  {
    no: '08',
    fallbacks: {
      title: 'Monitor budgets & reporting',
      desc: 'Track case milestones, legal expenditure drawdowns and procedural updates.',
    },
  },
  {
    no: '09',
    fallbacks: {
      title: 'Support settlement & distributions',
      desc: 'Enforcement management, recovery collection and waterfall distribution.',
    },
  },
];

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);

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
          <GitCommit className="w-4 h-4 text-[#e6463a]" />
          <EditableText
            pageSlug="home"
            path="process.eyebrow"
            fallback="How it works"
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
              path="process.title"
              fallback="A controlled process from case to capital."
            />
          </h2>
          <p>
            <EditableText
              pageSlug="home"
              path="process.body"
              fallback="Every matter is case-specific. The workflow below describes the intended coordination model."
            />
          </p>
        </motion.div>

        {/* Interactive Process Stepper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Steps List */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {processSteps.map((step, index) => {
              const isActive = activeStep === index;
              return (
                <motion.div
                  key={step.no}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => setActiveStep(index)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                    isActive
                      ? 'bg-white border-[#e6463a] shadow-lg ring-2 ring-[#e6463a]/20'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isActive ? 'bg-[#e6463a] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {step.no}
                    </span>
                    {isActive && <CheckCircle2 className="w-4 h-4 text-[#e6463a]" />}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    <EditableText
                      pageSlug="home"
                      path={`process.steps[${index}].title`}
                      fallback={step.fallbacks.title}
                    />
                  </h4>
                </motion.div>
              );
            })}
          </div>

          {/* Active Step Preview Panel */}
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-4 bg-[#17192b] text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 font-mono text-8xl font-black text-white pointer-events-none">
              {processSteps[activeStep].no}
            </div>

            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-mono text-xs font-bold uppercase tracking-wider">
                Step {processSteps[activeStep].no} of 09
              </span>

              <h3 className="text-2xl font-serif font-bold text-white">
                <EditableText
                  pageSlug="home"
                  path={`process.steps[${activeStep}].title`}
                  fallback={processSteps[activeStep].fallbacks.title}
                />
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed">
                <EditableText
                  pageSlug="home"
                  path={`process.steps[${activeStep}].desc`}
                  fallback={processSteps[activeStep].fallbacks.desc}
                />
              </p>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <EditableText
                  pageSlug="home"
                  path="process.milestoneLabel"
                  fallback="Coordination Milestone"
                />
                <span className="text-red-400 font-bold flex items-center gap-1">
                  Active Workflow <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
