import { getToken } from './auth-utils';

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

// Auth
export async function authLogin(email: string, password: string) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function authSignup(name: string, email: string, password: string) {
  return apiFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

// Admin
export async function adminGetMentors() {
  return apiFetch('/api/admin/mentors');
}

export async function adminCreateMentor(name: string, email: string, password: string) {
  return apiFetch('/api/admin/mentors', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

// Mentor — assessments
export async function mentorGetMyAssessments() {
  return apiFetch('/api/assessments/my');
}

export async function mentorCreateAssessment(title: string, description: string) {
  return apiFetch('/api/assessments', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });
}

export async function mentorUpdateAssessment(id: number, patch: { title?: string; description?: string }) {
  return apiFetch(`/api/assessments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function mentorPublishAssessment(id: number) {
  return apiFetch(`/api/assessments/${id}/publish`, { method: 'PATCH' });
}

export async function mentorDeleteAssessment(id: number) {
  return apiFetch(`/api/assessments/${id}`, { method: 'DELETE' });
}

// Mentor — questions
export async function mentorGetQuestions(assessmentId: number) {
  return apiFetch(`/api/assessments/${assessmentId}/questions`);
}

export async function mentorCreateQuestion(
  assessmentId: number,
  text: string,
  orderNumber: number,
  choices: { text: string; score: number }[]
) {
  return apiFetch(`/api/assessments/${assessmentId}/questions`, {
    method: 'POST',
    body: JSON.stringify({ text, orderNumber, choices }),
  });
}

export async function mentorDeleteQuestion(questionId: number) {
  return apiFetch(`/api/questions/${questionId}`, { method: 'DELETE' });
}

// Mentor — report templates
export async function mentorGetReportTemplates(assessmentId: number) {
  return apiFetch(`/api/assessments/${assessmentId}/reports`);
}

export async function mentorCreateReportTemplate(
  assessmentId: number,
  minScore: number,
  maxScore: number,
  freeReport: string,
  premiumReport: string
) {
  return apiFetch(`/api/assessments/${assessmentId}/reports`, {
    method: 'POST',
    body: JSON.stringify({ minScore, maxScore, freeReport, premiumReport }),
  });
}

// User — assessments
export async function userGetAssessments() {
  return apiFetch('/api/assessments');
}

export async function userGetAssessment(id: number) {
  return apiFetch(`/api/assessments/${id}`);
}

export async function userSubmitAttempt(
  assessmentId: number,
  answers: { questionId: number; choiceId: number }[]
) {
  return apiFetch(`/api/assessments/${assessmentId}/attempts`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

export async function userGetResult(attemptId: number) {
  return apiFetch(`/api/results/${attemptId}`);
}
