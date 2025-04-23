import { FC } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LessonIcon from './LessonIcon';
import { Chapter } from '../types';

const chapterColors = [
  '#4e54c8', // 第一章: 偏紫色蓝
  '#00b894', // 第二章: 薄荷绿
  '#e84393', // 第三章: 粉色
  '#f39c12', // 第四章: 橙色
];

interface ChapterSectionProps {
  chapter: Chapter;
  index: number;
}

const ChapterSection: FC<ChapterSectionProps> = ({ chapter, index }) => {
  const chapterColor = chapterColors[index % chapterColors.length];

  return (
    <section id={`chapter-${index}`} className="mb-16 relative font-dm-mono">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-3 h-12 rounded-sm"
          style={{ backgroundColor: chapterColor }}
        ></div>
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-white"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {chapter.title}
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-6">
        {chapter.lessons.map((lesson, lessonIndex) => (
          <motion.div
            key={`${index}-${lesson.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: lessonIndex * 0.05 }}
          >
            <Link
              to={`${chapter.path}${lesson.path}`}
              className="group block p-5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[rgba(0,0,0,0.2)] backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold relative overflow-hidden group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: chapterColor }}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <span className="relative z-10">{lesson.id}</span>
                </div>

                <div className="flex-1">
                  <h3 className="text-white group-hover:text-white font-medium">
                    {lesson.title}
                  </h3>
                </div>

                <div className="w-10 h-10 flex items-center justify-center">
                  <LessonIcon
                    lesson={lesson}
                    color={chapterColor}
                    isHovered={false}
                  />
                </div>
              </div>

              <div
                className="mt-3 h-1 w-0 group-hover:w-full bg-gradient-to-r transition-all duration-500 ease-out"
                style={{
                  backgroundImage: `linear-gradient(to right, ${chapterColor}, transparent)`,
                }}
              ></div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ChapterSection;
