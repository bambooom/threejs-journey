import { FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useIconCanvas } from '../contexts/IconCanvasContext';
import { getGeometryForLesson, getMaterialForLesson } from '../utils/lessonGeometries';
import { Lesson } from '../types';

interface LessonIconProps {
  lesson: Lesson;
  color: string;
  isHovered: boolean;
}

const LessonIcon: FC<LessonIconProps> = ({ lesson, color, isHovered }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const sceneIdRef = useRef(`lessonIcon-${lesson.id}`);
  const renderedRef = useRef(false);

  const { addScene, removeScene, updateSceneViewport } = useIconCanvas();

  useEffect(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 2.5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    const geometry = getGeometryForLesson(lesson.title);
    const material = getMaterialForLesson(lesson.title, color);

    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    let animationSpeed = 0.01;
    const targetAnimationSpeed = isHovered ? 0.05 : 0.01;

    const animate = () => {
      if (!meshRef.current || !renderedRef.current) return;
      animationSpeed += (targetAnimationSpeed - animationSpeed) * 0.1;
      meshRef.current.rotation.x += animationSpeed;
      meshRef.current.rotation.y += animationSpeed * 1.5;
    };

    const updatePosition = () => {
      if (!containerRef.current || !renderedRef.current) return;
      const newRect = containerRef.current.getBoundingClientRect();
      updateSceneViewport(sceneIdRef.current, {
        x: newRect.left,
        y: newRect.top + window.scrollY,
        width: newRect.width,
        height: newRect.height,
      });
    };

    // 初始化场景
    requestAnimationFrame(() => {
      renderedRef.current = true;
      addScene({
        id: sceneIdRef.current,
        scene,
        camera,
        animate,
        viewport: {
          x: rect.left,
          y: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
        }
      });
    });

    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    const observer = new ResizeObserver(updatePosition);
    observer.observe(containerRef.current);

    return () => {
      renderedRef.current = false;
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
      observer.disconnect();
      removeScene(sceneIdRef.current);
      geometry.dispose();
      material.dispose();
    };
  }, [lesson.id, lesson.title, color, isHovered, addScene, removeScene, updateSceneViewport]);

  return (
    <div
      ref={containerRef}
      className="w-10 h-10 relative pointer-events-none"
    />
  );
};

export default LessonIcon;
