import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface StudySession {
  id?: string;
  user_id: string;
  subject: string;
  duration: number; // in minutes
  session_type: 'focus' | 'break' | 'review';
  notes?: string;
  goal_progress?: number;
  created_at?: string;
}

export const studySessionService = {
  async createSession(session: Omit<StudySession, 'id' | 'user_id' | 'created_at'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          ...session,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating study session:', error);
      toast.error('Failed to save study session');
      throw error;
    }
  },

  async getUserSessions(timeRange: 'week' | 'month' | 'year' = 'week') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching study sessions:', error);
      throw error;
    }
  },

  async getAnalytics(timeRange: 'week' | 'month' | 'year' = 'week') {
    try {
      const sessions = await this.getUserSessions(timeRange);
      
      const totalStudyTime = sessions.reduce((total, session) => total + session.duration, 0);
      const completedSessions = sessions.length;
      const averageDaily = totalStudyTime / (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365);
      
      // Calculate streak (simplified)
      const today = new Date().toDateString();
      const hasStudiedToday = sessions.some(session => 
        new Date(session.created_at!).toDateString() === today
      );
      
      return {
        totalStudyTime: Math.round(totalStudyTime / 60), // Convert to hours
        averageDaily: Math.round(averageDaily / 60 * 10) / 10, // Convert to hours with 1 decimal
        completedSessions,
        streakDays: hasStudiedToday ? 1 : 0, // Simplified streak calculation
        weeklyGoalProgress: 75, // Mock data
        improvementRate: 15 // Mock data
      };
    } catch (error) {
      console.error('Error calculating analytics:', error);
      throw error;
    }
  }
};