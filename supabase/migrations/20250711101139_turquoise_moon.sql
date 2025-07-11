/*
  # Initial Database Schema for Study Assistant

  1. New Tables
    - `users` - User profiles and study goals
    - `study_sessions` - Study session tracking
    - `goal_tracking` - Daily progress monitoring
    - `notifications` - User notifications
    - `flashcards` - Spaced repetition flashcards
    - `notes` - Study notes with tags
    - `study_groups` - Collaborative study groups
    - `study_group_members` - Group memberships
    - `doubts` - AI-powered doubt solving

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Functions
    - `update_updated_at_column()` - Trigger function for updating timestamps
*/

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT auth.uid(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    category text DEFAULT 'student' CHECK (category IN ('school', 'college', 'professional', 'researcher')),
    branch text,
    domain text,
    current_gpa numeric(3,2),
    expected_gpa numeric(3,2),
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

-- Study sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject text NOT NULL,
    duration integer NOT NULL,
    session_type text DEFAULT 'focus' CHECK (session_type IN ('focus', 'break', 'review')),
    notes text,
    goal_progress numeric(5,2) DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Goal tracking table
CREATE TABLE IF NOT EXISTS goal_tracking (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date date NOT NULL,
    gpa_progress numeric(5,2) DEFAULT 0,
    study_hours_completed numeric(5,2) DEFAULT 0,
    self_rating_current numeric(3,1) DEFAULT 0,
    tasks_completed integer DEFAULT 0,
    total_tasks integer DEFAULT 0,
    notes text,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, date)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type text DEFAULT 'reminder' CHECK (type IN ('reminder', 'achievement', 'goal', 'system')),
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Flashcards table
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

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    subject text NOT NULL,
    tags text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Study groups table
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

-- Study group members table
CREATE TABLE IF NOT EXISTS study_group_members (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at timestamptz DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- Doubts table
CREATE TABLE IF NOT EXISTS doubts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question text NOT NULL,
    context text,
    subject text,
    solution jsonb,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'solved', 'archived')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

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

-- RLS Policies for users table
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for study_sessions table
CREATE POLICY "Users can manage own study sessions" ON study_sessions
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for goal_tracking table
CREATE POLICY "Users can manage own goal tracking" ON goal_tracking
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for notifications table
CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for flashcards table
CREATE POLICY "Users can manage own flashcards" ON flashcards
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for notes table
CREATE POLICY "Users can manage own notes" ON notes
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for study_groups table
CREATE POLICY "Users can create study groups" ON study_groups
    FOR INSERT WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update their study groups" ON study_groups
    FOR UPDATE USING (auth.uid() = admin_id);

CREATE POLICY "Admins can delete their study groups" ON study_groups
    FOR DELETE USING (auth.uid() = admin_id);

CREATE POLICY "Anyone can read public study groups" ON study_groups
    FOR SELECT USING (
        NOT is_private OR 
        admin_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM study_group_members 
            WHERE group_id = study_groups.id AND user_id = auth.uid()
        )
    );

-- RLS Policies for study_group_members table
CREATE POLICY "Users can join groups" ON study_group_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON study_group_members
    FOR DELETE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM study_groups 
            WHERE id = study_group_members.group_id AND admin_id = auth.uid()
        )
    );

CREATE POLICY "Users can view group memberships" ON study_group_members
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM study_groups 
            WHERE id = study_group_members.group_id AND 
            (admin_id = auth.uid() OR NOT is_private)
        )
    );

-- RLS Policies for doubts table
CREATE POLICY "Users can manage own doubts" ON doubts
    FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at
    BEFORE UPDATE ON flashcards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doubts_updated_at
    BEFORE UPDATE ON doubts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();