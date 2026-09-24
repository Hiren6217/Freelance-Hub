const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const cleanedApiBaseUrl = rawApiBaseUrl.replace(/\/+$|\s+/g, '');
export const API_BASE_URL = cleanedApiBaseUrl.endsWith('/api') ? cleanedApiBaseUrl : `${cleanedApiBaseUrl}/api`;

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeCode = (code: string) => code.trim();

async function requestJson(url: string, options: RequestInit, fallbackMessage: string) {
  let response: Response;

  try {
    response = await fetch(url, options);
  } catch {
    throw new Error('Unable to connect to the server. Make sure the backend is running on http://localhost:8080.');
  }

  let data: any = null;
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { error: text } : null;
  }

  if (!response.ok) {
    const error: any = new Error(data?.error || data?.message || fallbackMessage);
    // Attach the parsed body + status so callers can branch on structured payloads
    // (e.g. a { status: "SUSPENDED", userId } response from the auth endpoints).
    error.data = data;
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function signup(name: string, email: string, password: string, role: string) {
  const normalizedEmail = normalizeEmail(email);
  return requestJson(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email: normalizedEmail, password, role }),
  }, 'Signup failed');
}

export async function verifySignupOtp(email: string, code: string) {
  return requestJson(`${API_BASE_URL}/auth/verify-signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: normalizeEmail(email), code: normalizeCode(code) }),
  }, 'OTP verification failed');
}

export async function requestLoginOtp(email: string) {
  return requestJson(`${API_BASE_URL}/auth/request-login-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: normalizeEmail(email) }),
  }, 'Failed to request login OTP');
}

export async function verifyLoginOtp(email: string, code: string) {
  return requestJson(`${API_BASE_URL}/auth/verify-login-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: normalizeEmail(email), code: normalizeCode(code) }),
  }, 'OTP verification failed');
}

export async function login(email: string, password: string) {
  return requestJson(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  }, 'Login failed');
}

export async function verifyToken(token: string) {
  return requestJson(`${API_BASE_URL}/auth/verify?token=${token}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Token verification failed');
}

export async function postJob(jobData: any) {
  return requestJson(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jobData),
  }, 'Failed to post job');
}

export async function getJobs() {
  return requestJson(`${API_BASE_URL}/jobs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Failed to fetch jobs');
}

export async function getJobsByRecruiter(recruiterId: number) {
  return requestJson(`${API_BASE_URL}/jobs/recruiter/${recruiterId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Failed to fetch recruiter jobs');
}

export async function getJobById(id: number) {
  return requestJson(`${API_BASE_URL}/jobs/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Failed to fetch job');
}

// Job Application APIs
export async function applyForJob(jobId: number, applicantId: number, recruiterId: number, coverLetter: string = '') {
  return requestJson(`${API_BASE_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobId, applicantId, recruiterId, coverLetter }),
  }, 'Failed to submit application');
}

export async function getApplicantApplications(applicantId: number) {
  return requestJson(`${API_BASE_URL}/applications/applicant/${applicantId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Failed to fetch applications');
}

export async function getJobApplications(jobId: number) {
  return requestJson(`${API_BASE_URL}/applications/job/${jobId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Failed to fetch job applications');
}

export async function getRecruiterApplications(recruiterId: number) {
  return requestJson(`${API_BASE_URL}/applications/recruiter/${recruiterId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Failed to fetch recruiter applications');
}

export async function updateApplicationStatus(applicationId: number, status: string) {
  return requestJson(`${API_BASE_URL}/applications/${applicationId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  }, 'Failed to update application status');
}

export async function getNotifications(userId: number) {
  return requestJson(`${API_BASE_URL}/notifications/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Failed to fetch notifications');
}

export async function getMessages(receiverId: number) {
  return requestJson(`${API_BASE_URL}/messages/receiver/${receiverId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Failed to fetch messages');
}

export async function sendMessage(senderId: number, receiverId: number, content: string) {
  return requestJson(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ senderId, receiverId, content }),
  }, 'Failed to send message');
}

// Contract APIs

// Flat platform fee cut from the developer's payout on a finalized contract.
export const PLATFORM_FEE_RATE = 0.05;

export type BillingType = 'HOURLY' | 'MONTHLY' | 'PROJECT';

export interface CreateContractPayload {
  jobId: number;
  clientId: number;
  developerId: number;
  applicationId?: number;
  title?: string;
  description?: string;
  billingType: BillingType;
  amount: number;
  currency?: string;
}

// Preview the 5% platform fee split before creating a contract.
// `amount` is per the billing unit (hourly rate, monthly rate, or fixed project fee).
export function computeFeeBreakdown(amount: number) {
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const platformFee = Math.round(safeAmount * PLATFORM_FEE_RATE * 100) / 100;
  const developerEarnings = Math.round((safeAmount - platformFee) * 100) / 100;
  return { amount: safeAmount, platformFee, developerEarnings };
}

export function billingUnitLabel(billingType: BillingType) {
  switch (billingType) {
    case 'HOURLY':
      return '/hr';
    case 'MONTHLY':
      return '/mo';
    default:
      return '';
  }
}

export async function createContract(payload: CreateContractPayload) {
  return requestJson(`${API_BASE_URL}/contracts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }, 'Failed to create contract');
}

export async function getClientContracts(clientId: number) {
  return requestJson(`${API_BASE_URL}/contracts/client/${clientId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Failed to fetch contracts');
}

export async function getDeveloperContracts(developerId: number) {
  return requestJson(`${API_BASE_URL}/contracts/developer/${developerId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Failed to fetch contracts');
}

export async function updateContractStatus(contractId: number, status: string) {
  return requestJson(`${API_BASE_URL}/contracts/${contractId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  }, 'Failed to update contract');
}

// Conversation (two-way chat between a client and a developer)

// Full thread between two users in chat order (oldest first).
export async function getConversation(userA: number, userB: number) {
  return requestJson(`${API_BASE_URL}/messages/conversation?userA=${userA}&userB=${userB}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Failed to load conversation');
}

// Inbox: one summary row per person the user has messaged, newest first.
// Each row: { otherUserId, otherUserName, otherUserRole, lastMessage, lastMessageAt, lastMessageMine, unreadCount }.
export async function getMessageThreads(userId: number) {
  return requestJson(`${API_BASE_URL}/messages/threads/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Failed to load messages');
}

// Marks the thread from otherUserId as read for the current user (call when opening a thread).
export async function markConversationRead(userId: number, otherUserId: number) {
  return requestJson(`${API_BASE_URL}/messages/read?userId=${userId}&otherUserId=${otherUserId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Failed to update messages');
}

// Interview APIs (Google Meet interviews scheduled by the client)

// Opens Google Meet so the client can create a meeting and copy the join link.
export const GOOGLE_MEET_NEW_URL = 'https://meet.google.com/new';

export interface CreateInterviewPayload {
  clientId: number;
  developerId: number;
  jobId?: number;
  applicationId?: number;
  title?: string;
  meetingLink: string;
  scheduledAt: string; // ISO local date-time, e.g. "2026-09-25T14:30"
  note?: string;
}

// Builds an "Add to Google Calendar" link (30-minute event by default).
export function googleCalendarUrl(params: {
  title: string;
  scheduledAt: string; // "YYYY-MM-DDTHH:mm" (local)
  minutes?: number;
  details?: string;
  location?: string;
}) {
  const start = new Date(params.scheduledAt);
  if (Number.isNaN(start.getTime())) return '';
  const end = new Date(start.getTime() + (params.minutes ?? 30) * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: params.details ?? '',
    location: params.location ?? '',
  });
  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}

export async function createInterview(payload: CreateInterviewPayload) {
  return requestJson(`${API_BASE_URL}/interviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }, 'Failed to schedule interview');
}

export async function getClientInterviews(clientId: number) {
  return requestJson(`${API_BASE_URL}/interviews/client/${clientId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Failed to fetch interviews');
}

export async function getDeveloperInterviews(developerId: number) {
  return requestJson(`${API_BASE_URL}/interviews/developer/${developerId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 'Failed to fetch interviews');
}

export async function updateInterviewStatus(interviewId: number, status: string) {
  return requestJson(`${API_BASE_URL}/interviews/${interviewId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  }, 'Failed to update interview');
}

// Payment APIs (platform-mediated payments via PayPal)

export type PaymentStatus = 'DUE' | 'PROCESSING' | 'PAID' | 'FAILED';
export type PaymentType = 'PROJECT' | 'HOURLY';

export interface Payment {
  id: number;
  contractId: number;
  clientId: number;
  developerId: number;
  type: PaymentType;
  timeLogId?: number | null;
  amount: number;
  platformFee: number;
  developerEarnings: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  providerOrderId?: string | null;
  providerCaptureId?: string | null;
  createdAt?: string;
  dueAt?: string;
  paidAt?: string | null;
}

export interface TimeLog {
  id: number;
  contractId: number;
  developerId: number;
  clientId: number;
  hours: number;
  description?: string | null;
  workedOn?: string | null;
  paymentId?: number | null;
  createdAt?: string;
}

// Developer logs worked hours on an active HOURLY contract (creates a due payment).
export async function logHours(payload: {
  contractId: number;
  hours?: number;
  description?: string;
  workedOn?: string;
}) {
  return requestJson(`${API_BASE_URL}/time-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 'Failed to log hours');
}

export async function getContractTimeLogs(contractId: number) {
  return requestJson(`${API_BASE_URL}/time-logs/contract/${contractId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }, 'Failed to fetch time logs');
}

// Starts a PayPal order for a due payment; returns { orderId, paymentId, amount, currency }.
export async function createPaymentOrder(paymentId: number) {
  return requestJson(`${API_BASE_URL}/payments/${paymentId}/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, 'Failed to start payment');
}

// Captures an approved PayPal order; on success the payment becomes PAID.
export async function capturePayment(paymentId: number, orderId: string) {
  return requestJson(`${API_BASE_URL}/payments/${paymentId}/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  }, 'Failed to capture payment');
}

export async function getClientPayments(clientId: number) {
  return requestJson(`${API_BASE_URL}/payments/client/${clientId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }, 'Failed to fetch payments');
}

export async function getDeveloperPayments(developerId: number) {
  return requestJson(`${API_BASE_URL}/payments/developer/${developerId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }, 'Failed to fetch payments');
}

export async function getContractPayments(contractId: number) {
  return requestJson(`${API_BASE_URL}/payments/contract/${contractId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }, 'Failed to fetch payments');
}
