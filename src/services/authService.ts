import api from './api';
import { LoginResponse, User, Role } from '@/types';

class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user';
  private readonly ORG_KEY = 'organization';

  private isClient = typeof window !== 'undefined';  async login(email: string, password: string): Promise<LoginResponse> {
    // Auto-login bypass - accept any credentials
    const devResponse: LoginResponse = {
      token: 'auto-auth-token-' + new Date().getTime(),
      user: {
        id: 1,
        name: email.split('@')[0], // Use the email username as the display name
        email: email,
        role: Role.ADMIN,
        organizationId: 1
      },
      organization: {
        id: 1,
        name: 'Test Hospital',
        address: '123 Medical Drive',
        phone: '555-0123',
        email: 'admin@hospital.com'
      }
    };

    if (this.isClient) {
      // Set both localStorage and cookies
      window.localStorage.setItem(this.TOKEN_KEY, devResponse.token);
      window.localStorage.setItem(this.USER_KEY, JSON.stringify(devResponse.user));
      window.localStorage.setItem(this.ORG_KEY, JSON.stringify(devResponse.organization));
      
      // Set cookie with long expiry for development
      document.cookie = `${this.TOKEN_KEY}=${devResponse.token}; path=/; max-age=86400`;
    }
    
    return devResponse;
  }
  logout(): void {
    if (this.isClient) {
      // Clear localStorage
      window.localStorage.removeItem(this.TOKEN_KEY);
      window.localStorage.removeItem(this.USER_KEY);
      window.localStorage.removeItem(this.ORG_KEY);
      
      // Clear cookie
      document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      
      // Use window.location for more reliable navigation in development
      window.location.href = '/login';
    }
  }

  getToken(): string | null {
    if (!this.isClient) return null;
    return window.localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    if (!this.isClient) return null;
    const user = window.localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  getOrganization(): User | null {
    if (!this.isClient) return null;
    const org = window.localStorage.getItem(this.ORG_KEY);
    return org ? JSON.parse(org) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }
}

export const authService = new AuthService();
export default authService;
