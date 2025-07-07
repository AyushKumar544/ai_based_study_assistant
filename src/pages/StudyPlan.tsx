import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, BookOpen, TrendingUp, Calendar, CheckCircle, RefreshCw, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';

interface StudyPlanItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  completed: boolean;
}

const API_BASE_URL = 'http://localhost:3001';

export default function StudyPlan() {
  const { user } = useAuth();
  const [studyPlan, setStudyPlan] = useState<StudyPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyPlanItem | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    duration: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    category: ''
  });

  useEffect(() => {
    generateStudyPlan();
  }, []);

  const generateStudyPlan = async () => {
    try {
      setGenerating(true);
      console.log('🔄 Generating study plan for user:', user);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found, using mock study plan');
        setStudyPlan(getMockStudyPlan());
        setLoading(false);
        setGenerating(false);
        return;
      }

      // Prepare user profile data
      const userProfile = {
        category: user?.category || 'student',
        branch: user?.branch || 'General',
        domain: user?.domain || 'General Studies',
        currentGpa: user?.currentGpa || 7.0,
        expectedGpa: user?.expectedGpa || 8.5,
        currentStudyHours: user?.currentStudyHours || 4,
        expectedStudyHours: user?.expectedStudyHours || 6,
        currentSelfRating: user?.currentSelfRating || 6,
        expectedSelfRating: user?.expectedSelfRating || 8
      };

      console.log('📊 Sending user profile:', userProfile);

      const response = await axios.post(`${API_BASE_URL}/api/ai/generate-study-plan`, userProfile, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('✅ Study plan response:', response.data);
      
      if (response.data && response.data.plan && Array.isArray(response.data.plan)) {
        setStudyPlan(response.data.plan);
        toast.success('🎯 New study plan generated successfully!');
      } else {
        console.log('⚠️ Invalid response format, using mock plan');
        setStudyPlan(getMockStudyPlan());
        toast.success('📚 Study plan generated!');
      }
    } catch (error: any) {
      console.error('❌ Failed to generate study plan:', error);
      
      // Provide specific error messages
      if (error.code === 'ECONNREFUSED') {
        toast.error('🚨 Server is not running! Please start the backend server.');
      } else if (error.response?.status === 401) {
        toast.error('🔐 Authentication failed. Please login again.');
      } else if (error.response?.status === 500) {
        toast.error('⚠️ Server error. Using fallback study plan.');
      } else {
        toast.error('⚠️ Failed to generate plan. Using default plan.');
      }
      
      // Fallback to mock data
      setStudyPlan(getMockStudyPlan());
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const getMockStudyPlan = (): StudyPlanItem[] => {
    const userDomain = user?.domain || user?.branch || 'General Studies';
    const userCategory = user?.category || 'student';
    
    const basePlans = {
      student: [
        {
          id: '1',
          title: 'Morning Review Session',
          description: 'Review previous day\'s concepts and prepare for new topics',
          duration: '30 minutes',
          priority: 'high' as const,
          category: 'Review',
          completed: false
        },
        {
          id: '2',
          title: `Core ${userDomain} Study`,
          description: `Deep dive into ${userDomain} concepts with focused learning`,
          duration: '2 hours',
          priority: 'high' as const,
          category: 'Study',
          completed: false
        },
        {
          id: '3',
          title: 'Practice Problems',
          description: 'Solve practice questions and work on problem-solving skills',
          duration: '1 hour',
          priority: 'medium' as const,
          category: 'Practice',
          completed: false
        },
        {
          id: '4',
          title: 'Flashcard Review',
          description: 'Review flashcards using spaced repetition technique',
          duration: '20 minutes',
          priority: 'medium' as const,
          category: 'Review',
          completed: false
        },
        {
          id: '5',
          title: 'Note Organization',
          description: 'Organize and summarize today\'s learning materials',
          duration: '30 minutes',
          priority: 'low' as const,
          category: 'Organization',
          completed: false
        }
      ],
      professional: [
        {
          id: '1',
          title: 'Skill Assessment',
          description: 'Evaluate current skills and identify improvement areas',
          duration: '45 minutes',
          priority: 'high' as const,
          category: 'Assessment',
          completed: false
        },
        {
          id: '2',
          title: `${userDomain} Deep Dive`,
          description: `Advanced study session focused on ${userDomain} skills`,
          duration: '2.5 hours',
          priority: 'high' as const,
          category: 'Skill Development',
          completed: false
        },
        {
          id: '3',
          title: 'Practical Application',
          description: 'Apply learned concepts to real-world scenarios',
          duration: '1.5 hours',
          priority: 'medium' as const,
          category: 'Application',
          completed: false
        }
      ]
    };

    return basePlans[userCategory as keyof typeof basePlans] || basePlans.student;
  };

  const toggleCompletion = (id: string) => {
    setStudyPlan(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
    
    const item = studyPlan.find(item => item.id === id);
    if (item && !item.completed) {
      toast.success(`✅ Completed: ${item.title}`);
    }
  };

  const addCustomTask = () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      toast.error('Please fill in title and description');
      return;
    }

    const task: StudyPlanItem = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      duration: newTask.duration || '30 minutes',
      priority: newTask.priority,
      category: newTask.category || 'Custom',
      completed: false
    };

    setStudyPlan(prev => [...prev, task]);
    setNewTask({
      title: '',
      description: '',
      duration: '',
      priority: 'medium',
      category: ''
    });
    setShowCreateForm(false);
    toast.success('✅ Custom task added to your study plan!');
  };

  const editTask = (task: StudyPlanItem) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      duration: task.duration,
      priority: task.priority,
      category: task.category
    });
    setShowCreateForm(true);
  };

  const updateTask = () => {
    if (!editingTask || !newTask.title.trim() || !newTask.description.trim()) {
      toast.error('Please fill in title and description');
      return;
    }

    setStudyPlan(prev => prev.map(item => 
      item.id === editingTask.id 
        ? {
            ...item,
            title: newTask.title,
            description: newTask.description,
            duration: newTask.duration || '30 minutes',
            priority: newTask.priority,
            category: newTask.category || 'Custom'
          }
        : item
    ));

    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      duration: '',
      priority: 'medium',
      category: ''
    });
    setShowCreateForm(false);
    toast.success('✅ Task updated successfully!');
  };

  const deleteTask = (id: string) => {
    setStudyPlan(prev => prev.filter(item => item.id !== id));
    toast.success('🗑️ Task removed from study plan');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completedCount = studyPlan.filter(item => item.completed).length;
  const completionPercentage = studyPlan.length > 0 ? (completedCount / studyPlan.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading your study plan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Your Personalized Study Plan</h1>
            </div>
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingTask(null);
                  setNewTask({
                    title: '',
                    description: '',
                    duration: '',
                    priority: 'medium',
                    category: ''
                  });
                  setShowCreateForm(true);
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Custom Task
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateStudyPlan}
                disabled={generating}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Generate New Plan
                  </>
                )}
              </motion.button>
            </div>
          </div>
          <p className="text-xl text-gray-600">
            AI-generated plan based on your goals and current performance
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current GPA</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.currentGpa || 'Not Set'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Target GPA</p>
                <p className="text-2xl font-bold text-green-600">
                  {user?.expectedGpa || 'Not Set'}
                </p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Daily Study Hours</p>
                <p className="text-2xl font-bold text-purple-600">
                  {user?.expectedStudyHours ? `${user.expectedStudyHours}h` : 'Not Set'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-orange-600">
                  {completedCount}/{studyPlan.length}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </motion.div>

        {/* Create/Edit Task Modal */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 w-full max-w-2xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingTask ? 'Edit Task' : 'Add Custom Task'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe what this task involves..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={newTask.duration}
                      onChange={(e) => setNewTask(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 30 minutes"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={newTask.category}
                      onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Study, Review"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTask(null);
                    setNewTask({
                      title: '',
                      description: '',
                      duration: '',
                      priority: 'medium',
                      category: ''
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTask ? updateTask : addCustomTask}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Study Plan Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Today's Study Schedule</h2>
            <div className="text-sm text-gray-600">
              {completedCount} of {studyPlan.length} tasks completed ({Math.round(completionPercentage)}%)
            </div>
          </div>
          
          {studyPlan.length > 0 ? (
            <div className="space-y-4">
              {studyPlan.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    item.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <button
                        onClick={() => toggleCompletion(item.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          item.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {item.completed && <CheckCircle className="w-4 h-4 text-white" />}
                      </button>
                      
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${
                          item.completed ? 'text-green-700 line-through' : 'text-gray-900'
                        }`}>
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                        {item.priority.toUpperCase()}
                      </span>
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">{item.duration}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editTask(item)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Study Plan Available</h3>
              <p className="text-gray-600 mb-6">Click "Generate New Plan" to create your personalized study schedule</p>
            </div>
          )}

          {studyPlan.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  💡 <strong>Tip:</strong> Click on the circle to mark tasks as completed, or use the edit/delete buttons to customize your plan
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditingTask(null);
                      setNewTask({
                        title: '',
                        description: '',
                        duration: '',
                        priority: 'medium',
                        category: ''
                      });
                      setShowCreateForm(true);
                    }}
                    className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generateStudyPlan}
                    disabled={generating}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate Plan
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* User Profile Completion Notice */}
        {(!user?.currentGpa || !user?.expectedGpa || !user?.expectedStudyHours) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <Target className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-900">Complete Your Profile</h3>
                <p className="text-yellow-700">
                  Set your GPA goals and study hours in your profile to get more personalized study plans.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}





























/*

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, BookOpen, TrendingUp, Calendar, CheckCircle, RefreshCw, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';

interface StudyPlanItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  completed: boolean;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  currentGpa?: number;
  expectedGpa?: number;
  currentStudyHours?: number;
  expectedStudyHours?: number;
  currentSelfRating?: number;
  expectedSelfRating?: number;
  category?: string;
  branch?: string;
  domain?: string;
  setupComplete?: boolean;
  [key: string]: any;
}

const API_BASE_URL = 'http://localhost:3001';

export default function StudyPlan() {
  const { user, updateUser } = useAuth();
  const [studyPlan, setStudyPlan] = useState<StudyPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyPlanItem | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    duration: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    category: ''
  });

  useEffect(() => {
    fetchUserProfileAndPlan();
  }, []);

  const fetchUserProfileAndPlan = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token found');

      // Fetch user profile
      const profileResponse = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const profileData = profileResponse.data;
      setUserProfile(profileData);
      
      // Update auth context with fresh data
      if (updateUser) {
        updateUser(profileData);
      }

      // Generate study plan with the fetched profile data
      await generateStudyPlan(profileData);

      toast.success('🎉 Loaded personalized study plan!');
    } catch (error: any) {
      console.error('❌ Failed to fetch user profile:', error);
      toast.error('⚠️ Could not load profile. Using fallback plan.');
      setStudyPlan(getMockStudyPlan());
    } finally {
      setLoading(false);
    }
  };

  const generateStudyPlan = async (profileData?: UserProfile) => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found, using mock study plan');
        setStudyPlan(getMockStudyPlan());
        setGenerating(false);
        return;
      }

      // Use the provided profile data or fallback to user context
      const effectiveProfile = profileData || userProfile || user || {};
      
      const userProfileForPlan = {
        category: effectiveProfile?.category || 'student',
        branch: effectiveProfile?.branch || 'General',
        domain: effectiveProfile?.domain || 'General Studies',
        currentGpa: effectiveProfile?.currentGpa || 7.0,
        expectedGpa: effectiveProfile?.expectedGpa || 8.5,
        currentStudyHours: effectiveProfile?.currentStudyHours || 4,
        expectedStudyHours: effectiveProfile?.expectedStudyHours || 6,
        currentSelfRating: effectiveProfile?.currentSelfRating || 6,
        expectedSelfRating: effectiveProfile?.expectedSelfRating || 8
      };

      console.log('📊 Sending user profile:', userProfileForPlan);

      const response = await axios.post(`${API_BASE_URL}/api/ai/generate-study-plan`, userProfileForPlan, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Study plan response:', response.data);
      
      if (response.data?.plan) {
        setStudyPlan(response.data.plan);
        toast.success('🎯 New study plan generated successfully!');
      } else {
        console.log('⚠️ Invalid response format, using mock plan');
        setStudyPlan(getMockStudyPlan());
        toast.success('📚 Study plan generated!');
      }
    } catch (error: any) {
      console.error('❌ Failed to generate study plan:', error);
      
      if (error.code === 'ECONNREFUSED') {
        toast.error('🚨 Server is not running! Please start the backend server.');
      } else if (error.response?.status === 401) {
        toast.error('🔐 Authentication failed. Please login again.');
      } else if (error.response?.status === 500) {
        toast.error('⚠️ Server error. Using fallback study plan.');
      } else {
        toast.error('⚠️ Failed to generate plan. Using default plan.');
      }
      
      setStudyPlan(getMockStudyPlan());
    } finally {
      setGenerating(false);
    }
  };

  const getMockStudyPlan = (): StudyPlanItem[] => {
    const userDomain = user?.domain || user?.branch || 'General Studies';
    const userCategory = user?.category || 'student';
    
    const basePlans = {
      student: [
        {
          id: '1',
          title: 'Morning Review Session',
          description: 'Review previous day\'s concepts and prepare for new topics',
          duration: '30 minutes',
          priority: 'high' as const,
          category: 'Review',
          completed: false
        },
        {
          id: '2',
          title: `Core ${userDomain} Study`,
          description: `Deep dive into ${userDomain} concepts with focused learning`,
          duration: '2 hours',
          priority: 'high' as const,
          category: 'Study',
          completed: false
        },
        {
          id: '3',
          title: 'Practice Problems',
          description: 'Solve practice questions and work on problem-solving skills',
          duration: '1 hour',
          priority: 'medium' as const,
          category: 'Practice',
          completed: false
        },
        {
          id: '4',
          title: 'Flashcard Review',
          description: 'Review flashcards using spaced repetition technique',
          duration: '20 minutes',
          priority: 'medium' as const,
          category: 'Review',
          completed: false
        },
        {
          id: '5',
          title: 'Note Organization',
          description: 'Organize and summarize today\'s learning materials',
          duration: '30 minutes',
          priority: 'low' as const,
          category: 'Organization',
          completed: false
        }
      ],
      professional: [
        {
          id: '1',
          title: 'Skill Assessment',
          description: 'Evaluate current skills and identify improvement areas',
          duration: '45 minutes',
          priority: 'high' as const,
          category: 'Assessment',
          completed: false
        },
        {
          id: '2',
          title: `${userDomain} Deep Dive`,
          description: `Advanced study session focused on ${userDomain} skills`,
          duration: '2.5 hours',
          priority: 'high' as const,
          category: 'Skill Development',
          completed: false
        },
        {
          id: '3',
          title: 'Practical Application',
          description: 'Apply learned concepts to real-world scenarios',
          duration: '1.5 hours',
          priority: 'medium' as const,
          category: 'Application',
          completed: false
        }
      ]
    };

    return basePlans[userCategory as keyof typeof basePlans] || basePlans.student;
  };

  const toggleCompletion = (id: string) => {
    setStudyPlan(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
    
    const item = studyPlan.find(item => item.id === id);
    if (item && !item.completed) {
      toast.success(`✅ Completed: ${item.title}`);
    }
  };

  const addCustomTask = () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      toast.error('Please fill in title and description');
      return;
    }

    const task: StudyPlanItem = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      duration: newTask.duration || '30 minutes',
      priority: newTask.priority,
      category: newTask.category || 'Custom',
      completed: false
    };

    setStudyPlan(prev => [...prev, task]);
    setNewTask({
      title: '',
      description: '',
      duration: '',
      priority: 'medium',
      category: ''
    });
    setShowCreateForm(false);
    toast.success('✅ Custom task added to your study plan!');
  };

  const editTask = (task: StudyPlanItem) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      duration: task.duration,
      priority: task.priority,
      category: task.category
    });
    setShowCreateForm(true);
  };

  const updateTask = () => {
    if (!editingTask || !newTask.title.trim() || !newTask.description.trim()) {
      toast.error('Please fill in title and description');
      return;
    }

    setStudyPlan(prev => prev.map(item => 
      item.id === editingTask.id 
        ? {
            ...item,
            title: newTask.title,
            description: newTask.description,
            duration: newTask.duration || '30 minutes',
            priority: newTask.priority,
            category: newTask.category || 'Custom'
          }
        : item
    ));

    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      duration: '',
      priority: 'medium',
      category: ''
    });
    setShowCreateForm(false);
    toast.success('✅ Task updated successfully!');
  };

  const deleteTask = (id: string) => {
    setStudyPlan(prev => prev.filter(item => item.id !== id));
    toast.success('🗑️ Task removed from study plan');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completedCount = studyPlan.filter(item => item.completed).length;
  const completionPercentage = studyPlan.length > 0 ? (completedCount / studyPlan.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading your study plan...</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine which user data to display (prefer userProfile, fallback to user context)
  const displayUser = userProfile || user || {};
  const hasStudyGoals = displayUser.currentGpa && displayUser.expectedGpa && displayUser.expectedStudyHours;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Your Personalized Study Plan</h1>
            </div>
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingTask(null);
                  setNewTask({
                    title: '',
                    description: '',
                    duration: '',
                    priority: 'medium',
                    category: ''
                  });
                  setShowCreateForm(true);
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Custom Task
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => generateStudyPlan()}
                disabled={generating}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Generate New Plan
                  </>
//                 )}
//               </motion.button>
//             </div>
//           </div>
//           <p className="text-xl text-gray-600">
//             AI-generated plan based on your goals and current performance
//           </p>
//         </motion.div>

//         {/* Progress Overview */
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
//         >
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Current GPA</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {displayUser.currentGpa !== undefined ? displayUser.currentGpa : 'Not Set'}
//                 </p>
//               </div>
//               <TrendingUp className="w-8 h-8 text-blue-600" />
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Target GPA</p>
//                 <p className="text-2xl font-bold text-green-600">
//                   {displayUser.expectedGpa !== undefined ? displayUser.expectedGpa : 'Not Set'}
//                 </p>
//               </div>
//               <Target className="w-8 h-8 text-green-600" />
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Daily Study Hours</p>
//                 <p className="text-2xl font-bold text-purple-600">
//                   {displayUser.expectedStudyHours !== undefined ? `${displayUser.expectedStudyHours}h` : 'Not Set'}
//                 </p>
//               </div>
//               <Clock className="w-8 h-8 text-purple-600" />
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Completed Today</p>
//                 <p className="text-2xl font-bold text-orange-600">
//                   {completedCount}/{studyPlan.length}
//                 </p>
//                 <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
//                   <div 
//                     className="bg-orange-600 h-2 rounded-full transition-all duration-300"
//                     style={{ width: `${completionPercentage}%` }}
//                   />
//                 </div>
//               </div>
//               <CheckCircle className="w-8 h-8 text-orange-600" />
//             </div>
//           </div>
//         </motion.div>

//         {/* Create/Edit Task Modal */}
//         {showCreateForm && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               className="bg-white rounded-2xl p-8 w-full max-w-2xl"
//             >
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">
//                 {editingTask ? 'Edit Task' : 'Add Custom Task'}
//               </h2>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Task Title
//                   </label>
//                   <input
//                     type="text"
//                     value={newTask.title}
//                     onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Enter task title..."
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Description
//                   </label>
//                   <textarea
//                     value={newTask.description}
//                     onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     rows={3}
//                     placeholder="Describe what this task involves..."
//                   />
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Duration
//                     </label>
//                     <input
//                       type="text"
//                       value={newTask.duration}
//                       onChange={(e) => setNewTask(prev => ({ ...prev, duration: e.target.value }))}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="e.g., 30 minutes"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Priority
//                     </label>
//                     <select
//                       value={newTask.priority}
//                       onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="low">Low</option>
//                       <option value="medium">Medium</option>
//                       <option value="high">High</option>
//                     </select>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Category
//                     </label>
//                     <input
//                       type="text"
//                       value={newTask.category}
//                       onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="e.g., Study, Review"
//                     />
//                   </div>
//                 </div>
//               </div>
              
//               <div className="flex justify-end space-x-4 mt-8">
//                 <button
//                   onClick={() => {
//                     setShowCreateForm(false);
//                     setEditingTask(null);
//                     setNewTask({
//                       title: '',
//                       description: '',
//                       duration: '',
//                       priority: 'medium',
//                       category: ''
//                     });
//                   }}
//                   className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={editingTask ? updateTask : addCustomTask}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   {editingTask ? 'Update Task' : 'Add Task'}
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}

//         {/* Study Plan Items */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//           className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
//         >
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-gray-900">Today's Study Schedule</h2>
//             <div className="text-sm text-gray-600">
//               {completedCount} of {studyPlan.length} tasks completed ({Math.round(completionPercentage)}%)
//             </div>
//           </div>
          
//           {studyPlan.length > 0 ? (
//             <div className="space-y-4">
//               {studyPlan.map((item, index) => (
//                 <motion.div
//                   key={item.id}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                   className={`p-4 rounded-lg border-2 transition-all ${
//                     item.completed 
//                       ? 'bg-green-50 border-green-200' 
//                       : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-4 flex-1">
//                       <button
//                         onClick={() => toggleCompletion(item.id)}
//                         className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
//                           item.completed
//                             ? 'bg-green-500 border-green-500'
//                             : 'border-gray-300 hover:border-green-500'
//                         }`}
//                       >
//                         {item.completed && <CheckCircle className="w-4 h-4 text-white" />}
//                       </button>
                      
//                       <div className="flex-1">
//                         <h3 className={`text-lg font-semibold ${
//                           item.completed ? 'text-green-700 line-through' : 'text-gray-900'
//                         }`}>
//                           {item.title}
//                         </h3>
//                         <p className="text-gray-600 text-sm">{item.description}</p>
//                         <div className="flex items-center mt-2 space-x-4">
//                           <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
//                             {item.category}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-center space-x-3">
//                       <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
//                         {item.priority.toUpperCase()}
//                       </span>
//                       <div className="flex items-center text-gray-500">
//                         <Clock className="w-4 h-4 mr-1" />
//                         <span className="text-sm">{item.duration}</span>
//                       </div>
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => editTask(item)}
//                           className="text-gray-400 hover:text-blue-600 transition-colors"
//                         >
//                           <Edit className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => deleteTask(item.id)}
//                           className="text-gray-400 hover:text-red-600 transition-colors"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">No Study Plan Available</h3>
//               <p className="text-gray-600 mb-6">Click "Generate New Plan" to create your personalized study schedule</p>
//             </div>
//           )}

//           {studyPlan.length > 0 && (
//             <div className="mt-8 pt-6 border-t border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div className="text-sm text-gray-600">
//                   💡 <strong>Tip:</strong> Click on the circle to mark tasks as completed, or use the edit/delete buttons to customize your plan
//                 </div>
//                 <div className="flex space-x-2">
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => {
//                       setEditingTask(null);
//                       setNewTask({
//                         title: '',
//                         description: '',
//                         duration: '',
//                         priority: 'medium',
//                         category: ''
//                       });
//                       setShowCreateForm(true);
//                     }}
//                     className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
//                   >
//                     <Plus className="w-4 h-4 mr-2" />
//                     Add Task
//                   </motion.button>
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => generateStudyPlan()}
//                     disabled={generating}
//                     className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
//                   >
//                     {generating ? (
//                       <>
//                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
//                         Generating...
//                       </>
//                     ) : (
//                       <>
//                         <RefreshCw className="w-4 h-4 mr-2" />
//                         Regenerate Plan
//                       </>
//                     )}
//                   </motion.button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </motion.div>

//         {/* User Profile Completion Notice */}
//         {!hasStudyGoals && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6 }}
//             className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6"
//           >
//             <div className="flex items-center">
//               <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
//                 <Target className="w-5 h-5 text-yellow-600" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-yellow-900">Complete Your Profile</h3>
//                 <p className="text-yellow-700">
//                   Set your GPA goals and study hours in your profile to get more personalized study plans.
//                 </p>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }

// */