import { FC, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useIconCanvas } from '../contexts/IconCanvasContext';

const Logo: FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoGroupRef = useRef<THREE.Group | null>(null);
  const renderedRef = useRef(false);
  const { addScene, removeScene, updateSceneViewport } = useIconCanvas();

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 4;

    const logoGroup = new THREE.Group();
    logoGroupRef.current = logoGroup;

    const cubeGeometry = new THREE.BoxGeometry(1.5, 2, 1.3);
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: '#a14be3',
      metalness: 0.3,
      roughness: 0.4,
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.x = -0.8;
    logoGroup.add(cube);

    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: '#ff5bd1',
      metalness: 0.2,
      roughness: 0.4,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.x = 0.8;
    sphere.position.y = 0.6;
    logoGroup.add(sphere);

    scene.add(logoGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const animate = () => {
      if (!logoGroupRef.current || !renderedRef.current) return;
      const targetSpeed = isHovered ? 0.05 : 0.01;
      logoGroupRef.current.rotation.y += targetSpeed;
      logoGroupRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.3;
    };

    const updatePosition = () => {
      if (!containerRef.current || !renderedRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      updateSceneViewport('logo', {
        x: rect.left,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      });
    };

    requestAnimationFrame(() => {
      renderedRef.current = true;
      const rect = containerRef.current!.getBoundingClientRect();
      addScene({
        id: 'logo',
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
    const observer = new ResizeObserver(updatePosition);
    observer.observe(containerRef.current);

    return () => {
      renderedRef.current = false;
      window.removeEventListener('scroll', updatePosition);
      observer.disconnect();
      removeScene('logo');
      cubeGeometry.dispose();
      cubeMaterial.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
    };
  }, [isHovered, addScene, removeScene, updateSceneViewport]);

  return (
    <div
      ref={containerRef}
      className="w-20 h-20 relative" // 增加容器尺寸
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
};

export default Logo;
