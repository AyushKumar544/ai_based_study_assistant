import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar,
  Award,
  BookOpen,
  Brain,
  Zap,
  Activity,
  Users,
  Star
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import Navbar from '../components/Navbar';
import { studySessionService } from '../services/studySessionService';
import toast from 'react-hot-toast';


interface AnalyticsOverview {
  totalStudyTime: number;
  averageDaily: number;
  completedSessions: number;
  streakDays: number;
  weeklyGoalProgress: number;
  improvementRate: number;
}

interface StudyTrendData {
  date: string;
  hours: number;
  sessions: number;
}

interface SubjectData {
  subject: string;
  hours: number;
  sessions: number;
  color: string;
}

interface PerformanceData {
  week: string;
  score: number;
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('week');
  const [overview, setOverview] = useState<AnalyticsOverview>({
    totalStudyTime: 0,
    averageDaily: 0,
    completedSessions: 0,
    streakDays: 0,
    weeklyGoalProgress: 0,
    improvementRate: 0
  });
  const [studyTrend, setStudyTrend] = useState<StudyTrendData[]>([]);
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data from Supabase
      const [analyticsData, sessions] = await Promise.all([
        studySessionService.getAnalytics(timeRange as 'week' | 'month' | 'year'),
        studySessionService.getUserSessions(timeRange as 'week' | 'month' | 'year')
      ]);

      setOverview(analyticsData);
      
      // Process sessions for trend data
      const trendData = processTrendData(sessions, timeRange);
      setStudyTrend(trendData);
      
      // Process sessions for subject distribution
      const subjectDistribution = processSubjectData(sessions);
      setSubjectData(subjectDistribution);
      
      // Mock performance data for now
      const mockPerformanceData = Array.from({ length: 7 }, (_, i) => ({
        week: `Week ${i + 1}`,
        score: Math.floor(Math.random() * 40) + 60
      }));
      setPerformanceData(mockPerformanceData);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processTrendData = (sessions: any[], timeRange: string) => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const result = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySessions = sessions.filter(session => 
        session.created_at.split('T')[0] === dateStr
      );
      
      const totalMinutes = daySessions.reduce((sum, session) => sum + session.duration, 0);
      
      result.push({
        date: dateStr,
        hours: Math.round(totalMinutes / 60 * 10) / 10,
        sessions: daySessions.length
      });
    }
    
    return result;
  };

  const processSubjectData = (sessions: any[]) => {
    const subjectMap = new Map();
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    
    sessions.forEach(session => {
      const subject = session.subject;
      if (subjectMap.has(subject)) {
        const existing = subjectMap.get(subject);
        existing.hours += session.duration / 60;
        existing.sessions += 1;
      } else {
        subjectMap.set(subject, {
          subject,
          hours: session.duration / 60,
          sessions: 1,
          color: colors[subjectMap.size % colors.length]
        });
      }
    });
    
    return Array.from(subjectMap.values()).map(item => ({
      ...item,
      hours: Math.round(item.hours * 10) / 10
    }));
  };
  const getStreakMessage = (days: number) => {
    if (days === 0) return "Start your streak today! 🚀";
    if (days === 1) return "Great start! Keep it going! 💪";
    if (days < 7) return "Building momentum! 🔥";
    if (days < 30) return "Fantastic consistency! ⭐";
    return "You're a study champion! 🏆";
  };

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Loading your analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Track your progress and discover learning insights
            </p>
          </div>
          <div className="flex space-x-2 bg-white rounded-xl p-2 shadow-lg border border-gray-200">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Study Time</p>
                <p className="text-3xl font-bold text-gray-900">{overview.totalStudyTime}h</p>
                <p className={`text-sm font-medium ${overview.improvementRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overview.improvementRate >= 0 ? '+' : ''}{overview.improvementRate}% this {timeRange}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Daily Average</p>
                <p className="text-3xl font-bold text-gray-900">{overview.averageDaily}h</p>
                <p className="text-sm font-medium text-blue-600">Consistency is key!</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Study Streak</p>
                <p className="text-3xl font-bold text-gray-900">{overview.streakDays} days</p>
                <p className="text-sm font-medium text-orange-600">{getStreakMessage(overview.streakDays)}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Award className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Weekly Goal</p>
                <p className="text-3xl font-bold text-gray-900">{overview.weeklyGoalProgress}%</p>
                <p className="text-sm font-medium text-purple-600">{overview.completedSessions} sessions</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Study Time Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Study Time Trend</h3>
                <p className="text-sm text-gray-600">Your daily study hours over time</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={studyTrend}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value: any, name: string) => [
                    `${value}${name === 'hours' ? 'h' : ''}`, 
                    name === 'hours' ? 'Study Hours' : 'Sessions'
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fill="url(#colorHours)"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: 'white' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Performance Score */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Performance Score</h3>
                <p className="text-sm text-gray-600">Weekly performance tracking</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Performance Score']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="score" 
                  fill="url(#performanceGradient)" 
                  radius={[6, 6, 0, 0]}
                />
                <defs>
                  <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subject Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Subject Distribution</h3>
                <p className="text-sm text-gray-600">Time spent on different subjects</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {subjectData.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center">
                <div className="w-full lg:w-1/2 mb-6 lg:mb-0">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={subjectData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="hours"
                        label={({ subject, hours }) => `${subject}: ${hours}h`}
                      >
                        {subjectData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`${value}h`, 'Study Time']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2 space-y-4">
                  {subjectData.map((subject) => (
                    <div key={subject.subject} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: subject.color }}
                        />
                        <span className="font-medium text-gray-700">{subject.subject}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{subject.hours}h</span>
                        <p className="text-xs text-gray-500">{subject.sessions} sessions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Study Data Yet</h3>
                <p className="text-gray-600">Start studying to see your subject distribution!</p>
              </div>
            )}
          </motion.div>

          {/* Achievements & Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            {/* Recent Achievements */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
              </div>
              
              <div className="space-y-3">
                {overview.streakDays >= 7 && (
                  <div className="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Week Warrior</p>
                      <p className="text-xs text-gray-600">7+ day study streak</p>
                    </div>
                  </div>
                )}

                {overview.weeklyGoalProgress >= 100 && (
                  <div className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Goal Crusher</p>
                      <p className="text-xs text-gray-600">Exceeded weekly goal</p>
                    </div>
                  </div>
                )}

                {overview.improvementRate > 20 && (
                  <div className="flex items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Rapid Improver</p>
                      <p className="text-xs text-gray-600">+{overview.improvementRate}% improvement</p>
                    </div>
                  </div>
                )}

                {overview.completedSessions >= 50 && (
                  <div className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Session Master</p>
                      <p className="text-xs text-gray-600">50+ study sessions</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Quick Stats</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Avg Session</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {overview.completedSessions > 0 ? Math.round((overview.totalStudyTime * 60) / overview.completedSessions) : 0}min
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Goal Progress</span>
                  </div>
                  <span className={`font-semibold ${getProgressColor(overview.weeklyGoalProgress)}`}>
                    {overview.weeklyGoalProgress}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-purple-600 mr-2" />
                    <span className="text-sm text-gray-600">Total Sessions</span>
                  </div>
                  <span className="font-semibold text-gray-900">{overview.completedSessions}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 text-orange-600 mr-2" />
                    <span className="text-sm text-gray-600">Improvement</span>
                  </div>
                  <span className={`font-semibold ${overview.improvementRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {overview.improvementRate >= 0 ? '+' : ''}{overview.improvementRate}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}