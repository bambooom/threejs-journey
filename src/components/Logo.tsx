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

    const gradientShader = {
      uniforms: {
        color1: { value: new THREE.Color('#a14be3') },
        color2: { value: new THREE.Color('#ff5bd1') },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        void main() {
          vec3 color = mix(color1, color2, vUv.y);
          gl_FragColor = vec4(color, 1.0);
        }
      `
    };

    // Create TorusKnot (inner shape)
    const knotGeometry = new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16);
    const knotMaterial = new THREE.ShaderMaterial({
      ...gradientShader,
      uniforms: {
        color1: { value: new THREE.Color('#ff5bd1') },
        color2: { value: new THREE.Color('#a14be3') },
      },
    });
    const knot = new THREE.Mesh(knotGeometry, knotMaterial);
    logoGroup.add(knot);

    // Create Torus (outer shape)
    // Parameters: radius, tube, radialSegments, tubularSegments
    const torusGeometry = new THREE.TorusGeometry(1.2, 0.1, 16, 100);
    const torusMaterial = new THREE.ShaderMaterial({
      ...gradientShader,
      uniforms: {
        color1: { value: new THREE.Color('#a14be3') },
        color2: { value: new THREE.Color('#ff5bd1') },
      },
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    // Rotate the torus to make it encircle the knot
    torus.rotation.x = Math.PI / 2;
    logoGroup.add(torus);

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

      // Add different rotation to torus and knot
      if (knot && torus) {
        knot.rotation.x += targetSpeed * 0.5;
        torus.rotation.y += targetSpeed * 0.3;
      }
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
      knotGeometry.dispose();
      knotMaterial.dispose();
      torusGeometry.dispose();
      torusMaterial.dispose();
    };
  }, [isHovered, addScene, removeScene, updateSceneViewport]);

  return (
    <div
      ref={containerRef}
      className="w-20 h-20 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
};

export default Logo;
