"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Instagram } from 'lucide-react';

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
              style={{ color: 'white', backgroundColor: '#25D366' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-1.567.905-2.845 2.477-3.257 4.164-.412 1.688-.113 3.39.859 4.814.528.738 1.449 1.494 2.59 2.065 1.141.57 2.379.855 3.654.855 1.274 0 2.512-.285 3.654-.855 1.141-.571 2.062-1.327 2.591-2.065.972-1.424 1.27-3.126.858-4.814-.412-1.687-1.69-3.259-3.257-4.164a9.87 9.87 0 00-5.117-1.378m0-2.382c3.15 0 6.212 1.22 8.613 3.422 2.402 2.202 3.748 5.188 3.748 8.295 0 3.108-1.346 6.093-3.748 8.295-2.401 2.202-5.463 3.422-8.613 3.422-2.315 0-4.606-.613-6.613-1.777l-7.613 2.236 2.256-7.526c-1.228-2.046-1.886-4.375-1.886-6.85 0-3.107 1.346-6.093 3.748-8.295C4.788 1.22 7.85 0 11 0z"/>
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
