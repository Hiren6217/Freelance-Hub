'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness } from 'lucide-react';
import { postJob } from '@/lib/api';

export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'Remote',
    description: '',
    skills: '',
    referralBonus: '',
  });

  useEffect(() => {
    if (localStorage.getItem('userRole') !== 'CLIENT') {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('User not authenticated');

      await postJob({
        recruiterId: parseInt(userId, 10),
        title: formData.title,
        company: formData.company,
        location: formData.location,
        jobType: formData.jobType,
        description: formData.description,
        skills: formData.skills,
        referralBonus: formData.referralBonus,
      });

      setSuccess(true);
      setTimeout(() => router.push('/dashboard/client'), 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  return (
    <main className="min-h-screen py-6">
      <div className="page-shell max-w-4xl">
        <header className="surface-card flex items-center gap-4 px-5 py-4">
          <Link href="/dashboard/client" className="rounded-full bg-slate-100 p-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Post a new job</h1>
            <p className="text-sm text-slate-500">Create a LinkedIn-style job listing for your network.</p>
          </div>
        </header>

        <div className="mt-6 surface-card p-6">
          {success ? (
            <div className="rounded-[1.5rem] bg-green-50 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <BriefcaseBusiness className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-green-800">Job posted successfully</h2>
              <p className="mt-2 text-sm text-green-700">Redirecting back to your recruiter dashboard.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <input name="title" value={formData.title} onChange={handleChange} className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Job title" required />
                <input name="company" value={formData.company} onChange={handleChange} className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Company name" required />
                <input name="location" value={formData.location} onChange={handleChange} className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Location" />
                <select name="jobType" value={formData.jobType} onChange={handleChange} className="rounded-2xl border border-slate-200 px-4 py-3">
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                  <option value="Contract">Contract</option>
                  <option value="Full-time">Full-time</option>
                </select>
              </div>

              <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Describe the role, responsibilities, and requirements." required />
              <input name="skills" value={formData.skills} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Skills, comma separated" />
              <input name="referralBonus" value={formData.referralBonus} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Referral bonus, optional" />

              <div className="flex gap-4">
                <Link href="/dashboard/client" className="linkedin-button-secondary flex-1">Cancel</Link>
                <button type="submit" disabled={loading} className="linkedin-button flex-1 disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? 'Posting...' : 'Publish job'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
