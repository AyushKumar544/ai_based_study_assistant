import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  Send, 
  History, 
  BookOpen, 
  Lightbulb,
  CheckCircle,
  Clock,
  Search
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { doubtService } from '../services/doubtService';
import toast from 'react-hot-toast';

interface Doubt {
  id: string;
  question: string;
  subject: string;
  status: 'pending' | 'solved' | 'archived';
  created_at: string;
}

interface DoubtSolution {
  explanation: string;
  steps: string[];
  concepts: string[];
  examples: string[];
  tips: string;
  relatedTopics: string[];
  difficulty: string;
  subject: string;
}


export default function DoubtSolver() {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<DoubtSolution | null>(null);
  const [doubtsHistory, setDoubtsHistory] = useState<Doubt[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchDoubtsHistory();
  }, []);

  const fetchDoubtsHistory = async () => {
    try {
      console.log('🔍 Fetching doubts history...');
      const doubts = await doubtService.getDoubtHistory();
      
      console.log('✅ Doubts history fetched:', doubts);
      setDoubtsHistory(doubts || []);
    } catch (error: any) {
      console.error('❌ Failed to fetch doubts history:', error);
      toast.error('Failed to load history');
    }
  };

  const askDoubt = async () => {
    if (!question.trim()) {
      toast.error('Please enter your question');
      return;
    }

    setIsLoading(true);
    setSolution(null);

    try {
      console.log('🤔 Asking doubt:', { question, subject, context });
      
      const doubt = await doubtService.askDoubt(question, subject || 'General', context);

      console.log('✅ Doubt solution received:', doubt);
      setSolution(doubt.solution);
      setQuestion('');
      setContext('');
      fetchDoubtsHistory();
      toast.success('Your doubt has been solved!');
    } catch (error: any) {
      console.error('❌ Failed to solve doubt:', error);
      toast.error('Failed to solve doubt');
    } finally {
      setIsLoading(false);
    }
  };

  const viewDoubtSolution = async (doubtId: string) => {
    try {
      const doubt = await doubtService.getDoubtById(doubtId);
      
      setSolution(doubt.solution);
      setShowHistory(false);
    } catch (error: any) {
      console.error('❌ Failed to load doubt solution:', error);
      toast.error('Failed to load doubt solution');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">AI Doubt Solver</h1>
          </div>
          <p className="text-xl text-gray-600">
            Get instant, detailed solutions to your academic questions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Question Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Ask Your Question</h2>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mathematics, Physics, Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Question
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe your question in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Context (Optional)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Provide any additional context, formulas, or background information..."
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={askDoubt}
                disabled={isLoading || !question.trim()}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Solving...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Get Solution
                  </>
                )}
              </motion.button>
            </div>

            {/* Solution Display */}
            {solution && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="text-xl font-bold text-green-900">Solution</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Explanation:</h4>
                    <p className="text-gray-700 leading-relaxed">{solution.explanation}</p>
                  </div>

                  {solution.steps && solution.steps.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Step-by-Step Solution:</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        {solution.steps.map((step, index) => (
                          <li key={index} className="text-gray-700">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {solution.concepts && solution.concepts.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Key Concepts:</h4>
                      <div className="flex flex-wrap gap-2">
                        {solution.concepts.map((concept, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {solution.examples && solution.examples.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {solution.examples.map((example, index) => (
                          <li key={index} className="text-gray-700">{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {solution.tips && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tips:</h4>
                      <div className="flex items-start">
                        <Lightbulb className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{solution.tips}</p>
                      </div>
                    </div>
                  )}

                  {solution.relatedTopics && solution.relatedTopics.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Related Topics:</h4>
                      <div className="flex flex-wrap gap-2">
                        {solution.relatedTopics.map((topic, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Quick Tips */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Tips for Better Results</h3>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Be specific and clear in your question</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Include relevant formulas or equations</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Mention the subject for better context</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Provide any attempted solutions</p>
                </div>
              </div>
            </div>

            {/* Recent Doubts */}
            {showHistory && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <History className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Doubts</h3>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {doubtsHistory.length > 0 ? (
                    doubtsHistory.map((doubt) => (
                      <div
                        key={doubt.id}
                        onClick={() => viewDoubtSolution(doubt.id)}
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-blue-600 font-medium">{doubt.subject}</span>
                          <div className="flex items-center">
                            {doubt.status === 'solved' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-yellow-600" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{doubt.question}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(doubt.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No doubts yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Popular Subjects */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Subjects</h3>
              
              <div className="grid grid-cols-2 gap-2">
                {['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Biology', 'English'].map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSubject(subj)}
                    className="p-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}