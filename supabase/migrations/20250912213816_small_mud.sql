/*
  # AgentricAI Core Database Schema

  1. Core Tables
    - `agents` - Core agent registry
    - `user_sessions` - User interaction sessions
    - `agent_tasks` - Agent task management
    - `stealth_agent_registry` - Stealth agent ecosystem
    - `stealth_agent_communications` - Inter-agent messaging

  2. Knowledge Database Tables
    - `agentricai_knowledge_base` - Core knowledge storage
    - `agentricai_agent_memory` - Agent memory system
    - `agentricai_learning_patterns` - Learning pattern analysis
    - `agentricai_knowledge_access_log` - Knowledge access tracking

  3. Activity & Logging Tables
    - `agentricai_activity_logs` - Agent activity tracking
    - `agentricai_agent_creation_history` - Agent creation history
    - `agentricai_error_analysis` - Error analysis and handling
    - `agentricai_workflow_logs` - Workflow execution logs

  4. Security
    - Enable RLS on all tables
    - Add appropriate policies for data access
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom ENUM Types
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agent_type') THEN
        CREATE TYPE agent_type AS ENUM (
            'learning-coordinator',
            'behavior-analyst',
            'content-generator',
            'error-handler',
            'knowledge-manager',
            'communication-router',
            'workflow-orchestrator',
            'safety-guard',
            'meta-agent',
            'adaptive',
            'monitoring',
            'creative',
            'analytical',
            'dynamic',
            'data',
            'educational-student',
            'educational-instructor',
            'educational-leadership',
            'educational-support',
            'educational-curriculum',
            'educational-coordination',
            'educational-administration'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agent_status') THEN
        CREATE TYPE agent_status AS ENUM (
            'initializing',
            'active',
            'processing',
            'idle',
            'maintenance',
            'error',
            'retired',
            'standby'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM (
            'critical',
            'high',
            'medium',
            'low',
            'background',
            'normal'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM (
            'pending',
            'in-progress',
            'completed',
            'failed'
        );
    END IF;
END $$;

-- Core Tables
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type agent_type NOT NULL,
  status agent_status DEFAULT 'idle',
  config jsonb DEFAULT '{}',
  memory_allocated bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  agent_id uuid REFERENCES agents(id),
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  activities_completed jsonb DEFAULT '[]',
  adaptive_data jsonb DEFAULT '{}',
  progress_score integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id),
  task_type text NOT NULL,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  input_data jsonb,
  output_data jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Knowledge Database Tables
CREATE TABLE IF NOT EXISTS agentricai_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  key text NOT NULL,
  value jsonb NOT NULL,
  confidence_score float DEFAULT 1.0,
  source_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  access_count integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  relationships jsonb DEFAULT '{}',
  UNIQUE(category, key)
);

CREATE TABLE IF NOT EXISTS agentricai_agent_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  memory_type text NOT NULL,
  memory_data jsonb NOT NULL,
  priority integer DEFAULT 5,
  expiry_date timestamptz,
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now(),
  access_frequency integer DEFAULT 1
);

CREATE TABLE IF NOT EXISTS agentricai_learning_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  pattern_type text NOT NULL,
  pattern_data jsonb NOT NULL,
  effectiveness_score float DEFAULT 0.5,
  usage_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agentricai_knowledge_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  knowledge_key text NOT NULL,
  access_type text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  context jsonb DEFAULT '{}'
);

-- Agent Ecosystem Tables
CREATE TABLE IF NOT EXISTS stealth_agent_registry (
  agent_id text PRIMARY KEY,
  name text,
  type text,
  capabilities text[],
  status text,
  memory_allocation text,
  specialized_for text,
  stealth_config jsonb,
  created_at timestamptz,
  last_activity timestamptz
);

CREATE TABLE IF NOT EXISTS stealth_agent_communications (
  message_id text PRIMARY KEY,
  from_agent_id text,
  to_agent_id text,
  message_content jsonb,
  priority text,
  status text,
  created_at timestamptz
);

CREATE TABLE IF NOT EXISTS agentricai_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text,
  activity text,
  details jsonb,
  timestamp timestamptz
);

CREATE TABLE IF NOT EXISTS agentricai_agent_creation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text,
  created_for_task jsonb,
  agent_spec jsonb,
  created_at timestamptz
);

CREATE TABLE IF NOT EXISTS agentricai_error_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type text,
  error_message text,
  analysis jsonb,
  explanation text,
  proposed_fix jsonb,
  timestamp timestamptz
);

CREATE TABLE IF NOT EXISTS agentricai_workflow_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id text,
  workflow_type text,
  status text,
  execution_data jsonb,
  timestamp timestamptz
);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentricai_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentricai_agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentricai_learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentricai_knowledge_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE stealth_agent_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE stealth_agent_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentricai_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentricai_agent_creation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentricai_error_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentricai_workflow_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Knowledge Base
CREATE POLICY "Authenticated users can read knowledge base"
  ON agentricai_knowledge_base
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert knowledge"
  ON agentricai_knowledge_base
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update knowledge"
  ON agentricai_knowledge_base
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for Agent Memory
CREATE POLICY "Authenticated users can access agent memory"
  ON agentricai_agent_memory
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for Learning Patterns
CREATE POLICY "Users can access their learning patterns"
  ON agentricai_learning_patterns
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid()::text OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND 'admin' = ANY(user_profiles.permissions)
  ));

-- RLS Policies for Knowledge Access Log
CREATE POLICY "Authenticated users can log knowledge access"
  ON agentricai_knowledge_access_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read knowledge access logs"
  ON agentricai_knowledge_access_log
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND 'admin' = ANY(user_profiles.permissions)
  ));

-- RLS Policies for Stealth Agent Registry
CREATE POLICY "Authenticated users can access stealth agents"
  ON stealth_agent_registry
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for Agent Communications
CREATE POLICY "Authenticated users can access agent communications"
  ON stealth_agent_communications
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for Activity Logs
CREATE POLICY "Authenticated users can log activities"
  ON agentricai_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read activity logs"
  ON agentricai_activity_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND 'admin' = ANY(user_profiles.permissions)
  ));

-- RLS Policies for other tables (similar pattern)
CREATE POLICY "Authenticated users can access agent creation history"
  ON agentricai_agent_creation_history
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can access error analysis"
  ON agentricai_error_analysis
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can access workflow logs"
  ON agentricai_workflow_logs
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_id ON agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON agentricai_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_key ON agentricai_knowledge_base(key);
CREATE INDEX IF NOT EXISTS idx_agent_memory_agent_id ON agentricai_agent_memory(agent_id);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_user_id ON agentricai_learning_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_stealth_agents_type ON stealth_agent_registry(type);
CREATE INDEX IF NOT EXISTS idx_stealth_agents_status ON stealth_agent_registry(status);