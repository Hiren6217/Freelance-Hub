"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-8">
          {/* Logo section */}
          <Link href="/" className="flex items-center">
            <Image
              src="/Logo.png"
              alt="FreelanceHub"
              width={400}
              height={110}
              style={{ width: '280px', height: '76px', objectFit: 'contain' }}
              className="w-[280px] h-[76px] md:w-[400px] md:h-[110px]"
            />
          </Link>

          {/* Social media links with brand colors */}
          <div className="flex items-center gap-6">
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
              <Linkedin size={28} />
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
              <Instagram size={28} />
            </Link>
            <Link
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="inline-flex items-center justify-center rounded-full p-2 transition"
              style={{ color: '#25D366' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#25D366', e.currentTarget.style.color = 'white')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#25D366')}
            >
              <MessageCircle size={28} />
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} FreelanceHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
