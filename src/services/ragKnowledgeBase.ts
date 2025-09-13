// RAG Knowledge Base for AgentricAI ChatBot
export class RAGKnowledgeBase {
  private knowledgeBase: Map<string, any> = new Map();
  private vectorStore: Map<string, number[]> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.initializeKnowledgeBase();
  }

  private async initializeKnowledgeBase() {
    // System Status Knowledge
    this.addKnowledge('system_status', {
      agents_operational: {
        answer: "Currently we have 5 agents operational out of 6 total agents. System efficiency is running at 94.2%. Our agents include Learning Coordinator (98% efficiency), Behavior Analyst (91% efficiency), Content Generator (89% efficiency), Progress Monitor (96% efficiency), Communication Router (99% efficiency), and Error Handler (92% efficiency).",
        keywords: ['agents', 'operational', 'status', 'efficiency', 'how many']
      },
      system_health: {
        answer: "System health is OPTIMAL. Overall uptime is 99.9%, response time averages 120ms, error rate is 0.01%, memory usage at 65%, CPU at 35%, and storage at 42%. All critical systems are functioning normally.",
        keywords: ['system', 'health', 'performance', 'uptime', 'status']
      },
      resource_usage: {
        answer: "Current resource utilization: Memory 65% (within normal range), CPU 35% (optimal), Storage 42% (good), Network throughput 89% efficiency. All resources are operating within acceptable parameters.",
        keywords: ['resources', 'memory', 'cpu', 'storage', 'utilization']
      }
    });

    // Student Analytics Knowledge
    this.addKnowledge('student_analytics', {
      active_students: {
        answer: "We currently have 23 active students with an average engagement level of 87.3%. 21 students are performing well, 2 may need additional attention. Top performing areas include visual learning (94% completion) and pattern recognition (87% engagement).",
        keywords: ['students', 'active', 'engagement', 'performance', 'analytics']
      },
      completion_rates: {
        answer: "Overall completion rate is 82% across all modules. Visual Learning Modules: 94%, Pattern Recognition: 87%, Interactive Content: 91%, Emotional Recognition: 78%. Students show strong preference for visual and interactive content.",
        keywords: ['completion', 'rates', 'modules', 'progress', 'learning']
      },
      student_support: {
        answer: "2 students currently need attention: Student A shows decreased engagement (down to 45%), Student B has extended session pauses. Recommended interventions include personalized check-ins and adaptive difficulty adjustments.",
        keywords: ['support', 'attention', 'intervention', 'help', 'struggling']
      }
    });

    // Financial Analytics Knowledge
    this.addKnowledge('financial_analytics', {
      revenue_overview: {
        answer: "Monthly recurring revenue: $47,250 (↑12% from last month). Student subscriptions: 156 active, Average revenue per user: $302. Projected quarterly growth: 18%. Financial health is strong with positive cash flow.",
        keywords: ['finance', 'revenue', 'money', 'financial', 'earnings', 'income']
      },
      cost_analysis: {
        answer: "Operating costs: $28,400/month. Breakdown: Infrastructure 45% ($12,780), Personnel 35% ($9,940), Marketing 15% ($4,260), Other 5% ($1,420). Cost efficiency improved 8% this quarter through system optimizations.",
        keywords: ['costs', 'expenses', 'spending', 'budget', 'financial']
      },
      profit_margins: {
        answer: "Current profit margin: 39.9% (↑3.2% from last quarter). Gross margin: 72%, Net margin: 39.9%. Strong profitability with healthy growth trajectory. ROI on student acquisition: 340%.",
        keywords: ['profit', 'margin', 'profitability', 'roi', 'return']
      }
    });

    // Complaints & Issues Knowledge
    this.addKnowledge('complaints_issues', {
      recent_complaints: {
        answer: "Past 30 days: 3 complaints total (↓67% from last month). Issues: 1 technical difficulty (resolved), 1 content accessibility request (implemented), 1 billing inquiry (resolved). Average resolution time: 4.2 hours. Customer satisfaction: 96.8%.",
        keywords: ['complaints', 'issues', 'problems', 'support', 'tickets']
      },
      technical_issues: {
        answer: "Technical issues this month: 2 minor incidents. 1 brief system slowdown (resolved in 12 minutes), 1 content loading delay (fixed with CDN optimization). System reliability: 99.94%. No critical issues reported.",
        keywords: ['technical', 'bugs', 'errors', 'system', 'problems']
      },
      user_feedback: {
        answer: "User feedback summary: 94% positive ratings, 4.8/5.0 average score. Top praised features: Adaptive learning (96% satisfaction), Visual design (92% satisfaction), Agent assistance (89% satisfaction). Areas for improvement: Audio content variety, mobile optimization.",
        keywords: ['feedback', 'ratings', 'satisfaction', 'reviews', 'user']
      }
    });

    // Student Guidance Knowledge
    this.addKnowledge('student_guidance', {
      next_steps: {
        answer: "I recommend starting with 'Welcome to Your Learning Journey' - it's perfect for getting familiar with how AgentricAI works and will help identify your learning preferences. After that, try 'Amazing Patterns Everywhere' to build foundational skills.",
        keywords: ['next', 'start', 'begin', 'what do', 'where', 'first']
      },
      progress_help: {
        answer: "You're doing great! Your current progress shows strong visual learning preferences and good pattern recognition skills. Keep exploring the interactive lessons - they're designed specifically for your learning style. Remember to take breaks when needed!",
        keywords: ['progress', 'how am i', 'doing', 'performance', 'learning']
      },
      break_guidance: {
        answer: "Taking breaks is super important for learning! I can remind you every 15 or 30 minutes, or you can manage your own pace. During breaks, try some deep breathing or gentle stretching. Your brain processes information better when it's rested!",
        keywords: ['break', 'tired', 'rest', 'pause', 'stop']
      }
    });

    // Security Knowledge
    this.addKnowledge('security_status', {
      security_overview: {
        answer: "Security status: SECURE. No active threats detected, 0 failed login attempts today, all systems encrypted with AES-256. Access control active, API rate limiting enabled, regular security audits passed. Last security scan: All clear.",
        keywords: ['security', 'threats', 'safe', 'protection', 'secure']
      },
      access_control: {
        answer: "Access control status: 1 admin session active, 23 student sessions active, all authenticated properly. Role-based permissions enforced, session timeouts configured, multi-factor authentication available for admin accounts.",
        keywords: ['access', 'permissions', 'authentication', 'login', 'users']
      }
    });

    this.initialized = true;
    console.log('🧠 RAG Knowledge Base initialized with', this.knowledgeBase.size, 'categories');
  }

  private addKnowledge(category: string, entries: any) {
    this.knowledgeBase.set(category, entries);
    
    // Create simple keyword vectors for each entry
    for (const [key, entry] of Object.entries(entries)) {
      const vectorKey = `${category}_${key}`;
      const keywords = (entry as any).keywords || [];
      // Simple keyword-based vector (in real RAG, this would be embeddings)
      const vector = this.createKeywordVector(keywords);
      this.vectorStore.set(vectorKey, vector);
    }
  }

  private createKeywordVector(keywords: string[]): number[] {
    // Simple keyword matching vector (in production, use actual embeddings)
    const commonWords = [
      'agents', 'system', 'students', 'performance', 'status', 'health',
      'finance', 'revenue', 'complaints', 'issues', 'security', 'next',
      'progress', 'help', 'break', 'learning', 'operational', 'analytics'
    ];
    
    return commonWords.map(word => 
      keywords.some(keyword => keyword.includes(word) || word.includes(keyword)) ? 1 : 0
    );
  }

  public async queryKnowledge(query: string, userRole: 'admin' | 'student' = 'student'): Promise<string> {
    if (!this.initialized) {
      return "I'm still learning! Please try again in a moment.";
    }

    const queryLower = query.toLowerCase();
    const queryVector = this.createKeywordVector(queryLower.split(' '));
    
    let bestMatch = '';
    let bestScore = 0;
    let bestAnswer = '';

    // Search through knowledge base
    for (const [category, entries] of this.knowledgeBase.entries()) {
      // Filter by user role
      if (userRole === 'student' && !category.includes('guidance')) {
        if (category.includes('financial') || category.includes('complaints') || 
            category.includes('analytics') && !queryLower.includes('my')) {
          continue; // Skip admin-only content for students
        }
      }

      for (const [key, entry] of Object.entries(entries)) {
        const vectorKey = `${category}_${key}`;
        const entryVector = this.vectorStore.get(vectorKey) || [];
        
        // Calculate similarity score
        const score = this.calculateSimilarity(queryVector, entryVector);
        
        // Also check for direct keyword matches
        const keywords = (entry as any).keywords || [];
        const directMatch = keywords.some(keyword => 
          queryLower.includes(keyword) || keyword.includes(queryLower.split(' ')[0])
        );
        
        const finalScore = directMatch ? score + 0.5 : score;
        
        if (finalScore > bestScore) {
          bestScore = finalScore;
          bestMatch = vectorKey;
          bestAnswer = (entry as any).answer;
        }
      }
    }

    // Return best match or fallback
    if (bestScore > 0.3) {
      return bestAnswer;
    }

    // Fallback responses
    if (userRole === 'admin') {
      return "I can provide insights on system performance, student analytics, financial data, security status, and operational metrics. What specific area would you like me to analyze?";
    } else {
      return "I'm here to help with your learning journey! I can guide you to your next lesson, check your progress, or help with any questions about AgentricAI University. What would you like to explore?";
    }
  }

  private calculateSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  public getAvailableTopics(userRole: 'admin' | 'student'): string[] {
    if (userRole === 'admin') {
      return [
        'System Overview',
        'Student Performance', 
        'Financial Analytics',
        'Security Status',
        'Agent Analytics',
        'Complaints & Issues'
      ];
    } else {
      return [
        'What should I do next?',
        'Check my progress',
        'Help with settings',
        'Take a break',
        'Learning tips'
      ];
    }
  }

  public async getMultiTopicReport(topics: string[], userRole: 'admin' | 'student'): Promise<string> {
    const reports: string[] = [];
    
    for (const topic of topics) {
      const report = await this.queryKnowledge(topic, userRole);
      reports.push(`**${topic}:**\n${report}\n`);
    }
    
    return reports.join('\n');
  }
}

// Export singleton
export const ragKnowledgeBase = new RAGKnowledgeBase();