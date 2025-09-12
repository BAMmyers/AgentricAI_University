import React, { useState, useEffect } from 'react';
import { Brain, Users, Shield, Zap, Activity, Database } from 'lucide-react';
import { agentricaiEcosystem } from './services/agentEcosystem';

function App() {
  const [ecosystemStatus, setEcosystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-cyan-400 mb-2">Initializing AgentricAI Ecosystem</h2>
          <p className="text-gray-400">Deploying stealth agents...</p>
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
                AgentricAI University
              </h1>
            </div>
            <div className="flex items-center space-x-4">
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
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-400">Agent Status</h3>
                <Users className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Agents:</span>
                  <span className="text-white font-mono">{ecosystemStatus.agent_status.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active:</span>
                  <span className="text-green-400 font-mono">{ecosystemStatus.agent_status.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Processing:</span>
                  <span className="text-yellow-400 font-mono">{ecosystemStatus.agent_status.processing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Idle:</span>
                  <span className="text-blue-400 font-mono">{ecosystemStatus.agent_status.idle}</span>
                </div>
              </div>
            </div>

            {/* Communication Activity */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-400">Communication</h3>
                <Activity className="h-6 w-6 text-blue-400" />
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
            </div>

            {/* Knowledge Base */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-400">Knowledge Base</h3>
                <Database className="h-6 w-6 text-purple-400" />
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
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-cyan-400/50 transition-colors">
            <Shield className="h-12 w-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-cyan-400">Stealth Agent System</h3>
            <p className="text-gray-400">
              Self-evolving AI agents that adapt to individual learning patterns and provide personalized support.
            </p>
          </div>

          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-blue-400/50 transition-colors">
            <Brain className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Neurodiverse Optimization</h3>
            <p className="text-gray-400">
              Specially designed for neurodiverse learners with sensory-friendly interfaces and adaptive content.
            </p>
          </div>

          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-purple-400/50 transition-colors">
            <Zap className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-purple-400">Real-time Adaptation</h3>
            <p className="text-gray-400">
              Dynamic content adjustment based on learning progress, engagement levels, and individual preferences.
            </p>
          </div>
        </div>

        {/* System Health */}
        {ecosystemStatus?.agentricai_metrics && (
          <div className="mt-12 bg-gray-900/30 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-400">System Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {ecosystemStatus.agentricai_metrics.panel_efficiency}
                </div>
                <div className="text-sm text-gray-400">Panel Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">
                  {ecosystemStatus.agentricai_metrics.neon_system_status}
                </div>
                <div className="text-sm text-gray-400">Neon System</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {ecosystemStatus.agentricai_metrics.rivet_integrity}
                </div>
                <div className="text-sm text-gray-400">Rivet Integrity</div>
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