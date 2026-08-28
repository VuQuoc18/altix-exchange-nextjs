import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="inline-block mb-4" href="/" aria-label="ALTIX Exchange home">
            <div className="bg-white px-3.5 py-2 rounded-xl inline-block shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/img/logo.png"
                alt="ALTIX Exchange"
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </div>
          </Link>
          <p className="mt-2 text-sm text-slate-400">
            Technology and services for litigation finance and global asset recovery.
          </p>
        </div>
        <div>
          <h3>Navigate</h3>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/case-readiness">Case Readiness</Link>
          <Link href="/law-firms">Law firms</Link>
          <Link href="/funding-participants">Funding participants</Link>
        </div>
        <div>
          <h3>Company</h3>
          <Link href="/about">About</Link>
          <Link href="/company-facts">Company facts</Link>
          <Link href="/insights">Insights</Link>
          <Link href="/newsroom">Newsroom</Link>
        </div>
        <div>
          <h3>Legal</h3>
          <Link href="/disclosures">Disclosures</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/security">Security</Link>
          <Link href="/complaints">Complaints</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© 2026 ALTIX Exchange. All rights reserved.</p>
        <p>
          <a href="mailto:info@altix.exchange">info@altix.exchange</a>
        </p>
      </div>
    </footer>
  );
}
