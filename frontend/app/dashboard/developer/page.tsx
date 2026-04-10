'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Star, MessageSquare, TrendingUp, FileText, Award, CheckCircle, Clock, XCircle, Calendar, Mail, Eye, RefreshCw } from 'lucide-react';
import { getJobs, getApplicantApplications } from '@/lib/api';

export default function DeveloperDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [jobCount, setJobCount] = useState(0);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    // Check if user is logged in and is a developer
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    const id = localStorage.getItem('userId');
    
    if (!role || role !== 'DEVELOPER') {
      router.push('/login');
      return;
    }
    
    setUserName(name || 'Developer');
    setUserEmail(email || '');
    setUserId(id ? parseInt(id) : null);
    fetchJobCount();
    fetchApplications();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      console.log('Auto-refreshing applications...');
      fetchApplications();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [router]);

  const fetchJobCount = async () => {
    try {
      const jobs = await getJobs();
      setJobCount(jobs.length);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  const fetchApplications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      console.log('🔄 Fetching applications for developer ID:', userId);
      const applicationsData = await getApplicantApplications(userId);
      console.log('✅ Applications fetched:', applicationsData.length);
      console.log('📋 Applications data:', applicationsData);
      
      // Log each application status
      applicationsData.forEach((app: any, index: number) => {
        console.log(`📝 Application ${index + 1}:`, {
          id: app.id,
          jobId: app.jobId,
          status: app.status,
          appliedAt: app.appliedAt
        });
      });
      
      setApplications(applicationsData);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('❌ Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const handleRefresh = async () => {
    setLastRefreshed(new Date());
    await fetchApplications();
    await fetchJobCount();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    router.push('/');
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
                <p className="text-xs text-slate/70">Developer Dashboard</p>
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
        <div className="mb-8 rounded-[2rem] bg-gradient-to-r from-ember to-orange-600 p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-semibold">Welcome back, {userName.split(' ')[0]}!</h2>
              <p className="mt-2 text-white/90">Discover opportunities through trusted referrals</p>
              <p className="mt-2 text-xs text-white/70">
                Last updated: {lastRefreshed.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-7">
          {[
            { icon: Briefcase, label: 'Available Jobs', value: jobCount.toString(), color: 'bg-blue-500' },
            { icon: Star, label: 'Referral Score', value: '0', color: 'bg-amber-500' },
            { icon: MessageSquare, label: 'Messages', value: '0', color: 'bg-green-500' },
            { icon: TrendingUp, label: 'Total Applications', value: applications.length.toString(), color: 'bg-purple-500' },
            { icon: CheckCircle, label: 'Accepted', value: applications.filter((a: any) => a.status === 'ACCEPTED').length.toString(), color: 'bg-green-500' },
            { icon: Clock, label: 'Pending', value: applications.filter((a: any) => a.status === 'PENDING').length.toString(), color: 'bg-yellow-500' },
            { icon: Calendar, label: 'Interviews', value: applications.filter((a: any) => a.status === 'REVIEWED').length.toString(), color: 'bg-blue-500' }
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
          <div className="grid gap-4 md:grid-cols-3">
            <button className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="rounded-xl bg-ember p-3 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Complete Profile</p>
                <p className="text-sm text-slate/70">Add your skills & experience</p>
              </div>
            </button>
            
            <button className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="rounded-xl bg-ink p-3 text-white">
                <Briefcase className="h-6 w-6" />
              </div>
              <Link href="/dashboard/developer/browse-jobs" className="text-left block">
                <p className="font-semibold">Browse Jobs</p>
                <p className="text-sm text-slate/70">Find referred opportunities</p>
              </Link>
            </button>
            
            <button className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="rounded-xl bg-green-500 p-3 text-white">
                <Award className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold">View Referrals</p>
                <p className="text-sm text-slate/70">Track your referral status</p>
              </div>
            </button>
          </div>
        </div>

        {/* Job Applications */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-6 w-6 text-ember" />
              Your Job Applications
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate/70">
                {applications.length} Total Applications
              </span>
              {applications.some((a: any) => a.status === 'ACCEPTED') && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3" />
                  {applications.filter((a: any) => a.status === 'ACCEPTED').length} Accepted
                </span>
              )}
            </div>
          </div>
          
          {/* Recent Actions Notification */}
          {applications.some((a: any) => a.status === 'ACCEPTED') && (
            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">🎉 Congratulations! You have accepted applications!</h4>
                  <p className="text-sm text-green-700">
                    {applications.filter((a: any) => a.status === 'ACCEPTED').length} application(s) have been accepted by clients. 
                    Check the details below and wait for them to contact you with next steps.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {applications.some((a: any) => a.status === 'REVIEWED') && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Calendar className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">📅 Applications Under Review</h4>
                  <p className="text-sm text-blue-700">
                    {applications.filter((a: any) => a.status === 'REVIEWED').length} application(s) are being reviewed by clients. 
                    They may contact you for interviews soon!
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl bg-slate/5 p-4 animate-pulse">
                  <div className="h-4 bg-slate/20 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate/20 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-slate/20 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-xl bg-slate/5 p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate/40 mb-3" />
              <p className="text-slate/70 mb-4">You haven't applied to any jobs yet</p>
              <Link 
                href="/dashboard/developer/browse-jobs"
                className="inline-block rounded-full bg-ember px-6 py-2 font-semibold text-white hover:bg-ember/90 transition-colors"
              >
                Browse Available Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app: any) => (
                <div key={app.id} className="rounded-xl border border-black/10 p-4 hover:bg-slate/5 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">Application #{app.id}</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate/70">
                        Job ID: {app.jobId} • Recruiter ID: {app.recruiterId}
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => {
                          console.log('Viewing application details:', app);
                          handleViewDetails(app);
                        }}
                        className="flex items-center gap-2 rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white hover:bg-ember/90 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  {/* Action Summary */}
                  {app.status === 'ACCEPTED' && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium text-green-800">
                          ✅ Application Accepted - Client will contact you soon!
                        </p>
                      </div>
                    </div>
                  )}
                  {app.status === 'REJECTED' && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <p className="text-sm font-medium text-red-800">
                          ❌ Application Not Selected - Keep applying to other opportunities
                        </p>
                      </div>
                    </div>
                  )}
                  {app.status === 'REVIEWED' && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <p className="text-sm font-medium text-blue-800">
                          📅 Application Under Review - Client may schedule interview
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {app.coverLetter && (
                    <p className="text-xs text-slate/60 mt-3 line-clamp-2">
                      {app.coverLetter.substring(0, 100)}...
                    </p>
                  )}
                  <p className="text-xs text-slate/60 mt-2">
                    Applied: {new Date(app.appliedAt).toLocaleDateString()} at {new Date(app.appliedAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Featured Jobs */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold">Featured Opportunities</h3>
          <div className="space-y-4">
            <div className="rounded-xl bg-slate/5 p-4 text-center text-slate/70">
              <p>No featured jobs yet. Complete your profile to get matched with opportunities!</p>
            </div>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold">Your Referrals</h3>
          <div className="space-y-4">
            <div className="rounded-xl bg-slate/5 p-4 text-center text-slate/70">
              <p>No referrals yet. Start applying to jobs to build your referral network!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Application Details</h2>
              <p className="text-sm text-slate/70">Application #{selectedApplication.id}</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(selectedApplication.status)}`}>
                {getStatusIcon(selectedApplication.status)}
                {selectedApplication.status}
              </span>
            </div>

            {/* Client Action Alert */}
            <div className="mb-6">
              {selectedApplication.status === 'ACCEPTED' && (
                <div className="rounded-xl bg-green-50 border-2 border-green-200 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-800 mb-1">Application Accepted! 🎉</h3>
                      <p className="text-sm text-green-700">
                        The client has accepted your application. They will contact you soon with next steps regarding the job opportunity.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {selectedApplication.status === 'REJECTED' && (
                <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-800 mb-1">Application Not Selected</h3>
                      <p className="text-sm text-red-700">
                        Unfortunately, the client has decided to move forward with other candidates. Don't be discouraged - keep applying to other opportunities!
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {selectedApplication.status === 'REVIEWED' && (
                <div className="rounded-xl bg-blue-50 border-2 border-blue-200 p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-1">Application Under Review 📅</h3>
                      <p className="text-sm text-blue-700">
                        The client has reviewed your application. They may contact you for an interview or request additional information.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Timeline */}
            <div className="bg-slate/5 rounded-xl p-4 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-ember" />
                Application Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="w-0.5 h-full bg-slate/20"></div>
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-sm">Application Submitted</p>
                    <p className="text-xs text-slate/60">
                      {new Date(selectedApplication.appliedAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate/70 mt-1">Your application was successfully submitted</p>
                  </div>
                </div>
                
                {selectedApplication.status !== 'PENDING' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedApplication.status === 'ACCEPTED' ? 'bg-green-500' :
                        selectedApplication.status === 'REJECTED' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}></div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {selectedApplication.status === 'ACCEPTED' && 'Application Accepted ✅'}
                        {selectedApplication.status === 'REJECTED' && 'Application Rejected ❌'}
                        {selectedApplication.status === 'REVIEWED' && 'Application Reviewed 📅'}
                      </p>
                      <p className="text-xs text-slate/60">
                        Status updated by client
                      </p>
                      <p className="text-xs text-slate/70 mt-1">
                        {selectedApplication.status === 'ACCEPTED' && 'Client has accepted your application and will contact you soon'}
                        {selectedApplication.status === 'REJECTED' && 'Client has selected other candidates for this position'}
                        {selectedApplication.status === 'REVIEWED' && 'Client has reviewed your application'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Application Details */}
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Job Information</h3>
                <p className="text-sm text-slate/70">Job ID: {selectedApplication.jobId}</p>
                <p className="text-sm text-slate/70">Recruiter ID: {selectedApplication.recruiterId}</p>
              </div>

              {selectedApplication.coverLetter && (
                <div>
                  <h3 className="font-semibold mb-2">Your Cover Letter</h3>
                  <div className="rounded-xl bg-slate/5 p-4">
                    <p className="text-sm text-slate/70 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="border-t border-black/10 pt-6 mb-6">
              <h3 className="font-semibold mb-3">What's Next?</h3>
              <ul className="space-y-2 text-sm text-slate/70">
                {selectedApplication.status === 'PENDING' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      <span>Be patient while the client reviews applications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      <span>Continue applying to other opportunities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      <span>Check back regularly for status updates</span>
                    </li>
                  </>
                )}
                {selectedApplication.status === 'REVIEWED' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>The client may contact you for an interview</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>Keep your email and notifications enabled</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>Prepare for potential interview questions</span>
                    </li>
                  </>
                )}
                {selectedApplication.status === 'ACCEPTED' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Wait for the client to contact you with next steps</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Prepare for onboarding process</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Review the job requirements and expectations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Celebrate your acceptance! 🎉</span>
                    </li>
                  </>
                )}
                {selectedApplication.status === 'REJECTED' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      <span>Don't be discouraged - keep applying!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      <span>Browse more jobs on the opportunities page</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      <span>Improve your profile and cover letter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      <span>Learn from this experience for future applications</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full rounded-xl border border-black/10 px-6 py-3 font-semibold hover:bg-slate/5 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
