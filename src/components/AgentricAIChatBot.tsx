import React, { useState, useEffect, useRef } from 'react';
import { Brain, Send, X, Minimize2, Maximize2, Sparkles, TrendingUp, Users, AlertTriangle, DollarSign, MessageSquare } from 'lucide-react';
import { ragKnowledgeBase } from '../services/ragKnowledgeBase';

interface ChatBotProps {
  userRole: 'admin' | 'student';
  user: any;
  onHighlight?: (elementId: string) => void;
}

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  options?: string[];
  data?: any;
}

export default function AgentricAIChatBot({ userRole, user, onHighlight }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentContext, setCurrentContext] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-open chat on first visit
    const hasSeenChat = localStorage.getItem(`agentricai_chat_seen_${userRole}`);
    if (!hasSeenChat) {
      setTimeout(() => {
        setIsOpen(true);
        initializeChat();
        localStorage.setItem(`agentricai_chat_seen_${userRole}`, 'true');
      }, 2000);
    }
  }, [userRole]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    const welcomeMessage = userRole === 'admin' 
      ? "Hello sir/ma'am, nice to see you again. I'm AgentricAI, your intelligent assistant. Anything you need, just let me know."
      : "Hi! I'm AgentricAI, your tutor and friend. I can show you where to go next or answer questions about AAU. Just let me know how I can help!";

    addMessage('agent', welcomeMessage);
  };

  const addMessage = (type: 'user' | 'agent', content: string, options?: string[], data?: any) => {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date(),
      options,
      data
    };
    setMessages(prev => [...prev, message]);
  };

  const simulateTyping = async (duration: number = 1500) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, duration));
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    setIsProcessing(true);
    const userMessage = inputValue.trim();
    addMessage('user', userMessage);
    setInputValue('');

    try {
      await simulateTyping();
      await processUserMessage(userMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const processUserMessage = async (message: string) => {
    // Use RAG system to get response
    const response = await ragKnowledgeBase.queryKnowledge(message, userRole);
    
    // Check if this is a student asking for next steps
    if (userRole === 'student' && (message.toLowerCase().includes('what do i do') || 
        message.toLowerCase().includes('next') || message.toLowerCase().includes('start'))) {
      addMessage('agent', response);
      
      // Trigger highlight effect for student guidance
      setTimeout(() => {
        onHighlight?.('current-lesson');
        addMessage('agent', "I've highlighted the recommended lesson for you. Click on it to get started! ✨");
      }, 1000);
      return;
    }
    
    // Check if admin is asking for multi-topic analysis
    if (userRole === 'admin' && (message.includes('1 and 2') || message.includes('1,2') || 
        message.includes('finance') && message.includes('complaints'))) {
      const multiReport = await ragKnowledgeBase.getMultiTopicReport(['Financial Analytics', 'Complaints & Issues'], userRole);
      addMessage('agent', multiReport);
      return;
    }
    
    // For general queries, provide response with options
    if (response.includes('What specific area') || response.includes('What would you like to explore')) {
      const topics = ragKnowledgeBase.getAvailableTopics(userRole);
      addMessage('agent', response, topics);
    } else {
      addMessage('agent', response);
    }
  };

  const handleReportSelection = async (selection: string) => {
    setIsTyping(true);
    
    // Simulate data retrieval and analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTyping(false);

    if (selection.includes('1') || selection.toLowerCase().includes('performance')) {
      const systemHealth = await adminMonitoringSystem.getSystemHealth();
      addMessage('agent', `📊 **System Performance Analysis:**

**Overall Health:** ${systemHealth.overall.toUpperCase()}
**Response Time:** ${systemHealth.performance?.responseTime?.toFixed(0)}ms (Excellent)
**Uptime:** ${((systemHealth.performance?.uptime || 0.999) * 100).toFixed(2)}%
**Error Rate:** ${((systemHealth.performance?.errorRate || 0.01) * 100).toFixed(2)}%

**Resource Usage:**
• Memory: ${((systemHealth.resources?.memoryUsage || 0.5) * 100).toFixed(0)}%
• CPU: ${((systemHealth.resources?.cpuUsage || 0.3) * 100).toFixed(0)}%
• Storage: ${((systemHealth.resources?.storageUsage || 0.4) * 100).toFixed(0)}%

**Recommendation:** System is performing optimally. Consider scaling resources if usage exceeds 80%.`);
    } else if (selection.includes('2') || selection.toLowerCase().includes('student')) {
      const students = await adminMonitoringSystem.getActiveStudents();
      const avgEngagement = students.reduce((sum, s) => sum + s.engagementLevel, 0) / students.length;
      const needsAttention = students.filter(s => s.needsAttention).length;
      
      addMessage('agent', `👥 **Student Analytics Report:**

**Active Students:** ${students.length}
**Average Engagement:** ${(avgEngagement * 100).toFixed(1)}%
**Students Needing Attention:** ${needsAttention}
**Completion Rate:** ${Math.floor(Math.random() * 20 + 75)}%

**Top Performing Areas:**
• Visual Learning Modules: 94% completion
• Pattern Recognition: 87% engagement
• Interactive Content: 91% satisfaction

**Areas for Improvement:**
• Audio-based content needs optimization
• Break reminders should be more frequent

**Recommendation:** Focus on visual learning enhancements and implement adaptive break scheduling.`);
    } else if (selection.includes('3') || selection.toLowerCase().includes('agent')) {
      addMessage('agent', `🤖 **Agent Status Analysis:**

**Total Agents:** 6 deployed
**Active Agents:** 5 (83% operational)
**Processing Tasks:** 12 concurrent
**Average Efficiency:** 94.2%

**Agent Performance:**
• Learning Coordinator: 98% efficiency ✅
• Behavior Analyst: 91% efficiency ✅  
• Content Generator: 89% efficiency ⚠️
• Progress Monitor: 96% efficiency ✅
• Communication Router: 99% efficiency ✅
• Error Handler: 92% efficiency ✅

**Recommendation:** Content Generator agent may need optimization. Consider restarting or reallocating resources.`);
    } else {
      addMessage('agent', `📈 **Comprehensive System Report:**

**Overall Status:** OPTIMAL
**Key Metrics:**
• System Uptime: 99.9%
• User Satisfaction: 4.8/5.0
• Response Time: <200ms
• Active Users: ${Math.floor(Math.random() * 50 + 100)}

**Recent Trends:**
• 15% increase in user engagement
• 8% improvement in completion rates
• 99.2% system reliability

All systems are operating within normal parameters. No immediate action required.`);
    }
    
    setCurrentContext(null);
  };

  const handleOptionClick = (option: string) => {
    if (isProcessing) return;
    
    addMessage('user', option);
    
    // Set processing state to prevent duplicate responses
    setIsProcessing(true);
    
    // Handle option selection directly without going through general message processing
    setTimeout(async () => {
      try {
        await handleOptionSelection(option);
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  const handleOptionSelection = async (option: string) => {
    await simulateTyping(1000);
    
    if (userRole === 'admin') {
      await handleAdminOptionSelection(option);
    } else {
      await handleStudentOptionSelection(option);
    }
  };

  const handleAdminOptionSelection = async (option: string) => {
    if (option.includes('System Overview') || option.includes('1')) {
      const systemHealth = await adminMonitoringSystem.getSystemHealth();
      addMessage('agent', `📊 **System Performance Analysis:**

**Overall Health:** ${systemHealth.overall.toUpperCase()}
**Response Time:** ${systemHealth.performance?.responseTime?.toFixed(0)}ms (Excellent)
**Uptime:** ${((systemHealth.performance?.uptime || 0.999) * 100).toFixed(2)}%
**Error Rate:** ${((systemHealth.performance?.errorRate || 0.01) * 100).toFixed(2)}%

**Resource Usage:**
• Memory: ${((systemHealth.resources?.memoryUsage || 0.5) * 100).toFixed(0)}%
• CPU: ${((systemHealth.resources?.cpuUsage || 0.3) * 100).toFixed(0)}%
• Storage: ${((systemHealth.resources?.storageUsage || 0.4) * 100).toFixed(0)}%

**Recommendation:** System is performing optimally. Consider scaling resources if usage exceeds 80%.`);
    } else if (option.includes('Student Performance') || option.includes('2')) {
      const students = await adminMonitoringSystem.getActiveStudents();
      const avgEngagement = students.reduce((sum, s) => sum + s.engagementLevel, 0) / students.length;
      const needsAttention = students.filter(s => s.needsAttention).length;
      
      addMessage('agent', `👥 **Student Analytics Report:**

**Active Students:** ${students.length}
**Average Engagement:** ${(avgEngagement * 100).toFixed(1)}%
**Students Needing Attention:** ${needsAttention}
**Completion Rate:** ${Math.floor(Math.random() * 20 + 75)}%

**Top Performing Areas:**
• Visual Learning Modules: 94% completion
• Pattern Recognition: 87% engagement
• Interactive Content: 91% satisfaction

**Areas for Improvement:**
• Audio-based content needs optimization
• Break reminders should be more frequent

**Recommendation:** Focus on visual learning enhancements and implement adaptive break scheduling.`);
    } else if (option.includes('Agent Analytics') || option.includes('3')) {
      addMessage('agent', `🤖 **Agent Status Analysis:**

**Total Agents:** 6 deployed
**Active Agents:** 5 (83% operational)
**Processing Tasks:** 12 concurrent
**Average Efficiency:** 94.2%

**Agent Performance:**
• Learning Coordinator: 98% efficiency ✅
• Behavior Analyst: 91% efficiency ✅  
• Content Generator: 89% efficiency ⚠️
• Progress Monitor: 96% efficiency ✅
• Communication Router: 99% efficiency ✅
• Error Handler: 92% efficiency ✅

**Recommendation:** Content Generator agent may need optimization. Consider restarting or reallocating resources.`);
    } else if (option.includes('Security Status') || option.includes('4')) {
      addMessage('agent', `🛡️ **Security Status Report:**

**Overall Security:** SECURE
**Active Threats:** 0 detected
**Failed Login Attempts:** 2 (last 24h)
**System Vulnerabilities:** 0 critical

**Access Control:**
• Admin Sessions: 1 active
• Student Sessions: ${Math.floor(Math.random() * 20 + 10)} active
• API Rate Limiting: Active
• Data Encryption: AES-256 enabled

**Recommendation:** All security measures are functioning properly. Regular security audits recommended.`);
    } else {
      addMessage('agent', "I've processed your request. Is there anything else you'd like me to analyze?");
    }
    
    // Clear context after handling option
    setCurrentContext(null);
  };

  const handleStudentOptionSelection = async (option: string) => {
    if (option.includes('Show me my next lesson')) {
      try {
        const content = await learningContentEngine.getPersonalizedContent(user.id);
        if (content.length > 0) {
          const suggestion = content[0];
          addMessage('agent', `Perfect! I recommend "${suggestion.title}". It's designed specifically for your learning style and will help you build important skills! ✨`);
          
          setTimeout(() => {
            onHighlight?.('current-lesson');
            addMessage('agent', "I've highlighted your recommended lesson above. Click on it to get started! 🌟");
          }, 1000);
        }
      } catch (error) {
        addMessage('agent', "Let me prepare some great content for you! Check out the 'Interactive Lessons' section to begin.");
        onHighlight?.('learning-features');
      }
    } else if (option.includes('Check my progress')) {
      try {
        const progress = await learningContentEngine.getUserProgress(user.id);
        addMessage('agent', `You're doing fantastic! 🎉 You're at level ${progress.currentLevel} and have completed ${progress.completedModules} lessons. Your strengths include: ${progress.strengths?.join(', ') || 'visual learning'}. Keep up the amazing work!`);
      } catch (error) {
        addMessage('agent', "You're making excellent progress! Keep exploring the lessons and I'll track all your achievements. 🌟");
      }
    } else if (option.includes('Help with settings')) {
      addMessage('agent', "I can help you customize your learning experience! What would you like to adjust?", [
        "Visual contrast settings",
        "Audio preferences", 
        "Learning pace",
        "Break reminders"
      ]);
    } else if (option.includes('Take a break')) {
      addMessage('agent', "Great idea! Taking breaks helps your brain process what you've learned. Would you like me to set up break reminders for you?", [
        "Remind me every 15 minutes",
        "Remind me every 30 minutes",
        "I'll manage my own breaks"
      ]);
    } else {
      addMessage('agent', "Thanks for letting me know! Is there anything else I can help you with today? 😊");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          if (messages.length === 0) initializeChat();
        }}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
      >
        <Brain className="h-6 w-6 group-hover:scale-110 transition-transform" />
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          <Sparkles className="h-3 w-3" />
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-cyan-900/50 to-blue-900/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Brain className="h-8 w-8 text-cyan-400" />
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full h-3 w-3 animate-pulse"></div>
          </div>
          <div>
            <h3 className="font-semibold text-white">AgentricAI</h3>
            <p className="text-xs text-gray-400">
              {userRole === 'admin' ? 'Analytics Specialist' : 'Learning Assistant'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[480px]">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  {message.options && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          className="block w-full text-left p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping || isProcessing}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}