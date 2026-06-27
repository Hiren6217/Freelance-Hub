"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function GlobalHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="surface-card sticky top-0 z-50 mx-auto mb-4 w-full max-w-7xl rounded-b-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex items-center justify-between gap-3">
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

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="linkedin-button-secondary">
            Sign in
          </Link>
          <Link href="/dashboard" className="linkedin-button">
            Open network
          </Link>
        </div>

        {/* Hamburger for mobile */}
        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(prev => !prev)}
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu bar/dropdown */}
      <div className={`${open ? 'block' : 'hidden'} md:hidden mt-3`}>
        <nav className="flex flex-col gap-2 px-2 pb-3">
          <Link href="/login" onClick={() => setOpen(false)} className="linkedin-button-secondary block text-center w-full">
            Sign in
          </Link>
          <Link href="/dashboard" onClick={() => setOpen(false)} className="linkedin-button block text-center w-full">
            Open network
          </Link>
        </nav>
      </div>
    </header>
  );
}
