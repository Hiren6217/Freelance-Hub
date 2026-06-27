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
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l6.29-.98C9.24 22.37 10.61 23 12 23c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.41 0-2.73-.35-3.88-.95l-.28-.15-2.89.45.46-2.89-.15-.27c-.67-1.16-1.06-2.49-1.06-3.91 0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm4.3-12.3l-.55-.09c-.55-.1-1.23.12-1.75.73-.39.46-.62 1.05-1.18 1.95-.31.55-.15.98.22 1.42.22.25.49.55.77.77.22.16.34.27.52.45.3.3.56.57.9 1.05.39.55 1.03 1.35 2.37 2.13 1.78 1.04 2.85.85 3.29.8.44-.04 1.42-.58 1.62-1.13.2-.56.2-1.03.14-1.13-.06-.1-.22-.16-.46-.27-.55-.27-1.42-.7-1.97-.9zm0 0"/>
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
