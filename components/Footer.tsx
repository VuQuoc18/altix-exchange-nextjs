import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="footer-logo" href="/" aria-label="ALTIX home">
            <svg className="brand-mark" viewBox="0 0 180 46" role="img" aria-label="ALTIX">
              <text x="1" y="34" fontFamily="Arial,Helvetica,sans-serif" fontSize="39" fontWeight="900" letterSpacing="-2.2" fill="currentColor">
                ALTIX
              </text>
              <path d="M119 39c18-4 31-13 43-28" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" />
              <path d="m157 7 12-2-4 12" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p>Technology and services for litigation finance and global asset recovery.</p>
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
        <p>
          © 2026 ALTIX Exchange. <strong>Production note:</strong> replace this footer with the verified legal entity name, UEN and registered-office details before launch.
        </p>
        <p>
          <a href="mailto:info@altix.exchange">info@altix.exchange</a>
        </p>
      </div>
    </footer>
  );
}
