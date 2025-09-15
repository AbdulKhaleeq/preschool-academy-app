import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon, 
  PlayIcon, 
  ChartBarIcon,
  ArrowRightIcon,
  PaintBrushIcon,
  MusicalNoteIcon,
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import wellingtonTheme from '../theme/wellingtonTheme';

const OnboardingSlides = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // ===== BACKUP: Previous light theme slides safely stored =====
  // (Original slides with light gradients are backed up - can be restored if needed)

  // NEW FEATURE-ALIGNED LIGHT THEMES - Preschool Academy Focus
  const slides = [
    {
      id: 'reports',
      title: '📊 DAILY REPORTS',
      subtitle: 'Stay Connected with Your Child\'s Day',
      description: 'Receive detailed daily reports about meals, naps, activities, and learning progress directly from teachers.',
      icon: ChartBarIcon,
      gradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', // Light blue gradient
      illustration: (
        <div className="relative w-56 h-56 mx-auto">
          {/* Report dashboard */}
          <motion.div
            animate={{ 
              scale: [1, 1.02, 1],
              rotateY: [0, 2, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-40 h-32 bg-white rounded-xl shadow-lg border border-blue-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <ChartBarIcon className="w-8 h-8 text-blue-600" />
                <div className="text-xs text-gray-500">Today's Report</div>
              </div>
              {/* Progress bars */}
              <div className="space-y-2">
                {[
                  { label: 'Activities', progress: 85, color: '#3b82f6' },
                  { label: 'Learning', progress: 92, color: '#10b981' },
                  { label: 'Social', progress: 78, color: '#f59e0b' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="w-12 text-xs text-gray-600">{item.label}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 2, delay: i * 0.3 }}
                        className="h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Floating notification badges */}
          {[
            { icon: '🍎', color: '#ef4444', position: { top: '15%', left: '15%' } },
            { icon: '😴', color: '#8b5cf6', position: { top: '20%', right: '20%' } },
            { icon: '🎨', color: '#f59e0b', position: { bottom: '25%', left: '10%' } },
            { icon: '📚', color: '#10b981', position: { bottom: '15%', right: '15%' } }
          ].map((badge, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -8, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.4
              }}
              className="absolute w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white text-sm"
              style={{
                backgroundColor: badge.color,
                ...badge.position
              }}
            >
              {badge.icon}
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'exams',
      title: '� TESTS & EXAMS',
      subtitle: 'Track Academic Progress',
      description: 'Monitor test scores, exam results, and academic milestones with detailed performance analytics.',
      icon: BookOpenIcon,
      gradient: 'linear-gradient(135deg, #fefce8 0%, #ecfdf5 100%)', // Light yellow to green gradient
      illustration: (
        <div className="relative w-56 h-56 mx-auto">
          {/* Test paper with results */}
          <motion.div
            animate={{ 
              rotate: [0, 1, -1, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-36 h-44 bg-white rounded-lg shadow-lg border border-yellow-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <BookOpenIcon className="w-6 h-6 text-green-600" />
                <div className="text-xs text-gray-500">Math Test</div>
              </div>
              
              {/* Test questions with checkmarks */}
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((num, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div className="flex-1 h-1 bg-gray-200 rounded"></div>
                  </motion.div>
                ))}
              </div>
              
              {/* Score badge */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="mt-3 bg-green-100 text-green-800 text-center py-1 rounded text-sm font-bold"
              >
                A+ 95%
              </motion.div>
            </div>
          </motion.div>
          
          {/* Grade stars */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                rotate: [0, 360],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="absolute w-8 h-8"
              style={{
                top: `${20 + (i * 15)}%`,
                left: `${15 + (i * 12)}%`
              }}
            >
              <div className="w-full h-full bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xs">⭐</span>
              </div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'activities',
      title: '🎨 ACTIVITIES',
      subtitle: 'Engaging Learning Experiences',
      description: 'Discover fun educational activities, creative projects, and interactive lessons tailored for your child.',
      icon: PlayIcon,
      gradient: 'linear-gradient(135deg, #fdf2f8 0%, #f0f9ff 100%)', // Light pink to blue gradient
      illustration: (
        <div className="relative w-56 h-56 mx-auto">
          {/* Creative art palette with flowing paint */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Main palette */}
            <div className="w-32 h-32 bg-white rounded-full shadow-xl border-4 border-pink-200 flex items-center justify-center">
              <PlayIcon className="w-12 h-12 text-pink-600" />
            </div>
          </motion.div>
          
          {/* Flowing paint drops in circular motion */}
          {[
            { color: '#ef4444', size: 'w-6 h-6' }, // Red
            { color: '#f59e0b', size: 'w-8 h-8' }, // Orange  
            { color: '#eab308', size: 'w-5 h-5' }, // Yellow
            { color: '#22c55e', size: 'w-7 h-7' }, // Green
            { color: '#3b82f6', size: 'w-6 h-6' }, // Blue
            { color: '#8b5cf6', size: 'w-9 h-9' }, // Purple
            { color: '#ec4899', size: 'w-5 h-5' }, // Pink
            { color: '#06b6d4', size: 'w-7 h-7' }  // Cyan
          ].map((paint, i) => (
            <motion.div
              key={i}
              animate={{
                rotate: [0, 360],
                scale: [0.8, 1.3, 0.8],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 6 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3
              }}
              className={`absolute ${paint.size} rounded-full shadow-lg`}
              style={{
                backgroundColor: paint.color,
                top: `${50 + 35 * Math.sin((i * Math.PI * 2) / 8)}%`,
                left: `${50 + 35 * Math.cos((i * Math.PI * 2) / 8)}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
          
          {/* Floating activity bubbles with different animations */}
          {[
            { icon: <PaintBrushIcon className="w-4 h-4 text-red-500" />, position: { top: '15%', left: '15%' }, animation: 'bounce' },
            { icon: <MusicalNoteIcon className="w-4 h-4 text-purple-500" />, position: { top: '15%', right: '15%' }, animation: 'float' },
            { icon: <BookOpenIcon className="w-4 h-4 text-green-500" />, position: { bottom: '15%', left: '15%' }, animation: 'pulse' },
            { icon: '⭐', position: { bottom: '15%', right: '15%' }, animation: 'spin' }
          ].map((item, i) => {
            const animations = {
              bounce: { y: [0, -15, 0], transition: { duration: 2, repeat: Infinity } },
              float: { y: [0, -8, 0], x: [0, 5, 0], transition: { duration: 3, repeat: Infinity } },
              pulse: { scale: [1, 1.2, 1], transition: { duration: 2.5, repeat: Infinity } },
              spin: { rotate: [0, 360], scale: [1, 1.1, 1], transition: { duration: 4, repeat: Infinity } }
            };
            
            return (
              <motion.div
                key={i}
                animate={animations[item.animation]}
                className={`absolute w-10 h-10 ${item.bg || 'bg-white'} rounded-full shadow-lg flex items-center justify-center border-2 ${item.border || 'border-pink-100'}`}
                style={item.position}
              >
                {item.icon}
              </motion.div>
            );
          })}
          
          {/* Creative sparkle trail */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeInOut"
              }}
              className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
              style={{
                top: `${30 + (i * 5)}%`,
                left: `${20 + (i * 6)}%`
              }}
            />
          ))}
        </div>
      )
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev === slides.length - 1) {
          // Reached the last slide, stop auto-playing
          setIsAutoPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 4000); // 4 seconds per slide

    return () => clearInterval(timer);
  }, [isAutoPlaying, slides.length]);

  const handleNext = () => {
    setIsAutoPlaying(false);
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleGetStarted = () => {
    onComplete();
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div 
      className="fixed inset-0 z-40 overflow-hidden"
      style={{ background: currentSlideData.gradient }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-24 h-24 rounded-full border-2 border-white animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-16 h-16 rounded-full border border-white animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full border border-white animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-8 py-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-md mx-auto"
            >
              {/* Illustration */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                {currentSlideData.illustration}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-2xl md:text-4xl font-bold mb-3"
                style={{ 
                  color: currentSlide === 0 ? '#2563eb' : // Blue for Daily Reports
                         currentSlide === 1 ? '#059669' : // Green for Tests & Exams  
                         '#db2777', // Pink for Activities
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                {currentSlideData.title}
              </motion.h1>

              {/* Subtitle */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-lg md:text-xl font-semibold mb-3"
                style={{ 
                  color: currentSlide === 0 ? '#1e40af' : // Darker blue for Daily Reports
                         currentSlide === 1 ? '#047857' : // Darker green for Tests & Exams
                         '#be185d', // Darker pink for Activities
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                {currentSlideData.subtitle}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-sm md:text-base opacity-90 leading-relaxed"
                style={{ 
                  color: '#64748b',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                {currentSlideData.description}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Section */}
        <div className="pb-8 px-8">
          {/* Progress Indicators */}
          <div className="flex justify-center space-x-3 mb-8">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentSlide(index);
                }}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: index === currentSlide 
                    ? '#3b82f6' 
                    : 'rgba(148, 163, 184, 0.4)'
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            {currentSlide < slides.length - 1 ? (
              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-all duration-300"
                style={{ 
                  backgroundColor: '#3b82f6',
                  color: '#ffffff'
                }}
              >
                <span>Next</span>
                <ArrowRightIcon className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-4 rounded-full font-bold text-lg shadow-lg transition-all duration-300"
                style={{ 
                  backgroundColor: '#3b82f6',
                  color: '#ffffff'
                }}
              >
                Get Started
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSlides;