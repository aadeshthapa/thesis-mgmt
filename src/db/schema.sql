-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'supervisor', 'admin')),
    department VARCHAR(100),
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Theses table for managing submissions
CREATE TABLE theses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    abstract TEXT NOT NULL,
    keywords TEXT[], -- Array of keywords for better searching
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    year VARCHAR(4) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    file_url TEXT NOT NULL,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table for review comments
CREATE TABLE thesis_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thesis_id UUID NOT NULL REFERENCES theses(id) ON DELETE CASCADE,
    supervisor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('pending', 'addressed', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Thesis revisions table to track changes
CREATE TABLE thesis_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thesis_id UUID NOT NULL REFERENCES theses(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    submitted_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('thesis_update', 'feedback', 'status_change', 'system')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supervisor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    semester VARCHAR(50) NOT NULL,
    year VARCHAR(4) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress' 
        CHECK (status IN ('in_progress', 'completed')),
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add Assessments table
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'submitted', 'graded')),
    grade VARCHAR(2),
    feedback TEXT,
    submission_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_theses_student ON theses(student_id);
CREATE INDEX idx_theses_supervisor ON theses(supervisor_id);
CREATE INDEX idx_theses_status ON theses(status);
CREATE INDEX idx_theses_year ON theses(year);
CREATE INDEX idx_feedback_thesis ON thesis_feedback(thesis_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_projects_student ON projects(student_id);
CREATE INDEX idx_projects_supervisor ON projects(supervisor_id);
CREATE INDEX idx_assessments_project ON assessments(project_id);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_theses_updated_at
    BEFORE UPDATE ON theses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thesis_feedback_updated_at
    BEFORE UPDATE ON thesis_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 