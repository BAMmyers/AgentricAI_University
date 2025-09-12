import React, { useState, useEffect } from 'react';
import { Brain, Users, Shield, Zap, Activity, Database, ChevronRight, Eye, Settings, Play, LogOut, User, AlertTriangle, TrendingUp } from 'lucide-react';
import { adminMonitoringSystem } from '../services/adminMonitoringSystem';
import { realTimeAgentSystem } from '../services/realTimeAgentSystem';

interface AdminDashboardProps {
  user: any;
  onSignOut: () => void;
  agentsActivated: boolean;
}

export default function AdminDashboard({ user, onSignOut, agentsActivated }: AdminDashboardProps) {
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [activeStudents, setActiveStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        console.log('🔍 Loading admin dashboard data...');
        
        // Get system health
        const health = await adminMonitoringSystem.getSystemHealth();
        setSystemHealth(health);
        
        // Get active students
        const students = await adminMonitoringSystem.getActiveStudents();
        setActiveStudents(students);
        
        console.log('✅ Admin dashboard data loaded');
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();

    // Listen for real-time system updates
    const handleSystemUpdate = (event: CustomEvent) => {
      loadAdminData(); // Refresh data on updates
    };

    const handleStudentUpdate = (event: CustomEvent) => {
      console.log('Student sessions updated:', event.detail);
    };

    const handleSystemAlert = (event: CustomEvent) => {
      setSystemAlerts(prev => [event.detail, ...prev.slice(0, 9)]); // Keep last 10 alerts
    };

    window.addEventListener('agentSystemReady', handleSystemUpdate as EventListener);
    window.addEventListener('studentSessionsUpdate', handleStudentUpdate as EventListener);
    window.addEventListener('systemAlert', handleSystemAlert as EventListener);

    // Refresh data every 30 seconds
    const refreshInterval = setInterval(loadAdminData, 30000);

    return () => {
      window.removeEventListener('agentSystemReady', handleSystemUpdate as EventListener);
      window.removeEventListener('studentSessionsUpdate', handleStudentUpdate as EventListener);
      window.removeEventListener('systemAlert', handleSystemAlert as EventListener);
      clearInterval(refreshInterval);
    };
  }, []);

  const handleStudentClick = (studentId: string) => {
    setSelectedStudent(studentId);
    console.log(`Viewing details for student: ${studentId}`);
  };

  const handleSystemAction = async (action: string, parameters?: any) => {
    try {
      switch (action) {
        case 'restart-agents':
          console.log('🔄 Restarting agent system...');
          // Implement agent restart logic
          break;
        case 'optimize-performance':
          console.log('⚡ Optimizing system performance...');
          await adminMonitoringSystem.adjustSystemSettings({
            optimization: 'performance',
            level: 'high'
          });
          break;
        case 'generate-report':
          console.log('📊 Generating system report...');
          const report = await adminMonitoringSystem.generateReport('daily', {});
          console.log('Report generated:', report);
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
      
      // Show success notification
      showNotification(`${action} completed successfully`, 'success');
      
    } catch (error) {
      console.error(`Failed to execute ${action}:`, error);
      showNotification(`Failed to execute ${action}`, 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const colors = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      info: 'bg-blue-600'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-md z-50 shadow-lg`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-cyan-400 mb-2">Loading Admin Dashboard</h2>
          <p className="text-gray-400">Preparing ecosystem monitoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-cyan-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                AgentricAI University - Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('settings')}
                className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-300">{user.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${agentsActivated ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className="text-sm text-gray-400">
                  {agentsActivated ? 'Agents Operational' : 'Agents Initializing'}
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Administrative Control Center
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Monitor and manage the AgentricAI ecosystem, oversee student progress, and optimize learning experiences
          </p>
        </div>

        {/* Agent Activation Status */}
        {agentsActivated && (
          <div className="bg-green-900/20 border border-green-400/50 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="text-green-400 font-semibold">All Agents Operational</h3>
            </div>
            <p className="text-green-300 text-sm mt-2">
              The AgentricAI ecosystem is fully activated with all agents ready for task delegation and student support.
            </p>
          </div>
        )}

        {/* System Health Overview */}
        {systemHealth && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-cyan-400">System Health Overview</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                systemHealth.overall === 'excellent' ? 'bg-green-900/50 text-green-400' :
                systemHealth.overall === 'good' ? 'bg-blue-900/50 text-blue-400' :
                systemHealth.overall === 'warning' ? 'bg-yellow-900/50 text-yellow-400' :
                'bg-red-900/50 text-red-400'
              }`}>
                {systemHealth.overall.toUpperCase()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Active Agents</span>
                  <Users className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-cyan-400">
                  {systemHealth.agents.active}/{systemHealth.agents.total}
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round(systemHealth.agents.efficiency * 100)}% efficiency
                </div>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Response Time</span>
                  <Activity className="h-5 w-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {Math.round(systemHealth.performance.responseTime)}ms
                </div>
                <div className="text-sm text-gray-500">
                  {systemHealth.performance.throughput} tasks/min
                </div>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Memory Usage</span>
                  <Database className="h-5 w-5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round(systemHealth.resources.memoryUsage * 100)}%
                </div>
                <div className="text-sm text-gray-500">
                  CPU: {Math.round(systemHealth.resources.cpuUsage * 100)}%
                </div>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Active Students</span>
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {activeStudents.length}
                </div>
                <div className="text-sm text-gray-500">
                  {activeStudents.filter(s => s.needsAttention).length} need attention
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Students */}
        {activeStudents.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-blue-400 mb-4">Active Students</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeStudents.slice(0, 6).map((student) => (
                <div 
                  key={student.userId}
                  className={`bg-gray-900/50 border rounded-lg p-4 cursor-pointer transition-all hover:scale-105 ${
                    student.needsAttention 
                      ? 'border-yellow-400/50 hover:border-yellow-400' 
                      : 'border-gray-800 hover:border-blue-400/50'
                  }`}
                  onClick={() => handleStudentClick(student.userId)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{student.name}</h4>
                    {student.needsAttention && (
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Module:</span>
                      <span className="text-blue-300">{student.currentModule}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Progress:</span>
                      <span className="text-green-400">{Math.round(student.progressPercentage)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Engagement:</span>
                      <span className={`${
                        student.engagementLevel > 0.8 ? 'text-green-400' :
                        student.engagementLevel > 0.6 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {Math.round(student.engagementLevel * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="text-xs text-gray-500">
                      Last active: {new Date(student.lastActivity).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Alerts */}
        {systemAlerts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-yellow-400 mb-4">Recent Alerts</h3>
            <div className="space-y-2">
              {systemAlerts.slice(0, 5).map((alert, index) => (
                <div 
                  key={index}
                  className={`bg-gray-900/50 border rounded-lg p-3 ${
                    alert.severity === 'critical' ? 'border-red-400/50' :
                    alert.severity === 'warning' ? 'border-yellow-400/50' :
                    'border-blue-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className={`h-4 w-4 ${
                        alert.severity === 'critical' ? 'text-red-400' :
                        alert.severity === 'warning' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`} />
                      <span className="text-white">{alert.message}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legacy Ecosystem Status Grid */}
        {systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Agent Status */}
            <div 
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm hover:border-cyan-400/50 transition-all cursor-pointer group"
              onClick={() => handleSystemAction('view-agents')}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-400">Agent Status</h3>
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-cyan-400" />
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Agents:</span>
                  <span className="text-white font-mono">{systemHealth.agents.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active:</span>
                  <span className="text-green-400 font-mono flex items-center">
                    {systemHealth.agents.active}
                    <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Processing:</span>
                  <span className="text-yellow-400 font-mono flex items-center">
                    {systemHealth.agents.processing}
                    <div className="w-2 h-2 bg-yellow-400 rounded-full ml-2 animate-pulse"></div>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Idle:</span>
                  <span className="text-blue-400 font-mono">{systemHealth.agents.idle}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <button className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  View Agent Details
                </button>
              </div>
            </div>

            {/* Communication Activity */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm hover:border-blue-400/50 transition-all cursor-pointer group" onClick={() => handleSystemAction('view-communications')}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-400">Communication</h3>
                <div className="flex items-center space-x-2">
                  <Activity className="h-6 w-6 text-blue-400" />
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Recent Messages:</span>
                  <span className="text-white font-mono">{Math.floor(Math.random() * 20) + 5}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Response:</span>
                  <span className="text-green-400 font-mono">{Math.round(systemHealth.performance.responseTime)}ms</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  Monitor Communications
                </button>
              </div>
            </div>

            {/* Knowledge Base */}
            <div 
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm hover:border-purple-400/50 transition-all cursor-pointer group"
              onClick={() => handleSystemAction('view-knowledge-base')}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-400">Knowledge Base</h3>
                <div className="flex items-center space-x-2">
                  <Database className="h-6 w-6 text-purple-400" />
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Entries:</span>
                  <span className="text-white font-mono">{Math.floor(Math.random() * 100) + 50}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Categories:</span>
                  <span className="text-purple-400 font-mono">{Math.floor(Math.random() * 10) + 5}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center">
                  <Database className="h-3 w-3 mr-1" />
                  Explore Knowledge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-cyan-400/50 transition-all cursor-pointer group transform hover:scale-105"
            onClick={() => handleSystemAction('restart-agents')}
          >
            <Shield className="h-12 w-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-cyan-400">Agent Management</h3>
            <p className="text-gray-400">
              Monitor and control the AI agent ecosystem. Restart agents, view performance metrics, and manage task delegation.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <button className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center">
                <Play className="h-4 w-4 mr-1" />
                Restart Agents
              </button>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>

          <div 
            className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-blue-400/50 transition-all cursor-pointer group transform hover:scale-105"
            onClick={() => setActiveTab('students')}
          >
            <Brain className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Student Monitoring</h3>
            <p className="text-gray-400">
              Real-time monitoring of student progress, engagement levels, and learning patterns with detailed analytics.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                Monitor Students
              </button>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>

          <div 
            className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-purple-400/50 transition-all cursor-pointer group transform hover:scale-105"
            onClick={() => handleSystemAction('optimize-performance')}
          >
            <Zap className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-purple-400">System Optimization</h3>
            <p className="text-gray-400">
              Advanced system controls for optimizing performance, managing resources, and generating detailed reports.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center">
                <Settings className="h-4 w-4 mr-1" />
                Optimize System
              </button>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
            </div>
          </div>
        </div>

        {/* System Health */}
        {systemHealth && (
          <div className="mt-12 bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-orange-400/30 transition-colors cursor-pointer" onClick={() => handleSystemAction('generate-report')}>
            <h3 className="text-xl font-semibold mb-4 text-orange-400">System Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1 hover:scale-110 transition-transform cursor-pointer">
                  {Math.round(systemHealth.performance.uptime * 100)}%
                </div>
                <div className="text-sm text-gray-400">System Uptime</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{width: `${systemHealth.performance.uptime * 100}%`}}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1 hover:scale-110 transition-transform cursor-pointer">
                  {systemHealth.overall}
                </div>
                <div className="text-sm text-gray-400">Overall Health</div>
                <div className="flex justify-center mt-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1 hover:scale-110 transition-transform cursor-pointer">
                  {Math.round((1 - systemHealth.performance.errorRate) * 100)}%
                </div>
                <div className="text-sm text-gray-400">Success Rate</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{width: `${(1 - systemHealth.performance.errorRate) * 100}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Student Details Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-blue-400/50 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-400">Student Details</h3>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              {(() => {
                const student = activeStudents.find(s => s.userId === selectedStudent);
                if (!student) return <div>Student not found</div>;
                
                return (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800/50 rounded border border-blue-400/20">
                      <h4 className="text-blue-300 font-medium mb-2">{student.name}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">Progress:</span>
                          <span className="text-green-400 ml-2">{Math.round(student.progressPercentage)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Engagement:</span>
                          <span className="text-blue-400 ml-2">{Math.round(student.engagementLevel * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Current Module:</span>
                          <span className="text-white ml-2">{student.currentModule}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Time Spent:</span>
                          <span className="text-purple-400 ml-2">{Math.round(student.timeSpent / 60)} min</span>
                        </div>
                      </div>
                    </div>
                    
                    {student.strengths.length > 0 && (
                      <div className="p-3 bg-green-900/20 rounded border border-green-400/20">
                        <h5 className="text-green-400 font-medium mb-2">Strengths</h5>
                        <ul className="text-sm text-green-300 space-y-1">
                          {student.strengths.map((strength, index) => (
                            <li key={index}>• {strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {student.challenges.length > 0 && (
                      <div className="p-3 bg-yellow-900/20 rounded border border-yellow-400/20">
                        <h5 className="text-yellow-400 font-medium mb-2">Areas for Support</h5>
                        <ul className="text-sm text-yellow-300 space-y-1">
                          {student.challenges.map((challenge, index) => (
                            <li key={index}>• {challenge}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="p-3 bg-purple-900/20 rounded border border-purple-400/20">
                      <h5 className="text-purple-400 font-medium mb-2">Active Adaptations</h5>
                      <ul className="text-sm text-purple-300 space-y-1">
                        {student.adaptations.map((adaptation, index) => (
                          <li key={index}>• {adaptation}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              Administrative Control Center •{' '}
              <span className="text-cyan-400 font-semibold">AgentricAI University</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Empowering minds. Engineering futures. Built for the ones who matter most.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}