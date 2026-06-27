"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="surface-card mx-auto w-full max-w-7xl rounded-t-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/Logo.png"
                alt="FreelanceHub"
                width={400}
                height={110}
                className="w-[150px] h-[40px] md:w-[200px] md:h-[55px] object-contain"
              />
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="https://www.linkedin.com/company/freelancehub"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex items-center justify-center rounded-full p-2 text-[#0A66C2] transition hover:bg-[#0A66C2] hover:text-white"
              >
                <Linkedin size={24} />
              </Link>
              <Link
                href="https://www.instagram.com/freelancehub"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center justify-center rounded-full p-2 text-[#E4405F] transition hover:bg-[#E4405F] hover:text-white"
              >
                <Instagram size={24} />
              </Link>
              <Link
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex items-center justify-center rounded-full p-2 bg-[#25D366] transition hover:bg-[#1fa84f]"
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
          </div>

          <div className="text-center text-xs text-slate-600 md:text-right">
            &copy; {new Date().getFullYear()} FreelanceHub. All rights reserved.
          </div>
        </div>
    </footer>
  );
}
