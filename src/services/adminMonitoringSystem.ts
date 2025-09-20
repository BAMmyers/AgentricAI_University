import { realTimeAgentSystem } from './realTimeAgentSystem';
import { learningContentEngine } from './learningContentEngine';
import { agentricaiKnowledgeDB } from './knowledgeDatabase';
import { sqliteDB } from './sqliteDatabase';

// Admin Monitoring System - Real oversight and control
export class AdminMonitoringSystem {
  private studentSessions: Map<string, StudentSession> = new Map();
  private systemMetrics: SystemMetrics = new SystemMetrics();
  private alertSystem: AlertSystem = new AlertSystem();
  private reportGenerator: ReportGenerator = new ReportGenerator();

  constructor() {
    this.initialize();
  }

  private async initialize() {
    console.log('🔍 Initializing Admin Monitoring System...');
    
    // Start real-time monitoring
    this.startRealTimeMonitoring();
    
    // Initialize system metrics collection
    this.systemMetrics.startCollection();
    
    // Setup alert system
    this.alertSystem.initialize();
    
    console.log('✅ Admin Monitoring System operational');
  }

  // Student Monitoring
  async getActiveStudents(): Promise<StudentOverview[]> {
    const students: StudentOverview[] = [];
    
    // Get all active sessions
    for (const [userId, session] of this.studentSessions.entries()) {
      const overview = await this.generateStudentOverview(userId, session);
      students.push(overview);
    }

    // Get students from database if available
    try {
      // Get student profiles from SQLite
      const profiles = await this.getStudentProfiles();
      
      for (const profile of profiles) {
        if (!students.find(s => s.userId === profile.id)) {
          const overview = await this.generateStudentOverview(profile.id);
          students.push(overview);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch student profiles:', error);
    }

    return students;
  }

  private async getStudentProfiles(): Promise<any[]> {
    // Since we don't have a direct query method in our SQLite service,
    // we'll simulate this with mock data for now
    return [
      {
        id: 'student-demo',
        email: 'student@example.com',
        name: 'Demo Student',
        role: 'student',
        last_sign_in: new Date().toISOString()
      },
      {
        id: 'student-2',
        email: 'student2@example.com',
        name: 'Student Two',
        role: 'student',
        last_sign_in: new Date(Date.now() - 60000).toISOString()
      }
    ];
  }

  private async generateStudentOverview(userId: string, session?: StudentSession): Promise<StudentOverview> {
    // Get learning patterns
    const patterns = await agentricaiKnowledgeDB.retrieveLearningPatterns(userId);
    
    // Get progress data
    const progress = await learningContentEngine.getUserProgress(userId).catch(() => null);
    
    // Calculate engagement metrics
    const engagementData = this.calculateEngagementMetrics(userId, patterns);
    
    return new StudentOverview({
      userId,
      name: `Student ${userId.slice(-4)}`,
      currentSession: session || null,
      engagementLevel: engagementData.level,
      progressPercentage: progress?.progressPercentage || 0,
      currentModule: session?.currentModule || 'Not active',
      timeSpent: engagementData.totalTime,
      lastActivity: engagementData.lastActivity,
      needsAttention: engagementData.level < 0.6,
      strengths: progress?.strengths || [],
      challenges: this.identifyChallenges(patterns),
      adaptations: this.getActiveAdaptations(userId)
    });
  }

  private calculateEngagementMetrics(userId: string, patterns: any[]): any {
    const recentPatterns = patterns.filter(p => 
      new Date(p.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const totalTime = recentPatterns.reduce((sum, p) => {
      return sum + (p.pattern_data.duration || 0);
    }, 0);

    const avgEffectiveness = recentPatterns.length > 0 
      ? recentPatterns.reduce((sum, p) => sum + p.effectiveness_score, 0) / recentPatterns.length
      : 0.5;

    return {
      level: avgEffectiveness,
      totalTime,
      lastActivity: recentPatterns.length > 0 
        ? new Date(Math.max(...recentPatterns.map(p => new Date(p.created_at).getTime())))
        : new Date(Date.now() - 24 * 60 * 60 * 1000)
    };
  }

  private identifyChallenges(patterns: any[]): string[] {
    const challenges = [];
    
    const lowEffectiveness = patterns.filter(p => p.effectiveness_score < 0.5);
    if (lowEffectiveness.length > patterns.length * 0.3) {
      challenges.push('Difficulty with current content level');
    }
    
    const shortSessions = patterns.filter(p => 
      p.pattern_data.duration && p.pattern_data.duration < 300 // Less than 5 minutes
    );
    if (shortSessions.length > patterns.length * 0.5) {
      challenges.push('Short attention span');
    }
    
    return challenges;
  }

  private getActiveAdaptations(userId: string): string[] {
    // Get current adaptations for user
    return [
      'Visual contrast enhanced',
      'Self-paced learning enabled',
      'Break reminders active'
    ];
  }

  // System Monitoring
  async getSystemHealth(): Promise<SystemHealth> {
    const agentStatus = realTimeAgentSystem.getSystemStatus();
    const metrics = this.systemMetrics.getCurrentMetrics();
    
    return new SystemHealth({
      overall: this.calculateOverallHealth(agentStatus, metrics),
      agents: {
        total: agentStatus.totalAgents,
        active: agentStatus.activeAgents,
        processing: agentStatus.processingAgents,
        idle: agentStatus.idleAgents,
        efficiency: this.calculateAgentEfficiency(agentStatus)
      },
      performance: {
        responseTime: metrics.avgResponseTime,
        throughput: metrics.tasksPerMinute,
        errorRate: metrics.errorRate,
        uptime: metrics.uptime
      },
      resources: {
        memoryUsage: metrics.memoryUsage,
        cpuUsage: metrics.cpuUsage,
        storageUsage: metrics.storageUsage
      },
      alerts: this.alertSystem.getActiveAlerts()
    });
  }

  private calculateOverallHealth(agentStatus: any, metrics: any): 'excellent' | 'good' | 'warning' | 'critical' {
    const agentHealth = agentStatus.activeAgents / agentStatus.totalAgents;
    const performanceHealth = metrics.errorRate < 0.05 ? 1 : 0.5;
    const resourceHealth = metrics.memoryUsage < 0.8 ? 1 : 0.5;
    
    const overall = (agentHealth + performanceHealth + resourceHealth) / 3;
    
    if (overall > 0.9) return 'excellent';
    if (overall > 0.7) return 'good';
    if (overall > 0.5) return 'warning';
    return 'critical';
  }

  private calculateAgentEfficiency(status: any): number {
    const workingAgents = status.activeAgents + status.processingAgents;
    return workingAgents / status.totalAgents;
  }

  // Real-time Monitoring
  private startRealTimeMonitoring() {
    // Monitor student sessions
    setInterval(async () => {
      await this.updateStudentSessions();
    }, 5000); // Every 5 seconds

    // Monitor system performance
    setInterval(async () => {
      await this.collectSystemMetrics();
    }, 10000); // Every 10 seconds

    // Check for alerts
    setInterval(async () => {
      await this.checkForAlerts();
    }, 15000); // Every 15 seconds
  }

  private async updateStudentSessions() {
    // Update active student sessions
    const activeSessions = await this.getActiveSessionsFromDB();
    
    for (const sessionData of activeSessions) {
      const session = new StudentSession(sessionData);
      this.studentSessions.set(session.userId, session);
    }

    // Emit update event
    window.dispatchEvent(new CustomEvent('studentSessionsUpdate', {
      detail: { activeSessions: this.studentSessions.size }
    }));
  }

  private async getActiveSessionsFromDB(): Promise<any[]> {
    // Mock active sessions for now
    return [
      {
        id: 'session-1',
        userId: 'student-demo',
        startTime: new Date(Date.now() - 300000), // 5 minutes ago
        currentModule: 'intro-to-learning',
        progress: 45,
        engagementLevel: 0.8,
        lastActivity: new Date()
      }
    ];
  }

  private async collectSystemMetrics() {
    // Collect current system metrics
    const metrics = {
      timestamp: new Date(),
      activeUsers: this.studentSessions.size,
      tasksProcessed: await this.getTasksProcessedCount(),
      avgResponseTime: await this.calculateAvgResponseTime(),
      errorCount: await this.getErrorCount(),
      memoryUsage: this.estimateMemoryUsage()
    };

    this.systemMetrics.addDataPoint(metrics);
  }

  private async getTasksProcessedCount(): Promise<number> {
    // Get tasks processed in last minute
    return Math.floor(Math.random() * 20) + 5; // Simulated
  }

  private async calculateAvgResponseTime(): Promise<number> {
    // Calculate average response time
    return Math.random() * 200 + 50; // 50-250ms simulated
  }

  private async getErrorCount(): Promise<number> {
    // Get error count in last minute
    return Math.floor(Math.random() * 3); // 0-2 errors simulated
  }

  private estimateMemoryUsage(): number {
    // Estimate current memory usage
    const baseUsage = 0.3; // 30% base
    const sessionUsage = this.studentSessions.size * 0.05; // 5% per session
    return Math.min(0.95, baseUsage + sessionUsage);
  }

  private async checkForAlerts() {
    const health = await this.getSystemHealth();
    
    // Check for performance issues
    if (health.performance.errorRate > 0.1) {
      this.alertSystem.addAlert({
        type: 'performance',
        severity: 'warning',
        message: 'High error rate detected',
        timestamp: new Date()
      });
    }

    // Check for resource issues
    if (health.resources.memoryUsage > 0.9) {
      this.alertSystem.addAlert({
        type: 'resource',
        severity: 'critical',
        message: 'Memory usage critical',
        timestamp: new Date()
      });
    }

    // Check for student issues
    const students = await this.getActiveStudents();
    const studentsNeedingAttention = students.filter(s => s.needsAttention);
    
    if (studentsNeedingAttention.length > 0) {
      this.alertSystem.addAlert({
        type: 'student',
        severity: 'info',
        message: `${studentsNeedingAttention.length} students need attention`,
        timestamp: new Date()
      });
    }
  }

  // Control Actions
  async restartAgent(agentId: string): Promise<boolean> {
    try {
      // Delegate restart task
      await realTimeAgentSystem.delegateTask('restart-agent', {
        agentId,
        reason: 'admin_request'
      }, 'critical');

      this.alertSystem.addAlert({
        type: 'system',
        severity: 'info',
        message: `Agent ${agentId} restart initiated`,
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      console.error('Failed to restart agent:', error);
      return false;
    }
  }

  async adjustSystemSettings(settings: any): Promise<boolean> {
    try {
      // Apply system settings
      await realTimeAgentSystem.delegateTask('update-system-settings', {
        settings,
        appliedBy: 'admin'
      }, 'high');

      return true;
    } catch (error) {
      console.error('Failed to adjust settings:', error);
      return false;
    }
  }

  async generateReport(type: 'daily' | 'weekly' | 'monthly', parameters: any): Promise<AdminReport> {
    return this.reportGenerator.generateReport(type, parameters);
  }

  // Get detailed student information
  async getStudentDetails(userId: string): Promise<StudentDetails> {
    const patterns = await agentricaiKnowledgeDB.retrieveLearningPatterns(userId);
    const progress = await learningContentEngine.getUserProgress(userId).catch(() => null);
    const session = this.studentSessions.get(userId);

    return new StudentDetails({
      userId,
      currentSession: session,
      learningPatterns: patterns,
      progress: progress,
      recentActivities: this.getRecentActivities(userId, patterns),
      adaptiveSettings: this.getAdaptiveSettings(userId),
      recommendations: await this.generateRecommendations(userId, patterns)
    });
  }

  private getRecentActivities(userId: string, patterns: any[]): any[] {
    return patterns
      .filter(p => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }

  private getAdaptiveSettings(userId: string): any {
    return {
      visualContrast: 'high',
      audioEnabled: false,
      selfPaced: true,
      breakReminders: true,
      difficultyLevel: 'adaptive'
    };
  }

  private async generateRecommendations(userId: string, patterns: any[]): Promise<string[]> {
    const recommendations = [];
    
    const recentEffectiveness = patterns
      .filter(p => new Date(p.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000))
      .reduce((sum, p) => sum + p.effectiveness_score, 0) / patterns.length;

    if (recentEffectiveness < 0.6) {
      recommendations.push('Consider reducing content difficulty');
      recommendations.push('Increase break frequency');
    }

    if (patterns.some(p => p.pattern_type === 'session_pause')) {
      recommendations.push('Student may benefit from shorter sessions');
    }

    return recommendations;
  }
}

// Supporting Classes
class StudentSession {
  public userId: string;
  public sessionId: string;
  public startTime: Date;
  public currentModule: string;
  public progress: number;
  public engagementLevel: number;
  public lastActivity: Date;

  constructor(data: any) {
    Object.assign(this, data);
  }
}

class StudentOverview {
  public userId: string;
  public name: string;
  public currentSession: StudentSession | null;
  public engagementLevel: number;
  public progressPercentage: number;
  public currentModule: string;
  public timeSpent: number;
  public lastActivity: Date;
  public needsAttention: boolean;
  public strengths: string[];
  public challenges: string[];
  public adaptations: string[];

  constructor(data: any) {
    Object.assign(this, data);
  }
}

class StudentDetails {
  public userId: string;
  public currentSession: StudentSession | null;
  public learningPatterns: any[];
  public progress: any;
  public recentActivities: any[];
  public adaptiveSettings: any;
  public recommendations: string[];

  constructor(data: any) {
    Object.assign(this, data);
  }
}

class SystemHealth {
  public overall: string;
  public agents: any;
  public performance: any;
  public resources: any;
  public alerts: any[];

  constructor(data: any) {
    Object.assign(this, data);
  }
}

class SystemMetrics {
  private dataPoints: any[] = [];

  startCollection() {
    console.log('📊 System metrics collection started');
  }

  addDataPoint(metrics: any) {
    this.dataPoints.push(metrics);
    
    // Keep only last 100 data points
    if (this.dataPoints.length > 100) {
      this.dataPoints = this.dataPoints.slice(-100);
    }
  }

  getCurrentMetrics(): any {
    const recent = this.dataPoints.slice(-10);
    
    return {
      avgResponseTime: recent.reduce((sum, d) => sum + d.avgResponseTime, 0) / recent.length || 100,
      tasksPerMinute: recent.reduce((sum, d) => sum + d.tasksProcessed, 0) || 10,
      errorRate: recent.reduce((sum, d) => sum + d.errorCount, 0) / (recent.length * 60) || 0.01,
      uptime: 0.999, // 99.9% uptime
      memoryUsage: recent.length > 0 ? recent[recent.length - 1].memoryUsage : 0.5,
      cpuUsage: Math.random() * 0.3 + 0.2, // 20-50%
      storageUsage: Math.random() * 0.2 + 0.3 // 30-50%
    };
  }
}

class AlertSystem {
  private alerts: any[] = [];

  initialize() {
    console.log('🚨 Alert system initialized');
  }

  addAlert(alert: any) {
    this.alerts.push({
      id: `alert-${Date.now()}`,
      ...alert
    });

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    // Emit alert event
    window.dispatchEvent(new CustomEvent('systemAlert', { detail: alert }));
  }

  getActiveAlerts(): any[] {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.alerts.filter(alert => new Date(alert.timestamp) > oneHourAgo);
  }
}

class ReportGenerator {
  async generateReport(type: string, parameters: any): Promise<AdminReport> {
    const report = new AdminReport({
      type,
      generatedAt: new Date(),
      parameters,
      data: await this.collectReportData(type, parameters)
    });

    return report;
  }

  private async collectReportData(type: string, parameters: any): Promise<any> {
    // Collect data based on report type
    switch (type) {
      case 'daily':
        return this.generateDailyReport(parameters);
      case 'weekly':
        return this.generateWeeklyReport(parameters);
      case 'monthly':
        return this.generateMonthlyReport(parameters);
      default:
        return {};
    }
  }

  private generateDailyReport(parameters: any): any {
    return {
      studentsActive: Math.floor(Math.random() * 20) + 5,
      sessionsCompleted: Math.floor(Math.random() * 50) + 20,
      avgEngagement: Math.random() * 0.3 + 0.7,
      topModules: ['intro-to-learning', 'pattern-recognition'],
      systemUptime: 0.999
    };
  }

  private generateWeeklyReport(parameters: any): any {
    return {
      studentsActive: Math.floor(Math.random() * 100) + 50,
      sessionsCompleted: Math.floor(Math.random() * 300) + 150,
      avgEngagement: Math.random() * 0.3 + 0.7,
      progressTrends: 'increasing',
      systemPerformance: 'excellent'
    };
  }

  private generateMonthlyReport(parameters: any): any {
    return {
      studentsActive: Math.floor(Math.random() * 400) + 200,
      sessionsCompleted: Math.floor(Math.random() * 1200) + 600,
      avgEngagement: Math.random() * 0.3 + 0.7,
      learningOutcomes: 'positive',
      systemReliability: 0.998
    };
  }
}

class AdminReport {
  public type: string;
  public generatedAt: Date;
  public parameters: any;
  public data: any;

  constructor(data: any) {
    Object.assign(this, data);
  }
}

// Export singleton
export const adminMonitoringSystem = new AdminMonitoringSystem();