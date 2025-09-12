import React, { useState, useEffect } from 'react';
import { Brain, BookOpen, Target, Award, Play, Pause, Settings, LogOut, User } from 'lucide-react';
import { learningContentEngine } from '../services/learningContentEngine';
import { realTimeAgentSystem } from '../services/realTimeAgentSystem';
import AgentricAIChatBot from './AgentricAIChatBot';

interface StudentDashboardProps {
  user: any;
  onSignOut: () => void;
}

export default function StudentDashboard({ user, onSignOut }: StudentDashboardProps) {
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [isLearning, setIsLearning] = useState(false);
  const [learningSession, setLearningSession] = useState<any>(null);
  const [personalizedContent, setPersonalizedContent] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

  useEffect(() => {
    initializeStudentSession();
  }, [user]);

  const initializeStudentSession = async () => {
    try {
      console.log('🎓 Initializing student learning session...');
      
      // Get personalized content
      const content = await learningContentEngine.getPersonalizedContent(user.id);
      setPersonalizedContent(content);
      
      // Set current lesson to first recommended module
      if (content.length > 0) {
        setCurrentLesson(content[0]);
      }
      
      // Get user progress
      const progress = await learningContentEngine.getUserProgress(user.id);
      setUserProgress(progress);
      setProgress(progress.progressPercentage);
      
      console.log('✅ Student session initialized');

    } catch (error) {
      console.error('Failed to initialize student session:', error);
    }
  };

  const startLearning = async () => {
    if (!currentLesson) return;
    
    setIsLearning(true);
    
    try {
      // Start real learning session
      const session = await learningContentEngine.startLearningSession(user.id, currentLesson.id);
      setLearningSession(session);
      
      // Delegate monitoring task to agents
      await realTimeAgentSystem.delegateTask('monitor-student-engagement', {
        sessionId: session.id,
        userId: user.id,
        moduleId: currentLesson.id
      }, 'high');
      
      // Simulate realistic progress increment
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(100, prev + Math.random() * 3 + 1);
          
          // Update session progress
          if (learningSession) {
            learningSession.progress = newProgress;
          }
          
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            setIsLearning(false);
            handleLessonComplete();
          }
          
          return newProgress;
        });
      }, 2000); // Update every 2 seconds
      
    } catch (error) {
      console.error('Failed to start learning session:', error);
      setIsLearning(false);
    }
  };
  
  const handleLessonComplete = async () => {
    try {
      // Process lesson completion
      await learningContentEngine.processActivityResponse(
        learningSession.id,
        'lesson-complete',
        {
          completed: true,
          timeSpent: Date.now() - new Date(learningSession.startTime).getTime(),
          engagement: 0.9
        }
      );
      
      // Update user progress
      const updatedProgress = await learningContentEngine.getUserProgress(user.id);
      setUserProgress(updatedProgress);
      
      console.log('🎉 Lesson completed successfully!');
      
    } catch (error) {
      console.error('Failed to process lesson completion:', error);
    }
  };
    
  const pauseLearning = async () => {
    setIsLearning(false);
    
    if (learningSession) {
      try {
        // Process pause event
        await learningContentEngine.processActivityResponse(
          learningSession.id,
          'session-pause',
          {
            paused: true,
            currentProgress: progress,
            timestamp: new Date().toISOString()
          }
        );
        
      } catch (error) {
        console.error('Failed to process pause:', error);
      }
    }
  };

  const selectLesson = async (lesson: any) => {
    if (isLearning) {
      await pauseLearning();
    }
    
    setCurrentLesson(lesson);
    setProgress(0);
    setLearningSession(null);
  };

  const handleHighlight = (elementId: string) => {
    setHighlightedElement(elementId);
    setTimeout(() => setHighlightedElement(null), 5000); // Remove highlight after 5 seconds
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
          <div 
            id="current-lesson"
            className={`bg-gray-900/50 border rounded-lg p-6 mb-8 backdrop-blur-sm transition-all duration-1000 ${
              highlightedElement === 'current-lesson' 
                ? 'border-cyan-400 shadow-lg shadow-cyan-400/50 neon-cyan' 
                : 'border-gray-800 hover:border-cyan-400/30'
            }`}
          >
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
                <span>Difficulty: {currentLesson.difficulty || 'Adaptive'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Time: {currentLesson.estimatedTime || 15} minutes</span>
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

        {/* Available Lessons */}
        {personalizedContent.length > 1 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-blue-400 mb-4">Your Personalized Learning Path</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalizedContent.slice(1).map((lesson, index) => (
                <div 
                  key={lesson.id}
                  className="bg-gray-900/30 border border-gray-800 rounded-lg p-4 hover:border-blue-400/50 transition-all cursor-pointer"
                  onClick={() => selectLesson(lesson)}
                >
                  <h4 className="text-lg font-medium text-blue-300 mb-2">{lesson.title}</h4>
                  <p className="text-gray-400 text-sm mb-3">{lesson.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Difficulty: {lesson.difficulty}</span>
                    <span>{lesson.estimatedTime} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Features */}
        <div 
          id="learning-features"
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 transition-all duration-1000 ${
            highlightedElement === 'learning-features' ? 'neon-blue' : ''
          }`}
        >
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-cyan-400/50 transition-all cursor-pointer">
            <BookOpen className="h-12 w-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-cyan-400">Interactive Lessons</h3>
            <p className="text-gray-400 mb-4">
              Engaging, adaptive lessons designed specifically for your learning style.
            </p>
            <button className="text-cyan-400 hover:text-cyan-300 text-sm">
              Browse Lessons →
            </button>
          </div>

          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-blue-400/50 transition-all cursor-pointer">
            <Target className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Personal Goals</h3>
            <p className="text-gray-400 mb-4">
              Set and track your learning goals with AI-powered guidance.
            </p>
            <button className="text-blue-400 hover:text-blue-300 text-sm">
              Set Goals →
            </button>
          </div>

          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-purple-400/50 transition-all cursor-pointer">
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
        {userProgress && (
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-orange-400/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-orange-400">Your Learning Preferences</h3>
              <Settings className="h-6 w-6 text-orange-400" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Visual Supports:</span>
                  <span className="text-green-400">
                    Enabled
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Audio:</span>
                  <span className="text-gray-500">
                    Disabled
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Interaction Style:</span>
                  <span className="text-blue-400 capitalize">Gentle</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Learning Pace:</span>
                  <span className="text-purple-400 capitalize">Self-directed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Minimal Animation:</span>
                  <span className="text-green-400">
                    Yes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Clear Instructions:</span>
                  <span className="text-green-400">
                    Yes
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Progress Summary */}
        {userProgress && (
          <div className="mt-8 bg-gray-900/30 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-400 mb-4">Your Amazing Progress!</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">{userProgress.currentLevel}</div>
                <div className="text-sm text-gray-400">Current Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">{userProgress.completedModules}</div>
                <div className="text-sm text-gray-400">Lessons Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">{userProgress.strengths?.length || 0}</div>
                <div className="text-sm text-gray-400">Strengths Identified</div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* AgentricAI Chat Bot */}
      <AgentricAIChatBot 
        userRole="student" 
        user={user} 
        onHighlight={handleHighlight}
      />
    </div>
  );
}