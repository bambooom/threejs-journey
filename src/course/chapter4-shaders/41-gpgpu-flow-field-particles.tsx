import { type FC, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import particlesVertexShader from './shaders/41/particles/vertex.glsl';
import particlesFragmentShader from './shaders/41/particles/fragment.glsl';
import GUI from 'lil-gui';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);
  const [modelLoaded, setModelLoaded] = useState(true); //@fixme

  useEffect(() => {
    if (!canvas.current) return;
    // Debug
    const gui = new GUI({ width: 340 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const debugObject: Record<string, any> = {};

    // Scene
    const scene = new THREE.Scene();

    // Loaders
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    };

    const onResize = () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

      // update material
      if (particles) {
        particles.material?.uniforms.uResolution.value.set(
          sizes.width * sizes.pixelRatio,
          sizes.height * sizes.pixelRatio
        );
      }

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(sizes.pixelRatio);
    };

    window.addEventListener('resize', onResize);

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(
      35,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(4.5, 4, 11);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas.current);
    controls.enableDamping = true;

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.current,
      antialias: true,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);
    debugObject.clearColor = '#29191f';
    renderer.setClearColor(debugObject.clearColor);

    /**
     * Particles
     */
    const particles: {
      geometry?: THREE.BufferGeometry;
      material?: THREE.ShaderMaterial;
      points?: THREE.Points;
    } = {};

    // Geometry
    particles.geometry = new THREE.SphereGeometry(3);

    // Material
    particles.material = new THREE.ShaderMaterial({
      vertexShader: particlesVertexShader,
      fragmentShader: particlesFragmentShader,
      uniforms: {
        uSize: new THREE.Uniform(0.4),
        uResolution: new THREE.Uniform(
          new THREE.Vector2(
            sizes.width * sizes.pixelRatio,
            sizes.height * sizes.pixelRatio
          )
        ),
      },
    });

    // Points
    particles.points = new THREE.Points(particles.geometry, particles.material);
    scene.add(particles.points);

    /**
     * Tweaks
     */
    gui.addColor(debugObject, 'clearColor').onChange(() => {
      renderer.setClearColor(debugObject.clearColor);
    });
    gui
      .add(particles.material.uniforms.uSize, 'value')
      .min(0)
      .max(1)
      .step(0.001)
      .name('uSize');

    /**
     * Animate
     */
    const clock = new THREE.Clock();
    let previousTime = 0;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;

      // Update controls
      controls.update();

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    if (modelLoaded) {
      tick();
    }

    return () => {
      window.removeEventListener('resize', onResize);
      scene.clear();
      particles.material?.dispose();
      renderer.dispose();
      gui.destroy();
    };
  }, [canvas.current, modelLoaded]);

  return <canvas ref={canvas}></canvas>;
};

export default Page;
