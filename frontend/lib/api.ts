const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  errors: Record<string, string[]>;
  status: number;

  constructor(message: string, errors: Record<string, string[]> = {}, status: number = 400) {
    super(message);
    this.name = 'ApiError';
    this.errors = errors;
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(
        data.message || 'Something went wrong',
        data.errors || {},
        response.status
      );
    }
    return data as T;
  } else {
    const text = await response.text();
    console.error('Non-JSON response received:', text);
    throw new ApiError(
      `Server error: ${response.status} ${response.statusText}`,
      {},
      response.status
    );
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  console.log('API_URL:', API_URL);
  const url = `${API_URL}${endpoint}`;
  console.log('Fetching URL:', url);
  
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  
  // Only set Content-Type if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('card-setu-token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}
