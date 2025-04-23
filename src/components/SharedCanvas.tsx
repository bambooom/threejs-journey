import { FC, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { threeManager } from '../utils/ThreeManager';

const SharedCanvas: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene and camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Create particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;

    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Position particles on a sphere
      const radius = 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
      posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      posArray[i + 2] = radius * Math.cos(phi);

      colorsArray[i] = Math.random();
      colorsArray[i + 1] = Math.random();
      colorsArray[i + 2] = Math.random();
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(posArray, 3)
    );
    particlesGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colorsArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // Create chapter objects
    const chapterObjects: THREE.Mesh[] = [];
    const chapterShapes = ['box', 'sphere', 'torus', 'cone'];
    const chapterColors = [
      '#4e54c8', // Chapter 1: Blue-Purple
      '#00b894', // Chapter 2: Mint
      '#e84393', // Chapter 3: Pink
      '#f39c12', // Chapter 4: Orange
    ];

    for (let i = 0; i < 4; i++) {
      let geometry;

      switch (chapterShapes[i % chapterShapes.length]) {
        case 'sphere':
          geometry = new THREE.SphereGeometry(0.5, 16, 16);
          break;
        case 'torus':
          geometry = new THREE.TorusGeometry(0.3, 0.2, 8, 16);
          break;
        case 'cone':
          geometry = new THREE.ConeGeometry(0.5, 1, 16);
          break;
        case 'box':
        default:
          geometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
      }

      const material = new THREE.MeshStandardMaterial({
        color: chapterColors[i % chapterColors.length],
        metalness: 0.3,
        roughness: 0.4,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(-5 - i * 2, 0, 0);

      scene.add(mesh);
      chapterObjects.push(mesh);
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Track mouse position
    const mousePosition = { x: 0, y: 0 };
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      particleSystem.rotation.y = elapsedTime * 0.05;

      chapterObjects.forEach((obj, index) => {
        obj.rotation.x = elapsedTime * 0.2 + index * 0.2;
        obj.rotation.y = elapsedTime * 0.3 + index * 0.3;

        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const section = document.getElementById(`chapter-${index}`);

        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + scrollY;
          const sectionMiddle = sectionTop + rect.height / 2;
          const distanceFromMiddle = sectionMiddle - (scrollY + windowHeight / 2);
          const normalizedDistance = Math.max(
            -1,
            Math.min(1, distanceFromMiddle / windowHeight)
          );

          const targetX = 3 + normalizedDistance * 2;
          const targetY = -normalizedDistance * 2;

          obj.position.x += (targetX - obj.position.x) * 0.05;
          obj.position.y += (targetY - obj.position.y) * 0.05;
        }
      });
    };

    threeManager.addScene('mainBackground', scene, camera, animate, {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      threeManager.addScene('mainBackground', scene, camera, animate, {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (sceneRef.current) {
        threeManager.removeScene('mainBackground');
        sceneRef.current = null;
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      chapterObjects.forEach((obj) => {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        }
      });
    };
  }, []);

  return useMemo(() => (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  ), []);
};

export default SharedCanvas;
