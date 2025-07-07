import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Download, 
  Copy, 
  Zap,
  BookOpen,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';

interface SummaryResult {
  originalText: string;
  summary: string;
  keyPoints: string[];
  wordCount: {
    original: number;
    summary: number;
  };
  readingTime: {
    original: number;
    summary: number;
  };
}

const API_BASE_URL = 'http://localhost:3001';

export default function TextSummarizer() {
  const [inputText, setInputText] = useState('');
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [summaryType, setSummaryType] = useState<'extractive' | 'abstractive'>('abstractive');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
      toast.error('Please upload a text file (.txt)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  };

  const generateSummary = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to summarize');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Try to use AI service for summarization
      const response = await axios.post(`${API_BASE_URL}/api/ai/summarize`, {
        text: inputText,
        length: summaryLength,
        type: summaryType
      }, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      setSummaryResult(response.data);
    } catch (error) {
      console.error('AI summarization failed, using fallback:', error);
      // Fallback to mock summarization
      const mockSummary = generateMockSummary(inputText);
      setSummaryResult(mockSummary);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockSummary = (text: string): SummaryResult => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const wordCount = text.split(/\s+/).length;
    
    // Simple extractive summarization - take first few sentences
    let summaryLength;
    switch (summaryLength) {
      case 'short': summaryLength = Math.max(1, Math.floor(sentences.length * 0.25)); break;
      case 'medium': summaryLength = Math.max(1, Math.floor(sentences.length * 0.5)); break;
      case 'long': summaryLength = Math.max(1, Math.floor(sentences.length * 0.75)); break;
      default: summaryLength = Math.max(1, Math.floor(sentences.length * 0.5));
    }
    
    const summarySentences = sentences.slice(0, summaryLength);
    const summary = summarySentences.join('. ') + '.';
    
    // Extract key points (first sentence of each paragraph)
    const paragraphs = text.split(/\n\s*\n/);
    const keyPoints = paragraphs
      .map(p => p.split(/[.!?]/)[0].trim())
      .filter(point => point.length > 20)
      .slice(0, 5);

    const summaryWordCount = summary.split(/\s+/).length;
    
    return {
      originalText: text,
      summary,
      keyPoints,
      wordCount: {
        original: wordCount,
        summary: summaryWordCount
      },
      readingTime: {
        original: Math.ceil(wordCount / 200), // 200 words per minute
        summary: Math.ceil(summaryWordCount / 200)
      }
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadSummary = () => {
    if (!summaryResult) return;

    const content = `ORIGINAL TEXT:\n${summaryResult.originalText}\n\nSUMMARY:\n${summaryResult.summary}\n\nKEY POINTS:\n${summaryResult.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    a.click();
    URL.revokeObjectURL(url);
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
            <FileText className="w-12 h-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Text Summarizer</h1>
          </div>
          <p className="text-xl text-gray-600">
            AI-powered text summarization for efficient studying
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Input Text</h2>
              <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Paste your text here or upload a text file..."
            />

            <div className="mt-6 space-y-4">
              {/* Summary Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary Length
                  </label>
                  <select
                    value={summaryLength}
                    onChange={(e) => setSummaryLength(e.target.value as 'short' | 'medium' | 'long')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="short">Short (25%)</option>
                    <option value="medium">Medium (50%)</option>
                    <option value="long">Long (75%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary Type
                  </label>
                  <select
                    value={summaryType}
                    onChange={(e) => setSummaryType(e.target.value as 'extractive' | 'abstractive')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="extractive">Extractive</option>
                    <option value="abstractive">Abstractive</option>
                  </select>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateSummary}
                disabled={isLoading || !inputText.trim()}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Summary
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Summary</h2>
              {summaryResult && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(summaryResult.summary)}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </button>
                  <button
                    onClick={downloadSummary}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>
              )}
            </div>

            {summaryResult ? (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-blue-600">Original Words</p>
                    <p className="text-xl font-bold text-blue-900">{summaryResult.wordCount.original}</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-600">Summary Words</p>
                    <p className="text-xl font-bold text-green-900">{summaryResult.wordCount.summary}</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-purple-600">Time Saved</p>
                    <p className="text-xl font-bold text-purple-900">
                      {summaryResult.readingTime.original - summaryResult.readingTime.summary}m
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <CheckCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-orange-600">Compression</p>
                    <p className="text-xl font-bold text-orange-900">
                      {Math.round((1 - summaryResult.wordCount.summary / summaryResult.wordCount.original) * 100)}%
                    </p>
                  </div>
                </div>

                {/* Summary Text */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Generated Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{summaryResult.summary}</p>
                  </div>
                </div>

                {/* Key Points */}
                {summaryResult.keyPoints.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Points</h3>
                    <div className="space-y-2">
                      {summaryResult.keyPoints.map((point, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-gray-700">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Summary Yet</h3>
                <p className="text-gray-600">
                  Enter some text and click "Generate Summary" to get started
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Input Text</h3>
              <p className="text-gray-600">
                Paste your text or upload a document. Supports articles, research papers, and study materials.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Processing</h3>
              <p className="text-gray-600">
                Our AI analyzes the content and identifies the most important information and key concepts.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Summary</h3>
              <p className="text-gray-600">
                Receive a concise summary with key points, saving you time while retaining important information.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}