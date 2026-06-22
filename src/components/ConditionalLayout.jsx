"use client"; // यह ज़रूरी है क्योंकि हम URL पढ़ रहे हैं
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from '@/components/Footer';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();

  // यह चेक करेगा कि क्या URL '/dashboard' या '/print' से शुरू होता है?
  // अगर हाँ, तो Nav/Footer मत दिखाओ (false), वरना दिखाओ (true)
  const showNavFooter = !(pathname.startsWith('/dashboard') || pathname.startsWith('/print'));

  return (
    <>
      {showNavFooter && <Navbar />}
      
      {/* अगर Nav है तो pt-14 (padding-top) लगेगा, वरना फुल स्क्रीन */}
      <main className={`min-h-screen ${showNavFooter ? 'pt-14' : ''}`}>
        {children}
      </main>

      {showNavFooter && <Footer />}
    </>
  );
}