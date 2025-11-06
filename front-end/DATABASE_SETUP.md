# Supabase Database Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new project
4. Note your project URL and anon key

## 2. Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create tasks table
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('assignment', 'exam', 'project')) NOT NULL,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) NOT NULL,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks table
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

## 3. Environment Variables

Create `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Install Dependencies

```bash
npm install @supabase/supabase-js
```

## 5. Authentication Setup

In Supabase Dashboard:
1. Go to Authentication > Settings
2. Enable email confirmation (optional)
3. Configure email templates (optional)
4. Set up custom SMTP (optional)

## 6. Row Level Security (RLS)

RLS ensures users can only access their own data:
- Each user can only see/modify their own tasks
- Automatic user isolation
- Secure by default

## 7. Real-time Features

Your app automatically gets:
- Live updates when tasks change
- Multi-device synchronization
- Offline support (coming soon)

## 8. Testing the Setup

1. Start your app: `npm run dev`
2. Sign up with a new account
3. Create some tasks
4. Open another browser/device
5. Sign in with same account
6. See tasks sync in real-time

## Database Schema Explanation

### Tasks Table Structure:
- `id`: Auto-incrementing primary key
- `user_id`: Links to authenticated user
- `title`: Task name (required)
- `description`: Optional details
- `type`: assignment/exam/project
- `priority`: high/medium/low
- `due_date`: When task is due
- `completed`: Boolean status
- `created_at`: Auto timestamp
- `updated_at`: Auto-updated timestamp

### Security Features:
- Row Level Security prevents data leaks
- Policies ensure user data isolation
- Foreign key constraints maintain data integrity
- Indexes optimize query performance