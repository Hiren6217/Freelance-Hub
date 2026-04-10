'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Star, MapPin, Briefcase } from 'lucide-react';

// Mock data - replace with API call later
const mockDevelopers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Senior Full Stack Developer',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    location: 'Remote',
    experience: '5 years',
    referralScore: 95,
    available: true
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'Mobile App Developer',
    skills: ['React Native', 'iOS', 'Android', 'Firebase'],
    location: 'New York, NY',
    experience: '4 years',
    referralScore: 88,
    available: true
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    title: 'UI/UX Designer & Developer',
    skills: ['Figma', 'React', 'CSS', 'Design Systems'],
    location: 'San Francisco, CA',
    experience: '6 years',
    referralScore: 92,
    available: false
  }
];

export default function BrowseDevelopersPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [developers, setDevelopers] = useState(mockDevelopers);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    
    if (!role || role !== 'CLIENT') {
      router.push('/login');
      return;
    }
    
    setUserName(name || 'Client');
  }, [router]);

  const filteredDevelopers = developers.filter(dev => 
    dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dev.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-slate/5">
      {/* Header */}
      <header className="bg-white border-b border-black/10">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/client" className="rounded-full p-2 hover:bg-slate/5">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <img src="/freelancehub-logo.svg" alt="FreelanceHub" className="h-10 w-10 rounded-xl" />
              <div>
                <h1 className="text-lg font-semibold">Browse Developers</h1>
                <p className="text-xs text-slate/70">Find referred talent for your projects</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Search & Filter */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate/50" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, title, or skills..."
              className="w-full rounded-2xl border border-black/10 pl-12 pr-4 py-3"
            />
          </div>
          <button className="flex items-center gap-2 rounded-2xl border border-black/10 px-6 py-3 font-semibold hover:bg-slate/5">
            <Filter className="h-5 w-5" />
            Filters
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-slate/70">
            Showing {filteredDevelopers.length} developer{filteredDevelopers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Developers Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDevelopers.map((dev) => (
            <div key={dev.id} className="rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{dev.name}</h3>
                  <p className="text-sm text-slate/70">{dev.title}</p>
                </div>
                {!dev.available && (
                  <span className="rounded-full bg-slate/10 px-3 py-1 text-xs font-semibold text-slate/60">
                    Unavailable
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate/70">
                  <MapPin className="h-4 w-4" />
                  {dev.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate/70">
                  <Briefcase className="h-4 w-4" />
                  {dev.experience} experience
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold">{dev.referralScore}</span>
                  <span className="text-slate/70">referral score</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {dev.skills.slice(0, 3).map((skill) => (
                  <span 
                    key={skill}
                    className="rounded-full bg-ember/10 px-3 py-1 text-xs font-semibold text-ember"
                  >
                    {skill}
                  </span>
                ))}
                {dev.skills.length > 3 && (
                  <span className="rounded-full bg-slate/10 px-3 py-1 text-xs text-slate/70">
                    +{dev.skills.length - 3} more
                  </span>
                )}
              </div>

              <button 
                disabled={!dev.available}
                className={`mt-6 w-full rounded-full px-4 py-3 font-semibold transition-colors ${
                  dev.available 
                    ? 'bg-ink text-white hover:bg-ink/90' 
                    : 'bg-slate/10 text-slate/400 cursor-not-allowed'
                }`}
              >
                {dev.available ? 'View Profile' : 'Currently Unavailable'}
              </button>
            </div>
          ))}
        </div>

        {filteredDevelopers.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <Search className="mx-auto mb-4 h-12 w-12 text-slate/30" />
            <h3 className="text-xl font-semibold">No developers found</h3>
            <p className="mt-2 text-slate/70">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </main>
  );
}
