import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverConnected, setServerConnected] = useState(true); // Supabase is always connected

  const checkServerConnection = useCallback(async (showToast = false): Promise<boolean> => {
    // Supabase connection is always available
    setServerConnected(true);
    return true;
  }, []);

  const retryServerConnection = useCallback(async () => {
    setLoading(true);
    await checkServerConnection(true);
    setLoading(false);
  }, [checkServerConnection]);

  const handleApiError = useCallback((error: unknown): string => {
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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user profile from our users table
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Failed to fetch user profile:', error);
        } else if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            category: profile.category,
            branch: profile.branch,
            domain: profile.domain,
            currentGpa: profile.current_gpa,
            expectedGpa: profile.expected_gpa,
            currentStudyHours: profile.current_study_hours,
            expectedStudyHours: profile.expected_study_hours,
            currentSelfRating: profile.current_self_rating,
            expectedSelfRating: profile.expected_self_rating,
            targetDate: profile.target_date,
            improvementAreas: profile.improvement_areas,
            motivation: profile.motivation,
            goalStartDate: profile.goal_start_date,
            goalEndDate: profile.goal_end_date,
            aiStudyPlan: profile.ai_study_plan,
            setupComplete: profile.setup_complete
          });
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            category: profile.category,
            branch: profile.branch,
            domain: profile.domain,
            currentGpa: profile.current_gpa,
            expectedGpa: profile.expected_gpa,
            currentStudyHours: profile.current_study_hours,
            expectedStudyHours: profile.expected_study_hours,
            currentSelfRating: profile.current_self_rating,
            expectedSelfRating: profile.expected_self_rating,
            targetDate: profile.target_date,
            improvementAreas: profile.improvement_areas,
            motivation: profile.motivation,
            goalStartDate: profile.goal_start_date,
            goalEndDate: profile.goal_end_date,
            aiStudyPlan: profile.ai_study_plan,
            setupComplete: profile.setup_complete
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [initializeAuth]);

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

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailTrimmed.toLowerCase(),
        password: passwordTrimmed
      });

      if (error) {
        toast.error(error.message, {
          duration: 5000,
          style: { background: '#ef4444', color: 'white' }
        });
        return false;
      }

      if (data.user) {
        toast.success('Login successful!', {
          style: { background: '#10b981', color: 'white' }
        });
        return true;
      }

      return false;

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

      const { data, error } = await supabase.auth.signUp({
        email: emailTrimmed.toLowerCase(),
        password: passwordTrimmed,
        options: {
          data: {
            name: nameTrimmed
          }
        }
      });

      if (error) {
        toast.error(error.message, {
          duration: 5000,
          style: { background: '#ef4444', color: 'white' }
        });
        return false;
      }

      if (data.user) {
        // Wait a moment for the trigger to create the user profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to fetch the user profile to ensure it was created
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError || !profile) {
            // If trigger didn't work, manually create the profile
            console.log('Creating user profile manually...');
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                name: nameTrimmed,
                email: emailTrimmed.toLowerCase(),
                email_verified: true,
                setup_complete: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (insertError) {
              console.error('Failed to create user profile:', insertError);
              toast.error('Account created but profile setup failed. Please try logging in.', {
                duration: 7000,
                style: { background: '#f59e0b', color: 'white' }
              });
            }
          } else {
            console.log('User profile created successfully:', profile);
          }
        } catch (profileError) {
          console.error('Error checking/creating user profile:', profileError);
        }
        
        toast.success('Registration successful!', {
          style: { background: '#10b981', color: 'white' }
        });
        return true;
      }

      return false;

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
    supabase.auth.signOut();
    toast.success('Logged out successfully', {
      style: { background: '#10b981', color: 'white' }
    });
  }, []);

  const updateUser = useCallback(async (userData: Partial<User>): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        toast.error('Please login first', {
          style: { background: '#ef4444', color: 'white' }
        });
        return false;
      }

      // Convert camelCase to snake_case for database
      const dbPayload: any = {};
      
      if (userData.category) dbPayload.category = userData.category;
      if (userData.branch) dbPayload.branch = userData.branch;
      if (userData.domain) dbPayload.domain = userData.domain;
      if (userData.currentGpa !== undefined) dbPayload.current_gpa = userData.currentGpa;
      if (userData.expectedGpa !== undefined) dbPayload.expected_gpa = userData.expectedGpa;
      if (userData.currentStudyHours !== undefined) dbPayload.current_study_hours = userData.currentStudyHours;
      if (userData.expectedStudyHours !== undefined) dbPayload.expected_study_hours = userData.expectedStudyHours;
      if (userData.currentSelfRating !== undefined) dbPayload.current_self_rating = userData.currentSelfRating;
      if (userData.expectedSelfRating !== undefined) dbPayload.expected_self_rating = userData.expectedSelfRating;
      if (userData.targetDate) dbPayload.target_date = userData.targetDate;
      if (userData.improvementAreas) dbPayload.improvement_areas = userData.improvementAreas;
      if (userData.motivation) dbPayload.motivation = userData.motivation;
      if (userData.goalStartDate) dbPayload.goal_start_date = userData.goalStartDate;
      if (userData.goalEndDate) dbPayload.goal_end_date = userData.goalEndDate;
      if (userData.aiStudyPlan) dbPayload.ai_study_plan = userData.aiStudyPlan;
      if (userData.setupComplete !== undefined) dbPayload.setup_complete = userData.setupComplete;
      
      dbPayload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('users')
        .update(dbPayload)
        .eq('id', authUser.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Update local user state
        setUser(prev => ({
          ...prev!,
          category: data.category,
          branch: data.branch,
          domain: data.domain,
          currentGpa: data.current_gpa,
          expectedGpa: data.expected_gpa,
          currentStudyHours: data.current_study_hours,
          expectedStudyHours: data.expected_study_hours,
          currentSelfRating: data.current_self_rating,
          expectedSelfRating: data.expected_self_rating,
          targetDate: data.target_date,
          improvementAreas: data.improvement_areas,
          motivation: data.motivation,
          goalStartDate: data.goal_start_date,
          goalEndDate: data.goal_end_date,
          aiStudyPlan: data.ai_study_plan,
          setupComplete: data.setup_complete
        }));
        
        toast.success('Profile updated successfully!', {
          style: { background: '#10b981', color: 'white' }
        });
        return true;
      }

      return false;

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
  }, [handleApiError]);

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