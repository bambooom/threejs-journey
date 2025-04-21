import { FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { threeManager } from '../utils/ThreeManager';
import {
  getGeometryForLesson,
  getMaterialForLesson,
} from '../utils/lessonGeometries';

interface LessonIconProps {
  lesson: {
    id: string;
    title: string;
    path: string;
  };
  color: string;
  isHovered: boolean;
}

const LessonIcon: FC<LessonIconProps> = ({ lesson, color, isHovered }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

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

    const sceneId = `lessonIcon-${lesson.id}`;
    threeManager.addScene(sceneId, scene, camera, animate, {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    });

    // 监听容器位置变化
    const observer = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const newRect = containerRef.current.getBoundingClientRect();
      threeManager.addScene(sceneId, scene, camera, animate, {
        x: newRect.left,
        y: newRect.top,
        width: newRect.width,
        height: newRect.height
      });
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      threeManager.removeScene(sceneId);
      geometry.dispose();
      material.dispose();
    };
  }, [lesson.id, lesson.title, color, isHovered]);

  return <div ref={containerRef} className="w-10 h-10 relative" />;
};

export default LessonIcon;
