'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { postJob } from '@/lib/api';

export default function PostJobPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'Remote',
    description: '',
    skills: '',
    referralBonus: ''
  });

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    
    if (!role || role !== 'CLIENT') {
      router.push('/login');
      return;
    }
    
    setUserName(name || 'Client');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Call backend API to post job
      await postJob({
        recruiterId: parseInt(userId),
        title: formData.title,
        company: formData.company,
        location: formData.location,
        jobType: formData.jobType,
        description: formData.description,
        skills: formData.skills,
        referralBonus: formData.referralBonus
      });
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/client');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to post job:', err);
      alert(err.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
                <h1 className="text-lg font-semibold">Post a New Job</h1>
                <p className="text-xs text-slate/70">Create a job posting with referral bonus</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {success ? (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-green-800">Job Posted Successfully!</h2>
            <p className="mt-2 text-green-700">Your job is now live and developers can apply.</p>
            <p className="mt-4 text-sm text-green-600">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold">Job Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Job Title *</label>
                  <input 
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                    placeholder="e.g., Senior React Developer"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Company Name *</label>
                  <input 
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                    placeholder="Your company name"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Location</label>
                    <input 
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-black/10 px-4 py-3"
                      placeholder="e.g., Remote, New York, etc."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Job Type</label>
                    <select 
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-black/10 px-4 py-3"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                      <option value="Contract">Contract</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold">Job Description *</h2>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Describe the role, responsibilities, and requirements..."
                required
              />
            </div>

            {/* Skills & Bonus */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold">Skills & Referral</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Required Skills</label>
                  <input 
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                    placeholder="e.g., React, Node.js, TypeScript (comma separated)"
                  />
                  <p className="mt-1 text-xs text-slate/60">Separate multiple skills with commas</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Referral Bonus (Optional)</label>
                  <input 
                    type="text"
                    name="referralBonus"
                    value={formData.referralBonus}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                    placeholder="e.g., $500, 10% of first month salary"
                  />
                  <p className="mt-1 text-xs text-slate/60">Incentivize referrals with a bonus</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Link 
                href="/dashboard/client"
                className="flex-1 rounded-full border border-black/10 px-6 py-3 text-center font-semibold hover:bg-slate/5"
              >
                Cancel
              </Link>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-ember px-6 py-3 font-semibold text-white hover:bg-ember/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting Job...' : 'Post Job'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
