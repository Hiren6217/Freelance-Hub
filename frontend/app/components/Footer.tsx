"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Instagram, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-3">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-3">
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
              className="inline-flex items-center justify-center rounded-full p-2 transition"
              style={{ color: 'white', backgroundColor: '#25D366' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.52 3.48C18.38 1.35 15.53 0.1 12.51 0.1c-5.71 0-10.37 4.66-10.37 10.37 0 1.82.48 3.6 1.38 5.16L2 24l5.54-1.45c1.51.82 3.21 1.26 4.97 1.26 5.71 0 10.37-4.66 10.37-10.37 0-2.77-1.11-5.38-3.12-7.34zm-8.01 15.9c-1.55 0-3.07-.42-4.41-1.21l-.32-.19-3.26.86.87-3.2-.2-.32c-.88-1.4-1.35-3.02-1.35-4.67 0-4.74 3.86-8.6 8.6-8.6 2.29 0 4.44.89 6.06 2.51s2.51 3.77 2.51 6.06c0 4.74-3.86 8.6-8.6 8.6zm4.7-6.47c-.26-.13-1.53-.76-1.77-.85-.23-.08-.41-.13-.59.13-.17.26-.67.84-.82 1.01-.15.18-.3.2-.56.07-.26-.13-1.1-.41-2.1-1.3-.78-.7-1.3-1.56-1.45-1.82-.15-.26-.02-.4.11-.53.11-.11.26-.29.39-.44.13-.15.17-.26.26-.43.08-.17.04-.31-.02-.44-.06-.13-.59-1.42-.81-1.95-.21-.51-.43-.44-.59-.45-.15-.01-.32-.01-.49-.01-.17 0-.45.06-.68.31-.23.25-.88.86-.88 2.1s.18 2.43.2 2.6c.02.17.01 2.84 2.77 4.48 1.94 1.16 2.67 1.13 3.15 1.06.49-.07 1.59-.65 1.81-1.28.23-.63.23-1.17.16-1.28-.06-.1-.23-.16-.49-.28z"/>
              </svg>
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
