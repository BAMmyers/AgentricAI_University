import initSqlJs, { Database } from 'sql.js';

// SQLite Database Service - Local data storage for browser
export class SQLiteDatabase {
  private static instance: SQLiteDatabase;
  private db: Database | null = null;
  private isInitialized = false;

  private constructor() {
    this.initializeDatabase();
  }

  static getInstance(): SQLiteDatabase {
    if (!SQLiteDatabase.instance) {
      SQLiteDatabase.instance = new SQLiteDatabase();
    }
    return SQLiteDatabase.instance;
  }

  private async initializeDatabase() {
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });
      
      // Try to load existing database from localStorage
      const savedDb = localStorage.getItem('agentricai-db');
      if (savedDb) {
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        this.db = new SQL.Database(uint8Array);
      } else {
        this.db = new SQL.Database();
      }
      
      this.initializeTables();
      this.seedInitialData();
      this.isInitialized = true;
      
      console.log('✅ SQLite database initialized for browser');
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
    }
  }

  private async waitForInitialization(): Promise<void> {
    while (!this.isInitialized || !this.db) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private saveToLocalStorage(): void {
    if (this.db) {
      const data = this.db.export();
      localStorage.setItem('agentricai-db', JSON.stringify(Array.from(data)));
    }
  }

  private initializeTables() {
    if (!this.db) return;

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

    this.saveToLocalStorage();
  }

  private seedInitialData() {
    if (!this.db) return;

    // Create admin user
    const adminExists = this.db.exec('SELECT id FROM user_profiles WHERE email = "agentricaiuiux@gmail.com"');
    
    if (adminExists.length === 0) {
      this.db.exec(`
        INSERT INTO user_profiles (id, email, name, role, permissions)
        VALUES ('admin-user', 'agentricaiuiux@gmail.com', 'AgentricAI Admin', 'admin', '["admin", "basic_access"]')
      `);
    }

    // Create demo student
    const studentExists = this.db.exec('SELECT id FROM user_profiles WHERE email = "student@example.com"');
    
    if (studentExists.length === 0) {
      this.db.exec(`
        INSERT INTO user_profiles (id, email, name, role, permissions)
        VALUES ('student-demo', 'student@example.com', 'Demo Student', 'student', '["basic_access"]')
      `);
    }

    // Seed initial knowledge base
    this.seedKnowledgeBase();
    this.saveToLocalStorage();
    
    console.log('✅ SQLite database seeded with initial data');
  }

  private seedKnowledgeBase() {
    if (!this.db) return;

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

    for (const entry of knowledgeEntries) {
      const id = `${entry.category}:${entry.key}`;
      this.db.exec(`
        INSERT OR REPLACE INTO knowledge_base (id, category, key, value, source_agent, confidence_score)
        VALUES ('${id}', '${entry.category}', '${entry.key}', '${entry.value}', 'system', 1.0)
      `);
    }
  }

  // User management
  async createUser(userData: any): Promise<any> {
    await this.waitForInitialization();
    if (!this.db) throw new Error('Database not initialized');

    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.db.exec(`
      INSERT INTO user_profiles (id, email, name, role, permissions)
      VALUES ('${id}', '${userData.email}', '${userData.name || userData.email.split('@')[0]}', '${userData.role || 'student'}', '${JSON.stringify(userData.permissions || ['basic_access'])}')
    `);

    this.saveToLocalStorage();
    return { id, ...userData };
  }

  async getUserByEmail(email: string): Promise<any> {
    await this.waitForInitialization();
    if (!this.db) return null;

    const stmt = this.db.prepare('SELECT * FROM user_profiles WHERE email = ?');
    const result = stmt.getAsObject([email]);
    stmt.free();
    
    if (result && Object.keys(result).length > 0) {
      return {
        ...result,
        permissions: JSON.parse((result.permissions as string) || '["basic_access"]')
      };
    }
    
    return null;
  }

  async getUserById(id: string): Promise<any> {
    await this.waitForInitialization();
    if (!this.db) return null;

    const stmt = this.db.prepare('SELECT * FROM user_profiles WHERE id = ?');
    const result = stmt.getAsObject([id]);
    stmt.free();
    
    if (result && Object.keys(result).length > 0) {
      return {
        ...result,
        permissions: JSON.parse((result.permissions as string) || '["basic_access"]')
      };
    }
    
    return null;
  }

  // Authentication logging
  async logAuthEvent(userId: string, event: string, email: string, metadata?: any): Promise<void> {
    await this.waitForInitialization();
    if (!this.db) return;

    const id = `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.db.exec(`
      INSERT INTO auth_logs (id, user_id, event, email, ip_address, user_agent)
      VALUES ('${id}', '${userId}', '${event}', '${email}', '${metadata?.ip_address || 'localhost'}', '${metadata?.user_agent || 'AgentricAI-App'}')
    `);

    this.saveToLocalStorage();
  }

  // Agent management
  async createAgent(agentData: any): Promise<string> {
    await this.waitForInitialization();
    if (!this.db) throw new Error('Database not initialized');

    const id = agentData.id || `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.db.exec(`
      INSERT OR REPLACE INTO agents (id, name, type, status, config, memory_allocated)
      VALUES ('${id}', '${agentData.name}', '${agentData.type}', '${agentData.status || 'active'}', '${JSON.stringify(agentData.config || {})}', ${agentData.memory_allocated || 512})
    `);

    this.saveToLocalStorage();
    return id;
  }

  async getAgents(): Promise<any[]> {
    await this.waitForInitialization();
    if (!this.db) return [];

    const stmt = this.db.prepare('SELECT * FROM agents ORDER BY created_at DESC');
    const results = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        ...row,
        config: JSON.parse((row.config as string) || '{}')
      });
    }
    
    stmt.free();
    return results;
  }

  async updateAgentStatus(agentId: string, status: string): Promise<void> {
    await this.waitForInitialization();
    if (!this.db) return;

    this.db.exec(`UPDATE agents SET status = '${status}', updated_at = CURRENT_TIMESTAMP WHERE id = '${agentId}'`);
    this.saveToLocalStorage();
  }

  // Knowledge base operations
  async storeKnowledge(category: string, key: string, value: any, sourceAgent?: string, confidence: number = 1.0): Promise<string> {
    await this.waitForInitialization();
    if (!this.db) throw new Error('Database not initialized');

    const id = `${category}:${key}`;
    
    this.db.exec(`
      INSERT OR REPLACE INTO knowledge_base 
      (id, category, key, value, confidence_score, source_agent, access_count, tags, relationships)
      VALUES ('${id}', '${category}', '${key}', '${JSON.stringify(value)}', ${confidence}, '${sourceAgent || 'system'}', 0, '[]', '{}')
    `);

    this.saveToLocalStorage();
    return id;
  }

  async retrieveKnowledge(category: string, key: string): Promise<any> {
    await this.waitForInitialization();
    if (!this.db) return null;

    const stmt = this.db.prepare('SELECT * FROM knowledge_base WHERE category = ? AND key = ?');
    const result = stmt.getAsObject([category, key]);
    
    if (result && Object.keys(result).length > 0) {
      // Update access count
      this.db.exec(`UPDATE knowledge_base SET access_count = access_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = '${result.id}'`);
      this.saveToLocalStorage();
      
      stmt.free();
      return {
        ...result,
        value: JSON.parse(result.value as string),
        tags: JSON.parse((result.tags as string) || '[]'),
        relationships: JSON.parse((result.relationships as string) || '{}')
      };
    }
    
    stmt.free();
    return null;
  }

  async queryKnowledge(searchTerm: string): Promise<any[]> {
    await this.waitForInitialization();
    if (!this.db) return [];

    const stmt = this.db.prepare(`
      SELECT * FROM knowledge_base 
      WHERE category LIKE ? OR key LIKE ? OR value LIKE ?
      ORDER BY confidence_score DESC, access_count DESC
      LIMIT 10
    `);
    
    const searchPattern = `%${searchTerm}%`;
    const results = [];
    
    stmt.bind([searchPattern, searchPattern, searchPattern]);
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        ...row,
        value: JSON.parse(row.value as string),
        tags: JSON.parse((row.tags as string) || '[]'),
        relationships: JSON.parse((row.relationships as string) || '{}')
      });
    }
    
    stmt.free();
    return results;
  }

  // Agent memory operations
  async storeAgentMemory(agentId: string, memoryType: string, memoryData: any, priority: number = 5): Promise<string> {
    await this.waitForInitialization();
    if (!this.db) throw new Error('Database not initialized');

    const id = `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.db.exec(`
      INSERT INTO agent_memory (id, agent_id, memory_type, memory_data, priority)
      VALUES ('${id}', '${agentId}', '${memoryType}', '${JSON.stringify(memoryData)}', ${priority})
    `);
    
    this.saveToLocalStorage();
    return id;
  }

  async retrieveAgentMemory(agentId: string, memoryType?: string): Promise<any[]> {
    await this.waitForInitialization();
    if (!this.db) return [];

    let query = 'SELECT * FROM agent_memory WHERE agent_id = ?';
    const params = [agentId];
    
    if (memoryType) {
      query += ' AND memory_type = ?';
      params.push(memoryType);
    }
    
    query += ' ORDER BY priority DESC, last_accessed DESC';
    
    const stmt = this.db.prepare(query);
    const results = [];
    
    stmt.bind(params);
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        ...row,
        memory_data: JSON.parse(row.memory_data as string)
      });
    }
    
    stmt.free();
    return results;
  }

  // Learning patterns
  async storeLearningPattern(userId: string, patternType: string, patternData: any, effectiveness: number = 0.5): Promise<string> {
    await this.waitForInitialization();
    if (!this.db) throw new Error('Database not initialized');

    const id = `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.db.exec(`
      INSERT INTO learning_patterns (id, user_id, pattern_type, pattern_data, effectiveness_score)
      VALUES ('${id}', '${userId}', '${patternType}', '${JSON.stringify(patternData)}', ${effectiveness})
    `);
    
    this.saveToLocalStorage();
    return id;
  }

  async retrieveLearningPatterns(userId: string, patternType?: string): Promise<any[]> {
    await this.waitForInitialization();
    if (!this.db) return [];

    let query = 'SELECT * FROM learning_patterns WHERE user_id = ?';
    const params = [userId];
    
    if (patternType) {
      query += ' AND pattern_type = ?';
      params.push(patternType);
    }
    
    query += ' ORDER BY effectiveness_score DESC';
    
    const stmt = this.db.prepare(query);
    const results = [];
    
    stmt.bind(params);
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        ...row,
        pattern_data: JSON.parse(row.pattern_data as string)
      });
    }
    
    stmt.free();
    return results;
  }

  // User sessions
  async createUserSession(userId: string, agentId?: string): Promise<string> {
    await this.waitForInitialization();
    if (!this.db) throw new Error('Database not initialized');

    const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.db.exec(`
      INSERT INTO user_sessions (id, user_id, agent_id)
      VALUES ('${id}', '${userId}', '${agentId || ''}')
    `);
    
    this.saveToLocalStorage();
    return id;
  }

  async updateUserSession(sessionId: string, updates: any): Promise<void> {
    await this.waitForInitialization();
    if (!this.db) return;

    const fields = [];
    
    if (updates.end_time) {
      fields.push(`end_time = '${updates.end_time}'`);
    }
    
    if (updates.activities_completed) {
      fields.push(`activities_completed = '${JSON.stringify(updates.activities_completed)}'`);
    }
    
    if (updates.adaptive_data) {
      fields.push(`adaptive_data = '${JSON.stringify(updates.adaptive_data)}'`);
    }
    
    if (updates.progress_score !== undefined) {
      fields.push(`progress_score = ${updates.progress_score}`);
    }
    
    if (fields.length > 0) {
      const query = `UPDATE user_sessions SET ${fields.join(', ')} WHERE id = '${sessionId}'`;
      this.db.exec(query);
      this.saveToLocalStorage();
    }
  }

  // Activity logging
  async logActivity(agentId: string, activity: string, details: any): Promise<void> {
    await this.waitForInitialization();
    if (!this.db) return;

    const id = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.db.exec(`
      INSERT INTO activity_logs (id, agent_id, activity, details)
      VALUES ('${id}', '${agentId}', '${activity}', '${JSON.stringify(details)}')
    `);

    this.saveToLocalStorage();
  }

  // Statistics and reporting
  async getSystemStats(): Promise<any> {
    await this.waitForInitialization();
    if (!this.db) return { agents: { total: 0, active: 0 }, users: { total: 0 }, knowledge: { entries: 0 } };

    const agentCount = this.db.exec('SELECT COUNT(*) as count FROM agents')[0]?.values[0][0] || 0;
    const activeAgents = this.db.exec('SELECT COUNT(*) as count FROM agents WHERE status = "active"')[0]?.values[0][0] || 0;
    const userCount = this.db.exec('SELECT COUNT(*) as count FROM user_profiles')[0]?.values[0][0] || 0;
    const knowledgeCount = this.db.exec('SELECT COUNT(*) as count FROM knowledge_base')[0]?.values[0][0] || 0;
    
    return {
      agents: {
        total: agentCount,
        active: activeAgents
      },
      users: {
        total: userCount
      },
      knowledge: {
        entries: knowledgeCount
      }
    };
  }

  async getRecentActivity(limit: number = 10): Promise<any[]> {
    await this.waitForInitialization();
    if (!this.db) return [];

    const stmt = this.db.prepare(`
      SELECT * FROM activity_logs 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    
    const results = [];
    stmt.bind([limit]);
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        ...row,
        details: JSON.parse((row.details as string) || '{}')
      });
    }
    
    stmt.free();
    return results;
  }

  // Cleanup and maintenance
  close(): void {
    if (this.db) {
      this.saveToLocalStorage();
      this.db.close();
    }
  }

  // Backup functionality
  backup(filename: string): void {
    if (this.db) {
      const data = this.db.export();
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      console.log(`Database backed up to ${filename}`);
    }
  }
}

// Export singleton instance
export const sqliteDB = SQLiteDatabase.getInstance();