import { FC, useState, useEffect } from 'react';
import * as THREE from 'three';
import { threeManager } from '../utils/ThreeManager';

const ThreeLogo: FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const logoGroup = new THREE.Group();

    const cubeGeometry = new THREE.BoxGeometry(1, 1.5, 0.2);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: '#4e54c8' });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.x = -0.6;
    logoGroup.add(cube);

    const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: '#00b894' });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.x = 0.6;
    sphere.position.y = 0.5;
    logoGroup.add(sphere);

    scene.add(logoGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const animate = () => {
      const targetSpeed = isHovered ? 0.05 : 0.01;
      logoGroup.rotation.y += targetSpeed;
      logoGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.2;
    };

    threeManager.addScene('indexLogo', scene, camera, animate);

    return () => {
      threeManager.removeScene('indexLogo');
      cubeGeometry.dispose();
      cubeMaterial.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
    };
  }, [isHovered]);

  return (
    <div
      className="w-20 h-20 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
};

export default ThreeLogo;
