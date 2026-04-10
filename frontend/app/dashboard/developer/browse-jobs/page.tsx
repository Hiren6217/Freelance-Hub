'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, MapPin, Briefcase, DollarSign, Calendar, X, CheckCircle } from 'lucide-react';
import { getJobs, applyForJob, getApplicantApplications } from '@/lib/api';

export default function BrowseJobsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Set<number>>(new Set());

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const id = localStorage.getItem('userId');
    
    if (!role || role !== 'DEVELOPER') {
      router.push('/login');
      return;
    }
    
    setUserName(name || 'Developer');
    setUserId(id ? parseInt(id) : null);
    fetchJobs();
    fetchAppliedJobs(id ? parseInt(id) : null);
  }, [router]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const jobsData = await getJobs();
      setJobs(jobsData);
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
      const appliedJobIds = new Set<number>(applications.map((app) => Number(app.jobId)));
      setAppliedJobs(appliedJobIds);
    } catch (err) {
      console.error('Failed to fetch applied jobs:', err);
    }
  };

  const handleApplyClick = (job: any) => {
    setSelectedJob(job);
    setShowApplyModal(true);
    setCoverLetter('');
  };

  const handleSubmitApplication = async () => {
    if (!userId || !selectedJob) return;
    
    try {
      setApplying(true);
      await applyForJob(selectedJob.id, userId, selectedJob.recruiterId, coverLetter);
      
      // Update applied jobs list
      setAppliedJobs(prev => new Set([...prev, selectedJob.id]));
      
      // Close modal and show success
      setShowApplyModal(false);
      alert('Application submitted successfully!');
      setCoverLetter('');
    } catch (err: any) {
      console.error('Failed to apply:', err);
      alert(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter((job: any) => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.skills?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <main className="min-h-screen bg-slate/5">
      {/* Header */}
      <header className="bg-white border-b border-black/10">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/developer" className="rounded-full p-2 hover:bg-slate/5">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <img src="/freelancehub-logo.svg" alt="FreelanceHub" className="h-10 w-10 rounded-xl" />
              <div>
                <h1 className="text-lg font-semibold">Browse Jobs</h1>
                <p className="text-xs text-slate/70">Discover opportunities through referrals</p>
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
              placeholder="Search by title, company, or skills..."
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
            {loading ? 'Loading jobs...' : `Showing ${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white p-6 shadow-lg animate-pulse">
                <div className="h-6 bg-slate/20 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate/20 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-slate/20 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate/20 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job: any) => (
              <div key={job.id} className="rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <p className="text-slate/70 mt-1">{job.company}</p>
                  </div>
                  {job.referralBonus && (
                    <div className="rounded-full bg-ember/10 px-4 py-2 text-sm font-semibold text-ember">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      {job.referralBonus}
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-slate/70">
                    <MapPin className="h-4 w-4" />
                    {job.location || 'Remote'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate/70">
                    <Briefcase className="h-4 w-4" />
                    {job.jobType || 'Full-time'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate/70">
                    <Calendar className="h-4 w-4" />
                    Posted {formatDate(job.createdAt)}
                  </div>
                </div>

                {job.description && (
                  <p className="mt-4 text-sm text-slate/70 line-clamp-2">
                    {job.description}
                  </p>
                )}

                {job.skills && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills.split(',').slice(0, 5).map((skill: string, index: number) => (
                      <span 
                        key={index}
                        className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold text-ink"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  {appliedJobs.has(job.id) ? (
                    <button 
                      disabled
                      className="flex-1 flex items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-3 font-semibold text-white cursor-not-allowed"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Applied
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApplyClick(job)}
                      className="flex-1 rounded-full bg-ember px-6 py-3 font-semibold text-white hover:bg-ember/90 transition-colors"
                    >
                      Apply Now
                    </button>
                  )}
                  <button className="rounded-full border border-black/10 px-6 py-3 font-semibold hover:bg-slate/5 transition-colors">
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredJobs.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate/30" />
            <h3 className="text-xl font-semibold">No jobs found</h3>
            <p className="mt-2 text-slate/70">Try adjusting your search criteria or check back later</p>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Apply for Position</h2>
                <p className="text-slate/70 mt-1">{selectedJob.title} at {selectedJob.company}</p>
              </div>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="rounded-full p-2 hover:bg-slate/10 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate/70">
                <MapPin className="h-4 w-4" />
                <span>{selectedJob.location || 'Remote'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate/70">
                <Briefcase className="h-4 w-4" />
                <span>{selectedJob.jobType || 'Full-time'}</span>
              </div>
              {selectedJob.referralBonus && (
                <div className="flex items-center gap-2 text-sm text-ember font-semibold">
                  <DollarSign className="h-4 w-4" />
                  <span>Referral Bonus: {selectedJob.referralBonus}</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Cover Letter (Optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell us why you're a great fit for this role..."
                rows={6}
                className="w-full rounded-xl border border-black/10 p-4 resize-none focus:outline-none focus:ring-2 focus:ring-ember/50"
              />
              <p className="text-xs text-slate/60 mt-2">
                Briefly describe your relevant experience and why you're interested in this position.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 rounded-full border border-black/10 px-6 py-3 font-semibold hover:bg-slate/5 transition-colors"
                disabled={applying}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={applying}
                className="flex-1 rounded-full bg-ember px-6 py-3 font-semibold text-white hover:bg-ember/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
