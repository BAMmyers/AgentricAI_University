import Database from 'better-sqlite3';

// SQLite Database Service - Local data storage
export class SQLiteDatabase {
  private static instance: SQLiteDatabase;
  private db: Database.Database;

  private constructor() {
    // Initialize SQLite database
    this.db = new Database('agentricai.db');
    this.initializeTables();
    this.seedInitialData();
  }

  static getInstance(): SQLiteDatabase {
    if (!SQLiteDatabase.instance) {
      SQLiteDatabase.instance = new SQLiteDatabase();
    }
    return SQLiteDatabase.instance;
  }

  private initializeTables() {
    // User profiles table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'student',
        permissions TEXT DEFAULT '["basic_access"]',
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_sign_in DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Authentication logs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS auth_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        event TEXT NOT NULL,
        email TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
      )
    `);

    // Agents table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'idle',
        config TEXT DEFAULT '{}',
        memory_allocated INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Agent tasks table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_tasks (
        id TEXT PRIMARY KEY,
        agent_id TEXT,
        task_type TEXT NOT NULL,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'pending',
        input_data TEXT,
        output_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (agent_id) REFERENCES agents(id)
      )
    `);

    // Knowledge base table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS knowledge_base (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        confidence_score REAL DEFAULT 1.0,
        source_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        access_count INTEGER DEFAULT 0,
        tags TEXT DEFAULT '[]',
        relationships TEXT DEFAULT '{}',
        UNIQUE(category, key)
      )
    `);

    // Agent memory table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_memory (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        memory_type TEXT NOT NULL,
        memory_data TEXT NOT NULL,
        priority INTEGER DEFAULT 5,
        expiry_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        access_frequency INTEGER DEFAULT 1
      )
    `);

    // Learning patterns table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS learning_patterns (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        pattern_type TEXT NOT NULL,
        pattern_data TEXT NOT NULL,
        effectiveness_score REAL DEFAULT 0.5,
        usage_count INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        agent_id TEXT,
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        activities_completed TEXT DEFAULT '[]',
        adaptive_data TEXT DEFAULT '{}',
        progress_score INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES user_profiles(id),
        FOREIGN KEY (agent_id) REFERENCES agents(id)
      )
    `);

    // Activity logs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        agent_id TEXT,
        activity TEXT,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Error analysis table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS error_analysis (
        id TEXT PRIMARY KEY,
        error_type TEXT,
        error_message TEXT,
        analysis TEXT,
        explanation TEXT,
        proposed_fix TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Workflow logs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflow_logs (
        id TEXT PRIMARY KEY,
        workflow_id TEXT,
        workflow_type TEXT,
        status TEXT,
        execution_data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ SQLite database tables initialized');
  }

  private seedInitialData() {
    // Create admin user
    const adminExists = this.db.prepare('SELECT id FROM user_profiles WHERE email = ?').get('agentricaiuiux@gmail.com');
    
    if (!adminExists) {
      this.db.prepare(`
        INSERT INTO user_profiles (id, email, name, role, permissions)
        VALUES (?, ?, ?, ?, ?)
      `).run('admin-user', 'agentricaiuiux@gmail.com', 'AgentricAI Admin', 'admin', '["admin", "basic_access"]');
    }

    // Create demo student
    const studentExists = this.db.prepare('SELECT id FROM user_profiles WHERE email = ?').get('student@example.com');
    
    if (!studentExists) {
      this.db.prepare(`
        INSERT INTO user_profiles (id, email, name, role, permissions)
        VALUES (?, ?, ?, ?, ?)
      `).run('student-demo', 'student@example.com', 'Demo Student', 'student', '["basic_access"]');
    }

    // Seed initial knowledge base
    this.seedKnowledgeBase();
    
    console.log('✅ SQLite database seeded with initial data');
  }

  private seedKnowledgeBase() {
    const knowledgeEntries = [
      {
        category: 'neurodiverse_learning',
        key: 'sensory_preferences',
        value: JSON.stringify({ visual_contrast: 'high', audio_enabled: false, animation_speed: 'slow' })
      },
      {
        category: 'neurodiverse_learning',
        key: 'routine_importance',
        value: JSON.stringify({ consistency: 'critical', change_adaptation: 'gradual' })
      },
      {
        category: 'system_status',
        key: 'agents_operational',
        value: JSON.stringify({ 
          total: 6, 
          active: 5, 
          efficiency: 94.2,
          details: 'Learning Coordinator (98%), Behavior Analyst (91%), Content Generator (89%), Progress Monitor (96%), Communication Router (99%), Error Handler (92%)'
        })
      },
      {
        category: 'student_analytics',
        key: 'active_students',
        value: JSON.stringify({
          count: 23,
          engagement: 87.3,
          completion_rate: 82,
          top_modules: ['Visual Learning', 'Pattern Recognition', 'Interactive Content']
        })
      }
    ];

    const insertKnowledge = this.db.prepare(`
      INSERT OR REPLACE INTO knowledge_base (id, category, key, value, source_agent, confidence_score)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const entry of knowledgeEntries) {
      const id = `${entry.category}:${entry.key}`;
      insertKnowledge.run(id, entry.category, entry.key, entry.value, 'system', 1.0);
    }
  }

  // User management
  async createUser(userData: any): Promise<any> {
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = this.db.prepare(`
      INSERT INTO user_profiles (id, email, name, role, permissions)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      userData.email,
      userData.name || userData.email.split('@')[0],
      userData.role || 'student',
      JSON.stringify(userData.permissions || ['basic_access'])
    );

    return { id, ...userData };
  }

  async getUserByEmail(email: string): Promise<any> {
    const stmt = this.db.prepare('SELECT * FROM user_profiles WHERE email = ?');
    const user = stmt.get(email);
    
    if (user) {
      return {
        ...user,
        permissions: JSON.parse(user.permissions || '["basic_access"]')
      };
    }
    
    return null;
  }

  async getUserById(id: string): Promise<any> {
    const stmt = this.db.prepare('SELECT * FROM user_profiles WHERE id = ?');
    const user = stmt.get(id);
    
    if (user) {
      return {
        ...user,
        permissions: JSON.parse(user.permissions || '["basic_access"]')
      };
    }
    
    return null;
  }

  // Authentication logging
  async logAuthEvent(userId: string, event: string, email: string, metadata?: any): Promise<void> {
    const id = `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = this.db.prepare(`
      INSERT INTO auth_logs (id, user_id, event, email, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      userId,
      event,
      email,
      metadata?.ip_address || 'localhost',
      metadata?.user_agent || 'AgentricAI-App'
    );
  }

  // Agent management
  async createAgent(agentData: any): Promise<string> {
    const id = agentData.id || `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO agents (id, name, type, status, config, memory_allocated)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      agentData.name,
      agentData.type,
      agentData.status || 'active',
      JSON.stringify(agentData.config || {}),
      agentData.memory_allocated || 512
    );

    return id;
  }

  async getAgents(): Promise<any[]> {
    const stmt = this.db.prepare('SELECT * FROM agents ORDER BY created_at DESC');
    const agents = stmt.all();
    
    return agents.map(agent => ({
      ...agent,
      config: JSON.parse(agent.config || '{}')
    }));
  }

  async updateAgentStatus(agentId: string, status: string): Promise<void> {
    const stmt = this.db.prepare('UPDATE agents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(status, agentId);
  }

  // Knowledge base operations
  async storeKnowledge(category: string, key: string, value: any, sourceAgent?: string, confidence: number = 1.0): Promise<string> {
    const id = `${category}:${key}`;
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO knowledge_base 
      (id, category, key, value, confidence_score, source_agent, access_count, tags, relationships)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    `);
    
    stmt.run(
      id,
      category,
      key,
      JSON.stringify(value),
      confidence,
      sourceAgent || 'system',
      JSON.stringify([]),
      JSON.stringify({})
    );

    return id;
  }

  async retrieveKnowledge(category: string, key: string): Promise<any> {
    const stmt = this.db.prepare(`
      SELECT * FROM knowledge_base WHERE category = ? AND key = ?
    `);
    
    const result = stmt.get(category, key);
    
    if (result) {
      // Update access count
      const updateStmt = this.db.prepare(`
        UPDATE knowledge_base SET access_count = access_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `);
      updateStmt.run(result.id);
      
      return {
        ...result,
        value: JSON.parse(result.value),
        tags: JSON.parse(result.tags || '[]'),
        relationships: JSON.parse(result.relationships || '{}')
      };
    }
    
    return null;
  }

  async queryKnowledge(searchTerm: string): Promise<any[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM knowledge_base 
      WHERE category LIKE ? OR key LIKE ? OR value LIKE ?
      ORDER BY confidence_score DESC, access_count DESC
      LIMIT 10
    `);
    
    const searchPattern = `%${searchTerm}%`;
    const results = stmt.all(searchPattern, searchPattern, searchPattern);
    
    return results.map(result => ({
      ...result,
      value: JSON.parse(result.value),
      tags: JSON.parse(result.tags || '[]'),
      relationships: JSON.parse(result.relationships || '{}')
    }));
  }

  // Agent memory operations
  async storeAgentMemory(agentId: string, memoryType: string, memoryData: any, priority: number = 5): Promise<string> {
    const id = `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = this.db.prepare(`
      INSERT INTO agent_memory (id, agent_id, memory_type, memory_data, priority)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, agentId, memoryType, JSON.stringify(memoryData), priority);
    
    return id;
  }

  async retrieveAgentMemory(agentId: string, memoryType?: string): Promise<any[]> {
    let query = 'SELECT * FROM agent_memory WHERE agent_id = ?';
    const params = [agentId];
    
    if (memoryType) {
      query += ' AND memory_type = ?';
      params.push(memoryType);
    }
    
    query += ' ORDER BY priority DESC, last_accessed DESC';
    
    const stmt = this.db.prepare(query);
    const results = stmt.all(...params);
    
    return results.map(result => ({
      ...result,
      memory_data: JSON.parse(result.memory_data)
    }));
  }

  // Learning patterns
  async storeLearningPattern(userId: string, patternType: string, patternData: any, effectiveness: number = 0.5): Promise<string> {
    const id = `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = this.db.prepare(`
      INSERT INTO learning_patterns (id, user_id, pattern_type, pattern_data, effectiveness_score)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, userId, patternType, JSON.stringify(patternData), effectiveness);
    
    return id;
  }

  async retrieveLearningPatterns(userId: string, patternType?: string): Promise<any[]> {
    let query = 'SELECT * FROM learning_patterns WHERE user_id = ?';
    const params = [userId];
    
    if (patternType) {
      query += ' AND pattern_type = ?';
      params.push(patternType);
    }
    
    query += ' ORDER BY effectiveness_score DESC';
    
    const stmt = this.db.prepare(query);
    const results = stmt.all(...params);
    
    return results.map(result => ({
      ...result,
      pattern_data: JSON.parse(result.pattern_data)
    }));
  }

  // User sessions
  async createUserSession(userId: string, agentId?: string): Promise<string> {
    const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = this.db.prepare(`
      INSERT INTO user_sessions (id, user_id, agent_id)
      VALUES (?, ?, ?)
    `);
    
    stmt.run(id, userId, agentId);
    
    return id;
  }

  async updateUserSession(sessionId: string, updates: any): Promise<void> {
    const fields = [];
    const values = [];
    
    if (updates.end_time) {
      fields.push('end_time = ?');
      values.push(updates.end_time);
    }
    
    if (updates.activities_completed) {
      fields.push('activities_completed = ?');
      values.push(JSON.stringify(updates.activities_completed));
    }
    
    if (updates.adaptive_data) {
      fields.push('adaptive_data = ?');
      values.push(JSON.stringify(updates.adaptive_data));
    }
    
    if (updates.progress_score !== undefined) {
      fields.push('progress_score = ?');
      values.push(updates.progress_score);
    }
    
    if (fields.length > 0) {
      values.push(sessionId);
      const query = `UPDATE user_sessions SET ${fields.join(', ')} WHERE id = ?`;
      const stmt = this.db.prepare(query);
      stmt.run(...values);
    }
  }

  // Activity logging
  async logActivity(agentId: string, activity: string, details: any): Promise<void> {
    const id = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = this.db.prepare(`
      INSERT INTO activity_logs (id, agent_id, activity, details)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(id, agentId, activity, JSON.stringify(details));
  }

  // Statistics and reporting
  async getSystemStats(): Promise<any> {
    const agentCount = this.db.prepare('SELECT COUNT(*) as count FROM agents').get();
    const activeAgents = this.db.prepare('SELECT COUNT(*) as count FROM agents WHERE status = "active"').get();
    const userCount = this.db.prepare('SELECT COUNT(*) as count FROM user_profiles').get();
    const knowledgeCount = this.db.prepare('SELECT COUNT(*) as count FROM knowledge_base').get();
    
    return {
      agents: {
        total: agentCount.count,
        active: activeAgents.count
      },
      users: {
        total: userCount.count
      },
      knowledge: {
        entries: knowledgeCount.count
      }
    };
  }

  async getRecentActivity(limit: number = 10): Promise<any[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM activity_logs 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    
    const results = stmt.all(limit);
    
    return results.map(result => ({
      ...result,
      details: JSON.parse(result.details || '{}')
    }));
  }

  // Cleanup and maintenance
  close(): void {
    this.db.close();
  }

  // Backup functionality
  backup(filename: string): void {
    const backup = this.db.backup(filename);
    backup.close();
    console.log(`Database backed up to ${filename}`);
  }
}

// Export singleton instance
export const sqliteDB = SQLiteDatabase.getInstance();