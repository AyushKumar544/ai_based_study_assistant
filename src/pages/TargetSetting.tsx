import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Clock, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TargetForm {
  currentGpa: number;
  expectedGpa: number;
  currentStudyHours: number;
  expectedStudyHours: number;
  currentSelfRating: number;
  expectedSelfRating: number;
}

export default function TargetSetting() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TargetForm>();

  const onSubmit = async (data: TargetForm) => {
    const success = await updateUser({ ...data, setupComplete: true });
    if (success) {
      navigate('/study-plan');
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
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4"
          >
            <Target className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Set Your Learning Goals</h1>
          <p className="text-gray-600">
            Define your current status and target achievements to get a personalized study plan
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* GPA Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl"
            >
              <div className="flex items-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Academic Performance</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current GPA/Grade (0-10)
                  </label>
                  <input
                    {...register('currentGpa', {
                      required: 'Current GPA is required',
                      min: { value: 0, message: 'GPA must be between 0 and 10' },
                      max: { value: 10, message: 'GPA must be between 0 and 10' }
                    })}
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., 7.5"
                  />
                  {errors.currentGpa && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentGpa.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target GPA/Grade (0-10)
                  </label>
                  <input
                    {...register('expectedGpa', {
                      required: 'Target GPA is required',
                      min: { value: 0, message: 'GPA must be between 0 and 10' },
                      max: { value: 10, message: 'GPA must be between 0 and 10' }
                    })}
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., 9.0"
                  />
                  {errors.expectedGpa && (
                    <p className="mt-1 text-sm text-red-600">{errors.expectedGpa.message}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Study Hours Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl"
            >
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Study Time</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Daily Study Hours
                  </label>
                  <input
                    {...register('currentStudyHours', {
                      required: 'Current study hours is required',
                      min: { value: 0, message: 'Hours must be positive' },
                      max: { value: 24, message: 'Hours cannot exceed 24' }
                    })}
                    type="number"
                    step="0.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="e.g., 4"
                  />
                  {errors.currentStudyHours && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentStudyHours.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Daily Study Hours
                  </label>
                  <input
                    {...register('expectedStudyHours', {
                      required: 'Target study hours is required',
                      min: { value: 0, message: 'Hours must be positive' },
                      max: { value: 24, message: 'Hours cannot exceed 24' }
                    })}
                    type="number"
                    step="0.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="e.g., 6"
                  />
                  {errors.expectedStudyHours && (
                    <p className="mt-1 text-sm text-red-600">{errors.expectedStudyHours.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Self Rating Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl"
          >
            <div className="flex items-center mb-4">
              <Star className="w-6 h-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Self Assessment</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Self Rating (1-10)
                </label>
                <input
                  {...register('currentSelfRating', {
                    required: 'Current self rating is required',
                    min: { value: 1, message: 'Rating must be between 1 and 10' },
                    max: { value: 10, message: 'Rating must be between 1 and 10' }
                  })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., 6"
                />
                {errors.currentSelfRating && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentSelfRating.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Self Rating (1-10)
                </label>
                <input
                  {...register('expectedSelfRating', {
                    required: 'Target self rating is required',
                    min: { value: 1, message: 'Rating must be between 1 and 10' },
                    max: { value: 10, message: 'Rating must be between 1 and 10' }
                  })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., 9"
                />
                {errors.expectedSelfRating && (
                  <p className="mt-1 text-sm text-red-600">{errors.expectedSelfRating.message}</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isSubmitting ? 'Generating Your Study Plan...' : 'Generate Personalized Study Plan'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}