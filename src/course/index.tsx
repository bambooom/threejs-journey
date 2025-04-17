import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SharedCanvas from '../components/SharedCanvas';
import ThreeLogo from '../components/ThreeLogo';
import LessonIcon from '../components/LessonIcon';
import { courseStructure } from '../data/courseStructure';

const Page: FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 relative overflow-x-hidden">
      <SharedCanvas />

      {/* Header Section */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-8"
        >
          <ThreeLogo />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Three.js Journey
          </h1>
        </motion.div>

        {/* Course Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseStructure.map((chapter, chapterIndex) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: chapterIndex * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-4">{chapter.title}</h2>
              <div className="space-y-4">
                {chapter.lessons.map((lesson, lessonIndex) => (
                  <motion.div
                    key={lesson.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 rounded-md bg-white/10 hover:bg-white/20 transition-all duration-300"
                  >
                    <LessonIcon
                      lesson={lesson}
                      color={`hsl(${(chapterIndex * 30 + lessonIndex * 10) % 360}, 70%, 60%)`}
                      isHovered={false}
                    />
                    <span className="text-white/70 hover:text-white transition-colors duration-300">
                      {lesson.title}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Page;
