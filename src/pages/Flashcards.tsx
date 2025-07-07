import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, RotateCcw, CheckCircle, X, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: Date;
  nextReview: Date;
  reviewCount: number;
  subject: string;
}

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [newCard, setNewCard] = useState({
    front: '',
    back: '',
    subject: '',
    difficulty: 'medium' as const
  });

  useEffect(() => {
    // Load flashcards from localStorage or API
    const savedCards = localStorage.getItem('flashcards');
    if (savedCards) {
      setFlashcards(JSON.parse(savedCards));
    } else {
      // Sample flashcards
      const sampleCards: Flashcard[] = [
        {
          id: '1',
          front: 'What is React?',
          back: 'A JavaScript library for building user interfaces, particularly web applications.',
          difficulty: 'medium',
          lastReviewed: new Date(),
          nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
          reviewCount: 0,
          subject: 'Computer Science'
        },
        {
          id: '2',
          front: 'Define Algorithm',
          back: 'A step-by-step procedure for solving a problem or completing a task.',
          difficulty: 'easy',
          lastReviewed: new Date(),
          nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
          reviewCount: 0,
          subject: 'Computer Science'
        }
      ];
      setFlashcards(sampleCards);
      localStorage.setItem('flashcards', JSON.stringify(sampleCards));
    }
  }, []);

  const createFlashcard = () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return;

    const flashcard: Flashcard = {
      id: Date.now().toString(),
      front: newCard.front,
      back: newCard.back,
      difficulty: newCard.difficulty,
      lastReviewed: new Date(),
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
      reviewCount: 0,
      subject: newCard.subject || 'General'
    };

    const updatedCards = [...flashcards, flashcard];
    setFlashcards(updatedCards);
    localStorage.setItem('flashcards', JSON.stringify(updatedCards));
    
    setNewCard({ front: '', back: '', subject: '', difficulty: 'medium' });
    setShowCreateForm(false);
  };

  const deleteFlashcard = (id: string) => {
    const updatedCards = flashcards.filter(card => card.id !== id);
    setFlashcards(updatedCards);
    localStorage.setItem('flashcards', JSON.stringify(updatedCards));
  };

  const startStudySession = () => {
    if (flashcards.length === 0) return;
    setCurrentCard(flashcards[0]);
    setStudyMode(true);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (!currentCard) return;
    
    const currentIndex = flashcards.findIndex(card => card.id === currentCard.id);
    const nextIndex = (currentIndex + 1) % flashcards.length;
    setCurrentCard(flashcards[nextIndex]);
    setIsFlipped(false);
  };

  const markDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!currentCard) return;

    const updatedCard = {
      ...currentCard,
      difficulty,
      lastReviewed: new Date(),
      reviewCount: currentCard.reviewCount + 1,
      nextReview: new Date(Date.now() + getDaysUntilNextReview(difficulty) * 24 * 60 * 60 * 1000)
    };

    const updatedCards = flashcards.map(card => 
      card.id === currentCard.id ? updatedCard : card
    );
    
    setFlashcards(updatedCards);
    localStorage.setItem('flashcards', JSON.stringify(updatedCards));
    nextCard();
  };

  const getDaysUntilNextReview = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 7;
      case 'medium': return 3;
      case 'hard': return 1;
      default: return 3;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (studyMode && currentCard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Study Session</h1>
            <button
              onClick={() => setStudyMode(false)}
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Exit Study Mode
            </button>
          </div>

          <div className="flex justify-center">
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, rotateY: 0 }}
              animate={{ opacity: 1, rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-full max-w-2xl h-96 cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ perspective: '1000px' }}
            >
              <div className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl bg-white border-2 border-gray-200 flex items-center justify-center p-8">
                <div className="text-center">
                  {!isFlipped ? (
                    <>
                      <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Question</h2>
                      <p className="text-xl text-gray-700">{currentCard.front}</p>
                      <p className="text-sm text-gray-500 mt-6">Click to reveal answer</p>
                    </>
                  ) : (
                    <div style={{ transform: 'rotateY(180deg)' }}>
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Answer</h2>
                      <p className="text-xl text-gray-700">{currentCard.back}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mt-8 space-x-4"
            >
              <button
                onClick={() => markDifficulty('hard')}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Hard
              </button>
              <button
                onClick={() => markDifficulty('medium')}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Medium
              </button>
              <button
                onClick={() => markDifficulty('easy')}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Easy
              </button>
            </motion.div>
          )}
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
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Flashcards</h1>
            <p className="text-xl text-gray-600">
              Master your subjects with spaced repetition learning
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Card
            </button>
            <button
              onClick={startStudySession}
              disabled={flashcards.length === 0}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Study Now
            </button>
          </div>
        </motion.div>

        {/* Create Form Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Flashcard</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={newCard.subject}
                      onChange={(e) => setNewCard(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question (Front)
                    </label>
                    <textarea
                      value={newCard.front}
                      onChange={(e) => setNewCard(prev => ({ ...prev, front: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter your question here..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer (Back)
                    </label>
                    <textarea
                      value={newCard.back}
                      onChange={(e) => setNewCard(prev => ({ ...prev, back: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter your answer here..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={newCard.difficulty}
                      onChange={(e) => setNewCard(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createFlashcard}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Card
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flashcards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(card.difficulty)}`}>
                  {card.difficulty.toUpperCase()}
                </span>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteFlashcard(card.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{card.subject}</h3>
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">{card.front}</p>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Reviewed {card.reviewCount} times</span>
                <span>Next: {new Date(card.nextReview).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {flashcards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No flashcards yet</h3>
            <p className="text-gray-600 mb-6">Create your first flashcard to start learning!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Card
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}