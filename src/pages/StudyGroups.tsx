import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  MessageCircle, 
  Calendar, 
  BookOpen,
  Crown,
  UserPlus,
  Search,
  Filter
} from 'lucide-react';
import Navbar from '../components/Navbar';

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  members: number;
  maxMembers: number;
  isPrivate: boolean;
  admin: string;
  tags: string[];
  createdAt: Date;
  nextSession?: Date;
}

const sampleGroups: StudyGroup[] = [
  {
    id: '1',
    name: 'JavaScript Mastery',
    subject: 'Computer Science',
    description: 'Learn JavaScript from basics to advanced concepts. Weekly coding sessions and project discussions.',
    members: 12,
    maxMembers: 20,
    isPrivate: false,
    admin: 'Sarah Chen',
    tags: ['javascript', 'programming', 'web-development'],
    createdAt: new Date('2024-01-15'),
    nextSession: new Date('2024-01-25T18:00:00')
  },
  {
    id: '2',
    name: 'Calculus Study Circle',
    subject: 'Mathematics',
    description: 'Collaborative learning for calculus concepts. Problem-solving sessions and exam preparation.',
    members: 8,
    maxMembers: 15,
    isPrivate: false,
    admin: 'Mike Johnson',
    tags: ['calculus', 'mathematics', 'problem-solving'],
    createdAt: new Date('2024-01-10'),
    nextSession: new Date('2024-01-24T16:00:00')
  },
  {
    id: '3',
    name: 'Physics Lab Partners',
    subject: 'Physics',
    description: 'Virtual lab discussions and physics problem solving. Share experiments and insights.',
    members: 6,
    maxMembers: 10,
    isPrivate: true,
    admin: 'Emma Davis',
    tags: ['physics', 'laboratory', 'experiments'],
    createdAt: new Date('2024-01-20')
  }
];

export default function StudyGroups() {
  const [groups, setGroups] = useState<StudyGroup[]>(sampleGroups);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    subject: '',
    description: '',
    maxMembers: 10,
    isPrivate: false,
    tags: ''
  });

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = !selectedSubject || group.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = Array.from(new Set(groups.map(group => group.subject)));

  const joinGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId && group.members < group.maxMembers
        ? { ...group, members: group.members + 1 }
        : group
    ));
  };

  const createGroup = () => {
    if (!newGroup.name.trim() || !newGroup.description.trim()) return;

    const group: StudyGroup = {
      id: Date.now().toString(),
      name: newGroup.name,
      subject: newGroup.subject || 'General',
      description: newGroup.description,
      members: 1,
      maxMembers: newGroup.maxMembers,
      isPrivate: newGroup.isPrivate,
      admin: 'You',
      tags: newGroup.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date()
    };

    setGroups(prev => [...prev, group]);
    setNewGroup({
      name: '',
      subject: '',
      description: '',
      maxMembers: 10,
      isPrivate: false,
      tags: ''
    });
    setShowCreateForm(false);
  };

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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Study Groups</h1>
            <p className="text-xl text-gray-600">
              Join collaborative learning communities and study together
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Group
          </button>
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
              placeholder="Search groups, topics, or tags..."
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Create Group Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Study Group</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter group name..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={newGroup.subject}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Computer Science"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe your study group..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Members
                </label>
                <input
                  type="number"
                  value={newGroup.maxMembers}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="2"
                  max="50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newGroup.tags}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., javascript, programming"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newGroup.isPrivate}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Make this group private</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createGroup}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Group
              </button>
            </div>
          </motion.div>
        )}

        {/* Study Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{group.name}</h3>
                {group.isPrivate && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    Private
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="text-sm">{group.subject}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-sm">{group.members}/{group.maxMembers} members</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Crown className="w-4 h-4 mr-2" />
                  <span className="text-sm">Admin: {group.admin}</span>
                </div>

                {group.nextSession && (
                  <div className="flex items-center text-green-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Next: {group.nextSession.toLocaleDateString()} at {group.nextSession.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-gray-700 text-sm mb-4 line-clamp-3">{group.description}</p>

              {group.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {group.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => joinGroup(group.id)}
                  disabled={group.members >= group.maxMembers}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {group.members >= group.maxMembers ? 'Full' : 'Join'}
                </button>
                
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || selectedSubject ? 'No groups found' : 'No study groups yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedSubject 
                ? 'Try adjusting your search or filter criteria'
                : 'Create the first study group and start collaborating!'
              }
            </p>
            {!searchTerm && !selectedSubject && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Group
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}