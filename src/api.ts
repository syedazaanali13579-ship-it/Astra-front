import type { LpInquiry, NewLpInquiry, NewSubmission, Submission, WebsiteContent } from './types';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/+$/, '')
  : import.meta.env.DEV
    ? 'http://localhost:3000/api'
    : '/api';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        'Unable to reach the Astra API. Set VITE_API_URL to your deployed backend URL ending in /api, and allow your website origin in the backend FRONTEND_ORIGIN setting.'
      );
    }
    throw error;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string | string[] } | null;
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new ApiError(message || `Request failed (${response.status}).`, response.status);
  }

  try {
    return await response.json() as T;
  } catch {
    throw new Error(
      'The API returned an invalid response. Check that VITE_API_URL points to the deployed backend and ends in /api.'
    );
  }
}

function bearerHeaders(token: string): HeadersInit {
  return { Authorization: 'Bearer ' + token };
}

export const getContent = () => request<WebsiteContent>('/content');

export const submitFounderInquiry = (submission: NewSubmission) =>
  request<{ id: string; createdAt: string }>('/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission)
  });

export const submitLpInquiry = (inquiry: NewLpInquiry) =>
  request<{ id: string; createdAt: string }>('/lp-submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inquiry)
  });

export const getSubmissions = (token: string) =>
  request<Submission[]>('/submissions', { headers: bearerHeaders(token) });

export const getLpInquiries = (token: string) =>
  request<LpInquiry[]>('/lp-submissions', { headers: bearerHeaders(token) });

export const updateContent = (token: string, key: string, value: unknown) =>
  request<WebsiteContent>(`/content/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: {
      ...bearerHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ value })
  });
