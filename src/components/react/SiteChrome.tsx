import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Lock, FileText } from 'lucide-react';
import InstitutionalAccessModal from './InstitutionalAccessModal';

export default function SiteChrome() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOpenAccess = () => {
      setIsAccessModalOpen(true);
    };
    window.addEventListener('altix:open-access', handleOpenAccess);
    return () => window.removeEventListener('altix:open-access', handleOpenAccess);
  }, []);

  const openAccess = () => {
    setIsAccessModalOpen(true);
  };

  return (
    <>
      <header className={`site-header ${scrolled ? 'shadow-md border-slate-200' : ''}`}>
        <div className="container header-inner">
          <a className="flex items-center shrink-0" href="/" aria-label="ALTIX home">
            <img
              src="/assets/img/logo.png"
              alt="ALTIX"
              className="h-9 sm:h-10 w-auto max-w-[190px] object-contain object-left"
            />
          </a>

          {/* Mobile Toggle Button */}
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={isNavOpen}
            aria-controls="primary-nav"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            {isNavOpen ? <X className="w-6 h-6 text-slate-800" /> : <Menu className="w-6 h-6 text-slate-800" />}
            <span className="sr-only">Menu</span>
          </button>

          {/* Primary Navigation Links */}
          <nav className={`primary-nav ${isNavOpen ? 'is-open' : ''}`} id="primary-nav" aria-label="Primary navigation">
            <a href="/what-we-do" onClick={() => setIsNavOpen(false)}>
              What we do
            </a>
            <a href="/how-it-works" onClick={() => setIsNavOpen(false)}>
              How it works
            </a>
            <a href="/who-we-work-with" onClick={() => setIsNavOpen(false)}>
              Who we work with
            </a>
            <a href="/expert-network" onClick={() => setIsNavOpen(false)}>
              Professional Network
            </a>
            <a href="/insights" onClick={() => setIsNavOpen(false)}>
              Insights
            </a>
            <a href="/about" onClick={() => setIsNavOpen(false)}>
              About
            </a>

            {/* Mobile Action Buttons inside drawer */}
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-200 lg:hidden">
              <button
                type="button"
                onClick={() => {
                  setIsNavOpen(false);
                  openAccess();
                }}
                className="button button--secondary button--sm w-full"
              >
                <Lock className="w-3.5 h-3.5" />
                Institutional access
              </button>
              <a
                href="https://platform.altix.exchange/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsNavOpen(false)}
                className="button button--sm w-full"
              >
                <FileText className="w-3.5 h-3.5" />
                Submit a case
              </a>
            </div>
          </nav>

          {/* Desktop Header Actions */}
          <div className="header-actions">
            <button
              type="button"
              onClick={openAccess}
              className="button button--secondary button--sm"
            >
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              Institutional access
            </button>
            <a
              href="https://platform.altix.exchange/"
              target="_blank"
              rel="noopener noreferrer"
              className="button button--sm"
            >
              Submit a case
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      <InstitutionalAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
      />
    </>
  );
}
