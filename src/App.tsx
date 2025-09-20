import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import { realTimeAgentSystem } from './services/realTimeAgentSystem';
import { adminMonitoringSystem } from './services/adminMonitoringSystem';
import { localAuth } from './services/localAuthService';

function App() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentsActivated, setAgentsActivated] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const session = localAuth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          setUserRole(session.user.role);
          await initializeAgentricAISystem();
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const unsubscribe = localAuth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
        setAgentsActivated(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const initializeAgentricAISystem = async () => {
    if (!agentsActivated) {
      try {
        console.log('🚀 Initializing AgentricAI University System...');
        
        // Wait for agent system to be ready
        const handleAgentSystemReady = (event: CustomEvent) => {
          console.log('✅ Agent system ready with', event.detail.agentCount, 'agents');
          setAgentsActivated(true);
          window.removeEventListener('agentSystemReady', handleAgentSystemReady as EventListener);
        };
        
        window.addEventListener('agentSystemReady', handleAgentSystemReady as EventListener);
        
        // Initialize monitoring system for admin users
        if (userRole === 'admin') {
          console.log('🔍 Initializing admin monitoring system...');
        }
        
        // Set timeout fallback
        setTimeout(() => {
          setAgentsActivated(true);
          console.log('✅ AgentricAI system activated (fallback)');
        }, 3000);
        
      } catch (error) {
        console.error('Failed to initialize AgentricAI system:', error);
        // Still activate to prevent blocking
        setAgentsActivated(true);
      }
    }
  };

  const handleAuthSuccess = async (authUser: any, role: string) => {
    setUser(authUser);
    setUserRole(role);
    await initializeAgentricAISystem();
  };

  const handleSignOut = async () => {
    try {
      await localAuth.signOut();
      setUser(null);
      setUserRole(null);
      setAgentsActivated(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
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
}

export default App;