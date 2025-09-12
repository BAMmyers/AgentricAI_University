import React, { useState, useEffect } from 'react';
import { Brain, Users, Shield, Zap, Activity, Database, ChevronRight, Eye, Settings, Play, LogOut, User } from 'lucide-react';
import { agentricaiEcosystem } from '../services/agentEcosystem';

interface AdminDashboardProps {
  user: any;
  onSignOut: () => void;
  agentsActivated: boolean;
}

export default function AdminDashboard({ user, onSignOut, agentsActivated }: AdminDashboardProps) {
  const [ecosystemStatus, setEcosystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showKnowledgeDetails, setShowKnowledgeDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const loadEcosystemStatus = async () => {
      try {
        const status = await agentricaiEcosystem.getEcosystemStatus();
        setEcosystemStatus(status);
      } catch (error) {
        console.error('Failed to load ecosystem status:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEcosystemStatus();

    // Listen for real-time updates
    const handleEcosystemUpdate = (event: CustomEvent) => {
      setEcosystemStatus(event.detail);
    };

    window.addEventListener('agentricaiEcosystemUpdate', handleEcosystemUpdate as EventListener);

    return () => {
      window.removeEventListener('agentricaiEcosystemUpdate', handleEcosystemUpdate as EventListener);
    };
  }, []);

  const handleAgentClick = (agentId: string) => {
    setSelectedAgent(agentId);
    console.log(`Viewing details for agent: ${agentId}`);
  };

  const handleKnowledgeBaseClick = () => {
    setShowKnowledgeDetails(!showKnowledgeDetails);
  };

  const handleFeatureClick = (feature: string) => {
    console.log(`Activating feature: ${feature}`);
    
    // Provide user feedback
    const featureMessages = {
      'stealth-agents': 'Stealth Agent System activated - monitoring all agent activities',
      'student-monitoring': 'Student Monitoring enabled - tracking learning progress',
      'system-optimization': 'System Optimization initiated - analyzing performance metrics'
    };
    
    const message = featureMessages[feature] || 'Feature activated';
    
    // Show temporary notification (you could replace this with a proper toast system)
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
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

        {/* Ecosystem Status Grid */}
        {ecosystemStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Agent Status */}
            <div 
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm hover:border-cyan-400/50 transition-all cursor-pointer group"
              onClick={() => handleAgentClick('agent-status')}
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
                  <span className="text-white font-mono">{ecosystemStatus.agent_status.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active:</span>
                  <span className="text-green-400 font-mono flex items-center">
                    {ecosystemStatus.agent_status.active}
                    <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Processing:</span>
                  <span className="text-yellow-400 font-mono flex items-center">
                    {ecosystemStatus.agent_status.processing}
                    <div className="w-2 h-2 bg-yellow-400 rounded-full ml-2 animate-pulse"></div>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Idle:</span>
                  <span className="text-blue-400 font-mono">{ecosystemStatus.agent_status.idle}</span>
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
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm hover:border-blue-400/50 transition-all cursor-pointer group">
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
                  <span className="text-white font-mono">{ecosystemStatus.communication_activity.recent_messages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Response:</span>
                  <span className="text-green-400 font-mono">{ecosystemStatus.communication_activity.avg_response_time}</span>
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
              onClick={handleKnowledgeBaseClick}
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
                  <span className="text-white font-mono">{ecosystemStatus.knowledge_base.total_entries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Categories:</span>
                  <span className="text-purple-400 font-mono">{ecosystemStatus.knowledge_base.categories}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center">
                  <Database className="h-3 w-3 mr-1" />
                  Explore Knowledge
                </button>
              </div>
              {showKnowledgeDetails && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded border border-purple-400/30">
                  <p className="text-xs text-gray-300 mb-2">Recent Knowledge Updates:</p>
                  <div className="space-y-1">
                    <div className="text-xs text-purple-300">• Neurodiverse learning patterns updated</div>
                    <div className="text-xs text-purple-300">• Agent communication protocols refined</div>
                    <div className="text-xs text-purple-300">• Sensory optimization data added</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-cyan-400/50 transition-all cursor-pointer group transform hover:scale-105"
            onClick={() => handleFeatureClick('stealth-agents')}
          >
            <Shield className="h-12 w-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-cyan-400">Stealth Agent System</h3>
            <p className="text-gray-400">
              Self-evolving AI agents that adapt to individual learning patterns and provide personalized support.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <button className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center">
                <Play className="h-4 w-4 mr-1" />
                Manage Agents
              </button>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>

          <div 
            className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-blue-400/50 transition-all cursor-pointer group transform hover:scale-105"
            onClick={() => handleFeatureClick('student-monitoring')}
          >
            <Brain className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Student Monitoring</h3>
            <p className="text-gray-400">
              Real-time monitoring of student progress, engagement, and learning patterns.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                View Students
              </button>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>

          <div 
            className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-purple-400/50 transition-all cursor-pointer group transform hover:scale-105"
            onClick={() => handleFeatureClick('system-optimization')}
          >
            <Zap className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-purple-400">System Optimization</h3>
            <p className="text-gray-400">
              Advanced system controls for optimizing performance and customizing learning environments.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center">
                <Settings className="h-4 w-4 mr-1" />
                Optimize
              </button>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
            </div>
          </div>
        </div>

        {/* System Health */}
        {ecosystemStatus?.agentricai_metrics && (
          <div className="mt-12 bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-orange-400/30 transition-colors">
            <h3 className="text-xl font-semibold mb-4 text-orange-400">System Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1 hover:scale-110 transition-transform cursor-pointer">
                  {ecosystemStatus.agentricai_metrics.panel_efficiency}
                </div>
                <div className="text-sm text-gray-400">Panel Efficiency</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{width: ecosystemStatus.agentricai_metrics.panel_efficiency}}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1 hover:scale-110 transition-transform cursor-pointer">
                  {ecosystemStatus.agentricai_metrics.neon_system_status}
                </div>
                <div className="text-sm text-gray-400">Neon System</div>
                <div className="flex justify-center mt-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1 hover:scale-110 transition-transform cursor-pointer">
                  {ecosystemStatus.agentricai_metrics.rivet_integrity}
                </div>
                <div className="text-sm text-gray-400">Rivet Integrity</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{width: ecosystemStatus.agentricai_metrics.rivet_integrity}}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Agent Details Modal */}
        {selectedAgent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-cyan-400/50 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-400">Agent Details</h3>
                <button 
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-800/50 rounded border border-cyan-400/20">
                  <p className="text-sm text-cyan-300 font-medium">Learning Coordinator Agent</p>
                  <p className="text-xs text-gray-400 mt-1">Status: Active • Memory: 2.4GB</p>
                  <p className="text-xs text-gray-300 mt-2">Specialized for autism learning patterns and adaptive content delivery.</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded border border-blue-400/20">
                  <p className="text-sm text-blue-300 font-medium">Behavior Analyst Agent</p>
                  <p className="text-xs text-gray-400 mt-1">Status: Processing • Memory: 1.8GB</p>
                  <p className="text-xs text-gray-300 mt-2">Analyzing sensory processing patterns and behavioral responses.</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded border border-purple-400/20">
                  <p className="text-sm text-purple-300 font-medium">Content Generator Agent</p>
                  <p className="text-xs text-gray-400 mt-1">Status: Idle • Memory: 0.9GB</p>
                  <p className="text-xs text-gray-300 mt-2">Ready to create autism-friendly educational content.</p>
                </div>
              </div>
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