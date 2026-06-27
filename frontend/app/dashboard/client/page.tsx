'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageSquareText,
  PlusCircle,
  Search,
  XCircle,
} from 'lucide-react';
import { getJobsByRecruiter, getRecruiterApplications, sendMessage, updateApplicationStatus } from '@/lib/api';

export default function ClientDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Client');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    const id = localStorage.getItem('userId');

    if (role !== 'CLIENT') {
      router.push('/login');
      return;
    }

    const parsedUserId = id ? parseInt(id, 10) : null;
    setUserName(name || 'Client');
    setUserEmail(email || '');
    setUserId(parsedUserId);

    if (parsedUserId) {
      void fetchDashboardData(parsedUserId);
    } else {
      setLoading(false);
    }
  }, [router]);

  const fetchDashboardData = async (currentUserId: number) => {
    try {
      setLoading(true);
      const [jobsData, recruiterApplications] = await Promise.all([
        getJobsByRecruiter(currentUserId),
        getRecruiterApplications(currentUserId),
      ]);

      const jobsById = new Map<number, any>(jobsData.map((job: any) => [Number(job.id), job] as const));
      const hydratedApplications = recruiterApplications.map((app: any) => {
        const job = jobsById.get(Number(app.jobId));
        return { ...app, jobTitle: job?.title || `Job #${app.jobId}`, company: job?.company || 'FreelanceHub company' };
      });

      setJobs(jobsData);
      setApplications(hydratedApplications);
    } catch (err) {
      console.error('Failed to fetch client dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    ['authToken', 'userId', 'userEmail', 'userName', 'userRole'].forEach((key) => localStorage.removeItem(key));
    router.push('/');
  };

  const activeJobsCount = jobs.length;
  const totalApplications = applications.length;
  const pendingApplications = applications.filter((app) => app.status === 'PENDING').length;
  const acceptedApplications = applications.filter((app) => app.status === 'ACCEPTED').length;

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-orange-100 text-orange-700';
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  const refreshCurrentUserData = async () => {
    if (userId) await fetchDashboardData(userId);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedApplication) return;

    try {
      setUpdating(true);
      await updateApplicationStatus(selectedApplication.id, newStatus);
      await refreshCurrentUserData();
      setShowActionModal(false);
      setSelectedApplication(null);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedApplication || !userId || !interviewDate || !interviewTime) return;

    try {
      setUpdating(true);
      const interviewMessage = `Interview scheduled for ${interviewDate} at ${interviewTime}${messageText.trim() ? `\n\n${messageText.trim()}` : ''}`;
      await updateApplicationStatus(selectedApplication.id, 'REVIEWED');
      await sendMessage(userId, selectedApplication.applicantId, interviewMessage);
      await refreshCurrentUserData();
      setShowActionModal(false);
      setSelectedApplication(null);
      setMessageText('');
      setInterviewDate('');
      setInterviewTime('');
    } catch (err) {
      console.error('Failed to schedule interview:', err);
      alert('Failed to schedule interview');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedApplication || !userId || !messageText.trim()) return;

    try {
      setUpdating(true);
      await sendMessage(userId, selectedApplication.applicantId, messageText.trim());
      setShowActionModal(false);
      setMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <main className="min-h-screen py-6">
      <div className="page-shell">
        <section className="feed-grid mt-6">
          <aside className="space-y-6">
            <div className="surface-card p-5">
              <p className="text-sm text-slate-500">Recruiter profile</p>
              <h2 className="mt-2 text-xl font-semibold">{userName}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Manage jobs, review applicants, and keep communication moving like a professional network workflow.</p>
              <div className="mt-5 space-y-3 text-sm">
                <Link href="/dashboard/client/post-job" className="linkedin-button flex w-full gap-2"><PlusCircle className="h-4 w-4" />Post a job</Link>
                <Link href="/dashboard/client/browse-developers" className="linkedin-button-secondary flex w-full gap-2"><Search className="h-4 w-4" />Browse developers</Link>
              </div>
            </div>

            <div className="surface-card p-5">
              <h3 className="text-lg font-semibold">Network stats</h3>
              <div className="mt-4 space-y-3">
                {[{ label: 'Live jobs', value: activeJobsCount }, { label: 'Applicants', value: totalApplications }, { label: 'Pending review', value: pendingApplications }, { label: 'Accepted', value: acceptedApplications }].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className="font-semibold text-[#0a66c2]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="surface-subtle px-6 py-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0a66c2]">Recruiting feed</p>
              <h2 className="mt-3 text-3xl font-semibold">Track talent, pipeline, and outreach from one workspace.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">This page is styled to feel closer to LinkedIn: cleaner cards, blue accents, feed-based scanning, and fast access to posting, review, and direct messaging.</p>
            </div>

            <div className="surface-card p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">Open roles</h3>
                  <p className="text-sm text-slate-500">Your active hiring posts and referral-ready positions.</p>
                </div>
                <Link href="/dashboard/client/post-job" className="linkedin-button">New role</Link>
              </div>
              <div className="space-y-4">
                {loading ? <p className="text-sm text-slate-500">Loading jobs...</p> : jobs.length === 0 ? <div className="rounded-[1.5rem] bg-slate-50 p-6 text-sm text-slate-600">No roles posted yet. Start with your first job listing.</div> : jobs.map((job) => (
                  <article key={job.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-semibold">{job.title}</h4>
                        <p className="mt-1 text-sm text-slate-500">{job.company}</p>
                      </div>
                      <span className="rounded-full bg-[#e8f3ff] px-3 py-1 text-xs font-semibold text-[#0a66c2]">{job.jobType || 'Remote'}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location || 'Remote'}</span>
                      <span className="inline-flex items-center gap-1"><BriefcaseBusiness className="h-4 w-4" />{job.referralBonus || 'Referral bonus not set'}</span>
                    </div>
                    {job.skills && <div className="mt-4 flex flex-wrap gap-2">{job.skills.split(',').slice(0, 4).map((skill: string) => <span key={skill} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{skill.trim()}</span>)}</div>}
                  </article>
                ))}
              </div>
            </div>

            <div className="surface-card p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">Applicant pipeline</h3>
                  <p className="text-sm text-slate-500">Review inbound candidates, schedule interviews, and respond.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{totalApplications} total</span>
              </div>
              <div className="space-y-4">
                {loading ? <p className="text-sm text-slate-500">Loading applications...</p> : applications.length === 0 ? <div className="rounded-[1.5rem] bg-slate-50 p-6 text-sm text-slate-600">Applications will appear here after developers apply to your jobs.</div> : applications.map((app) => (
                  <article key={app.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-semibold">{app.jobTitle}</h4>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(app.status)}`}>{app.status}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">Applicant #{app.applicantId} · {app.company}</p>
                      </div>
                      <button onClick={() => { setSelectedApplication(app); setShowActionModal(true); setMessageText(''); }} className="linkedin-button">Manage</button>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{app.coverLetter || 'No cover letter submitted.'}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="surface-card p-5">
              <h3 className="text-lg font-semibold">Recruiter priorities</h3>
              <div className="mt-4 space-y-3">
                {[{ icon: Clock3, label: 'Respond faster to new applicants' }, { icon: Calendar, label: 'Schedule reviews inside 48 hours' }, { icon: Mail, label: 'Keep messaging active for top talent' }].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                    <item.icon className="mt-0.5 h-4 w-4 text-[#0a66c2]" />
                    <p className="text-sm text-slate-600">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card p-5">
              <h3 className="text-lg font-semibold">Product notes</h3>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>LinkedIn-like styling has been applied here without changing your API contract.</p>
                <p>The admin workspace is available at `/dashboard/admin`.</p>
              </div>
            </div>
          </aside>
        </section>
      </div>

      {showActionModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="surface-card max-h-[90vh] w-full max-w-3xl overflow-y-auto p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Manage application</h2>
              <p className="mt-1 text-sm text-slate-500">{selectedApplication.jobTitle} · Applicant #{selectedApplication.applicantId}</p>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <button onClick={() => handleUpdateStatus('ACCEPTED')} disabled={updating} className="rounded-2xl bg-green-600 px-6 py-4 font-semibold text-white disabled:opacity-50"><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-5 w-5" />Accept</span></button>
              <button onClick={() => handleUpdateStatus('REJECTED')} disabled={updating} className="rounded-2xl bg-orange-600 px-6 py-4 font-semibold text-white disabled:opacity-50"><span className="inline-flex items-center gap-2"><XCircle className="h-5 w-5" />Reject</span></button>
            </div>

            <div className="mb-6 border-t border-slate-200 pt-6">
              <h3 className="mb-4 text-lg font-semibold">Schedule interview</h3>
              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3" min={new Date().toISOString().split('T')[0]} />
                <input type="time" value={interviewTime} onChange={(e) => setInterviewTime(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3" />
              </div>
              <button onClick={handleScheduleInterview} disabled={updating || !interviewDate || !interviewTime} className="linkedin-button w-full disabled:cursor-not-allowed disabled:opacity-50">Mark reviewed and send interview details</button>
            </div>

            <div className="mb-6 border-t border-slate-200 pt-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold"><MessageSquareText className="h-5 w-5 text-[#0a66c2]" />Message applicant</h3>
              <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Write a message..." />
              <button onClick={handleSendMessage} disabled={updating || !messageText.trim()} className="linkedin-button mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50">Send message</button>
            </div>

            <button onClick={() => setShowActionModal(false)} disabled={updating} className="linkedin-button-secondary w-full">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}
