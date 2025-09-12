import React, { useState, useEffect } from 'react';
import { Brain, BookOpen, Target, Award, Play, Pause, Settings, LogOut, User } from 'lucide-react';
import { agentricaiKnowledgeDB } from '../services/knowledgeDatabase';

interface StudentDashboardProps {
  user: any;
  onSignOut: () => void;
}

export default function StudentDashboard({ user, onSignOut }: StudentDashboardProps) {
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [learningPatterns, setLearningPatterns] = useState<any[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [adaptiveContent, setAdaptiveContent] = useState<any>(null);

  useEffect(() => {
    initializeStudentSession();
  }, [user]);

  const initializeStudentSession = async () => {
    try {
      // Get student's learning patterns
      const patterns = await agentricaiKnowledgeDB.retrieveLearningPatterns(user.id);
      setLearningPatterns(patterns);

      // Initialize adaptive content based on student's needs
      const content = await generateAdaptiveContent(patterns);
      setAdaptiveContent(content);

      // Set current lesson
      setCurrentLesson({
        id: 'intro-to-learning',
        title: 'Welcome to Your Learning Journey',
        description: 'Let\'s start with understanding how you learn best',
        difficulty: 'beginner',
        estimatedTime: '15 minutes'
      });

    } catch (error) {
      console.error('Failed to initialize student session:', error);
    }
  };

  const generateAdaptiveContent = async (patterns: any[]) => {
    // Generate content based on learning patterns
    return {
      visualSupports: true,
      audioEnabled: false,
      interactionStyle: 'gentle',
      pacing: 'self-directed',
      sensoryConsiderations: {
        lowContrast: false,
        minimalAnimation: true,
        clearInstructions: true
      }
    };
  };

  const startLearning = async () => {
    setIsLearning(true);
    
    // Simulate progress increment
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 1000);
    
    // Store learning session start
    await agentricaiKnowledgeDB.storeLearningPattern(
      user.id,
      'session_start',
      {
        lesson_id: currentLesson?.id,
        timestamp: new Date().toISOString(),
        adaptive_settings: adaptiveContent
      }
    );
  };

  const pauseLearning = async () => {
    setIsLearning(false);
    
    // Store learning session pause
    await agentricaiKnowledgeDB.storeLearningPattern(
      user.id,
      'session_pause',
      {
        lesson_id: currentLesson?.id,
        progress: progress,
        timestamp: new Date().toISOString()
      }
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-cyan-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                My Learning Space
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-300">{user.email?.split('@')[0]}</span>
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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome Back, {user.email?.split('@')[0]}!
          </h2>
          <p className="text-xl text-gray-400">
            Your personalized learning environment is ready
          </p>
        </div>

        {/* Current Lesson */}
        {currentLesson && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-cyan-400">{currentLesson.title}</h3>
              <div className="flex items-center space-x-2">
                {!isLearning ? (
                  <button
                    onClick={startLearning}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition-colors"
                  >
                    <Play className="h-5 w-5" />
                    <span>Start Learning</span>
                  </button>
                ) : (
                  <button
                    onClick={pauseLearning}
                    className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-md transition-colors"
                  >
                    <Pause className="h-5 w-5" />
                    <span>Pause</span>
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">{currentLesson.description}</p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Difficulty: {currentLesson.difficulty}</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Time: {currentLesson.estimatedTime}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Learning Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-cyan-400/50 transition-all">
            <BookOpen className="h-12 w-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-cyan-400">Interactive Lessons</h3>
            <p className="text-gray-400 mb-4">
              Engaging, adaptive lessons designed specifically for your learning style.
            </p>
            <button className="text-cyan-400 hover:text-cyan-300 text-sm">
              Browse Lessons →
            </button>
          </div>

          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-blue-400/50 transition-all">
            <Target className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Personal Goals</h3>
            <p className="text-gray-400 mb-4">
              Set and track your learning goals with AI-powered guidance.
            </p>
            <button className="text-blue-400 hover:text-blue-300 text-sm">
              Set Goals →
            </button>
          </div>

          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-purple-400/50 transition-all">
            <Award className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-purple-400">Achievements</h3>
            <p className="text-gray-400 mb-4">
              Celebrate your progress with personalized achievements and rewards.
            </p>
            <button className="text-purple-400 hover:text-purple-300 text-sm">
              View Achievements →
            </button>
          </div>
        </div>

        {/* Adaptive Settings */}
        {adaptiveContent && (
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-orange-400">Your Learning Preferences</h3>
              <Settings className="h-6 w-6 text-orange-400" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Visual Supports:</span>
                  <span className={adaptiveContent.visualSupports ? "text-green-400" : "text-gray-500"}>
                    {adaptiveContent.visualSupports ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Audio:</span>
                  <span className={adaptiveContent.audioEnabled ? "text-green-400" : "text-gray-500"}>
                    {adaptiveContent.audioEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Interaction Style:</span>
                  <span className="text-blue-400 capitalize">{adaptiveContent.interactionStyle}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Learning Pace:</span>
                  <span className="text-purple-400 capitalize">{adaptiveContent.pacing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Minimal Animation:</span>
                  <span className={adaptiveContent.sensoryConsiderations?.minimalAnimation ? "text-green-400" : "text-gray-500"}>
                    {adaptiveContent.sensoryConsiderations?.minimalAnimation ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Clear Instructions:</span>
                  <span className={adaptiveContent.sensoryConsiderations?.clearInstructions ? "text-green-400" : "text-gray-500"}>
                    {adaptiveContent.sensoryConsiderations?.clearInstructions ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}