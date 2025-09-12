import { createClient } from '@supabase/supabase-js';

// Enhanced Knowledge Database - Active Working Memory for AgentricAI Ecosystem
export class AgentricAIKnowledgeDatabase {
  private static instance: AgentricAIKnowledgeDatabase;
  private supabase: any;
  private localKnowledge: Map<string, any> = new Map();
  private agentMemories: Map<string, any> = new Map();
  private learningPatterns: Map<string, any> = new Map();
  private realTimeSubscriptions: Map<string, any> = new Map();
  private knowledgeGraph: Map<string, Set<string>> = new Map();
  private accessLog: Array<any> = [];

  private constructor() {
    this.initializeDatabase();
    this.setupRealTimeSync();
    this.initializeKnowledgeStructure();
  }

  static getInstance(): AgentricAIKnowledgeDatabase {
    if (!AgentricAIKnowledgeDatabase.instance) {
      AgentricAIKnowledgeDatabase.instance = new AgentricAIKnowledgeDatabase();
    }
    return AgentricAIKnowledgeDatabase.instance;
  }

  private async initializeDatabase() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co' && supabaseKey !== 'your-anon-key') {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      console.log('AgentricAI Knowledge Database running in local mode - Supabase not configured');
      this.supabase = null;
      this.initializeLocalStorage();
    }
  }

  private initializeLocalStorage() {
    // Initialize local storage structure
    const stored = localStorage.getItem('agentricai_knowledge_base');
    if (stored) {
      const data = JSON.parse(stored);
      this.localKnowledge = new Map(data.knowledge || []);
      this.agentMemories = new Map(data.memories || []);
      this.learningPatterns = new Map(data.patterns || []);
    }
  }

  private async initializeKnowledgeStructure() {
    // Core knowledge categories for AgentricAI University
    const coreKnowledge = {
      'neurodiverse_learning': {
        'sensory_processing': {
          visual_preferences: { high_contrast: true, minimal_animation: true },
          auditory_preferences: { clear_speech: true, background_noise: false },
          tactile_preferences: { smooth_textures: true, consistent_feedback: true }
        },
        'cognitive_patterns': {
          routine_importance: 'critical',
          change_adaptation: 'gradual',
          information_processing: 'sequential'
        },
        'communication_styles': {
          direct_language: true,
          visual_supports: true,
          processing_time: 'extended'
        }
      },
      'agentricai_protocols': {
        'agent_communication': {
          priority_levels: ['critical', 'high', 'medium', 'low'],
          message_types: ['direct', 'knowledge_update', 'workflow_trigger', 'emergency'],
          routing_rules: 'capability_based'
        },
        'knowledge_sharing': {
          confidence_threshold: 0.7,
          update_frequency: 'real_time',
          conflict_resolution: 'highest_confidence'
        },
        'learning_adaptation': {
          pattern_recognition: 'continuous',
          effectiveness_tracking: 'per_interaction',
          adaptation_speed: 'conservative'
        }
      },
      'university_curriculum': {
        'adaptive_content': {
          difficulty_scaling: 'dynamic',
          content_types: ['visual', 'auditory', 'kinesthetic', 'mixed'],
          assessment_methods: ['observation', 'interaction', 'completion']
        },
        'progress_tracking': {
          metrics: ['engagement', 'completion', 'retention', 'application'],
          reporting: 'real_time',
          privacy: 'anonymized'
        }
      }
    };

    await this.bulkInsertKnowledge(coreKnowledge);
  }

  // Core Knowledge Operations
  async storeKnowledge(category: string, key: string, value: any, sourceAgent?: string, confidence: number = 1.0): Promise<string> {
    const knowledgeId = `${category}:${key}`;
    const knowledgeEntry = {
      id: knowledgeId,
      category,
      key,
      value,
      confidence_score: confidence,
      source_agent: sourceAgent || 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      access_count: 0,
      tags: this.extractTags(value),
      relationships: this.findRelationships(category, key, value)
    };

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('agentricai_knowledge_base')
          .upsert(knowledgeEntry);
        
        if (error) throw error;
      } catch (error) {
        console.warn('Supabase storage failed, falling back to local storage:', error);
        this.localKnowledge.set(knowledgeId, knowledgeEntry);
        this.saveToLocalStorage();
      }
    } else {
      this.localKnowledge.set(knowledgeId, knowledgeEntry);
      this.saveToLocalStorage();
    }

    // Update knowledge graph
    this.updateKnowledgeGraph(category, key, knowledgeEntry.relationships);
    
    // Log the storage operation
    if (sourceAgent !== 'system-init') {
      await this.logKnowledgeAccess(sourceAgent || 'system', knowledgeId, 'store', { confidence });
    }

    return knowledgeId;
  }

  async retrieveKnowledge(category: string, key: string, requestingAgent?: string): Promise<any> {
    const knowledgeId = `${category}:${key}`;
    let knowledge = null;

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('agentricai_knowledge_base')
          .select('*')
          .eq('category', category)
          .eq('key', key)
          .single();
        
        if (!error && data) {
          knowledge = data;
          // Update access count
          await this.supabase
            .from('agentricai_knowledge_base')
            .update({ 
              access_count: data.access_count + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.id);
        }
      } catch (error) {
        console.warn('Supabase retrieval failed, using local:', error);
      }
    }

    if (!knowledge) {
      knowledge = this.localKnowledge.get(knowledgeId);
      if (knowledge) {
        knowledge.access_count = (knowledge.access_count || 0) + 1;
        this.localKnowledge.set(knowledgeId, knowledge);
        this.saveToLocalStorage();
      }
    }

    // Log the retrieval
    if (knowledge) {
      await this.logKnowledgeAccess(requestingAgent || 'unknown', knowledgeId, 'retrieve', {
        confidence: knowledge.confidence_score
      });
    }

    return knowledge?.value || null;
  }

  async queryKnowledge(query: string, requestingAgent?: string): Promise<any[]> {
    const results: any[] = [];
    
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('agentricai_knowledge_base')
          .select('*')
          .or(`key.ilike.%${query}%,value::text.ilike.%${query}%`)
          .order('confidence_score', { ascending: false })
          .limit(10);
        
        if (!error && data) {
          results.push(...data);
        }
      } catch (error) {
        console.warn('Supabase query failed, using local search:', error);
      }
    }

    // Local search fallback
    if (results.length === 0) {
      for (const [id, entry] of this.localKnowledge.entries()) {
        if (entry.key.toLowerCase().includes(query.toLowerCase()) ||
            JSON.stringify(entry.value).toLowerCase().includes(query.toLowerCase())) {
          results.push(entry);
        }
      }
      results.sort((a, b) => b.confidence_score - a.confidence_score);
    }

    // Log the query
    await this.logKnowledgeAccess(requestingAgent || 'unknown', `query:${query}`, 'query', {
      results_count: results.length
    });

    return results.slice(0, 10);
  }

  // Agent Memory Management
  async storeAgentMemory(agentId: string, memoryType: string, memoryData: any, priority: number = 5): Promise<string> {
    const memoryId = `${agentId}:${memoryType}:${Date.now()}`;
    const memoryEntry = {
      id: memoryId,
      agent_id: agentId,
      memory_type: memoryType,
      memory_data: memoryData,
      priority,
      created_at: new Date().toISOString(),
      last_accessed: new Date().toISOString(),
      access_frequency: 1
    };

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('agentricai_agent_memory')
          .insert(memoryEntry);
        
        if (error) throw error;
      } catch (error) {
        console.warn('Supabase memory storage failed, using local:', error);
        this.agentMemories.set(memoryId, memoryEntry);
        this.saveToLocalStorage();
      }
    } else {
      this.agentMemories.set(memoryId, memoryEntry);
      this.saveToLocalStorage();
    }

    return memoryId;
  }

  async retrieveAgentMemory(agentId: string, memoryType?: string): Promise<any[]> {
    let memories: any[] = [];

    if (this.supabase) {
      try {
        let query = this.supabase
          .from('agentricai_agent_memory')
          .select('*')
          .eq('agent_id', agentId);
        
        if (memoryType) {
          query = query.eq('memory_type', memoryType);
        }
        
        const { data, error } = await query
          .order('priority', { ascending: false })
          .order('last_accessed', { ascending: false });
        
        if (!error && data) {
          memories = data;
        }
      } catch (error) {
        console.warn('Supabase memory retrieval failed, using local:', error);
      }
    }

    if (memories.length === 0) {
      for (const [id, memory] of this.agentMemories.entries()) {
        if (memory.agent_id === agentId && (!memoryType || memory.memory_type === memoryType)) {
          memories.push(memory);
        }
      }
      memories.sort((a, b) => b.priority - a.priority || new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime());
    }

    return memories;
  }

  // Learning Pattern Management
  async storeLearningPattern(userId: string, patternType: string, patternData: any, effectiveness: number = 0.5): Promise<string> {
    const patternId = `${userId}:${patternType}:${Date.now()}`;
    const patternEntry = {
      id: patternId,
      user_id: userId,
      pattern_type: patternType,
      pattern_data: patternData,
      effectiveness_score: effectiveness,
      usage_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('agentricai_learning_patterns')
          .insert(patternEntry);
        
        if (error) throw error;
      } catch (error) {
        console.warn('Supabase pattern storage failed, using local:', error);
        this.learningPatterns.set(patternId, patternEntry);
        this.saveToLocalStorage();
      }
    } else {
      this.learningPatterns.set(patternId, patternEntry);
      this.saveToLocalStorage();
    }

    return patternId;
  }

  async retrieveLearningPatterns(userId: string, patternType?: string): Promise<any[]> {
    let patterns: any[] = [];

    if (this.supabase) {
      try {
        let query = this.supabase
          .from('agentricai_learning_patterns')
          .select('*')
          .eq('user_id', userId);
        
        if (patternType) {
          query = query.eq('pattern_type', patternType);
        }
        
        const { data, error } = await query
          .order('effectiveness_score', { ascending: false });
        
        if (!error && data) {
          patterns = data;
        }
      } catch (error) {
        console.warn('Supabase pattern retrieval failed, using local:', error);
      }
    }

    if (patterns.length === 0) {
      for (const [id, pattern] of this.learningPatterns.entries()) {
        if (pattern.user_id === userId && (!patternType || pattern.pattern_type === patternType)) {
          patterns.push(pattern);
        }
      }
      patterns.sort((a, b) => b.effectiveness_score - a.effectiveness_score);
    }

    return patterns;
  }

  // Real-time Synchronization
  private setupRealTimeSync() {
    if (this.supabase) {
      // Subscribe to knowledge base changes
      const knowledgeSubscription = this.supabase
        .channel('knowledge_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'agentricai_knowledge_base' },
          (payload: any) => this.handleKnowledgeChange(payload)
        )
        .subscribe();

      this.realTimeSubscriptions.set('knowledge', knowledgeSubscription);

      // Subscribe to agent memory changes
      const memorySubscription = this.supabase
        .channel('memory_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'agentricai_agent_memory' },
          (payload: any) => this.handleMemoryChange(payload)
        )
        .subscribe();

      this.realTimeSubscriptions.set('memory', memorySubscription);
    }
  }

  private handleKnowledgeChange(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        const knowledgeId = `${newRecord.category}:${newRecord.key}`;
        this.localKnowledge.set(knowledgeId, newRecord);
        this.updateKnowledgeGraph(newRecord.category, newRecord.key, newRecord.relationships);
        break;
      case 'DELETE':
        const deletedId = `${oldRecord.category}:${oldRecord.key}`;
        this.localKnowledge.delete(deletedId);
        break;
    }

    // Emit change event for agents
    this.emitKnowledgeUpdate(payload);
  }

  private handleMemoryChange(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        this.agentMemories.set(newRecord.id, newRecord);
        break;
      case 'DELETE':
        this.agentMemories.delete(oldRecord.id);
        break;
    }

    // Emit change event for agents
    this.emitMemoryUpdate(payload);
  }

  // Knowledge Graph Management
  private updateKnowledgeGraph(category: string, key: string, relationships: any) {
    const nodeId = `${category}:${key}`;
    
    if (!this.knowledgeGraph.has(nodeId)) {
      this.knowledgeGraph.set(nodeId, new Set());
    }

    if (relationships && typeof relationships === 'object') {
      for (const [relType, relTargets] of Object.entries(relationships)) {
        if (Array.isArray(relTargets)) {
          relTargets.forEach(target => {
            this.knowledgeGraph.get(nodeId)?.add(`${relType}:${target}`);
          });
        }
      }
    }
  }

  private findRelationships(category: string, key: string, value: any): any {
    const relationships: any = {};
    
    // Find semantic relationships based on content
    if (typeof value === 'object' && value !== null) {
      // Look for references to other knowledge
      for (const [k, v] of Object.entries(value)) {
        if (typeof v === 'string' && v.includes('_')) {
          // Potential reference to another knowledge entry
          relationships.references = relationships.references || [];
          relationships.references.push(v);
        }
      }
    }

    // Category-based relationships
    relationships.category_peers = [category];
    
    return relationships;
  }

  // Utility Methods
  private extractTags(value: any): string[] {
    const tags: string[] = [];
    
    if (typeof value === 'object' && value !== null) {
      // Extract meaningful tags from object keys and values
      for (const [k, v] of Object.entries(value)) {
        tags.push(k);
        if (typeof v === 'string' && v.length < 50) {
          tags.push(v);
        }
      }
    } else if (typeof value === 'string') {
      // Extract words as tags
      const words = value.split(/\s+/).filter(word => word.length > 3);
      tags.push(...words.slice(0, 5));
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  private async logKnowledgeAccess(agentId: string, knowledgeKey: string, accessType: string, context: any = {}) {
    const logEntry = {
      agent_id: agentId,
      knowledge_key: knowledgeKey,
      access_type: accessType,
      timestamp: new Date().toISOString(),
      context
    };

    this.accessLog.push(logEntry);
    
    // Keep only last 1000 entries in memory
    if (this.accessLog.length > 1000) {
      this.accessLog = this.accessLog.slice(-1000);
    }

    if (this.supabase) {
      try {
        await this.supabase
          .from('agentricai_knowledge_access_log')
          .insert(logEntry);
      } catch (error) {
        console.warn('Failed to log knowledge access to Supabase, continuing with local storage:', error);
      }
    }
  }

  private async bulkInsertKnowledge(knowledgeStructure: any, parentCategory: string = '') {
    for (const [key, value] of Object.entries(knowledgeStructure)) {
      const category = parentCategory ? `${parentCategory}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Check if this is a knowledge entry or a nested category
        const hasDataKeys = Object.keys(value).some(k => 
          typeof value[k] !== 'object' || Array.isArray(value[k])
        );
        
        if (hasDataKeys) {
          // This is a knowledge entry
          await this.storeKnowledge(parentCategory || 'core', key, value, 'system-init', 1.0);
        } else {
          // This is a nested category
          await this.bulkInsertKnowledge(value, category);
        }
      } else {
        // This is a direct value
        await this.storeKnowledge(parentCategory || 'core', key, value, 'system-init', 1.0);
      }
    }
  }

  private saveToLocalStorage() {
    const data = {
      knowledge: Array.from(this.localKnowledge.entries()),
      memories: Array.from(this.agentMemories.entries()),
      patterns: Array.from(this.learningPatterns.entries())
    };
    localStorage.setItem('agentricai_knowledge_base', JSON.stringify(data));
  }

  private emitKnowledgeUpdate(payload: any) {
    window.dispatchEvent(new CustomEvent('agentricaiKnowledgeUpdate', { detail: payload }));
  }

  private emitMemoryUpdate(payload: any) {
    window.dispatchEvent(new CustomEvent('agentricaiMemoryUpdate', { detail: payload }));
  }

  // Public API for Agents
  async getKnowledgeStats(): Promise<any> {
    return {
      total_entries: this.localKnowledge.size,
      categories: new Set(Array.from(this.localKnowledge.keys()).map(k => k.split(':')[0])).size,
      agent_memories: this.agentMemories.size,
      learning_patterns: this.learningPatterns.size,
      recent_accesses: this.accessLog.slice(-10),
      knowledge_graph_nodes: this.knowledgeGraph.size
    };
  }

  async getRelatedKnowledge(category: string, key: string): Promise<any[]> {
    const nodeId = `${category}:${key}`;
    const related: any[] = [];
    
    const relationships = this.knowledgeGraph.get(nodeId);
    if (relationships) {
      for (const rel of relationships) {
        const [relType, target] = rel.split(':', 2);
        const knowledge = await this.retrieveKnowledge('core', target);
        if (knowledge) {
          related.push({ type: relType, target, knowledge });
        }
      }
    }

    return related;
  }

  // Cleanup
  destroy() {
    for (const [name, subscription] of this.realTimeSubscriptions.entries()) {
      subscription.unsubscribe();
    }
    this.realTimeSubscriptions.clear();
  }
}

// Export singleton instance
export const agentricaiKnowledgeDB = AgentricAIKnowledgeDatabase.getInstance();