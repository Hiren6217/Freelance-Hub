'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Eye,
  FileSignature,
  Mail,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  Video,
  XCircle,
} from 'lucide-react';
import {
  billingUnitLabel,
  getApplicantApplications,
  getDeveloperContracts,
  getDeveloperInterviews,
  getJobs,
  getMessages,
  getNotifications,
  updateContractStatus,
} from '@/lib/api';
import ResumeUpload from '@/app/components/ResumeUpload';
import JobMatch from '@/app/components/JobMatch';
import ChatThread from '@/app/components/ChatThread';

export default function DeveloperDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('Developer');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [jobCount, setJobCount] = useState(0);
  const [applications, setApplications] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('applications');
  const [contracts, setContracts] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [updatingContractId, setUpdatingContractId] = useState<number | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    const id = localStorage.getItem('userId');

    if (role !== 'DEVELOPER') {
      router.push('/login');
      return;
    }

    const parsedUserId = id ? parseInt(id, 10) : null;
    setUserName(name || 'Developer');
    setUserEmail(email || '');
    setUserId(parsedUserId);

    void fetchJobCount();

    if (parsedUserId) {
      void fetchDashboardData(parsedUserId);
    } else {
      setLoading(false);
    }
  }, [router]);

  const fetchJobCount = async () => {
    try {
      const jobs = await getJobs();
      setJobCount(jobs.length);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  const fetchDashboardData = async (currentUserId: number) => {
    try {
      setLoading(true);
      const [applicationsData, notificationsData, messagesData, contractsData, interviewsData] = await Promise.all([
        getApplicantApplications(currentUserId),
        getNotifications(currentUserId),
        getMessages(currentUserId),
        getDeveloperContracts(currentUserId),
        getDeveloperInterviews(currentUserId),
      ]);

      setApplications(applicationsData);
      setNotifications(notificationsData);
      setMessages(messagesData);
      setContracts(contractsData);
      setInterviews(interviewsData);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch developer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (userId) await fetchDashboardData(userId);
    await fetchJobCount();
  };

  const handleLogout = () => {
    ['authToken', 'userId', 'userEmail', 'userName', 'userRole'].forEach((key) => localStorage.removeItem(key));
    router.push('/');
  };

  const handleContractStatus = async (contractId: number, status: string) => {
    try {
      setUpdatingContractId(contractId);
      await updateContractStatus(contractId, status);
      if (userId) await fetchDashboardData(userId);
    } catch (err: any) {
      console.error('Failed to update contract:', err);
      alert(err?.message || 'Failed to update contract');
    } finally {
      setUpdatingContractId(null);
    }
  };

  const pendingContracts = contracts.filter((c) => c.status === 'PENDING').length;
  const upcomingInterviews = interviews.filter((iv) => iv.status === 'SCHEDULED').length;

  const getInterviewsForApplication = (applicationId: number) =>
    interviews.filter((iv) => Number(iv.applicationId) === Number(applicationId));

  const acceptedCount = applications.filter((a) => a.status === 'ACCEPTED').length;
  const reviewedCount = applications.filter((a) => a.status === 'REVIEWED').length;

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

  return (
    <main className="min-h-screen py-6">
      <div className="page-shell">
        <section className="feed-grid mt-6">
          <aside className="space-y-6">
            <div className="surface-card p-5">
              <p className="text-sm text-slate-500">Your profile</p>
              <h2 className="mt-2 text-xl font-semibold">{userName}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Keep your profile active, discover jobs, and monitor replies from recruiters.</p>
              <div className="mt-4 grid gap-3">
                <Link href="/dashboard/developer/browse-jobs" className="linkedin-button flex w-full gap-2"><Search className="h-4 w-4" />Browse jobs</Link>
                <Link href="/dashboard/messages" className="linkedin-button-secondary flex w-full gap-2"><MessageSquareText className="h-4 w-4" />Messages</Link>
                <div className="rounded-2xl bg-[#e8f3ff] px-4 py-3 text-sm text-[#0a66c2]">Last refreshed {lastRefreshed.toLocaleTimeString()}</div>
              </div>
            </div>

            <div className="surface-card p-5">
              <h3 className="text-lg font-semibold">Snapshot</h3>
              <div className="mt-4 space-y-3">
                {[{ label: 'Open jobs', value: jobCount }, { label: 'Applications', value: applications.length }, { label: 'Reviewed', value: reviewedCount }, { label: 'Accepted', value: acceptedCount }].map((item) => (
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0a66c2]">Member feed</p>
              <h2 className="mt-3 text-3xl font-semibold">Find work, follow your pipeline, and stay visible.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">The layout mirrors a professional networking app: strong profile column, central feed of applications, and a right rail for notifications and messaging.</p>
            </div>

            <div className="surface-card p-6">
              <div className="mb-5">
                <div className="flex space-x-4 border-b">
                  <button
                    onClick={() => setActiveTab('applications')}
                    className={`py-2 px-4 ${activeTab === 'applications' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                  >
                    My Applications
                  </button>
                  <button
                    onClick={() => setActiveTab('resume')}
                    className={`py-2 px-4 ${activeTab === 'resume' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                  >
                    Resume Upload
                  </button>
                  <button
                    onClick={() => setActiveTab('matches')}
                    className={`py-2 px-4 ${activeTab === 'matches' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                  >
                    Job Matches
                  </button>
                  <button
                    onClick={() => setActiveTab('contracts')}
                    className={`py-2 px-4 ${activeTab === 'contracts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                  >
                    Contracts{pendingContracts > 0 ? ` (${pendingContracts})` : ''}
                  </button>
                  <button
                    onClick={() => setActiveTab('interviews')}
                    className={`py-2 px-4 ${activeTab === 'interviews' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                  >
                    Interviews{upcomingInterviews > 0 ? ` (${upcomingInterviews})` : ''}
                  </button>
                </div>
              </div>

              {activeTab === 'applications' && (
                <>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">My applications</h3>
                      <p className="text-sm text-slate-500">Track each job you applied to and current hiring status.</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{applications.length} submitted</span>
                  </div>

                  <div className="space-y-4">
                    {loading ? <p className="text-sm text-slate-500">Loading applications...</p> : applications.length === 0 ? <div className="rounded-[1.5rem] bg-slate-50 p-6 text-sm text-slate-600">You have not applied to any jobs yet. Start with the browse jobs page.</div> : applications.map((app: any) => (
                      <article key={app.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-semibold">Application #{app.id}</h4>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(app.status)}`}>{app.status}</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">Job ID {app.jobId} · Recruiter ID {app.recruiterId}</p>
                          </div>
                          <button onClick={() => { setSelectedApplication(app); setShowDetailsModal(true); }} className="linkedin-button"><span className="inline-flex items-center gap-2"><Eye className="h-4 w-4" />Details</span></button>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{app.coverLetter || 'No cover letter was attached to this application.'}</p>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {activeTab === 'resume' && <ResumeUpload />}
              {activeTab === 'matches' && <JobMatch />}

              {activeTab === 'contracts' && (
                <>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-xl font-semibold"><FileSignature className="h-5 w-5 text-[#0a66c2]" />My contracts</h3>
                      <p className="text-sm text-slate-500">Review and accept final contracts. A 5% platform fee is deducted from your payout.</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{contracts.length} total</span>
                  </div>

                  <div className="space-y-4">
                    {loading ? <p className="text-sm text-slate-500">Loading contracts...</p> : contracts.length === 0 ? <div className="rounded-[1.5rem] bg-slate-50 p-6 text-sm text-slate-600">No contracts yet. When a client finalizes an agreement, it will appear here.</div> : contracts.map((contract: any) => (
                      <article key={contract.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-semibold">{contract.title || `Contract #${contract.id}`}</h4>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(contract.status === 'ACTIVE' ? 'ACCEPTED' : contract.status === 'CANCELLED' ? 'REJECTED' : contract.status)}`}>{contract.status}</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">Client #{contract.clientId} · {contract.billingType}</p>
                          </div>
                        </div>
                        {contract.description && <p className="mt-3 text-sm leading-6 text-slate-600">{contract.description}</p>}
                        <div className="mt-3 rounded-2xl bg-white p-4 text-sm">
                          <div className="flex items-center justify-between text-slate-600"><span>Agreed amount</span><span className="font-semibold">{contract.currency} {contract.amount}{billingUnitLabel(contract.billingType)}</span></div>
                          <div className="flex items-center justify-between text-slate-600"><span>Platform fee (5%)</span><span className="font-semibold text-orange-600">−{contract.currency} {contract.platformFee}{billingUnitLabel(contract.billingType)}</span></div>
                          <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-2"><span>You receive</span><span className="font-semibold text-[#0a66c2]">{contract.currency} {contract.developerEarnings}{billingUnitLabel(contract.billingType)}</span></div>
                        </div>
                        {contract.status === 'PENDING' && (
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <button onClick={() => handleContractStatus(contract.id, 'ACTIVE')} disabled={updatingContractId === contract.id} className="rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white disabled:opacity-50"><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Accept &amp; finalize</span></button>
                            <button onClick={() => handleContractStatus(contract.id, 'CANCELLED')} disabled={updatingContractId === contract.id} className="rounded-2xl bg-orange-600 px-6 py-3 font-semibold text-white disabled:opacity-50"><span className="inline-flex items-center gap-2"><XCircle className="h-4 w-4" />Decline</span></button>
                          </div>
                        )}
                        {contract.status === 'ACTIVE' && <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm text-green-700"><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Contract finalized. Net earnings shown are after the 5% platform fee.</span></div>}
                      </article>
                    ))}
                  </div>
                </>
              )}

              {activeTab === 'interviews' && (
                <>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 text-xl font-semibold"><Video className="h-5 w-5 text-[#0a66c2]" />Interviews</h3>
                      <p className="text-sm text-slate-500">Google Meet interviews scheduled by clients. Join at the scheduled time.</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{interviews.length} total</span>
                  </div>

                  <div className="space-y-4">
                    {loading ? <p className="text-sm text-slate-500">Loading interviews...</p> : interviews.length === 0 ? <div className="rounded-[1.5rem] bg-slate-50 p-6 text-sm text-slate-600">No interviews scheduled yet. When a client sets up a Google Meet, it will appear here.</div> : interviews.map((iv: any) => (
                      <article key={iv.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-semibold">{iv.title || `Interview #${iv.id}`}</h4>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(iv.status === 'SCHEDULED' ? 'REVIEWED' : iv.status === 'CANCELLED' ? 'REJECTED' : 'ACCEPTED')}`}>{iv.status}</span>
                            </div>
                            <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500"><CalendarDays className="h-4 w-4 text-[#0a66c2]" />{new Date(iv.scheduledAt).toLocaleString()} · Client #{iv.clientId}</p>
                          </div>
                          {iv.status === 'SCHEDULED' && <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer" className="linkedin-button"><span className="inline-flex items-center gap-2"><Video className="h-4 w-4" />Join Meet</span></a>}
                        </div>
                        {iv.note && <p className="mt-3 text-sm leading-6 text-slate-600">{iv.note}</p>}
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="surface-card p-5">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#0a66c2]" />
                <h3 className="text-lg font-semibold">Notifications</h3>
              </div>
              <div className="mt-4 space-y-3">
                {notifications.length === 0 ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No notifications yet.</div> : notifications.slice(0, 4).map((notification: any) => (
                  <div key={notification.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold">{notification.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{notification.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[#0a66c2]" />
                  <h3 className="text-lg font-semibold">Messages</h3>
                </div>
                <Link href="/dashboard/messages" className="text-sm font-semibold text-[#0a66c2] hover:underline">View all</Link>
              </div>
              <div className="mt-4 space-y-3">
                {messages.length === 0 ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No client messages yet.</div> : messages.slice(0, 4).map((message: any) => (
                  <Link key={message.id} href={`/dashboard/messages?with=${message.senderId}`} className="block rounded-2xl bg-slate-50 p-4 transition hover:bg-[#e8f3ff]">
                    <p className="line-clamp-2 whitespace-pre-wrap text-sm text-slate-600">{message.content}</p>
                    <p className="mt-1 text-xs font-semibold text-[#0a66c2]">Open conversation →</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="surface-card p-5">
              <h3 className="text-lg font-semibold">Growth tips</h3>
              <div className="mt-4 space-y-3">
                {[{ icon: Star, label: 'Improve profile completeness for better visibility.' }, { icon: TrendingUp, label: 'Follow up quickly on reviewed applications.' }, { icon: ShieldCheck, label: 'Keep messaging professional to preserve trust score.' }].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                    <item.icon className="mt-0.5 h-4 w-4 text-[#0a66c2]" />
                    <p className="text-sm text-slate-600">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>

      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="surface-card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Application details</h2>
              <p className="mt-1 text-sm text-slate-500">Application #{selectedApplication.id}</p>
            </div>

            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(selectedApplication.status)}`}>{selectedApplication.status}</span>
                <span className="text-sm text-slate-500">Job ID {selectedApplication.jobId}</span>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p className="inline-flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-[#0a66c2]" />Recruiter ID {selectedApplication.recruiterId}</p>
                <p className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#0a66c2]" />Applied {new Date(selectedApplication.appliedAt).toLocaleString()}</p>
                <p>{selectedApplication.coverLetter || 'No cover letter submitted.'}</p>
              </div>

              <div className="mt-5 space-y-3">
                {selectedApplication.status === 'ACCEPTED' && <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-700"><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Your application was accepted.</span></div>}
                {selectedApplication.status === 'REVIEWED' && <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700"><span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />This application is under review.</span></div>}
                {selectedApplication.status === 'REJECTED' && <div className="rounded-2xl bg-orange-50 p-4 text-sm text-orange-700"><span className="inline-flex items-center gap-2"><XCircle className="h-4 w-4" />This application was not selected.</span></div>}
              </div>
            </div>

            {getInterviewsForApplication(selectedApplication.id).length > 0 && (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Video className="h-5 w-5 text-[#0a66c2]" />Interviews</h3>
                <div className="space-y-2">
                  {getInterviewsForApplication(selectedApplication.id).map((iv: any) => (
                    <div key={iv.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 p-3 text-sm">
                      <div>
                        <p className="font-semibold text-slate-700">{new Date(iv.scheduledAt).toLocaleString()}</p>
                        <p className="text-xs text-slate-500">Status: {iv.status}</p>
                      </div>
                      {iv.status === 'SCHEDULED' && <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer" className="linkedin-button-secondary inline-flex items-center gap-1 text-sm"><Video className="h-4 w-4" />Join</a>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-slate-200 pt-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold"><MessageSquareText className="h-5 w-5 text-[#0a66c2]" />Discuss with the client</h3>
              {userId && <ChatThread currentUserId={userId} otherUserId={selectedApplication.recruiterId} otherLabel={`Client #${selectedApplication.recruiterId}`} />}
            </div>

            <button onClick={() => setShowDetailsModal(false)} className="linkedin-button-secondary mt-6 w-full">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}
