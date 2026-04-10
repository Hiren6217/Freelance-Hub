'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Users, MessageSquare, TrendingUp, PlusCircle, Search, MapPin, DollarSign, FileText, CheckCircle, Clock, XCircle, Calendar, Mail, Check, X } from 'lucide-react';
import { getJobs, getJobApplications, updateApplicationStatus } from '@/lib/api';

export default function ClientDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplications, setShowApplications] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Check if user is logged in and is a client
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    const id = localStorage.getItem('userId');
    
    if (!role || role !== 'CLIENT') {
      router.push('/login');
      return;
    }
    
    setUserName(name || 'Client');
    setUserEmail(email || '');
    setUserId(id ? parseInt(id) : null);
    fetchJobs();
    fetchApplications();
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

  const fetchApplications = async () => {
    try {
      const currentUserId = parseInt(localStorage.getItem('userId') || '0');
      console.log('Fetching applications for user ID:', currentUserId);
      
      const jobsData = await getJobs();
      console.log('Total jobs fetched:', jobsData.length);
      
      const myJobsList = jobsData.filter((job: any) => job.recruiterId === currentUserId);
      console.log('My jobs count:', myJobsList.length, 'Job IDs:', myJobsList.map((j: any) => j.id));
      
      const allApplications: any[] = [];
      for (const job of myJobsList) {
        console.log(`Fetching applications for job ${job.id} (${job.title})...`);
        const jobApplications = await getJobApplications(job.id);
        console.log(`Found ${jobApplications.length} applications for job ${job.id}`);
        allApplications.push(...jobApplications.map((app: any) => ({
          ...app,
          jobTitle: job.title,
          company: job.company
        })));
      }
      
      console.log('Total applications:', allApplications.length);
      setApplications(allApplications);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  // Filter jobs posted by this client
  const myJobs = jobs.filter(job => job.recruiterId === userId);
  const activeJobsCount = myJobs.length;
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === 'PENDING').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'REVIEWED':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-slate/40" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-700';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate/10 text-slate/70';
    }
  };

  const handleOpenActionModal = (application: any) => {
    setSelectedApplication(application);
    setShowActionModal(true);
    setMessageText('');
    setInterviewDate('');
    setInterviewTime('');
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedApplication) return;
    
    try {
      setUpdating(true);
      await updateApplicationStatus(selectedApplication.id, newStatus);
      
      // Refresh applications
      await fetchApplications();
      
      setShowActionModal(false);
      setSelectedApplication(null);
      alert(`Application ${newStatus.toLowerCase()} successfully!`);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(err.message || 'Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const handleScheduleInterview = () => {
    if (!interviewDate || !interviewTime) {
      alert('Please select both date and time for the interview');
      return;
    }
    
    // For now, just mark as REVIEWED with message
    const message = `Interview scheduled for ${interviewDate} at ${interviewTime}\n\n${messageText}`;
    console.log('Scheduling interview:', { applicationId: selectedApplication.id, date: interviewDate, time: interviewTime, message });
    
    handleUpdateStatus('REVIEWED');
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }
    
    console.log('Sending message to applicant:', { applicationId: selectedApplication.id, message: messageText });
    alert('Message sent successfully! (Feature will be fully implemented with messaging system)');
    setShowActionModal(false);
    setMessageText('');
  };

  return (
    <main className="min-h-screen bg-slate/5">
      {/* Header */}
      <header className="bg-white border-b border-black/10">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/freelancehub-logo.svg" alt="FreelanceHub" className="h-10 w-10 rounded-xl" />
              <div>
                <h1 className="text-lg font-semibold">FreelanceHub</h1>
                <p className="text-xs text-slate/70">Client Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold">{userName}</p>
                <p className="text-xs text-slate/70">{userEmail}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold hover:bg-slate/5"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 rounded-[2rem] bg-ink p-8 text-white">
          <h2 className="text-3xl font-semibold">Welcome back, {userName.split(' ')[0]}!</h2>
          <p className="mt-2 text-slate/80">Find top talent through trusted referrals</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            { icon: Briefcase, label: 'Active Jobs', value: loading ? '...' : activeJobsCount.toString(), color: 'bg-blue-500' },
            { icon: FileText, label: 'Total Applications', value: loading ? '...' : totalApplications.toString(), color: 'bg-ember' },
            { icon: Clock, label: 'Pending Review', value: loading ? '...' : pendingApplications.toString(), color: 'bg-yellow-500' },
            { icon: TrendingUp, label: 'Hired This Month', value: '0', color: 'bg-purple-500' }
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white p-6 shadow-lg">
              <div className={`inline-flex rounded-xl ${stat.color} p-3 text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-3xl font-semibold">{stat.value}</p>
              <p className="text-sm text-slate/70">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/dashboard/client/post-job" className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="rounded-xl bg-ember p-3 text-white">
                <PlusCircle className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Post a New Job</p>
                <p className="text-sm text-slate/70">Create a job posting with referral bonus</p>
              </div>
            </Link>
            
            <Link href="/dashboard/client/browse-developers" className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="rounded-xl bg-ink p-3 text-white">
                <Search className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Browse Developers</p>
                <p className="text-sm text-slate/70">Find referred talent for your projects</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-white p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">My Posted Jobs</h3>
            <Link 
              href="/dashboard/client/post-job"
              className="flex items-center gap-2 rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white hover:bg-ember/90 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Post New Job
            </Link>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-xl bg-slate/5 p-4">
                  <div className="h-4 w-3/4 bg-slate/20 rounded mb-2"></div>
                  <div className="h-3 w-1/2 bg-slate/20 rounded"></div>
                </div>
              ))}
            </div>
          ) : myJobs.length > 0 ? (
            <div className="space-y-4">
              {myJobs.map((job) => (
                <div key={job.id} className="rounded-xl border border-black/10 p-4 hover:bg-slate/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{job.title}</h4>
                      <p className="text-sm text-slate/70 mt-1">{job.company}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate/60">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{job.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{job.referralBonus || 'N/A'}</span>
                        </div>
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                          {job.jobType || 'Full-time'}
                        </span>
                      </div>
                      {job.skills && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {job.skills.split(',').slice(0, 3).map((skill: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 rounded-md bg-slate/10 text-xs">
                              {skill.trim()}
                            </span>
                          ))}
                          {job.skills.split(',').length > 3 && (
                            <span className="px-2 py-1 rounded-md bg-slate/10 text-xs">
                              +{job.skills.split(',').length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-slate/60">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate/5 p-8 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-slate/40 mb-3" />
              <p className="text-slate/70 mb-2">No jobs posted yet</p>
              <p className="text-sm text-slate/60 mb-4">Start by posting your first job to find top talent!</p>
              <Link 
                href="/dashboard/client/post-job"
                className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-2 text-sm font-semibold text-white hover:bg-ember/90 transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                Post Your First Job
              </Link>
            </div>
          )}
        </div>

        {/* Job Applications Section */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">Job Applications</h3>
              <p className="text-sm text-slate/70 mt-1">
                {totalApplications} application{totalApplications !== 1 ? 's' : ''} received
                {pendingApplications > 0 && ` • ${pendingApplications} pending`}
              </p>
            </div>
            <button
              onClick={() => setShowApplications(!showApplications)}
              className="text-sm font-semibold text-ember hover:text-ember/80"
            >
              {showApplications ? 'Hide Details' : 'View All'}
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-xl bg-slate/5 p-4">
                  <div className="h-4 w-3/4 bg-slate/20 rounded mb-2"></div>
                  <div className="h-3 w-1/2 bg-slate/20 rounded"></div>
                </div>
              ))}
            </div>
          ) : showApplications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="rounded-xl border border-black/10 p-4 hover:bg-slate/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">Application for {app.jobTitle}</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate/70">
                        Applied by Developer #{app.applicantId}
                      </p>
                      {app.coverLetter && (
                        <div className="mt-2 p-3 bg-slate/5 rounded-lg">
                          <p className="text-xs text-slate/60 font-medium mb-1">Cover Letter:</p>
                          <p className="text-sm text-slate/70 line-clamp-2">{app.coverLetter}</p>
                        </div>
                      )}
                      <p className="text-xs text-slate/60 mt-2">
                        Applied {new Date(app.appliedAt).toLocaleDateString()} at {new Date(app.appliedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      <button
                        onClick={() => handleOpenActionModal(app)}
                        className="flex items-center gap-2 rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white hover:bg-ember/90 transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        Actions
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : showApplications && applications.length === 0 ? (
            <div className="rounded-xl bg-slate/5 p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-slate/40 mb-3" />
              <p className="text-slate/70 mb-2">No applications yet</p>
              <p className="text-sm text-slate/60">Applications will appear here when developers apply to your jobs</p>
            </div>
          ) : (
            <div className="rounded-xl bg-slate/5 p-6 text-center">
              <p className="text-sm text-slate/60">
                {totalApplications > 0 
                  ? `You have ${totalApplications} application${totalApplications !== 1 ? 's' : ''}. Click "View All" to see details.`
                  : 'Applications will appear here when developers apply to your jobs'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Application Action Modal */}
      {showActionModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Application Actions</h2>
              <p className="text-sm text-slate/70">
                {selectedApplication.jobTitle} - Developer #{selectedApplication.applicantId}
              </p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(selectedApplication.status)}`}>
                {getStatusIcon(selectedApplication.status)}
                {selectedApplication.status}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <button
                onClick={() => handleUpdateStatus('ACCEPTED')}
                disabled={updating}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-4 font-semibold text-white hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                <Check className="h-5 w-5" />
                Accept Application
              </button>
              <button
                onClick={() => handleUpdateStatus('REJECTED')}
                disabled={updating}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-4 font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
                Reject Application
              </button>
            </div>

            {/* Schedule Interview */}
            <div className="border-t border-black/10 pt-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-ember" />
                Schedule Interview
              </h3>
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Interview Date</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full rounded-xl border border-black/10 px-4 py-3"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Interview Time</label>
                  <input
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full rounded-xl border border-black/10 px-4 py-3"
                  />
                </div>
              </div>
              <button
                onClick={handleScheduleInterview}
                disabled={updating || !interviewDate || !interviewTime}
                className="w-full rounded-xl bg-ember px-6 py-3 font-semibold text-white hover:bg-ember/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Processing...' : 'Schedule Interview & Mark as Reviewed'}
              </button>
            </div>

            {/* Send Message */}
            <div className="border-t border-black/10 pt-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Send Message to Applicant
              </h3>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full rounded-xl border border-black/10 px-4 py-3 resize-none mb-4"
              />
              <button
                onClick={handleSendMessage}
                disabled={updating || !messageText.trim()}
                className="w-full rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Message
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowActionModal(false)}
              className="w-full rounded-xl border border-black/10 px-6 py-3 font-semibold hover:bg-slate/5 transition-colors"
              disabled={updating}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
