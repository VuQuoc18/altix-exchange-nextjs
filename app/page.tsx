'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import WhatWeDoSection from '@/components/WhatWeDoSection';
import EcosystemSection from '@/components/EcosystemSection';
import ProcessSection from '@/components/ProcessSection';
import UnderwritingSection from '@/components/UnderwritingSection';
import RoadmapSection from '@/components/RoadmapSection';
import LeadershipSection from '@/components/LeadershipSection';
import CtaBandSection from '@/components/CtaBandSection';
import Footer from '@/components/Footer';
import SubmitMatterModal from '@/components/modals/SubmitMatterModal';
import InstitutionalAccessModal from '@/components/modals/InstitutionalAccessModal';

export default function HomePage() {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);

  return (
    <>
      <Header onOpenAccess={() => setIsAccessOpen(true)} />

      <main id="main">
        <HeroSection onOpenAccess={() => setIsAccessOpen(true)} />
        <WhatWeDoSection />
        <EcosystemSection />
        <ProcessSection />
        <UnderwritingSection />
        <RoadmapSection />
        <LeadershipSection />
        <CtaBandSection />
      </main>

      <Footer />

      {/* Modals */}
      <SubmitMatterModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
      />
      <InstitutionalAccessModal
        isOpen={isAccessOpen}
        onClose={() => setIsAccessOpen(false)}
      />
    </>
  );
}
