import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import { agentricaiEcosystem } from './services/agentEcosystem';
import { createClient } from '@supabase/supabase-js';
import { Brain, Shield, Zap, Users, Activity, Database, Settings, Eye, Play, ChevronRight } from 'lucide-react';

function App() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentsActivated, setAgentsActivated] = useState(false);
  const [ecosystemStatus, setEcosystemStatus] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showKnowledgeDetails, setShowKnowledgeDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setUser(session.user);
            setUserRole(profile.role);
            await activateAgentEcosystem();
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
        setAgentsActivated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const activateAgentEcosystem = async () => {
    if (!agentsActivated) {
      try {
        console.log('🚀 Activating AgentricAI Ecosystem...');
        
        // Initialize and activate all agents
        const status = await agentricaiEcosystem.getEcosystemStatus();
        console.log('✅ Agent Ecosystem Status:', status);
        setEcosystemStatus(status);
        
        // Ensure all agents are operational
        if (status.agent_status.total > 0) {
          setAgentsActivated(true);
          console.log('🎯 All agents are now operational and ready for task delegation');
        }
      } catch (error) {
        console.error('Failed to activate agent ecosystem:', error);
      }
    }
  };

  const handleAuthSuccess = async (authUser: any, role: string) => {
    setUser(authUser);
    setUserRole(role);
    await activateAgentEcosystem();
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      setAgentsActivated(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleAgentClick = (agentId: string) => {
    setSelectedAgent(agentId);
    console.log(`Viewing details for agent: ${agentId}`);
  };

  const handleKnowledgeBaseClick = () => {
    setShowKnowledgeDetails(!showKnowledgeDetails);
  };

  const handleFeatureClick = (feature: string) => {
    console.log(`Activating feature: ${feature}`);
    // Add feature-specific functionality here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-cyan-400 mb-2">Initializing AgentricAI University</h2>
          <p className="text-gray-400">Loading your personalized learning environment...</p>
        </div>
      </div>
    );
  }

  // Show authentication page if not signed in
  if (!user || !userRole) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Route to appropriate dashboard based on role
  if (userRole === 'admin') {
    return <AdminDashboard user={user} onSignOut={handleSignOut} agentsActivated={agentsActivated} />;
  } else {
    return <StudentDashboard user={user} onSignOut={handleSignOut} />;
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
                AgentricAI University
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
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Ecosystem Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Revolutionary AI-Powered Education
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Empowering neurodiverse learners through adaptive AI agents and personalized educational experiences
          </p>
        </div>

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
                Activate
              </button>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>

          <div 
            className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-blue-400/50 transition-all cursor-pointer group transform hover:scale-105"
            onClick={() => handleFeatureClick('neurodiverse-optimization')}
          >
            <Brain className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Neurodiverse Optimization</h3>
            <p className="text-gray-400">
              Specially designed for neurodiverse learners with sensory-friendly interfaces and adaptive content.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </button>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>

          <div 
            className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-purple-400/50 transition-all cursor-pointer group transform hover:scale-105"
            onClick={() => handleFeatureClick('real-time-adaptation')}
          >
            <Zap className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-purple-400">Real-time Adaptation</h3>
            <p className="text-gray-400">
              Dynamic content adjustment based on learning progress, engagement levels, and individual preferences.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                Monitor
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
              Built with ❤️ for neurodiverse learners by{' '}
              <span className="text-cyan-400 font-semibold">AgentricAI</span>
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

export default App;