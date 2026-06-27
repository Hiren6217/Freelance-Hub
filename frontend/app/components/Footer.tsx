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
                sizes="(max-width: 768px) 160px, 220px"
                className="w-[160px] h-[45px] md:w-[220px] md:h-[60px] object-contain"
              />
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="https://www.linkedin.com/company/freelancehub"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#0A66C2] transition duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#0A66C2] hover:text-white hover:shadow-lg"
              >
                <Linkedin size={20} />
              </Link>
              <Link
                href="https://www.instagram.com/freelancehub"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#E4405F] transition duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#E4405F] hover:text-white hover:shadow-lg"
              >
                <Instagram size={20} />
              </Link>
              <Link
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#1fa84f] hover:shadow-lg"
              >
                <Image
                  src="/WhatsApp-Logo.wine.svg"
                  alt="WhatsApp"
                  width={20}
                  height={20}
                  className="w-5 h-5"
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
