import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface ProfileForm {
  branch: string;
  domain: string;
}

const branches = {
  school: ['Elementary', 'Middle School', 'High School'],
  college: ['BTech', 'BSc', 'BA', 'BBA', 'BCom', 'MTech', 'MSc', 'MA', 'MBA', 'MCom'],
  professional: ['Software Development', 'Marketing', 'Finance', 'HR', 'Operations', 'Sales'],
  researcher: ['Computer Science', 'Engineering', 'Life Sciences', 'Physical Sciences', 'Social Sciences']
};

const domains = {
  BTech: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical'],
  BSc: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
  BA: ['English', 'History', 'Psychology', 'Sociology', 'Political Science'],
  BBA: ['Finance', 'Marketing', 'HR', 'Operations', 'International Business'],
  BCom: ['Accounting', 'Finance', 'Economics', 'Business Studies'],
  MTech: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical'],
  MSc: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
  MA: ['English', 'History', 'Psychology', 'Sociology', 'Political Science'],
  MBA: ['Finance', 'Marketing', 'HR', 'Operations', 'Strategy'],
  MCom: ['Accounting', 'Finance', 'Economics', 'Business Studies']
};

export default function ProfileSetup() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ProfileForm>();

  const selectedBranch = watch('branch');
  const availableBranches = branches[user?.category as keyof typeof branches] || [];
  const availableDomains = domains[selectedBranch as keyof typeof domains] || [];

  const onSubmit = async (data: ProfileForm) => {
    const success = await updateUser(data);
    if (success) {
      navigate('/target-setting');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Profile</h1>
          <p className="text-gray-600">
            Help us personalize your learning experience
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {user?.category === 'school' ? 'Grade Level' : 
               user?.category === 'college' ? 'Degree' :
               user?.category === 'professional' ? 'Field' : 'Research Area'}
            </label>
            <select
              {...register('branch', { required: 'This field is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select an option</option>
              {availableBranches.map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            {errors.branch && (
              <p className="mt-1 text-sm text-red-600">{errors.branch.message}</p>
            )}
          </div>

          {selectedBranch && availableDomains.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialization
              </label>
              <select
                {...register('domain', { required: 'This field is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select specialization</option>
                {availableDomains.map((domain) => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
              {errors.domain && (
                <p className="mt-1 text-sm text-red-600">{errors.domain.message}</p>
              )}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}