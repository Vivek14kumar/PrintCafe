import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from './Providers';
import ConditionalLayout from '@/components/ConditionalLayout'; // 🌟 नया Wrapper इम्पोर्ट किया

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PrintCafe - Cafe Portal',
  description: 'Smart and automated print portal for Cyber Cafes and CSCs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <AuthProvider>
          {/* 🌟 सारा मैजिक अब इस Wrapper के अंदर होगा */}
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}