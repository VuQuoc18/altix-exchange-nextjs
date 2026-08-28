import type { Metadata, Viewport } from 'next';
import './globals.css';
import UtilityBar from '@/components/UtilityBar';
import { CmsProvider } from '@/components/cms/CmsProvider';
import EditToolbar from '@/components/cms/EditToolbar';

export const viewport: Viewport = {
  themeColor: '#17192b',
};

export const metadata: Metadata = {
  title: 'ALTIX Exchange | Litigation Finance & Global Asset Recovery',
  description:
    'ALTIX prepares selected legal and recovery matters for professional funding through structured assessment, evidence organization, collectability analysis and controlled investor access.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    title: 'ALTIX Exchange | Litigation Finance & Global Asset Recovery',
    description:
      'ALTIX prepares selected legal and recovery matters for professional funding through structured assessment, evidence organization, collectability analysis and controlled investor access.',
    url: 'https://altix.exchange/',
    siteName: 'ALTIX Exchange',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://altix.exchange/#organization',
  name: 'ALTIX Exchange',
  alternateName: ['ALTIX', 'Alternative Investment Exchange'],
  url: 'https://altix.exchange/',
  description:
    'ALTIX Exchange is a Singapore-based technology and services company serving litigation finance and global asset recovery.',
  email: 'info@altix.exchange',
  founder: {
    '@id': 'https://altix.exchange/about/leadership/elke-biechele/#person',
  },
  sameAs: [
    'https://x.com/AltixExchange',
    'https://www.linkedin.com/in/elke-biechele/',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <CmsProvider>
          <EditToolbar />
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <UtilityBar />
          {children}
        </CmsProvider>
      </body>
    </html>
  );
}
