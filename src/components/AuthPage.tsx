import React, { useState } from 'react';
import { Brain, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { localAuth } from '../services/localAuthService';

interface AuthPageProps {
  onAuthSuccess: (user: any, role: string) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ipBypass, setIpBypass] = useState(false);

  // Check for IP bypass on component mount
  React.useEffect(() => {
    const checkIpBypass = async () => {
      try {
        // Check if running in development environment
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname.includes('webcontainer') ||
                             window.location.hostname.includes('local-credentialless') ||
                             window.location.port === '5173';
        
        if (isDevelopment) {
          setIpBypass(true);
          // Auto-login as admin
          const adminUser = {
            id: 'admin-user',
            email: 'agentricaiuiux@gmail.com',
            user_metadata: { name: 'AgentricAI Admin (Dev Bypass)' }
          };
          onAuthSuccess(adminUser, 'admin');
        }
      } catch (error) {
        console.log('Development check failed, continuing with normal auth');
      }
    };
    
    checkIpBypass();
  }, [onAuthSuccess]);

  // If IP bypass is active, show loading state
  if (ipBypass) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-cyan-400 mb-2">
            Admin Access Granted
          </h1>
          <p className="text-gray-400">IP-based bypass active...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check for admin credentials first
      if (email === 'agentricaiuiux@gmail.com' && password === 'agentricaiADMIN') {
        const { user, role } = await localAuth.signIn(email, password);
        onAuthSuccess(user, role);
        return;
      }

      if (isSignIn) {
        const { user, role } = await localAuth.signIn(email, password);
        onAuthSuccess(user, role);
      } else {
        const { user, role } = await localAuth.signUp(email, password, name);
        onAuthSuccess(user, role);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            AgentricAI University
          </h1>
          <p className="text-gray-400">
            {isSignIn ? 'Sign in to access your learning environment' : 'Create your AgentricAI account'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSignIn && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="Enter your full name"
                  required={!isSignIn}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-4 rounded-md hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  {isSignIn ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                isSignIn ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {isSignIn ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Student Demo */}
          <div className="mt-6 p-3 bg-gray-800/50 rounded border border-gray-700">
            <p className="text-xs text-gray-400 mb-2">Student Demo:</p>
            <div className="text-xs space-y-1">
              <div className="text-blue-300">Email: student@example.com</div>
              <div className="text-gray-400">Password: demo123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}