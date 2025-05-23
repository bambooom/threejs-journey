import { type FC, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import halftoneVertexShader from './shaders/37/vertex.glsl';
import halftoneFragmentShader from './shaders/37/fragment.glsl';
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
      sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

      // update material
      material.uniforms.uResolution.value.set(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio
      );

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
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(2, 2, 2);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas.current);
    controls.enableDamping = true;

    /**
     * Renderer
     */
    const rendererParameters = {
      clearColor: '#26132f',
    };
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.current,
      antialias: true,
    });
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(rendererParameters.clearColor);
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    gui.addColor(rendererParameters, 'clearColor').onChange(() => {
      renderer.setClearColor(rendererParameters.clearColor);
    });

    /**
     * Material
     */
    const materialParameters = {
      // color: '#ff794d',
      color: '#e58fe2',
      // shadowColor: '#8e19b8',
      shadowColor: '#203af8',
      lightColor: '#e5ffe0',
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: halftoneVertexShader,
      fragmentShader: halftoneFragmentShader,
      uniforms: {
        uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
        uResolution: new THREE.Uniform(
          new THREE.Vector2(
            sizes.width * sizes.pixelRatio,
            sizes.height * sizes.pixelRatio
          )
        ),
        uShadowRepetitions: new THREE.Uniform(150),
        uShadowColor: new THREE.Uniform(
          new THREE.Color(materialParameters.shadowColor)
        ),
        uLightRepetitions: new THREE.Uniform(180),
        uLightColor: new THREE.Uniform(
          new THREE.Color(materialParameters.lightColor)
        ),
      },
    });

    gui.addColor(materialParameters, 'color').onChange(() => {
      material.uniforms.uColor.value.set(materialParameters.color);
    });
    gui
      .add(material.uniforms.uShadowRepetitions, 'value')
      .min(0)
      .max(300)
      .step(1)
      .name('uShadowRepetitions');
    gui.addColor(materialParameters, 'shadowColor').onChange(() => {
      material.uniforms.uShadowColor.value.set(materialParameters.shadowColor);
    });
    gui
      .add(material.uniforms.uLightRepetitions, 'value')
      .min(0)
      .max(300)
      .step(1)
      .name('uLightRepetitions');
    gui.addColor(materialParameters, 'lightColor').onChange(() => {
      material.uniforms.uLightColor.value.set(materialParameters.lightColor);
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
      material.dispose();
      renderer.dispose();
      gui.destroy();
    };
  }, [canvas.current, modelLoaded]);

  return <canvas ref={canvas}></canvas>;
};

export default Page;
