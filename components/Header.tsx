'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowUpRight, Lock, FileText } from 'lucide-react';

interface HeaderProps {
  onOpenSubmit?: () => void;
  onOpenAccess?: () => void;
}

export default function Header({ onOpenSubmit, onOpenAccess }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'shadow-md border-slate-200' : ''}`}>
      <div className="container header-inner">
        <Link className="flex items-center gap-2" href="/" aria-label="Risiko home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/img/logo.png"
            alt="Risiko"
            className="h-9 sm:h-10 w-auto object-contain"
          />
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={isOpen}
          aria-controls="primary-nav"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6 text-slate-800" /> : <Menu className="w-6 h-6 text-slate-800" />}
          <span className="sr-only">Menu</span>
        </button>

        {/* Primary Navigation Links */}
        <nav className={`primary-nav ${isOpen ? 'is-open' : ''}`} id="primary-nav" aria-label="Primary navigation">
          <Link href="/what-we-do" onClick={() => setIsOpen(false)}>
            What we do
          </Link>
          <Link href="/how-it-works" onClick={() => setIsOpen(false)}>
            How it works
          </Link>
          <Link href="/who-we-work-with" onClick={() => setIsOpen(false)}>
            Who we work with
          </Link>
          <Link href="/expert-network" onClick={() => setIsOpen(false)}>
            Professional Network
          </Link>
          <Link href="/insights" onClick={() => setIsOpen(false)}>
            Insights
          </Link>
          <Link href="/about" onClick={() => setIsOpen(false)}>
            About
          </Link>

          {/* Mobile Action Buttons inside drawer */}
          <div className="flex flex-col gap-2 pt-4 border-t border-slate-200 lg:hidden">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAccess?.();
              }}
              className="button button--secondary button--sm w-full"
            >
              <Lock className="w-3.5 h-3.5" />
              Institutional access
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSubmit?.();
              }}
              className="button button--sm w-full"
            >
              <FileText className="w-3.5 h-3.5" />
              Submit a matter
            </button>
          </div>
        </nav>

        {/* Desktop Header Actions */}
        <div className="header-actions">
          <button
            type="button"
            onClick={onOpenAccess}
            className="button button--secondary button--sm"
          >
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            Institutional access
          </button>
          <button
            type="button"
            onClick={onOpenSubmit}
            className="button button--sm"
          >
            Submit a matter
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
