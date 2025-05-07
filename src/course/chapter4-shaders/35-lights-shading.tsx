import { type FC, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import shadingVertexShader from './shaders/35/vertex.glsl';
import shadingFragmentShader from './shaders/35/fragment.glsl';
import GUI from 'lil-gui';

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

    // Loaders
    const gltfLoader = new GLTFLoader();

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
      // update pixel ratio
      sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

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
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFShadowMap;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // renderer.toneMappingExposure = 1;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    /**
     * Material
     */
    const materialParameters = {
      color: '#fff',
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: shadingVertexShader,
      fragmentShader: shadingFragmentShader,
      uniforms: {
        uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
      },
    });

    gui.addColor(materialParameters, 'color').onChange(() => {
      material.uniforms.uColor.value.set(materialParameters.color);
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
     * Light helpers
     */
    const directionalLightHelper = new THREE.Mesh(
      new THREE.PlaneGeometry(),
      new THREE.MeshBasicMaterial()
    );
    directionalLightHelper.material.color.setRGB(0.1, 0.1, 1);
    directionalLightHelper.material.side = THREE.DoubleSide;
    directionalLightHelper.position.set(0, 0, 3);
    scene.add(directionalLightHelper);

    const pointLightHelper = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.1, 2),
      new THREE.MeshBasicMaterial()
    );
    pointLightHelper.material.color.setRGB(1, 0.1, 0.1);
    pointLightHelper.position.set(0, 2.5, 0);
    scene.add(pointLightHelper);

    const pointLightHelper2 = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.1, 2),
      new THREE.MeshBasicMaterial()
    );
    pointLightHelper2.material.color.setRGB(0.1, 1.0, 0.5);
    pointLightHelper2.position.set(2, 2, 2);
    scene.add(pointLightHelper2);

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
      // material?.dispose();
      renderer.dispose();
      gui.destroy();
    };
  }, [canvas.current, modelLoaded]);
  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;
