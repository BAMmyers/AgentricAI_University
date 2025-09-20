import { sqliteDB } from './sqliteDatabase';

// Enhanced Knowledge Database - Active Working Memory for AgentricAI Ecosystem
export class AgentricAIKnowledgeDatabase {
  private static instance: AgentricAIKnowledgeDatabase;
  private localKnowledge: Map<string, any> = new Map();
  private agentMemories: Map<string, any> = new Map();
  private learningPatterns: Map<string, any> = new Map();
  private knowledgeGraph: Map<string, Set<string>> = new Map();
  private accessLog: Array<any> = [];

  private constructor() {
    this.initializeKnowledgeStructure();
  }

  static getInstance(): AgentricAIKnowledgeDatabase {
    if (!AgentricAIKnowledgeDatabase.instance) {
      AgentricAIKnowledgeDatabase.instance = new AgentricAIKnowledgeDatabase();
    }
    return AgentricAIKnowledgeDatabase.instance;
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
    const knowledgeId = await sqliteDB.storeKnowledge(category, key, value, sourceAgent, confidence);
    
    // Log the storage operation
    if (sourceAgent !== 'system-init') {
      await this.logKnowledgeAccess(sourceAgent || 'system', knowledgeId, 'store', { confidence });
    }

    return knowledgeId;
  }

  async retrieveKnowledge(category: string, key: string, requestingAgent?: string): Promise<any> {
    const knowledge = await sqliteDB.retrieveKnowledge(category, key);
    const knowledgeId = `${category}:${key}`;

    // Log the retrieval
    if (knowledge) {
      await this.logKnowledgeAccess(requestingAgent || 'unknown', knowledgeId, 'retrieve', {
        confidence: knowledge.confidence_score
      });
    }

    return knowledge?.value || null;
  }

  async queryKnowledge(query: string, requestingAgent?: string): Promise<any[]> {
    const results = await sqliteDB.queryKnowledge(query);

    // Log the query
    await this.logKnowledgeAccess(requestingAgent || 'unknown', `query:${query}`, 'query', {
      results_count: results.length
    });

    return results.slice(0, 10);
  }

  // Agent Memory Management
  async storeAgentMemory(agentId: string, memoryType: string, memoryData: any, priority: number = 5): Promise<string> {
    return await sqliteDB.storeAgentMemory(agentId, memoryType, memoryData, priority);
  }

  async retrieveAgentMemory(agentId: string, memoryType?: string): Promise<any[]> {
    return await sqliteDB.retrieveAgentMemory(agentId, memoryType);
  }

  // Learning Pattern Management
  async storeLearningPattern(userId: string, patternType: string, patternData: any, effectiveness: number = 0.5): Promise<string> {
    return await sqliteDB.storeLearningPattern(userId, patternType, patternData, effectiveness);
  }

  async retrieveLearningPatterns(userId: string, patternType?: string): Promise<any[]> {
    return await sqliteDB.retrieveLearningPatterns(userId, patternType);
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
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

    // Log to SQLite
    await sqliteDB.logActivity(agentId, `knowledge_${accessType}`, {
      knowledge_key: knowledgeKey,
      context
    });
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
          try {
            await this.storeKnowledge(parentCategory || 'core', key, value, 'system-init', 1.0);
          } catch (error) {
            console.warn(`Failed to store knowledge entry ${key}:`, error);
          }
        } else {
          // This is a nested category
          await this.bulkInsertKnowledge(value, category);
        }
      } else {
        // This is a direct value
        try {
          await this.storeKnowledge(parentCategory || 'core', key, value, 'system-init', 1.0);
        } catch (error) {
          console.warn(`Failed to store knowledge value ${key}:`, error);
        }
      }
    }
  }

  // Public API for Agents
  async getKnowledgeStats(): Promise<any> {
    const stats = await sqliteDB.getSystemStats();
    return {
      total_entries: stats.knowledge.entries,
      categories: 4, // Estimated based on our knowledge structure
      agent_memories: 0, // Will be populated as agents create memories
      learning_patterns: 0, // Will be populated as users learn
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

}

// Export singleton instance
export const agentricaiKnowledgeDB = AgentricAIKnowledgeDatabase.getInstance();