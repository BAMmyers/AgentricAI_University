import React, { useState, useEffect } from 'react';
import { X, Play, Save, Upload, Download, Terminal, Database, Brain, Code, FileText, Zap } from 'lucide-react';
import { agentricaiKnowledgeDB } from '../services/knowledgeDatabase';
import { ragKnowledgeBase } from '../services/ragKnowledgeBase';

interface AgentTuningConsoleProps {
  onClose: () => void;
  agentsActivated: boolean;
}

export default function AgentTuningConsole({ onClose, agentsActivated }: AgentTuningConsoleProps) {
  const [activeTab, setActiveTab] = useState('knowledge');
  const [jsonInput, setJsonInput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [knowledgeStats, setKnowledgeStats] = useState<any>(null);

  useEffect(() => {
    initializeConsole();
    loadKnowledgeStats();
  }, []);

  const initializeConsole = () => {
    addToConsole('🚀 AgentricAI Agent Tuning Console v1.0');
    addToConsole('📊 System Status: ' + (agentsActivated ? 'OPERATIONAL' : 'INITIALIZING'));
    addToConsole('🧠 Knowledge Base: CONNECTED');
    addToConsole('⚡ Ready for agent tuning operations...');
    addToConsole('');
  };

  const loadKnowledgeStats = async () => {
    try {
      const stats = await agentricaiKnowledgeDB.getKnowledgeStats();
      setKnowledgeStats(stats);
      addToConsole(`📈 Knowledge Base Stats: ${stats.total_entries} entries, ${stats.categories} categories`);
    } catch (error) {
      addToConsole('⚠️ Failed to load knowledge stats');
    }
  };

  const addToConsole = (message: string) => {
    setConsoleOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const clearConsole = () => {
    setConsoleOutput([]);
    initializeConsole();
  };

  const executeCommand = async () => {
    if (!jsonInput.trim()) {
      addToConsole('❌ Error: No input provided');
      return;
    }

    setIsProcessing(true);
    addToConsole(`🔄 Processing ${activeTab} update for ${selectedAgent}...`);

    try {
      const data = JSON.parse(jsonInput);
      
      switch (activeTab) {
        case 'knowledge':
          await updateKnowledgeBase(data);
          break;
        case 'chatbot':
          await updateChatbotKnowledge(data);
          break;
        case 'agents':
          await updateAgentConfig(data);
          break;
        case 'datasets':
          await processDataset(data);
          break;
      }
      
      addToConsole('✅ Update completed successfully');
      await loadKnowledgeStats();
      
    } catch (error: any) {
      addToConsole(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateKnowledgeBase = async (data: any) => {
    let entriesAdded = 0;
    
    for (const [category, entries] of Object.entries(data)) {
      if (typeof entries === 'object' && entries !== null) {
        for (const [key, value] of Object.entries(entries)) {
          await agentricaiKnowledgeDB.storeKnowledge(
            category,
            key,
            value,
            selectedAgent === 'all' ? 'admin-tuning' : selectedAgent,
            0.95
          );
          entriesAdded++;
        }
      }
    }
    
    addToConsole(`📝 Added ${entriesAdded} knowledge entries`);
  };

  const updateChatbotKnowledge = async (data: any) => {
    // Update RAG knowledge base for chatbot
    for (const [category, entries] of Object.entries(data)) {
      addToConsole(`🤖 Updating chatbot knowledge: ${category}`);
      // This would integrate with the RAG system
    }
    addToConsole('🤖 Chatbot knowledge updated');
  };

  const updateAgentConfig = async (data: any) => {
    addToConsole(`⚙️ Updating agent configuration for: ${selectedAgent}`);
    
    if (data.capabilities) {
      addToConsole(`🔧 New capabilities: ${data.capabilities.join(', ')}`);
    }
    
    if (data.memory_settings) {
      addToConsole(`🧠 Memory settings updated`);
    }
    
    if (data.behavior_patterns) {
      addToConsole(`🎯 Behavior patterns updated`);
    }
  };

  const processDataset = async (data: any) => {
    if (Array.isArray(data)) {
      addToConsole(`📊 Processing dataset with ${data.length} entries`);
      
      for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        if (entry.category && entry.key && entry.value) {
          await agentricaiKnowledgeDB.storeKnowledge(
            entry.category,
            entry.key,
            entry.value,
            'dataset-import',
            entry.confidence || 0.8
          );
        }
      }
      
      addToConsole(`✅ Processed ${data.length} dataset entries`);
    } else {
      addToConsole('❌ Dataset must be an array of objects');
    }
  };

  const loadSampleData = (type: string) => {
    const samples = {
      knowledge: {
        "learning_strategies": {
          "visual_learning": {
            "description": "Enhanced visual learning techniques for neurodiverse students",
            "methods": ["high_contrast_displays", "minimal_animations", "clear_icons"],
            "effectiveness": 0.94
          },
          "adaptive_pacing": {
            "description": "Self-paced learning with intelligent break suggestions",
            "triggers": ["attention_decline", "completion_time", "user_request"],
            "intervals": [15, 30, 45]
          }
        },
        "system_responses": {
          "encouragement": [
            "You're doing amazing! Keep up the great work! 🌟",
            "Fantastic progress! Your brain is learning so well! 🧠✨",
            "Excellent job! You should be proud of yourself! 🎉"
          ],
          "support": [
            "That's okay! Learning takes practice. Let's try together! 🤝",
            "No worries! Every expert was once a beginner! 🌱"
          ]
        }
      },
      chatbot: {
        "student_guidance": {
          "next_lesson": {
            "answer": "I recommend starting with 'Welcome to Your Learning Journey' - it's perfect for getting familiar with AgentricAI!",
            "keywords": ["next", "start", "begin", "what do", "where"]
          },
          "progress_check": {
            "answer": "You're doing fantastic! Your visual learning skills are really strong and you're making excellent progress!",
            "keywords": ["progress", "how am i", "doing", "performance"]
          }
        }
      },
      agents: {
        "learning_coordinator": {
          "capabilities": ["lesson_planning", "progress_tracking", "adaptive_content", "engagement_monitoring"],
          "memory_settings": {
            "retention_period": "30_days",
            "priority_threshold": 0.7,
            "max_entries": 1000
          },
          "behavior_patterns": {
            "response_style": "encouraging",
            "adaptation_speed": "moderate",
            "intervention_threshold": 0.6
          }
        }
      },
      datasets: [
        {
          "category": "learning_outcomes",
          "key": "pattern_recognition_success",
          "value": {
            "completion_rate": 0.87,
            "engagement_level": 0.92,
            "retention_score": 0.84
          },
          "confidence": 0.9
        },
        {
          "category": "user_preferences",
          "key": "visual_contrast_high",
          "value": {
            "user_satisfaction": 0.95,
            "usage_frequency": 0.78,
            "effectiveness": 0.91
          },
          "confidence": 0.85
        }
      ]
    };

    setJsonInput(JSON.stringify(samples[type], null, 2));
    addToConsole(`📋 Loaded ${type} sample data`);
  };

  const exportKnowledge = async () => {
    try {
      const stats = await agentricaiKnowledgeDB.getKnowledgeStats();
      const exportData = {
        timestamp: new Date().toISOString(),
        stats: stats,
        export_type: 'knowledge_base_backup'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agentricai_knowledge_${Date.now()}.json`;
      a.click();
      
      addToConsole('📥 Knowledge base exported successfully');
    } catch (error) {
      addToConsole('❌ Export failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
          <div className="flex items-center space-x-3">
            <Terminal className="h-8 w-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Agent Tuning Console</h2>
              <p className="text-sm text-gray-400">Advanced AI Agent & Knowledge Base Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Tabs and Controls */}
          <div className="w-80 border-r border-gray-700 bg-gray-800/50 p-4 flex flex-col">
            {/* Tabs */}
            <div className="space-y-2 mb-6">
              {[
                { id: 'knowledge', label: 'Knowledge Base', icon: Database },
                { id: 'chatbot', label: 'ChatBot RAG', icon: Brain },
                { id: 'agents', label: 'Agent Config', icon: Zap },
                { id: 'datasets', label: 'Datasets', icon: FileText }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300' 
                      : 'bg-gray-700/30 hover:bg-gray-700/50 text-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Agent Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Agent</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Agents</option>
                <option value="learning-coordinator">Learning Coordinator</option>
                <option value="behavior-analyst">Behavior Analyst</option>
                <option value="content-generator">Content Generator</option>
                <option value="chatbot">ChatBot System</option>
              </select>
            </div>

            {/* Sample Data Buttons */}
            <div className="space-y-2 mb-6">
              <p className="text-sm font-medium text-gray-300">Load Sample Data:</p>
              <button
                onClick={() => loadSampleData(activeTab)}
                className="w-full bg-blue-600/20 border border-blue-500/30 px-3 py-2 rounded text-blue-300 hover:bg-blue-600/30 transition-colors text-sm"
              >
                Load {activeTab} Sample
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-2 mt-auto">
              <button
                onClick={executeCommand}
                disabled={isProcessing}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg text-white transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>{isProcessing ? 'Processing...' : 'Execute Update'}</span>
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={exportKnowledge}
                  className="flex-1 flex items-center justify-center space-x-1 bg-purple-600/20 border border-purple-500/30 px-3 py-2 rounded text-purple-300 hover:bg-purple-600/30 transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={clearConsole}
                  className="flex-1 bg-gray-600/20 border border-gray-500/30 px-3 py-2 rounded text-gray-300 hover:bg-gray-600/30 transition-colors text-sm"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Stats */}
            {knowledgeStats && (
              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-400 mb-2">Knowledge Base Stats:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entries:</span>
                    <span className="text-cyan-400">{knowledgeStats.total_entries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Categories:</span>
                    <span className="text-blue-400">{knowledgeStats.categories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memories:</span>
                    <span className="text-purple-400">{knowledgeStats.agent_memories}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Editor and Console */}
          <div className="flex-1 flex flex-col">
            {/* JSON Editor */}
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white capitalize">{activeTab} Configuration</h3>
                <div className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-400">JSON Editor</span>
                </div>
              </div>
              
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`Enter ${activeTab} configuration as JSON...`}
                className="w-full h-full bg-gray-800 border border-gray-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                style={{ minHeight: '300px' }}
              />
            </div>

            {/* Console Output */}
            <div className="h-64 border-t border-gray-700 bg-black/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-green-400">Console Output</h4>
                <Terminal className="h-4 w-4 text-green-400" />
              </div>
              
              <div className="h-48 overflow-y-auto bg-black/30 rounded border border-gray-700 p-3 font-mono text-xs">
                {consoleOutput.map((line, index) => (
                  <div key={index} className="text-green-300 mb-1 whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
                {isProcessing && (
                  <div className="text-yellow-400 animate-pulse">
                    ⏳ Processing...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}