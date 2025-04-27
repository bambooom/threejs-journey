import { type FC, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import GUI from 'lil-gui';
import holographicVertexShader from './shaders/33/vertex.glsl';
import holographicFragmentShader from './shaders/33/fragment.glsl';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    if (!canvas.current) return;
    // Debug
    const gui = new GUI();

    // Scene
    const scene = new THREE.Scene();

    /**
     * Loaders
     */
    const gltfLoader = new GLTFLoader();

    /**
     * Material
     */
    const material = new THREE.ShaderMaterial({
      vertexShader: holographicVertexShader,
      fragmentShader: holographicFragmentShader,
      uniforms: {
        uTime: new THREE.Uniform(0),
      },
      transparent: true,
    });

    /**
     * Objects
     */
    // Torus knot
    const torusKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
      material
    );
    torusKnot.position.x = 3;
    scene.add(torusKnot);

    // Sphere
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(), material);
    sphere.position.x = -3;
    scene.add(sphere);

    // Suzanne
    let suzanne: THREE.Group<THREE.Object3DEventMap> | null = null;
    gltfLoader.load('/models/suzanne.glb', (gltf) => {
      suzanne = gltf.scene;
      suzanne.traverse((child) => {
        if (child instanceof THREE.Mesh)
          (child as THREE.Mesh).material = material;
      });
      scene.add(suzanne);
      setModelLoaded(true);
    });

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const onResize = () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', onResize);

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(
      25,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(7, 7, 7);
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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const rendererParameters = {
      clearColor: '#1d1f2a',
    };

    gui.addColor(rendererParameters, 'clearColor').onChange(() => {
      renderer.setClearColor(rendererParameters.clearColor);
    });

    /**
     * Animate
     */
    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // Rotate objects
      if (suzanne) {
        suzanne.rotation.x = -elapsedTime * 0.1;
        suzanne.rotation.y = elapsedTime * 0.2;
      }

      sphere.rotation.x = -elapsedTime * 0.1;
      sphere.rotation.y = elapsedTime * 0.2;

      torusKnot.rotation.x = -elapsedTime * 0.1;
      torusKnot.rotation.y = elapsedTime * 0.2;

      // update uniforms
      material.uniforms.uTime.value = elapsedTime;

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
      // geometry?.dispose();
      material?.dispose();
      renderer.dispose();
      gui.destroy();
    };
  }, [canvas.current, modelLoaded]);
  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;
