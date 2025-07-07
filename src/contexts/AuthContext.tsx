import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  category?: string;
  branch?: string;
  domain?: string;
  currentGpa?: number;
  expectedGpa?: number;
  currentStudyHours?: number;
  expectedStudyHours?: number;
  currentSelfRating?: number;
  expectedSelfRating?: number;
  setupComplete?: boolean;
  targetDate?: string;
  improvementAreas?: string;
  motivation?: string;
  goalStartDate?: string;
  goalEndDate?: string;
  aiStudyPlan?: any[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  loading: boolean;
  serverConnected: boolean;
  retryServerConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverConnected, setServerConnected] = useState(false);

  const checkServerConnection = useCallback(async (showToast = false): Promise<boolean> => {
    try {
      const response = await api.get('/health');
      if (response.data?.status === 'OK') {
        setServerConnected(true);
        return true;
      }
      throw new Error('Server not healthy');
    } catch (error) {
      setServerConnected(false);
      console.error('Server connection check failed:', error);
      
      if (showToast) {
        toast.error('Cannot connect to server. Please try again later.', {
          id: 'server-connection-error',
          duration: 5000
        });
      }
      
      return false;
    }
  }, []);

  const retryServerConnection = useCallback(async () => {
    setLoading(true);
    await checkServerConnection(true);
    setLoading(false);
  }, [checkServerConnection]);

  const handleApiError = useCallback((error: unknown): string => {
    if (axios.isAxiosError(error)) {
      console.error('Axios Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });

      if (error.code === 'ECONNABORTED') {
        return 'Request timeout. Please check your connection.';
      }

      if (!error.response) {
        return 'Network error. Please check your internet connection.';
      }

      // Handle server validation errors
      if (error.response.status === 400 && error.response.data?.errors) {
        return Object.values(error.response.data.errors).join('\n');
      }

      if (error.response.data?.message) {
        return error.response.data.message;
      }

      switch (error.response.status) {
        case 401:
          return 'Session expired. Please login again.';
        case 403:
          return 'Access denied. Please check your credentials.';
        case 404:
          return 'Resource not found.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return 'An unexpected error occurred.';
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unknown error occurred';
  }, []);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const initializeAuth = useCallback(async () => {
    const isConnected = await checkServerConnection();
    
    if (!isConnected) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
        setServerConnected(true);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        localStorage.removeItem('token');
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          toast.error('Session expired. Please login again.', {
            duration: 5000,
            style: { background: '#ef4444', color: 'white' }
          });
        }
      }
    }
    setLoading(false);
  }, [checkServerConnection]);

  useEffect(() => {
    initializeAuth();

    const interval = setInterval(() => checkServerConnection(), 30000);
    return () => clearInterval(interval);
  }, [initializeAuth, checkServerConnection]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const emailTrimmed = email.trim();
      const passwordTrimmed = password.trim();
      
      if (!validateEmail(emailTrimmed)) {
        toast.error('Please enter a valid email address', {
          style: { background: '#ef4444', color: 'white' }
        });
        return false;
      }
      
      if (passwordTrimmed.length < 6) {
        toast.error('Password must be at least 6 characters', {
          style: { background: '#ef4444', color: 'white' }
        });
        return false;
      }

      const response = await api.post('/auth/login', 
        { 
          email: emailTrimmed.toLowerCase(), 
          password: passwordTrimmed 
        },
        {
          validateStatus: (status) => status < 500
        }
      );

      if (response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        setServerConnected(true);
        
        toast.success('Login successful!', {
          style: { background: '#10b981', color: 'white' }
        });
        return true;
      }

      if (response.status === 400) {
        const errorMessage = response.data?.message || 'Invalid email or password';
        toast.error(errorMessage, {
          duration: 5000,
          style: { background: '#ef4444', color: 'white' }
        });
        return false;
      }

      throw new Error(response.data?.message || 'Login failed');

    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = handleApiError(error);
      toast.error(errorMsg, {
        duration: 5000,
        style: { background: '#ef4444', color: 'white' }
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const nameTrimmed = name.trim();
      const emailTrimmed = email.trim();
      const passwordTrimmed = password.trim();

      if (nameTrimmed.length < 2) {
        toast.error('Name must be at least 2 characters', {
          style: { background: '#ef4444', color: 'white' }
        });
        return false;
      }

      if (!validateEmail(emailTrimmed)) {
        toast.error('Please enter a valid email address', {
          style: { background: '#ef4444', color: 'white' }
        });
        return false;
      }

      if (passwordTrimmed.length < 6) {
        toast.error('Password must be at least 6 characters', {
          style: { background: '#ef4444', color: 'white' }
        });
        return false;
      }

      const response = await api.post('/auth/register', {
        name: nameTrimmed,
        email: emailTrimmed.toLowerCase(),
        password: passwordTrimmed
      }, {
        validateStatus: (status) => status < 500
      });

      if (response.status === 201) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        setServerConnected(true);
        
        toast.success('Registration successful!', {
          style: { background: '#10b981', color: 'white' }
        });
        return true;
      }

      if (response.status === 400) {
        const errorMessage = response.data?.message || 'Registration failed';
        toast.error(errorMessage, {
          duration: 5000,
          style: { background: '#ef4444', color: 'white' }
        });
        return false;
      }

      throw new Error(response.data?.message || 'Registration failed');

    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = handleApiError(error);
      toast.error(errorMsg, {
        duration: 5000,
        style: { background: '#ef4444', color: 'white' }
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully', {
      style: { background: '#10b981', color: 'white' }
    });
  }, []);

  const updateUser = useCallback(async (userData: Partial<User>): Promise<boolean> => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first', {
          style: { background: '#ef4444', color: 'white' }
        });
        return false;
      }

      // Ensure setupComplete is included if it's required by your backend
      const payload = {
        ...userData,
        setupComplete: userData.setupComplete ?? user?.setupComplete ?? false
      };

      console.log('Sending update payload:', payload); // Debug log

      const response = await api.put('/auth/update-profile', payload, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 500
      });

      console.log('Update response:', response.data); // Debug log

      if (response.status === 200) {
        setUser(prev => ({ ...prev, ...response.data.user }));
        toast.success('Profile updated successfully!', {
          style: { background: '#10b981', color: 'white' }
        });
        return true;
      }

      if (response.status === 400) {
        const errorMessage = response.data?.message || 'Update failed';
        toast.error(errorMessage, {
          duration: 5000,
          style: { background: '#ef4444', color: 'white' }
        });
        return false;
      }

      throw new Error(response.data?.message || 'Update failed');

    } catch (error) {
      console.error('Update error:', error);
      const errorMsg = handleApiError(error);
      toast.error(errorMsg, {
        duration: 5000,
        style: { background: '#ef4444', color: 'white' }
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleApiError, user?.setupComplete]);

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    serverConnected,
    retryServerConnection
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}