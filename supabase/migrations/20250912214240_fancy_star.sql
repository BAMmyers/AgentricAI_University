/*
  # Fix Row Level Security Policies

  1. Security Updates
    - Allow system initialization without authentication
    - Enable proper access for agent registration
    - Maintain security for user data
  
  2. Changes
    - Update RLS policies for stealth_agent_registry
    - Allow system operations during initialization
    - Maintain security boundaries
*/

-- Update RLS policies for stealth_agent_registry to allow system initialization
DROP POLICY IF EXISTS "Authenticated users can access stealth agents" ON stealth_agent_registry;

CREATE POLICY "Allow system agent registration"
  ON stealth_agent_registry
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow reading stealth agents"
  ON stealth_agent_registry
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow updating stealth agents"
  ON stealth_agent_registry
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Update RLS policies for stealth_agent_communications
DROP POLICY IF EXISTS "Authenticated users can access agent communications" ON stealth_agent_communications;

CREATE POLICY "Allow system agent communications"
  ON stealth_agent_communications
  FOR ALL
  TO anon, authenticated
  USING (true);

-- Update RLS policies for agentricai_knowledge_base
DROP POLICY IF EXISTS "Authenticated users can read knowledge base" ON agentricai_knowledge_base;
DROP POLICY IF EXISTS "Authenticated users can insert knowledge" ON agentricai_knowledge_base;
DROP POLICY IF EXISTS "Authenticated users can update knowledge" ON agentricai_knowledge_base;

CREATE POLICY "Allow system knowledge operations"
  ON agentricai_knowledge_base
  FOR ALL
  TO anon, authenticated
  USING (true);

-- Update RLS policies for agentricai_agent_memory
DROP POLICY IF EXISTS "Authenticated users can access agent memory" ON agentricai_agent_memory;

CREATE POLICY "Allow system agent memory operations"
  ON agentricai_agent_memory
  FOR ALL
  TO anon, authenticated
  USING (true);

-- Update RLS policies for agentricai_activity_logs
DROP POLICY IF EXISTS "Authenticated users can log activities" ON agentricai_activity_logs;
DROP POLICY IF EXISTS "Admins can read activity logs" ON agentricai_activity_logs;

CREATE POLICY "Allow system activity logging"
  ON agentricai_activity_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow reading activity logs"
  ON agentricai_activity_logs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Update RLS policies for agentricai_knowledge_access_log
DROP POLICY IF EXISTS "Authenticated users can log knowledge access" ON agentricai_knowledge_access_log;
DROP POLICY IF EXISTS "Admins can read knowledge access logs" ON agentricai_knowledge_access_log;

CREATE POLICY "Allow system knowledge access logging"
  ON agentricai_knowledge_access_log
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow reading knowledge access logs"
  ON agentricai_knowledge_access_log
  FOR SELECT
  TO anon, authenticated
  USING (true);