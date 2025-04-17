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
  const objectRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 2.5;

    const geometry = getGeometryForLesson(lesson.title);
    const material = getMaterialForLesson(lesson.title, color);
    const mesh = new THREE.Mesh(geometry, material);
    objectRef.current = mesh;
    scene.add(mesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    let animationSpeed = 0.01;
    const targetAnimationSpeed = isHovered ? 0.05 : 0.01;

    const animate = () => {
      if (!objectRef.current) return;
      animationSpeed += (targetAnimationSpeed - animationSpeed) * 0.1;
      objectRef.current.rotation.x += animationSpeed;
      objectRef.current.rotation.y += animationSpeed * 1.5;
    };

    const sceneId = `lessonIcon-${lesson.id}`;
    threeManager.addScene(sceneId, scene, camera, animate);

    return () => {
      threeManager.removeScene(sceneId);
      geometry.dispose();
      material.dispose();
    };
  }, [lesson.id, lesson.title, color, isHovered]);

  return (
    <div className="w-10 h-10 relative" />
  );
};

export default LessonIcon;
