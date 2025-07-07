import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  Plus,
  BookOpen,
  Target,
  Award,
  Search,
  Filter,
  Globe,
  Edit,
  Trash2,
  Download,
  Upload,
  Zap,
  Brain
} from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  topic?: string;
}

interface Test {
  id: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  questions: Question[];
  difficulty: 'easy' | 'medium' | 'hard';
  isCustom: boolean;
  createdBy?: string;
  tags?: string[];
}

interface TestResult {
  testId: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  answers: { [questionId: string]: number };
  completedAt: Date;
}

// Available subjects for test generation
const subjects = [
  'Computer Science',
  'Electronics & Communication Engineering (ECE)',
  'Information Technology (IT)',
  'Biomedical Engineering (BME)',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'General Knowledge',
  'Aptitude & Reasoning'
];

// Topic suggestions for each subject
const topicsBySubject: { [key: string]: string[] } = {
  'Computer Science': ['Data Structures', 'Algorithms', 'Programming', 'Database Systems', 'Operating Systems', 'Computer Networks', 'Software Engineering'],
  'Electronics & Communication Engineering (ECE)': ['Digital Electronics', 'Analog Electronics', 'Signal Processing', 'Communication Systems', 'Microprocessors', 'VLSI Design'],
  'Information Technology (IT)': ['Web Development', 'Database Management', 'Network Security', 'Cloud Computing', 'Mobile Development', 'System Administration'],
  'Mathematics': ['Calculus', 'Linear Algebra', 'Statistics', 'Probability', 'Discrete Mathematics', 'Number Theory'],
  'Physics': ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Quantum Physics', 'Optics', 'Modern Physics'],
  'Chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry'],
  'Biology': ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Molecular Biology', 'Physiology']
};

// Sample question templates for different subjects
const questionTemplates: { [key: string]: any[] } = {
  'Computer Science': [
    {
      template: "What is the time complexity of {algorithm} in the worst case?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
      variables: { algorithm: ["binary search", "merge sort", "quick sort", "bubble sort"] }
    },
    {
      template: "Which data structure is best suited for {operation}?",
      options: ["Array", "Linked List", "Stack", "Queue"],
      variables: { operation: ["LIFO operations", "FIFO operations", "random access", "sequential access"] }
    }
  ],
  'Mathematics': [
    {
      template: "What is the derivative of {function}?",
      options: ["2x", "x²", "1", "0"],
      variables: { function: ["x²", "sin(x)", "cos(x)", "ln(x)"] }
    }
  ],
  'Physics': [
    {
      template: "What is the unit of {quantity}?",
      options: ["Newton", "Joule", "Watt", "Pascal"],
      variables: { quantity: ["force", "energy", "power", "pressure"] }
    }
  ]
};

// Sample tests with different subjects
const sampleTests: Test[] = [
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    subject: 'Computer Science',
    duration: 30,
    difficulty: 'medium',
    isCustom: false,
    tags: ['programming', 'web-development'],
    questions: [
      {
        id: '1',
        question: 'What is the correct way to declare a variable in JavaScript?',
        options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
        correctAnswer: 0,
        explanation: 'In JavaScript, variables are declared using var, let, or const keywords.',
        difficulty: 'easy',
        subject: 'Computer Science',
        topic: 'Variables'
      },
      {
        id: '2',
        question: 'Which method is used to add an element to the end of an array?',
        options: ['push()', 'add()', 'append()', 'insert()'],
        correctAnswer: 0,
        explanation: 'The push() method adds one or more elements to the end of an array.',
        difficulty: 'medium',
        subject: 'Computer Science',
        topic: 'Arrays'
      }
    ]
  },
  {
    id: '2',
    title: 'Digital Electronics Basics',
    subject: 'Electronics & Communication Engineering (ECE)',
    duration: 45,
    difficulty: 'medium',
    isCustom: false,
    tags: ['digital-circuits', 'logic-gates'],
    questions: [
      {
        id: '3',
        question: 'What is the output of an AND gate when both inputs are 1?',
        options: ['0', '1', 'Undefined', 'High Impedance'],
        correctAnswer: 1,
        explanation: 'An AND gate outputs 1 only when both inputs are 1.',
        difficulty: 'easy',
        subject: 'Electronics & Communication Engineering (ECE)',
        topic: 'Logic Gates'
      }
    ]
  }
];

export default function MockTests() {
  const [tests, setTests] = useState<Test[]>(sampleTests);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generatingTest, setGeneratingTest] = useState(false);

  // Form states
  const [generateForm, setGenerateForm] = useState({
    subject: '',
    topic: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    questionCount: 10,
    duration: 30
  });

  const [newTest, setNewTest] = useState({
    title: '',
    subject: '',
    duration: 30,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    tags: ''
  });

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    topic: ''
  });

  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (testStarted && timeLeft > 0 && !testCompleted) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            completeTest();
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [testStarted, timeLeft, testCompleted]);

  const generateQuestionFromTemplate = (subject: string, topic: string, difficulty: 'easy' | 'medium' | 'hard', index: number): Question => {
    const templates = questionTemplates[subject] || [];
    
    if (templates.length > 0) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      let question = template.template;
      
      // Replace variables in template
      if (template.variables) {
        Object.keys(template.variables).forEach(variable => {
          const options = template.variables[variable];
          const randomOption = options[Math.floor(Math.random() * options.length)];
          question = question.replace(`{${variable}}`, randomOption);
        });
      }
      
      return {
        id: `gen_${Date.now()}_${index}`,
        question,
        options: [...template.options],
        correctAnswer: Math.floor(Math.random() * template.options.length),
        explanation: `This question tests your understanding of ${topic} in ${subject}. The correct answer demonstrates fundamental concepts in this area.`,
        difficulty,
        subject,
        topic
      };
    }
    
    // Fallback generic question
    return {
      id: `gen_${Date.now()}_${index}`,
      question: `Which of the following is a key concept in ${topic}?`,
      options: [
        `Primary concept of ${topic}`,
        `Secondary aspect of ${topic}`,
        `Related but different concept`,
        `Unrelated option`
      ],
      correctAnswer: 0,
      explanation: `This question tests your understanding of fundamental concepts in ${topic}. Understanding these basics is crucial for mastering ${subject}.`,
      difficulty,
      subject,
      topic
    };
  };

  const generateTestFromInternet = async () => {
    if (!generateForm.subject) {
      toast.error('Please select a subject first!');
      return;
    }

    if (generateForm.questionCount < 5 || generateForm.questionCount > 50) {
      toast.error('Please select between 5 and 50 questions');
      return;
    }

    setGeneratingTest(true);
    
    try {
      // Show progress toast
      toast.loading('🤖 Generating questions from internet sources...', { id: 'generating' });
      
      // Simulate realistic API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const generatedQuestions: Question[] = [];
      const topicToUse = generateForm.topic || 'General';
      
      for (let i = 0; i < generateForm.questionCount; i++) {
        const question = generateQuestionFromTemplate(
          generateForm.subject,
          topicToUse,
          generateForm.difficulty,
          i
        );
        generatedQuestions.push(question);
      }

      const generatedTest: Test = {
        id: `generated_${Date.now()}`,
        title: `${generateForm.subject}${generateForm.topic ? ` - ${generateForm.topic}` : ''} Test`,
        subject: generateForm.subject,
        duration: generateForm.duration,
        difficulty: generateForm.difficulty,
        isCustom: false,
        questions: generatedQuestions,
        tags: ['ai-generated', 'internet-sourced', generateForm.difficulty]
      };

      setTests(prev => [generatedTest, ...prev]);
      setShowGenerateForm(false);
      
      // Reset form
      setGenerateForm({
        subject: '',
        topic: '',
        difficulty: 'medium',
        questionCount: 10,
        duration: 30
      });
      
      toast.success(`✅ Successfully generated ${generateForm.questionCount} questions for ${generateForm.subject}!`, { id: 'generating' });
      
      // Auto-scroll to the new test
      setTimeout(() => {
        const element = document.getElementById('tests-grid');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
      
    } catch (error) {
      toast.error('Failed to generate test. Please try again.', { id: 'generating' });
      console.error('Test generation error:', error);
    } finally {
      setGeneratingTest(false);
    }
  };

  const startTest = (test: Test) => {
    setCurrentTest(test);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(test.duration * 60);
    setTestStarted(true);
    setTestCompleted(false);
    setShowResults(false);
  };

  const selectAnswer = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (currentTest && currentQuestionIndex < currentTest.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeTest();
    }
  };

  const completeTest = () => {
    if (!currentTest) return;

    const score = currentTest.questions.reduce((acc, question) => {
      return acc + (answers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);

    const result: TestResult = {
      testId: currentTest.id,
      score,
      totalQuestions: currentTest.questions.length,
      timeTaken: (currentTest.duration * 60) - timeLeft,
      answers,
      completedAt: new Date()
    };

    setResults(prev => [...prev, result]);
    setTestCompleted(true);
    setTestStarted(false);
    setShowResults(true);
  };

  const addCustomQuestion = () => {
    if (!newQuestion.question.trim() || newQuestion.options.some(opt => !opt.trim())) {
      toast.error('Please fill in all question fields');
      return;
    }

    const question: Question = {
      id: `custom_${Date.now()}`,
      question: newQuestion.question,
      options: [...newQuestion.options],
      correctAnswer: newQuestion.correctAnswer,
      explanation: newQuestion.explanation,
      difficulty: newQuestion.difficulty,
      subject: newTest.subject,
      topic: newQuestion.topic
    };

    setCustomQuestions(prev => [...prev, question]);
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'medium',
      topic: ''
    });
    
    toast.success('Question added to custom test!');
  };

  const createCustomTest = () => {
    if (!newTest.title.trim() || !newTest.subject || customQuestions.length === 0) {
      toast.error('Please fill in test details and add at least one question');
      return;
    }

    const test: Test = {
      id: `custom_${Date.now()}`,
      title: newTest.title,
      subject: newTest.subject,
      duration: newTest.duration,
      difficulty: newTest.difficulty,
      isCustom: true,
      questions: [...customQuestions],
      tags: newTest.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdBy: 'You'
    };

    setTests(prev => [test, ...prev]);
    setShowCreateForm(false);
    setCustomQuestions([]);
    setNewTest({
      title: '',
      subject: '',
      duration: 30,
      difficulty: 'medium',
      tags: ''
    });
    
    toast.success('Custom test created successfully!');
  };

  const deleteTest = (testId: string) => {
    setTests(prev => prev.filter(test => test.id !== testId));
    toast.success('Test deleted successfully');
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || test.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Test Taking Interface
  if (testStarted && currentTest && !testCompleted) {
    const currentQuestion = currentTest.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentTest.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Test Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{currentTest.title}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-red-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                Question {currentQuestionIndex + 1} of {currentTest.questions.length}
              </span>
              <div className="w-64 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question */}
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectAnswer(currentQuestion.id, index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    answers[currentQuestion.id] === index
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="font-medium mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </motion.button>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <button
                onClick={nextQuestion}
                disabled={answers[currentQuestion.id] === undefined}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestionIndex === currentTest.questions.length - 1 ? 'Finish Test' : 'Next Question'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Results Interface
  if (showResults && currentTest) {
    const latestResult = results[results.length - 1];
    const percentage = (latestResult.score / latestResult.totalQuestions) * 100;

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <div className="mb-6">
              <Award className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h1>
              <p className="text-xl text-gray-600">{currentTest.title}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Score</h3>
                <p className={`text-3xl font-bold ${getScoreColor(latestResult.score, latestResult.totalQuestions)}`}>
                  {latestResult.score}/{latestResult.totalQuestions}
                </p>
                <p className="text-sm text-blue-700">{percentage.toFixed(1)}%</p>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Time Taken</h3>
                <p className="text-3xl font-bold text-green-600">
                  {formatTime(latestResult.timeTaken)}
                </p>
                <p className="text-sm text-green-700">
                  of {currentTest.duration} minutes
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Performance</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Needs Work'}
                </p>
                <p className="text-sm text-purple-700">Keep practicing!</p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowResults(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Tests
              </button>
              <button
                onClick={() => startTest(currentTest)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retake Test
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main Tests List
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mock Tests</h1>
            <p className="text-xl text-gray-600">
              Practice with AI-generated tests from internet sources and create custom tests
            </p>
          </div>
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGenerateForm(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              <Globe className="w-5 h-5 mr-2" />
              Generate from Internet
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Custom Test
            </motion.button>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search tests by title or subject..."
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[250px]"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Generate Test Form */}
        <AnimatePresence>
          {showGenerateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center mb-6">
                  <Brain className="w-8 h-8 text-green-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Generate Test from Internet</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm">
                      🤖 Our AI will generate questions from various internet sources based on your selected subject and preferences.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        value={generateForm.subject}
                        onChange={(e) => {
                          setGenerateForm(prev => ({ ...prev, subject: e.target.value, topic: '' }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Topic (Optional)
                      </label>
                      <select
                        value={generateForm.topic}
                        onChange={(e) => setGenerateForm(prev => ({ ...prev, topic: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!generateForm.subject}
                      >
                        <option value="">Any Topic</option>
                        {generateForm.subject && topicsBySubject[generateForm.subject]?.map(topic => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={generateForm.difficulty}
                        onChange={(e) => setGenerateForm(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Questions
                      </label>
                      <input
                        type="number"
                        value={generateForm.questionCount}
                        onChange={(e) => setGenerateForm(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 10 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="5"
                        max="50"
                        placeholder="10"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={generateForm.duration}
                        onChange={(e) => setGenerateForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="10"
                        max="180"
                        placeholder="30"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Preview:</h4>
                    <p className="text-blue-800 text-sm">
                      {generateForm.subject ? (
                        <>
                          Generating <strong>{generateForm.questionCount}</strong> {generateForm.difficulty} questions 
                          for <strong>{generateForm.subject}</strong>
                          {generateForm.topic && <> focusing on <strong>{generateForm.topic}</strong></>}
                          <br />
                          Test duration: <strong>{generateForm.duration} minutes</strong>
                        </>
                      ) : (
                        'Please select a subject to see the preview'
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    onClick={() => setShowGenerateForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateTestFromInternet}
                    disabled={generatingTest || !generateForm.subject}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {generatingTest ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2 inline-block" />
                        Generate Test
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Custom Test Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Custom Test</h2>
                
                {/* Test Details */}
                <div className="space-y-4 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Title *
                      </label>
                      <input
                        type="text"
                        value={newTest.title}
                        onChange={(e) => setNewTest(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter test title..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        value={newTest.subject}
                        onChange={(e) => setNewTest(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={newTest.duration}
                        onChange={(e) => setNewTest(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="10"
                        max="180"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty
                      </label>
                      <select
                        value={newTest.difficulty}
                        onChange={(e) => setNewTest(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <input
                        type="text"
                        value={newTest.tags}
                        onChange={(e) => setNewTest(prev => ({ ...prev, tags: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </div>
                </div>

                {/* Add Question Section */}
                <div className="border-t pt-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Questions</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question *
                      </label>
                      <textarea
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter your question..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {newQuestion.options.map((option, index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Option {String.fromCharCode(65 + index)} *
                          </label>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options];
                              newOptions[index] = e.target.value;
                              setNewQuestion(prev => ({ ...prev, options: newOptions }));
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correct Answer
                        </label>
                        <select
                          value={newQuestion.correctAnswer}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, correctAnswer: parseInt(e.target.value) }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {newQuestion.options.map((_, index) => (
                            <option key={index} value={index}>
                              Option {String.fromCharCode(65 + index)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Difficulty
                        </label>
                        <select
                          value={newQuestion.difficulty}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Topic
                        </label>
                        <input
                          type="text"
                          value={newQuestion.topic}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, topic: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Question topic"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Explanation
                      </label>
                      <textarea
                        value={newQuestion.explanation}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        placeholder="Explain the correct answer..."
                      />
                    </div>
                    
                    <button
                      onClick={addCustomQuestion}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add Question ({customQuestions.length} added)
                    </button>
                  </div>
                </div>

                {/* Added Questions List */}
                {customQuestions.length > 0 && (
                  <div className="border-t pt-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Added Questions ({customQuestions.length})</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {customQuestions.map((question, index) => (
                        <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">
                            {index + 1}. {question.question.substring(0, 50)}...
                          </span>
                          <button
                            onClick={() => setCustomQuestions(prev => prev.filter(q => q.id !== question.id))}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setCustomQuestions([]);
                      setNewTest({
                        title: '',
                        subject: '',
                        duration: 30,
                        difficulty: 'medium',
                        tags: ''
                      });
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createCustomTest}
                    disabled={!newTest.title || !newTest.subject || customQuestions.length === 0}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Test
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Results */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Recent Results</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.slice(-3).map((result, index) => {
                const test = tests.find(t => t.id === result.testId);
                const percentage = (result.score / result.totalQuestions) * 100;
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{test?.title}</h3>
                    <p className={`text-2xl font-bold ${getScoreColor(result.score, result.totalQuestions)}`}>
                      {percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {result.completedAt.toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Available Tests */}
        <div id="tests-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{test.title}</h3>
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(test.difficulty)}`}>
                    {test.difficulty.toUpperCase()}
                  </span>
                  {test.isCustom && (
                    <button
                      onClick={() => deleteTest(test.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="text-sm">{test.subject}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">{test.duration} minutes</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Target className="w-4 h-4 mr-2" />
                  <span className="text-sm">{test.questions.length} questions</span>
                </div>
                {test.isCustom && (
                  <div className="flex items-center text-blue-600">
                    <Edit className="w-4 h-4 mr-2" />
                    <span className="text-sm">Custom Test</span>
                  </div>
                )}
              </div>

              {test.tags && test.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {test.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {test.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{test.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startTest(test)}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Test
              </motion.button>
            </motion.div>
          ))}
        </div>

        {filteredTests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tests found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedSubject 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first test or generate one from the internet!'
              }
            </p>
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGenerateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
              >
                <Globe className="w-5 h-5 mr-2 inline-block" />
                Generate from Internet
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2 inline-block" />
                Create Custom Test
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}