import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  BookOpen, 
  PenTool, 
  BarChart3, 
  Target, 
  TestTube, 
  Users, 
  Calendar,
  Music,
  FileText,
  Brain,
  Timer,
  HelpCircle,
  TrendingUp,
  Award,
  Bell,
  CheckCircle,
  AlertCircle,
  Zap,
  Star,
  ArrowRight,
  Play,
  ChevronRight,
  Activity,
  Bookmark,
  Coffee,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const features = [
  {
    title: 'Study Timer',
    description: 'Pomodoro technique & focus sessions',
    icon: Timer,
    path: '/study-timer',
    gradient: 'from-red-500 to-pink-500',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600'
  },
  {
    title: 'Flashcards',
    description: 'Spaced repetition learning',
    icon: BookOpen,
    path: '/flashcards',
    gradient: 'from-blue-500 to-indigo-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    title: 'Notes',
    description: 'Organized study materials',
    icon: PenTool,
    path: '/notes',
    gradient: 'from-green-500 to-emerald-500',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    title: 'Drawing Board',
    description: 'Visual learning & flowcharts',
    icon: PenTool,
    path: '/drawing-board',
    gradient: 'from-purple-500 to-violet-500',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    title: 'Analytics',
    description: 'Progress tracking & insights',
    icon: BarChart3,
    path: '/analytics',
    gradient: 'from-indigo-500 to-blue-500',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  },
  {
    title: 'Study Plan',
    description: 'AI-powered recommendations',
    icon: Target,
    path: '/study-plan',
    gradient: 'from-orange-500 to-red-500',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600'
  },
  {
    title: 'Mock Tests',
    description: 'Practice & assessment',
    icon: TestTube,
    path: '/mock-tests',
    gradient: 'from-pink-500 to-rose-500',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600'
  },
  {
    title: 'Study Groups',
    description: 'Collaborative learning',
    icon: Users,
    path: '/study-groups',
    gradient: 'from-teal-500 to-cyan-500',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600'
  },
  {
    title: 'Calendar',
    description: 'Schedule & deadlines',
    icon: Calendar,
    path: '/calendar',
    gradient: 'from-cyan-500 to-blue-500',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600'
  },
  {
    title: 'Focus Music',
    description: 'Concentration sounds',
    icon: Music,
    path: '/music',
    gradient: 'from-yellow-500 to-orange-500',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  },
  {
    title: 'Text Summarizer',
    description: 'AI content summary',
    icon: FileText,
    path: '/text-summarizer',
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  {
    title: 'Doubt Solver',
    description: 'AI question answering',
    icon: HelpCircle,
    path: '/doubt-solver',
    gradient: 'from-violet-500 to-purple-500',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600'
  }
];

const motivationalQuotes = [
  "Success is the sum of small efforts repeated day in and day out. 💪",
  "The expert in anything was once a beginner. 🌟",
  "Don't watch the clock; do what it does. Keep going. ⏰",
  "Education is the most powerful weapon you can use to change the world. 🌍",
  "The beautiful thing about learning is that no one can take it away from you. 📚",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. 🚀"
];

export default function Dashboard() {
  const { user } = useAuth();
  const [currentQuote, setCurrentQuote] = useState(0);
  const [goalProgress, setGoalProgress] = useState({
    gpaProgress: 0,
    studyHoursProgress: 0,
    selfRatingProgress: 0,
    daysRemaining: 0,
    totalDays: 0
  });
  const [todayStats, setTodayStats] = useState({
    studyTime: 0,
    tasksCompleted: 0,
    totalTasks: 5,
    streak: 7
  });
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'reminder',
      message: 'Study session starts in 30 minutes',
      time: '2 min ago',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'achievement',
      message: 'Congratulations! 7-day study streak achieved!',
      time: '1 hour ago',
      icon: Award,
      color: 'text-yellow-600'
    },
    {
      id: 3,
      type: 'goal',
      message: 'You\'re 65% towards your GPA goal!',
      time: '3 hours ago',
      icon: Target,
      color: 'text-green-600'
    }
  ]);

  useEffect(() => {
    // Calculate goal progress
    if (user?.goalStartDate && user?.goalEndDate) {
      const startDate = new Date(user.goalStartDate);
      const endDate = new Date(user.goalEndDate);
      const currentDate = new Date();
      
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, totalDays - daysElapsed);
      
      // Mock progress calculations (in real app, this would come from actual data)
      const timeProgress = Math.min(100, (daysElapsed / totalDays) * 100);
      const gpaProgress = Math.min(100, timeProgress * 0.8); // Slightly behind time
      const studyHoursProgress = Math.min(100, timeProgress * 1.1); // Slightly ahead
      const selfRatingProgress = Math.min(100, timeProgress * 0.9); // On track
      
      setGoalProgress({
        gpaProgress,
        studyHoursProgress,
        selfRatingProgress,
        daysRemaining,
        totalDays
      });
    }

    // Rotate motivational quotes
    const quoteInterval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % motivationalQuotes.length);
    }, 10000);

    return () => clearInterval(quoteInterval);
  }, [user]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBgColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
                Welcome back, {user?.name?.split(' ')[0]}! 
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                Ready to continue your learning journey? Let's achieve your goals together!
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Lightbulb className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Goal Progress Overview */}
        {user?.expectedGpa && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden bg-white rounded-3xl p-8 mb-8 shadow-xl border border-gray-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Goal Progress</h2>
                  <p className="text-gray-600 text-lg">
                    {goalProgress.daysRemaining} days remaining to achieve your targets
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {Math.round((goalProgress.gpaProgress + goalProgress.studyHoursProgress + goalProgress.selfRatingProgress) / 3)}%
                  </div>
                  <p className="text-gray-600 font-medium">Overall Progress</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-blue-900">GPA Goal</span>
                    <span className="text-sm font-bold text-blue-700">{user.currentGpa} → {user.expectedGpa}</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${goalProgress.gpaProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-700 font-medium">{Math.round(goalProgress.gpaProgress)}% complete</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-green-900">Study Hours</span>
                    <span className="text-sm font-bold text-green-700">{user.currentStudyHours}h → {user.expectedStudyHours}h</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${goalProgress.studyHoursProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-green-700 font-medium">{Math.round(goalProgress.studyHoursProgress)}% complete</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-purple-900">Self Rating</span>
                    <span className="text-sm font-bold text-purple-700">{user.currentSelfRating} → {user.expectedSelfRating}</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${goalProgress.selfRatingProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-purple-700 font-medium">{Math.round(goalProgress.selfRatingProgress)}% complete</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Enhanced Today's Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Study Time Today</p>
                    <p className="text-3xl font-bold text-blue-600">{todayStats.studyTime}h</p>
                    <p className="text-xs text-blue-500 font-medium">+2h from yesterday</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Tasks Completed</p>
                    <p className="text-3xl font-bold text-green-600">{todayStats.tasksCompleted}/{todayStats.totalTasks}</p>
                    <p className="text-xs text-green-500 font-medium">Great progress!</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Study Streak</p>
                    <p className="text-3xl font-bold text-orange-600">{todayStats.streak} days</p>
                    <p className="text-xs text-orange-500 font-medium">Keep it up! 🔥</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Goal Progress</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {Math.round((goalProgress.gpaProgress + goalProgress.studyHoursProgress + goalProgress.selfRatingProgress) / 3)}%
                    </p>
                    <p className="text-xs text-purple-500 font-medium">On track!</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Motivational Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-8 mb-8 shadow-xl"
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-6">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Daily Motivation</h3>
                  <p className="text-white/90 text-lg font-medium">{motivationalQuotes[currentQuote]}</p>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <Link
                    to={feature.path}
                    className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 block hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 ${feature.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                      <span>Get started</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                    
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Notifications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div key={notification.id} className="flex items-start p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-4 shadow-sm`}>
                      <notification.icon className={`w-5 h-5 ${notification.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-relaxed">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Enhanced Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link
                  to="/study-timer"
                  className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-semibold">Start Study Session</span>
                </Link>
                
                <Link
                  to="/doubt-solver"
                  className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-semibold">Ask a Question</span>
                </Link>
                
                <Link
                  to="/analytics"
                  className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 rounded-xl hover:from-purple-100 hover:to-violet-100 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-semibold">View Progress</span>
                </Link>
              </div>
            </motion.div>

            {/* Enhanced Goal Reminder */}
            {goalProgress.daysRemaining > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
                className="relative overflow-hidden bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl"
              >
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold">Goal Reminder</h3>
                  </div>
                  <p className="text-white/90 mb-4 leading-relaxed">
                    Only {goalProgress.daysRemaining} days left to achieve your goals!
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center">
                      <Coffee className="w-4 h-4 mr-2" />
                      Keep pushing forward! 💪
                    </p>
                    <p className="flex items-center">
                      <Bookmark className="w-4 h-4 mr-2" />
                      You're {Math.round((goalProgress.gpaProgress + goalProgress.studyHoursProgress + goalProgress.selfRatingProgress) / 3)}% there!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}