import { FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { threeManager } from '../utils/ThreeManager';
import {
  getGeometryForLesson,
  getMaterialForLesson,
} from '../utils/lessonGeometries';
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

  useEffect(() => {
    if (!containerRef.current) return;

    const updateScenePosition = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      threeManager.updateSceneViewport(sceneIdRef.current, {
        x: rect.left,
        y: rect.top + window.scrollY, // adding scroll offset
        width: rect.width,
        height: rect.height,
      });
    };

    const rect = containerRef.current.getBoundingClientRect();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 2.5;

    const geometry = getGeometryForLesson(lesson.title);
    const material = getMaterialForLesson(lesson.title, color);
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    let animationSpeed = 0.01;
    const targetAnimationSpeed = isHovered ? 0.05 : 0.01;

    const animate = () => {
      if (!meshRef.current) return;
      animationSpeed += (targetAnimationSpeed - animationSpeed) * 0.1;
      meshRef.current.rotation.x += animationSpeed;
      meshRef.current.rotation.y += animationSpeed * 1.5;
    };

    threeManager.addScene(sceneIdRef.current, scene, camera, animate, {
      x: rect.left,
      y: rect.top + window.scrollY, // adding scroll offset
      width: rect.width,
      height: rect.height,
    });

    // 监听滚动事件
    window.addEventListener('scroll', updateScenePosition);

    // 监听容器位置变化
    const observer = new ResizeObserver(updateScenePosition);
    observer.observe(containerRef.current);

    return () => {
      window.removeEventListener('scroll', updateScenePosition);
      observer.disconnect();
      threeManager.removeScene(sceneIdRef.current);
      geometry.dispose();
      material.dispose();
    };
  }, [lesson.id, lesson.title, color, isHovered]);

  return (
    <div
      ref={containerRef}
      className="w-10 h-10 relative pointer-events-none"
    />
  );
};

export default LessonIcon;
