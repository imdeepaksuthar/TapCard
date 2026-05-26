'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ContactUtilityProps {
  cardSlug: string;
}

export default function ContactUtility({ cardSlug }: ContactUtilityProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      // Calls the Laravel backend vCard endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cards/public/${cardSlug}/vcard`);
      
      if (!response.ok) throw new Error('Failed to fetch vCard');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `contact-${cardSlug}.vcf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading vCard:', error);
      alert('Failed to download contact. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleDownload}
      disabled={isDownloading}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl disabled:opacity-70"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      {isDownloading ? 'Saving Contact...' : 'Save to Contacts'}
    </motion.button>
  );
}
