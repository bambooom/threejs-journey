import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import galaxyVertexShader from './shaders/30/vertex.glsl';
import galaxyFragmentShader from './shaders/30/fragment.glsl';
import GUI from 'lil-gui';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;
    // Debug
    const gui = new GUI();

    // Scene
    const scene = new THREE.Scene();

    /**
     * Galaxy
     */
    const parameters = {
      count: 200000,
      size: 0.005,
      radius: 5,
      branches: 3,
      spin: 1,
      randomness: 0.2,
      randomnessPower: 3,
      insideColor: '#ff6030',
      outsideColor: '#1b3984',
    };

    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let points: THREE.Points | null = null;

    const generateGalaxy = () => {
      if (points !== null) {
        geometry?.dispose();
        material?.dispose();
        scene.remove(points);
      }

      /**
       * Geometry
       */
      geometry = new THREE.BufferGeometry();

      const positions = new Float32Array(parameters.count * 3);
      const randomness = new Float32Array(parameters.count * 3);
      const colors = new Float32Array(parameters.count * 3);
      const scales = new Float32Array(parameters.count * 1);

      const insideColor = new THREE.Color(parameters.insideColor);
      const outsideColor = new THREE.Color(parameters.outsideColor);

      for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        // Position
        const radius = Math.random() * parameters.radius;
        // Scale
        scales[i] = Math.random();

        const branchAngle =
          ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

        const randomX =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          parameters.randomness *
          radius;
        const randomY =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          parameters.randomness *
          radius;
        const randomZ =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          parameters.randomness *
          radius;

        positions[i3] = Math.cos(branchAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle) * radius + randomZ;

        randomness[i3] = randomX;
        randomness[i3 + 1] = randomY;
        randomness[i3 + 2] = randomZ;

        // Color
        const mixedColor = insideColor.clone();
        mixedColor.lerp(outsideColor, radius / parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      // custom attribute aScale, so can use it in vertext.glsl
      geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

      /**
       * Material
       */
      material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: galaxyVertexShader,
        fragmentShader: galaxyFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 10 * renderer.getPixelRatio() }, // fix size, make it seem same on different devices
        },
      });

      /**
       * Points
       */
      points = new THREE.Points(geometry, material);
      scene.add(points);
    };

    gui
      .add(parameters, 'count')
      .min(100)
      .max(1000000)
      .step(100)
      .onFinishChange(generateGalaxy);
    gui
      .add(parameters, 'radius')
      .min(0.01)
      .max(20)
      .step(0.01)
      .onFinishChange(generateGalaxy);
    gui
      .add(parameters, 'branches')
      .min(2)
      .max(20)
      .step(1)
      .onFinishChange(generateGalaxy);
    gui
      .add(parameters, 'randomness')
      .min(0)
      .max(2)
      .step(0.001)
      .onFinishChange(generateGalaxy);
    gui
      .add(parameters, 'randomnessPower')
      .min(1)
      .max(10)
      .step(0.001)
      .onFinishChange(generateGalaxy);
    gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
    gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);

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
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(1, 1, 1);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas.current);
    controls.enableDamping = true;

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.current,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /**
     * Generate the first galaxy
     */
    generateGalaxy();

    /**
     * Animate
     */
    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // update utime
      if (material) {
        material.uniforms.uTime.value = elapsedTime;
      }

      // Update controls
      controls.update();

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener('resize', onResize);
      scene.clear();
      geometry?.dispose();
      material?.dispose();
      renderer.dispose();
      gui.destroy();
    };
  }, [canvas.current]);
  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;
