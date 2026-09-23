'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BriefcaseBusiness,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileSignature,
  Mail,
  MapPin,
  MessageSquareText,
  PlusCircle,
  Receipt,
  Search,
  Video,
  XCircle,
} from 'lucide-react';
import {
  billingUnitLabel,
  computeFeeBreakdown,
  createContract,
  createInterview,
  getClientContracts,
  getClientInterviews,
  getJobsByRecruiter,
  getRecruiterApplications,
  googleCalendarUrl,
  GOOGLE_MEET_NEW_URL,
  updateApplicationStatus,
  updateInterviewStatus,
  type BillingType,
} from '@/lib/api';
import ChatThread from '@/app/components/ChatThread';

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
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewNote, setInterviewNote] = useState('');
  const [interviews, setInterviews] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);
  const [contracts, setContracts] = useState<any[]>([]);
  const [contractBillingType, setContractBillingType] = useState<BillingType>('PROJECT');
  const [contractAmount, setContractAmount] = useState('');
  const [contractDescription, setContractDescription] = useState('');
  const [creatingContract, setCreatingContract] = useState(false);

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
      const [jobsData, recruiterApplications, contractsData, interviewsData] = await Promise.all([
        getJobsByRecruiter(currentUserId),
        getRecruiterApplications(currentUserId),
        getClientContracts(currentUserId),
        getClientInterviews(currentUserId),
      ]);

      const jobsById = new Map<number, any>(jobsData.map((job: any) => [Number(job.id), job] as const));
      const hydratedApplications = recruiterApplications.map((app: any) => {
        const job = jobsById.get(Number(app.jobId));
        return { ...app, jobTitle: job?.title || `Job #${app.jobId}`, company: job?.company || 'FreelanceHub company' };
      });

      setJobs(jobsData);
      setApplications(hydratedApplications);
      setContracts(contractsData);
      setInterviews(interviewsData);
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
    if (!meetingLink.trim()) {
      alert('Add a Google Meet link. Use "Create Meet link" to open Google Meet, then paste the link here.');
      return;
    }

    try {
      setUpdating(true);
      await createInterview({
        clientId: userId,
        developerId: selectedApplication.applicantId,
        jobId: selectedApplication.jobId,
        applicationId: selectedApplication.id,
        title: selectedApplication.jobTitle,
        meetingLink: meetingLink.trim(),
        scheduledAt: `${interviewDate}T${interviewTime}`,
        note: interviewNote.trim() || undefined,
      });
      await updateApplicationStatus(selectedApplication.id, 'REVIEWED');
      await refreshCurrentUserData();
      setInterviewDate('');
      setInterviewTime('');
      setMeetingLink('');
      setInterviewNote('');
    } catch (err: any) {
      console.error('Failed to schedule interview:', err);
      alert(err?.message || 'Failed to schedule interview');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelInterview = async (interviewId: number) => {
    try {
      setUpdating(true);
      await updateInterviewStatus(interviewId, 'CANCELLED');
      await refreshCurrentUserData();
    } catch (err: any) {
      console.error('Failed to cancel interview:', err);
      alert(err?.message || 'Failed to cancel interview');
    } finally {
      setUpdating(false);
    }
  };

  const getInterviewsForApplication = (applicationId: number) =>
    interviews.filter((iv) => Number(iv.applicationId) === Number(applicationId));

  const getContractForApplication = (applicationId: number) =>
    contracts.find((contract) => Number(contract.applicationId) === Number(applicationId));

  const handleCreateContract = async () => {
    if (!selectedApplication || !userId) return;

    const amount = parseFloat(contractAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Enter a valid contract amount greater than 0.');
      return;
    }

    try {
      setCreatingContract(true);
      await createContract({
        jobId: selectedApplication.jobId,
        clientId: userId,
        developerId: selectedApplication.applicantId,
        applicationId: selectedApplication.id,
        title: selectedApplication.jobTitle,
        description: contractDescription.trim() || undefined,
        billingType: contractBillingType,
        amount,
      });
      await refreshCurrentUserData();
      setShowActionModal(false);
      setSelectedApplication(null);
      setContractAmount('');
      setContractDescription('');
      setContractBillingType('PROJECT');
    } catch (err: any) {
      console.error('Failed to create contract:', err);
      alert(err?.message || 'Failed to create contract');
    } finally {
      setCreatingContract(false);
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
                <Link href="/dashboard/messages" className="linkedin-button-secondary flex w-full gap-2"><MessageSquareText className="h-4 w-4" />Messages</Link>
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
                      <button onClick={() => { setSelectedApplication(app); setShowActionModal(true); setInterviewDate(''); setInterviewTime(''); setMeetingLink(''); setInterviewNote(''); setContractAmount(''); setContractDescription(''); setContractBillingType('PROJECT'); }} className="linkedin-button">Manage</button>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{app.coverLetter || 'No cover letter submitted.'}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="surface-card p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-semibold"><Receipt className="h-5 w-5 text-[#0a66c2]" />Contracts</h3>
                  <p className="text-sm text-slate-500">Finalized agreements with the 5% platform fee applied.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{contracts.length} total</span>
              </div>
              <div className="space-y-4">
                {loading ? <p className="text-sm text-slate-500">Loading contracts...</p> : contracts.length === 0 ? <div className="rounded-[1.5rem] bg-slate-50 p-6 text-sm text-slate-600">No contracts yet. Accept an applicant and send a final contract from the Manage panel.</div> : contracts.map((contract) => (
                  <article key={contract.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-semibold">{contract.title || `Contract #${contract.id}`}</h4>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(contract.status === 'ACTIVE' || contract.status === 'COMPLETED' ? 'ACCEPTED' : contract.status === 'CANCELLED' ? 'REJECTED' : contract.status)}`}>{contract.status}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">Developer #{contract.developerId} · {contract.billingType}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-1 text-sm text-slate-600 sm:grid-cols-3">
                      <span>Agreed: {contract.currency} {contract.amount}{billingUnitLabel(contract.billingType)}</span>
                      <span className="text-orange-600">Fee (5%): −{contract.currency} {contract.platformFee}{billingUnitLabel(contract.billingType)}</span>
                      <span className="font-semibold text-[#0a66c2]">Developer nets: {contract.currency} {contract.developerEarnings}{billingUnitLabel(contract.billingType)}</span>
                    </div>
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
              <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold"><FileSignature className="h-5 w-5 text-[#0a66c2]" />Final contract</h3>
              {(() => {
                const existing = getContractForApplication(selectedApplication.id);
                if (existing) {
                  return (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                      <p className="font-semibold text-slate-700">Contract #{existing.id} · {existing.status}</p>
                      <div className="mt-2 grid gap-1 text-slate-600">
                        <span>Billing: {existing.billingType}</span>
                        <span>Agreed: {existing.currency} {existing.amount}{billingUnitLabel(existing.billingType)}</span>
                        <span>Platform fee (5%): −{existing.currency} {existing.platformFee}{billingUnitLabel(existing.billingType)}</span>
                        <span className="font-semibold text-[#0a66c2]">Developer receives: {existing.currency} {existing.developerEarnings}{billingUnitLabel(existing.billingType)}</span>
                      </div>
                    </div>
                  );
                }
                if (selectedApplication.status !== 'ACCEPTED') {
                  return <p className="text-sm text-slate-500">Accept the application first to send the final contract.</p>;
                }
                const preview = computeFeeBreakdown(parseFloat(contractAmount));
                const unit = billingUnitLabel(contractBillingType);
                return (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500">A 5% platform fee is deducted from the developer&apos;s payout when the contract is finalized.</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <select value={contractBillingType} onChange={(e) => setContractBillingType(e.target.value as BillingType)} className="rounded-2xl border border-slate-200 px-4 py-3">
                        <option value="PROJECT">Project based (fixed fee)</option>
                        <option value="HOURLY">Hourly rate</option>
                        <option value="MONTHLY">Monthly rate</option>
                      </select>
                      <input type="number" min="0" step="0.01" value={contractAmount} onChange={(e) => setContractAmount(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3" placeholder={contractBillingType === 'PROJECT' ? 'Total project fee (USD)' : `Rate (USD${unit})`} />
                    </div>
                    <textarea value={contractDescription} onChange={(e) => setContractDescription(e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Scope / terms (optional)" />
                    <div className="rounded-2xl bg-[#e8f3ff] p-4 text-sm text-slate-700">
                      <div className="flex items-center justify-between"><span>Agreed amount</span><span className="font-semibold">${preview.amount.toFixed(2)}{unit}</span></div>
                      <div className="flex items-center justify-between"><span>Platform fee (5%)</span><span className="font-semibold text-orange-600">−${preview.platformFee.toFixed(2)}{unit}</span></div>
                      <div className="mt-1 flex items-center justify-between border-t border-[#c9e2ff] pt-2"><span>Developer receives</span><span className="font-semibold text-[#0a66c2]">${preview.developerEarnings.toFixed(2)}{unit}</span></div>
                    </div>
                    <button onClick={handleCreateContract} disabled={creatingContract || !(parseFloat(contractAmount) > 0)} className="linkedin-button w-full disabled:cursor-not-allowed disabled:opacity-50">{creatingContract ? 'Sending contract…' : 'Send final contract'}</button>
                  </div>
                );
              })()}
            </div>

            <div className="mb-6 border-t border-slate-200 pt-6">
              <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold"><Video className="h-5 w-5 text-[#0a66c2]" />Schedule Google Meet interview</h3>
              <p className="mb-4 text-sm text-slate-500">Create a Meet link, pick a time, and the developer is notified with the join link.</p>

              {getInterviewsForApplication(selectedApplication.id).length > 0 && (
                <div className="mb-4 space-y-2">
                  {getInterviewsForApplication(selectedApplication.id).map((iv: any) => (
                    <div key={iv.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 p-3 text-sm">
                      <div>
                        <p className="font-semibold text-slate-700">{new Date(iv.scheduledAt).toLocaleString()}</p>
                        <p className="text-xs text-slate-500">Status: {iv.status}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer" className="linkedin-button-secondary inline-flex items-center gap-1 text-sm"><Video className="h-4 w-4" />Join</a>
                        {iv.status === 'SCHEDULED' && <button onClick={() => handleCancelInterview(iv.id)} disabled={updating} className="text-sm font-semibold text-orange-600 disabled:opacity-50">Cancel</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-3 flex flex-wrap items-center gap-3">
                <a href={GOOGLE_MEET_NEW_URL} target="_blank" rel="noopener noreferrer" className="linkedin-button-secondary inline-flex items-center gap-2 whitespace-nowrap"><ExternalLink className="h-4 w-4" />Create Meet link</a>
                <input type="url" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} className="min-w-[200px] flex-1 rounded-2xl border border-slate-200 px-4 py-3" placeholder="Paste Google Meet link (https://meet.google.com/...)" />
              </div>
              <div className="mb-3 grid gap-4 md:grid-cols-2">
                <input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3" min={new Date().toISOString().split('T')[0]} />
                <input type="time" value={interviewTime} onChange={(e) => setInterviewTime(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3" />
              </div>
              <textarea value={interviewNote} onChange={(e) => setInterviewNote(e.target.value)} rows={2} className="mb-3 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Agenda / note for the developer (optional)" />
              {interviewDate && interviewTime && meetingLink.trim() && (
                <a href={googleCalendarUrl({ title: `Interview: ${selectedApplication.jobTitle}`, scheduledAt: `${interviewDate}T${interviewTime}`, details: `Google Meet: ${meetingLink.trim()}`, location: meetingLink.trim() })} target="_blank" rel="noopener noreferrer" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0a66c2]"><CalendarPlus className="h-4 w-4" />Add to Google Calendar</a>
              )}
              <button onClick={handleScheduleInterview} disabled={updating || !interviewDate || !interviewTime || !meetingLink.trim()} className="linkedin-button w-full disabled:cursor-not-allowed disabled:opacity-50">Send interview invite &amp; mark reviewed</button>
            </div>

            <div className="mb-6 border-t border-slate-200 pt-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold"><MessageSquareText className="h-5 w-5 text-[#0a66c2]" />Discuss the project</h3>
              {userId && <ChatThread currentUserId={userId} otherUserId={selectedApplication.applicantId} otherLabel={selectedApplication.applicantName} />}
            </div>

            <button onClick={() => setShowActionModal(false)} disabled={updating} className="linkedin-button-secondary w-full">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}
