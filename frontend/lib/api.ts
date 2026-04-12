const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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
    throw new Error(data?.error || fallbackMessage);
  }

  return data;
}

export async function signup(name: string, email: string, password: string, role: string) {
  return requestJson(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, role }),
  }, 'Signup failed');
}

export async function verifySignupOtp(email: string, code: string) {
  return requestJson(`${API_BASE_URL}/auth/verify-signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  }, 'OTP verification failed');
}

export async function requestLoginOtp(email: string) {
  return requestJson(`${API_BASE_URL}/auth/request-login-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  }, 'Failed to request login OTP');
}

export async function verifyLoginOtp(email: string, code: string) {
  return requestJson(`${API_BASE_URL}/auth/verify-login-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
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
