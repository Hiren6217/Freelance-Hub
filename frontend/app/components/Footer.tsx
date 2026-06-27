"use client";

import Link from 'next/link';
import { Linkedin, Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Left section: branding/text */}
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-slate-900">FreelanceHub</p>
            <p className="text-xs text-slate-600">Connect. Collaborate. Grow.</p>
          </div>

          {/* Center section: social media links */}
          <div className="flex items-center gap-6">
            <Link
              href="https://www.linkedin.com/company/freelancehub"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="inline-flex items-center justify-center rounded-full p-2 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
            >
              <Linkedin size={24} />
            </Link>
            <Link
              href="https://www.instagram.com/freelancehub"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center justify-center rounded-full p-2 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
            >
              <Instagram size={24} />
            </Link>
            <Link
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="inline-flex items-center justify-center rounded-full p-2 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
            >
              <MessageCircle size={24} />
            </Link>
          </div>

          {/* Right section: copyright */}
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
