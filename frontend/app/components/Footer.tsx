"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-3">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
            {/* Logo section */}
            <Link href="/" className="flex items-center">
              <Image
                src="/Logo.png"
                alt="FreelanceHub"
                width={400}
                height={110}
                style={{ width: '150px', height: '40px', objectFit: 'contain' }}
                className="w-[150px] h-[40px] md:w-[200px] md:h-[55px]"
              />
            </Link>

            {/* Social media links with brand colors */}
            <div className="flex items-center gap-4">
            <Link
              href="https://www.linkedin.com/company/freelancehub"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="inline-flex items-center justify-center rounded-full p-2 transition"
              style={{ color: '#0A66C2' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0A66C2', e.currentTarget.style.color = 'white')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#0A66C2')}
            >
              <Linkedin size={24} />
            </Link>
            <Link
              href="https://www.instagram.com/freelancehub"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center justify-center rounded-full p-2 transition"
              style={{ color: '#E4405F' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E4405F', e.currentTarget.style.color = 'white')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#E4405F')}
            >
              <Instagram size={24} />
            </Link>
            <Link
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="inline-flex items-center justify-center rounded-full p-2 transition bg-[#25D366] hover:bg-[#1fa84f]"
            >
              <Image
                src="/WhatsApp-Logo.wine.svg"
                alt="WhatsApp"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} FreelanceHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
