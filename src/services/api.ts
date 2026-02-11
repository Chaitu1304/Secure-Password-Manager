const API_BASE_URL = process.env.REACT_APP_API_URL;

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'An error occurred' };
      }

      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Network error. Please check your connection.' };
    }
  }

  // Auth endpoints
  async register(email: string, masterPassword: string) {
    const response = await this.request<{
      token: string;
      user: { id: string; email: string; salt: string };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, masterPassword }),
    });

    if (response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async login(email: string, masterPassword: string) {
    const response = await this.request<{
      token: string;
      user: { id: string; email: string; salt: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, masterPassword }),
    });

    if (response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async getCurrentUser() {
    return this.request<{ id: string; email: string; salt: string }>('/auth/me');
  }

  async deleteAccount() {
    const response = await this.request('/auth/account', {
      method: 'DELETE',
    });
    if (!response.error) {
      this.setToken(null);
    }
    return response;
  }

  logout() {
    this.setToken(null);
  }

  // Password endpoints
  async getPasswords() {
    return this.request<PasswordEntryAPI[]>('/passwords');
  }

  async createPassword(entry: CreatePasswordEntry) {
    return this.request<PasswordEntryAPI>('/passwords', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async updatePassword(id: string, entry: Partial<CreatePasswordEntry>) {
    return this.request<PasswordEntryAPI>(`/passwords/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  }

  async deletePassword(id: string) {
    return this.request(`/passwords/${id}`, {
      method: 'DELETE',
    });
  }

  async searchPasswords(query: string) {
    return this.request<PasswordEntryAPI[]>(`/passwords/search?q=${encodeURIComponent(query)}`);
  }
}

export interface PasswordEntryAPI {
  _id: string;
  userId: string;
  title: string;
  username: string;
  encryptedPassword: string;
  url: string;
  notes: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePasswordEntry {
  title: string;
  username: string;
  encryptedPassword: string;
  url?: string;
  notes?: string;
  category?: string;
}

export const apiService = new ApiService();
export default apiService;
