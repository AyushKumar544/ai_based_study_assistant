import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Music as MusicIcon,
  Headphones
} from 'lucide-react';
import Navbar from '../components/Navbar';

interface Track {
  id: string;
  title: string;
  artist: string;
  category: string;
  duration: number;
  url: string;
  description: string;
}

const focusTracks: Track[] = [
  {
    id: '1',
    title: 'Forest Rain',
    artist: 'Nature Sounds',
    category: 'Nature',
    duration: 3600,
    url: 'https://www.soundjay.com/misc/sounds/rain-01.wav',
    description: 'Gentle rain sounds for deep focus'
  },
  {
    id: '2',
    title: 'Ocean Waves',
    artist: 'Nature Sounds',
    category: 'Nature',
    duration: 3600,
    url: 'https://www.soundjay.com/misc/sounds/ocean-wave-1.wav',
    description: 'Calming ocean waves for concentration'
  },
  {
    id: '3',
    title: 'White Noise',
    artist: 'Focus Sounds',
    category: 'Ambient',
    duration: 3600,
    url: 'https://www.soundjay.com/misc/sounds/white-noise.wav',
    description: 'Pure white noise for blocking distractions'
  },
  {
    id: '4',
    title: 'Cafe Ambience',
    artist: 'Urban Sounds',
    category: 'Ambient',
    duration: 3600,
    url: 'https://www.soundjay.com/misc/sounds/cafe-ambience.wav',
    description: 'Coffee shop atmosphere for productivity'
  },
  {
    id: '5',
    title: 'Binaural Beats 40Hz',
    artist: 'Focus Frequencies',
    category: 'Binaural',
    duration: 1800,
    url: 'https://www.soundjay.com/misc/sounds/binaural-40hz.wav',
    description: 'Gamma waves for enhanced focus and alertness'
  },
  {
    id: '6',
    title: 'Piano Meditation',
    artist: 'Calm Music',
    category: 'Instrumental',
    duration: 2400,
    url: 'https://www.soundjay.com/misc/sounds/piano-meditation.wav',
    description: 'Soft piano melodies for relaxed studying'
  }
];

const categories = ['All', 'Nature', 'Ambient', 'Binaural', 'Instrumental'];

export default function Music() {
  const [tracks] = useState<Track[]>(focusTracks);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const filteredTracks = selectedCategory === 'All' 
    ? tracks 
    : tracks.filter(track => track.category === selectedCategory);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    
    // Since we can't actually load external audio files in this demo,
    // we'll simulate audio playback
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (!currentTrack) return;
    
    const currentIndex = filteredTracks.findIndex(track => track.id === currentTrack.id);
    let nextIndex;
    
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * filteredTracks.length);
    } else {
      nextIndex = (currentIndex + 1) % filteredTracks.length;
    }
    
    playTrack(filteredTracks[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentTrack) return;
    
    const currentIndex = filteredTracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? filteredTracks.length - 1 : currentIndex - 1;
    
    playTrack(filteredTracks[prevIndex]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Nature': return 'bg-green-100 text-green-800';
      case 'Ambient': return 'bg-blue-100 text-blue-800';
      case 'Binaural': return 'bg-purple-100 text-purple-800';
      case 'Instrumental': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <Headphones className="w-12 h-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Focus Music</h1>
          </div>
          <p className="text-xl text-gray-600">
            Enhance your concentration with curated focus sounds and music
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex space-x-2 bg-white rounded-lg p-2 shadow-lg">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Track List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Tracks</h2>
            
            <div className="space-y-4">
              {filteredTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    currentTrack?.id === track.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => playTrack(track)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <MusicIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{track.title}</h3>
                        <p className="text-sm text-gray-600">{track.artist}</p>
                        <p className="text-xs text-gray-500">{track.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(track.category)}`}>
                        {track.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTime(track.duration)}
                      </span>
                      {currentTrack?.id === track.id && isPlaying && (
                        <div className="flex space-x-1">
                          <div className="w-1 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                          <div className="w-1 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Player */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            {/* Now Playing */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Now Playing</h3>
              
              {currentTrack ? (
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <MusicIcon className="w-16 h-16 text-white" />
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-1">{currentTrack.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{currentTrack.artist}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(currentTime / currentTrack.duration) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(currentTrack.duration)}</span>
                    </div>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <button
                      onClick={() => setIsShuffle(!isShuffle)}
                      className={`p-2 rounded-full transition-colors ${
                        isShuffle ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={playPrevious}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={togglePlayPause}
                      className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    
                    <button
                      onClick={playNext}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => setIsRepeat(!isRepeat)}
                      className={`p-2 rounded-full transition-colors ${
                        isRepeat ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Repeat className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Volume */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        setIsMuted(false);
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MusicIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a track to start playing</p>
                </div>
              )}
            </div>

            {/* Study Tips */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Focus Tips</h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Nature sounds help reduce stress and improve concentration</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Binaural beats can enhance cognitive performance</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Keep volume at 50-60% for optimal focus</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Use instrumental music to avoid lyrical distractions</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hidden audio element for future implementation */}
        <audio ref={audioRef} preload="none" />
      </div>
    </div>
  );
}