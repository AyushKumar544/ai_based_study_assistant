import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface Doubt {
  id?: string;
  user_id: string;
  question: string;
  context?: string;
  subject?: string;
  solution?: any;
  status: 'pending' | 'solved' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export const doubtService = {
  async askDoubt(question: string, subject?: string, context?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate mock AI solution (replace with actual AI service)
      const mockSolution = {
        explanation: `This is a comprehensive explanation for your question: "${question}". The solution involves understanding the core concepts and applying them systematically.`,
        steps: [
          "Analyze the question to understand what's being asked",
          "Identify the key concepts and principles involved",
          "Apply the appropriate method or formula",
          "Work through the solution step by step",
          "Verify the answer and check for reasonableness"
        ],
        concepts: ["Problem Analysis", "Conceptual Understanding", "Solution Methodology"],
        examples: [
          "Similar problems you might encounter",
          "Real-world applications of this concept",
          "Practice exercises to reinforce learning"
        ],
        tips: "Practice regularly with similar problems to build confidence and understanding. Break complex problems into smaller, manageable parts.",
        relatedTopics: ["Related Topic 1", "Related Topic 2", "Related Topic 3"],
        difficulty: "intermediate",
        subject: subject || "General"
      };

      const { data, error } = await supabase
        .from('doubts')
        .insert({
          user_id: user.id,
          question,
          context,
          subject: subject || 'General',
          solution: mockSolution,
          status: 'solved'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error asking doubt:', error);
      toast.error('Failed to process your question');
      throw error;
    }
  },

  async getDoubtHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('doubts')
        .select('id, question, subject, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching doubt history:', error);
      throw error;
    }
  },

  async getDoubtById(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('doubts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching doubt:', error);
      throw error;
    }
  }
};