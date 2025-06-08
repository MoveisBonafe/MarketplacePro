import type { User } from "@shared/schema";

const AUTH_STORAGE_KEY = 'ecommerce-auth';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export class AuthManager {
  private storageKey = AUTH_STORAGE_KEY;

  // Get current auth state from localStorage
  getAuthState(): AuthState {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          user: parsed.user,
          isAuthenticated: !!parsed.user
        };
      }
    } catch (error) {
      console.error('Error reading auth state:', error);
    }

    return {
      user: null,
      isAuthenticated: false
    };
  }

  // Save auth state to localStorage
  saveAuthState(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(this.storageKey, JSON.stringify({ user }));
      } else {
        localStorage.removeItem(this.storageKey);
      }
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }

  // Clear auth state
  clearAuthState(): void {
    localStorage.removeItem(this.storageKey);
  }

  // Check if user has required permission
  hasPermission(user: User | null, requiredType: string): boolean {
    if (!user) return false;
    
    switch (requiredType) {
      case 'admin':
        return user.userType === 'admin';
      case 'loja':
        return user.userType === 'loja' || user.userType === 'admin';
      case 'restaurante':
        return user.userType === 'restaurante' || user.userType === 'admin';
      default:
        return false;
    }
  }

  // Get display name for user type
  getUserTypeDisplay(userType: string): string {
    switch (userType) {
      case 'admin':
        return 'Administrador';
      case 'loja':
        return 'Loja';
      case 'restaurante':
        return 'Restaurante';
      default:
        return userType;
    }
  }

  // Get redirect path for user type
  getRedirectPath(userType: string): string {
    switch (userType) {
      case 'admin':
        return '/admin';
      case 'loja':
        return '/loja';
      case 'restaurante':
        return '/restaurante';
      default:
        return '/login';
    }
  }

  // Validate user session (check if still valid)
  async validateSession(user: User): Promise<boolean> {
    try {
      // In a real app, you might want to verify the session with the server
      // For now, we'll just check if the user object is valid
      return !!(user && user.id && user.username && user.userType && user.active);
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }

  // Generate session token (for demo purposes)
  generateSessionToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export const authManager = new AuthManager();

// Demo user data for testing
export const DEMO_USERS = {
  admin: {
    username: 'admin',
    password: 'admin123',
    userType: 'admin',
    name: 'Administrador',
    active: true
  },
  loja: {
    username: 'loja',
    password: 'loja123',
    userType: 'loja',
    name: 'Usuário Loja',
    active: true
  },
  restaurante: {
    username: 'restaurante',
    password: 'restaurante123',
    userType: 'restaurante',
    name: 'Usuário Restaurante',
    active: true
  }
};
