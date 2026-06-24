import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from './Providers';
import ConditionalLayout from '@/components/ConditionalLayout'; // 🌟 नया Wrapper इम्पोर्ट किया
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  // 1. Core SEO - Title & Description
  title: 'PrintCafe | Automated Print Portal for Cyber Cafes & CSCs',
  description: 'Boost your Cyber Cafe or CSC business with PrintCafe. The ultimate smart, automated print portal for seamless document management, secure printing, and easy setup.',
  
  // 2. Keywords to rank on Google (Targeting Indian Cyber Cafe/CSC audience)
  keywords: [
    'PrintCafe',
    'Cyber Cafe Software',
    'CSC Print Portal',
    'Automated Printing Solution',
    'Online Print Management',
    'Document Printing for CSC',
    'Xerox Shop Software',
    'Auto Print Out'
  ],

  // 3. OpenGraph - Ye tab kaam aayega jab log aapki site ka link WhatsApp, Facebook, ya LinkedIn par share karenge
  openGraph: {
    title: 'PrintCafe | Smart Print Portal for Cyber Cafes & CSCs',
    description: 'Manage your printing business efficiently. Perfect for CSCs and Cyber Cafes with automated print features.',
    url: 'https://wprintcafe.online', // Apna actual domain yahan dalein
    siteName: 'PrintCafe',
    images: [
      {
        url: 'https://printcafe.online/og-image.jpg', // Yahan ek attractive banner image ka URL dalein (1200x630px)
        width: 1200,
        height: 630,
        alt: 'PrintCafe Dashboard and Features Preview',
      },
    ],
    locale: 'en_IN', // targeting Indian audience
    type: 'website',
  },

  // 4. Twitter Cards - X (Twitter) par sharing ke liye
  twitter: {
    card: 'summary_large_image',
    title: 'PrintCafe | Next-Gen Print Portal for CSCs',
    description: 'Smart and automated print portal for Cyber Cafes and CSCs. Start streamlining your printing today.',
    images: ['https://www.printcafe.online/og-image.jpg'],
  },

  // 5. Search Engine Crawlers ki permission (Taaki Google isko padh sake)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // 6. Application Details
  authors: [{ name: 'PrintCafe Team', url: 'https://www.printcafe.online' }],
  creator: 'PrintCafe',
  publisher: 'PrintCafe',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <AuthProvider>
          {/* 🌟 सारा मैजिक अब इस Wrapper के अंदर होगा */}
          <ConditionalLayout>
            {children}
            <Analytics/>
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}