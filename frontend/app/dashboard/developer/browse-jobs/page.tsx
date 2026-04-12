'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BriefcaseBusiness, Calendar, CheckCircle, DollarSign, MapPin, Search, X } from 'lucide-react';
import { getJobs, applyForJob, getApplicantApplications } from '@/lib/api';

export default function BrowseJobsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Set<number>>(new Set());

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const id = localStorage.getItem('userId');

    if (role !== 'DEVELOPER') {
      router.push('/login');
      return;
    }

    const parsedId = id ? parseInt(id, 10) : null;
    setUserId(parsedId);
    void fetchJobs();
    void fetchAppliedJobs(parsedId);
  }, [router]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setJobs(await getJobs());
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async (applicantId: number | null) => {
    if (!applicantId) return;
    try {
      const applications: any[] = await getApplicantApplications(applicantId);
      setAppliedJobs(new Set<number>(applications.map((app) => Number(app.jobId))));
    } catch (err) {
      console.error('Failed to fetch applied jobs:', err);
    }
  };

  const handleSubmitApplication = async () => {
    if (!userId || !selectedJob) return;

    try {
      setApplying(true);
      await applyForJob(selectedJob.id, userId, selectedJob.recruiterId, coverLetter);
      setAppliedJobs((prev) => new Set([...prev, selectedJob.id]));
      setShowApplyModal(false);
      setCoverLetter('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter((job: any) =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.skills?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <main className="min-h-screen py-6">
      <div className="page-shell">
        <header className="surface-card flex items-center gap-4 px-5 py-4">
          <Link href="/dashboard/developer" className="rounded-full bg-slate-100 p-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Browse jobs</h1>
            <p className="text-sm text-slate-500">Search roles in a LinkedIn-style job feed.</p>
          </div>
        </header>

        <div className="mt-6 surface-card p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by title, company, or skills..." className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4" />
          </div>
          <p className="mt-4 text-sm text-slate-500">{loading ? 'Loading jobs...' : `Showing ${filteredJobs.length} job(s)`}</p>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? <div className="surface-card p-6 text-sm text-slate-500">Loading jobs...</div> : filteredJobs.map((job: any) => (
            <article key={job.id} className="surface-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{job.company}</p>
                </div>
                {job.referralBonus && <span className="rounded-full bg-[#e8f3ff] px-4 py-2 text-sm font-semibold text-[#0a66c2]"><DollarSign className="mr-1 inline h-4 w-4" />{job.referralBonus}</span>}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#0a66c2]" />{job.location || 'Remote'}</span>
                <span className="inline-flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-[#0a66c2]" />{job.jobType || 'Full-time'}</span>
                <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-[#0a66c2]" />{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{job.description}</p>
              {job.skills && <div className="mt-4 flex flex-wrap gap-2">{job.skills.split(',').map((skill: string) => <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{skill.trim()}</span>)}</div>}
              <div className="mt-6 flex gap-3">
                {appliedJobs.has(job.id) ? (
                  <button disabled className="flex-1 rounded-full bg-green-600 px-6 py-3 font-semibold text-white"><span className="inline-flex items-center gap-2"><CheckCircle className="h-5 w-5" />Applied</span></button>
                ) : (
                  <button onClick={() => { setSelectedJob(job); setShowApplyModal(true); }} className="linkedin-button flex-1">Apply now</button>
                )}
                <button className="linkedin-button-secondary">Save</button>
              </div>
            </article>
          ))}
          {!loading && filteredJobs.length === 0 && <div className="surface-card p-8 text-center text-sm text-slate-600">No jobs found for this search.</div>}
        </div>
      </div>

      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="surface-card w-full max-w-2xl p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Apply for {selectedJob.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedJob.company}</p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="rounded-full bg-slate-100 p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={6} className="w-full rounded-2xl border border-slate-200 p-4" placeholder="Write a short cover note..." />
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowApplyModal(false)} className="linkedin-button-secondary flex-1">Cancel</button>
              <button onClick={handleSubmitApplication} disabled={applying} className="linkedin-button flex-1 disabled:cursor-not-allowed disabled:opacity-50">
                {applying ? 'Submitting...' : 'Submit application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
