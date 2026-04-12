'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness, MapPin, Search, Star } from 'lucide-react';

const mockDevelopers = [
  { id: 1, name: 'Sarah Johnson', title: 'Senior Full Stack Developer', skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'], location: 'Remote', experience: '5 years', referralScore: 95, available: true },
  { id: 2, name: 'Michael Chen', title: 'Mobile App Developer', skills: ['React Native', 'iOS', 'Android', 'Firebase'], location: 'New York, NY', experience: '4 years', referralScore: 88, available: true },
  { id: 3, name: 'Emily Rodriguez', title: 'UI/UX Designer & Developer', skills: ['Figma', 'React', 'CSS', 'Design Systems'], location: 'San Francisco, CA', experience: '6 years', referralScore: 92, available: false },
];

export default function BrowseDevelopersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (localStorage.getItem('userRole') !== 'CLIENT') {
      router.push('/login');
    }
  }, [router]);

  const filteredDevelopers = mockDevelopers.filter((dev) =>
    dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dev.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <main className="min-h-screen py-6">
      <div className="page-shell">
        <header className="surface-card flex items-center gap-4 px-5 py-4">
          <Link href="/dashboard/client" className="rounded-full bg-slate-100 p-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Browse developers</h1>
            <p className="text-sm text-slate-500">Search profiles with LinkedIn-style cards and blue/white theming.</p>
          </div>
        </header>

        <div className="mt-6 surface-card p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, title, or skills..." className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4" />
          </div>
          <p className="mt-4 text-sm text-slate-500">Showing {filteredDevelopers.length} profile(s)</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDevelopers.map((dev) => (
            <article key={dev.id} className="surface-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{dev.name}</h3>
                  <p className="text-sm text-slate-500">{dev.title}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${dev.available ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'}`}>
                  {dev.available ? 'Open' : 'Unavailable'}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#0a66c2]" />{dev.location}</p>
                <p className="inline-flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-[#0a66c2]" />{dev.experience} experience</p>
                <p className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-[#0a66c2]" />Referral score {dev.referralScore}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {dev.skills.map((skill) => <span key={skill} className="rounded-full bg-[#e8f3ff] px-3 py-1 text-xs font-semibold text-[#0a66c2]">{skill}</span>)}
              </div>
              <button disabled={!dev.available} className={`mt-6 w-full rounded-full px-4 py-3 font-semibold ${dev.available ? 'bg-[#0a66c2] text-white' : 'bg-slate-200 text-slate-500'}`}>
                {dev.available ? 'View profile' : 'Currently unavailable'}
              </button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
