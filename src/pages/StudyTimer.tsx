import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, Coffee, BookOpen, Save } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:3001';

export default function StudyTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [currentSubject, setCurrentSubject] = useState('General');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [settings, setSettings] = useState({
    studyTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      if (isBreak) {
        // Break finished, start study session
        setIsBreak(false);
        setTimeLeft(settings.studyTime * 60);
        toast.success('Break time over! Ready to study?');
      } else {
        // Study session finished - save to database
        saveStudySession();
        setSessions(prev => prev + 1);
        const newSessions = sessions + 1;
        
        if (newSessions % settings.sessionsUntilLongBreak === 0) {
          // Long break
          setTimeLeft(settings.longBreak * 60);
          toast.success('Great work! Time for a long break!');
        } else {
          // Short break
          setTimeLeft(settings.shortBreak * 60);
          toast.success('Session complete! Take a short break.');
        }
        setIsBreak(true);
      }
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isBreak, sessions, settings]);

  const saveStudySession = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const duration = settings.studyTime; // Duration in minutes
      const goalProgress = Math.random() * 20 + 80; // Mock progress between 80-100%

      await axios.post(`${API_BASE_URL}/api/study-sessions`, {
        subject: currentSubject,
        duration: duration,
        sessionType: 'focus',
        notes: sessionNotes,
        goalProgress: goalProgress
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Study session saved successfully');
    } catch (error) {
      console.error('Failed to save study session:', error);
    }
  };

  const toggleTimer = () => {
    if (!isActive && !sessionStartTime) {
      setSessionStartTime(new Date());
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(settings.studyTime * 60);
    setSessionStartTime(null);
    setSessionNotes('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = isBreak 
      ? (sessions % settings.sessionsUntilLongBreak === 0 ? settings.longBreak : settings.shortBreak) * 60
      : settings.studyTime * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const manualSaveSession = async () => {
    if (!sessionStartTime) {
      toast.error('No active session to save');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to save sessions');
        return;
      }

      const now = new Date();
      const duration = Math.round((now.getTime() - sessionStartTime.getTime()) / (1000 * 60)); // Duration in minutes
      const goalProgress = Math.random() * 20 + 80; // Mock progress between 80-100%

      await axios.post(`${API_BASE_URL}/api/study-sessions`, {
        subject: currentSubject,
        duration: duration,
        sessionType: 'focus',
        notes: sessionNotes,
        goalProgress: goalProgress
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('Study session saved successfully!');
      setSessionStartTime(null);
      setSessionNotes('');
      setSessions(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save study session:', error);
      toast.error('Failed to save study session');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Study Timer
          </h1>
          <p className="text-xl text-gray-600">
            Use the Pomodoro technique to boost your productivity
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                {isBreak ? (
                  <Coffee className="w-8 h-8 text-orange-500 mr-3" />
                ) : (
                  <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
                )}
                <h2 className="text-2xl font-bold text-gray-900">
                  {isBreak ? 'Break Time' : 'Study Session'}
                </h2>
              </div>

              <div className="w-80 h-80 mx-auto mb-8">
                <CircularProgressbar
                  value={getProgress()}
                  text={formatTime(timeLeft)}
                  styles={buildStyles({
                    textSize: '16px',
                    pathColor: isBreak ? '#f97316' : '#2563eb',
                    textColor: '#1f2937',
                    trailColor: '#e5e7eb',
                    backgroundColor: '#ffffff',
                  })}
                />
              </div>

              <div className="flex justify-center space-x-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTimer}
                  className={`flex items-center px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg ${
                    isActive 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetTimer}
                  className="flex items-center px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </motion.button>

                {sessionStartTime && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={manualSaveSession}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Session
                  </motion.button>
                )}
              </div>

              {/* Subject and Notes */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Subject
                  </label>
                  <input
                    type="text"
                    value={currentSubject}
                    onChange={(e) => setCurrentSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What are you studying?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Notes (Optional)
                  </label>
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add notes about this study session..."
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats & Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Session Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed Sessions</span>
                  <span className="text-2xl font-bold text-blue-600">{sessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Study Time</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {Math.floor(sessions * settings.studyTime / 60)}h {(sessions * settings.studyTime) % 60}m
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((sessions / 8) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">Daily goal: 8 sessions</p>
              </div>
            </div>

            {/* Quick Settings */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <Settings className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Timer Settings</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Study Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.studyTime}
                    onChange={(e) => setSettings(prev => ({ ...prev, studyTime: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.shortBreak}
                    onChange={(e) => setSettings(prev => ({ ...prev, shortBreak: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.longBreak}
                    onChange={(e) => setSettings(prev => ({ ...prev, longBreak: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="60"
                  />
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Pomodoro Tips</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• Focus completely during study time</p>
                <p>• Take breaks seriously - they help retention</p>
                <p>• Track what you accomplish each session</p>
                <p>• Adjust timer settings to fit your needs</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}