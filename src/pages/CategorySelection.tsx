import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Briefcase, Microscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const categories = [
  {
    id: 'school',
    title: 'School Student',
    description: 'Elementary to High School students',
    icon: BookOpen,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600'
  },
  {
    id: 'college',
    title: 'College Student',
    description: 'Undergraduate and Graduate students',
    icon: GraduationCap,
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600'
  },
  {
    id: 'professional',
    title: 'Working Professional',
    description: 'Career development and skill enhancement',
    icon: Briefcase,
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600'
  },
  {
    id: 'researcher',
    title: 'Research Scholar',
    description: 'PhD and Research-focused learning',
    icon: Microscope,
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600'
  }
];

export default function CategorySelection() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const handleCategorySelect = async (category: string) => {
    const success = await updateUser({ category });
    if (success) {
      navigate('/profile-setup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Category</h1>
          <p className="text-xl text-gray-600">
            Select the category that best describes your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategorySelect(category.id)}
              className={`${category.color} ${category.hoverColor} text-white p-8 rounded-xl shadow-lg transition-all duration-300 text-left group`}
            >
              <div className="flex items-center mb-4">
                <category.icon className="w-12 h-12 mr-4" />
                <div>
                  <h3 className="text-2xl font-bold">{category.title}</h3>
                  <p className="text-white/80 mt-1">{category.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Click to select</span>
                <div className="w-8 h-8 rounded-full border-2 border-white/30 group-hover:border-white/60 transition-colors" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}