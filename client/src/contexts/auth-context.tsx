import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authManager, type AuthState } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import type { User } from '@shared/schema';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const savedState = authManager.getAuthState();
      setAuthState(savedState);
    } catch (error) {
      console.error('Error initializing auth state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save auth state when it changes
  useEffect(() => {
    authManager.saveAuthState(authState.user);
  }, [authState.user]);

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        username,
        password
      });
      
      const data = await response.json();
      const user = data.user;

      if (!user) {
        throw new Error('Invalid response from server');
      }

      // Validate session
      const isValidSession = await authManager.validateSession(user);
      if (!isValidSession) {
        throw new Error('Invalid user session');
      }

      setAuthState({
        user,
        isAuthenticated: true
      });

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false
    });
    authManager.clearAuthState();
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for checking permissions
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (requiredType: string) => {
    return authManager.hasPermission(user, requiredType);
  };

  const isAdmin = () => hasPermission('admin');
  const isLoja = () => hasPermission('loja');
  const isRestaurante = () => hasPermission('restaurante');

  return {
    hasPermission,
    isAdmin,
    isLoja,
    isRestaurante,
    userType: user?.userType,
    userName: user?.name
  };
}

// Higher-order component for route protection
interface ProtectedRouteProps {
  children: ReactNode;
  requiredType?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredType, 
  fallback = <div>Acesso negado</div> 
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Não autenticado</div>;
  }

  if (requiredType && !authManager.hasPermission(user, requiredType)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
