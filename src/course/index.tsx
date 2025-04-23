import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BackgroundCanvas from '../components/BackgroundCanvas';
// import IconCanvas from '../components/IconCanvas';
import ThreeLogo from '../components/ThreeLogo';
import ChapterSection from '../components/ChapterSection';
import { courseStructure } from '../data/courseStructure';

const Page: FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen text-white p-6 md:p-10 relative overflow-x-hidden">
      {/* 3D Background Canvas */}
      <BackgroundCanvas />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <header className="mb-16 pt-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Three.js Logo */}
            <div className="w-20 h-20 relative">
              <ThreeLogo />
            </div>

            {/* Title and Description */}
            <div>
              <motion.h1
                className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Three.js Journey
              </motion.h1>
              <motion.p
                className="text-white/70 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                A showcase of projects from the Three.js Journey course. Explore
                different chapters and lessons to see what you can create with
                Three.js.
              </motion.p>
            </div>
          </div>

          {/* Animated Divider */}
          <motion.div
            className="mt-8 h-[1px] bg-gradient-to-r from-blue-500 to-transparent"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </header>

        {/* <IconCanvas> */}
          {/* Course Structure */}
          {courseStructure.map((chapter, index) => (
            <ChapterSection key={chapter.id} chapter={chapter} index={index} />
          ))}
        {/* </IconCanvas> */}
      </div>
    </main>
  );
};

export default Page;
