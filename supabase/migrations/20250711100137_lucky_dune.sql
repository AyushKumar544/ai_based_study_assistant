/*
  # Initial Schema for Study Assistant App

  1. New Tables
    - `users` - User accounts and profiles with study goals
    - `study_sessions` - Track individual study sessions
    - `goal_tracking` - Daily progress tracking
    - `notifications` - User notifications and reminders
    - `flashcards` - Spaced repetition flashcards
    - `notes` - Study notes with tags and subjects
    - `study_groups` - Collaborative study groups
    - `study_group_members` - Group membership tracking
    - `doubts` - AI-powered doubt solving history

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for study groups collaboration

  3. Features
    - User authentication with profiles
    - Study session tracking with analytics
    - Goal setting and progress monitoring
    - Collaborative study groups
    - AI-powered features (study plans, doubt solving)
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with comprehensive profile information
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  category text DEFAULT 'student' CHECK (category IN ('school', 'college', 'professional', 'researcher')),
  branch text,
  domain text,
  current_gpa decimal(3,2),
  expected_gpa decimal(3,2),
  current_study_hours integer,
  expected_study_hours integer,
  current_self_rating integer CHECK (current_self_rating >= 1 AND current_self_rating <= 10),
  expected_self_rating integer CHECK (expected_self_rating >= 1 AND expected_self_rating <= 10),
  target_date date,
  improvement_areas text,
  motivation text,
  goal_start_date date,
  goal_end_date date,
  ai_study_plan jsonb,
  setup_complete boolean DEFAULT false,
  email_verified boolean DEFAULT true,
  verification_token text,
  reset_token text,
  reset_token_expires timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Study sessions tracking
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  duration integer NOT NULL, -- in minutes
  session_type text DEFAULT 'focus' CHECK (session_type IN ('focus', 'break', 'review')),
  notes text,
  goal_progress decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Goal tracking for daily progress
CREATE TABLE IF NOT EXISTS goal_tracking (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  gpa_progress decimal(5,2) DEFAULT 0,
  study_hours_completed decimal(5,2) DEFAULT 0,
  self_rating_current decimal(3,1) DEFAULT 0,
  tasks_completed integer DEFAULT 0,
  total_tasks integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Notifications system
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text DEFAULT 'reminder' CHECK (type IN ('reminder', 'achievement', 'goal', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Flashcards with spaced repetition
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  front text NOT NULL,
  back text NOT NULL,
  subject text NOT NULL,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  last_reviewed timestamptz DEFAULT now(),
  next_review timestamptz DEFAULT now(),
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notes with tagging system
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  subject text NOT NULL,
  tags text[], -- Array of tags
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Study groups for collaboration
CREATE TABLE IF NOT EXISTS study_groups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  subject text NOT NULL,
  admin_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  max_members integer DEFAULT 10,
  is_private boolean DEFAULT false,
  tags text[],
  created_at timestamptz DEFAULT now()
);

-- Study group membership
CREATE TABLE IF NOT EXISTS study_group_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Doubts and AI solutions
CREATE TABLE IF NOT EXISTS doubts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question text NOT NULL,
  context text,
  subject text,
  solution jsonb, -- Store AI solution as JSON
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'solved', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Study sessions policies
CREATE POLICY "Users can manage own study sessions"
  ON study_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Goal tracking policies
CREATE POLICY "Users can manage own goal tracking"
  ON goal_tracking
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can manage own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Flashcards policies
CREATE POLICY "Users can manage own flashcards"
  ON flashcards
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can manage own notes"
  ON notes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Study groups policies
CREATE POLICY "Anyone can read public study groups"
  ON study_groups
  FOR SELECT
  TO authenticated
  USING (NOT is_private OR admin_id = auth.uid() OR EXISTS (
    SELECT 1 FROM study_group_members 
    WHERE group_id = study_groups.id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create study groups"
  ON study_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update their study groups"
  ON study_groups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id);

CREATE POLICY "Admins can delete their study groups"
  ON study_groups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = admin_id);

-- Study group members policies
CREATE POLICY "Users can view group memberships"
  ON study_group_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM study_groups 
      WHERE id = group_id AND (admin_id = auth.uid() OR NOT is_private)
    )
  );

CREATE POLICY "Users can join groups"
  ON study_group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON study_group_members
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM study_groups 
      WHERE id = group_id AND admin_id = auth.uid()
    )
  );

-- Doubts policies
CREATE POLICY "Users can manage own doubts"
  ON doubts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_created_at ON study_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_goal_tracking_user_date ON goal_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject ON notes(subject);
CREATE INDEX IF NOT EXISTS idx_study_groups_subject ON study_groups(subject);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group_id ON study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_doubts_user_id ON doubts(user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON flashcards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doubts_updated_at BEFORE UPDATE ON doubts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, email_verified)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    new.email,
    new.email_confirmed_at IS NOT NULL
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();