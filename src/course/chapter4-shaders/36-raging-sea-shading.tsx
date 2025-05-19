import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import waterVertexShader from './shaders/29/water/vertex.glsl';
import waterFragmentShader from './shaders/29/water/fragment.glsl';
import GUI from 'lil-gui';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;
    // Debug
    const gui = new GUI();
    const debugObject = {
      depthColor: '#ff4000',
      surfaceColor: '#151c37',
    };

    // Scene
    const scene = new THREE.Scene();

    // Axes helper
    const axesHelper = new THREE.AxesHelper();
    axesHelper.position.y += 0.25;
    scene.add(axesHelper);

    /**
     * Water
     */
    // Geometry
    const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512);
    waterGeometry.deleteAttribute('normal'); // you can delete the normal attribute because we are going to calculate the normal in the shader
    waterGeometry.deleteAttribute('uv'); // we don't need uv, good for performance

    // Material
    const waterMaterial = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: {
        uTime: { value: 0 },

        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
        uBigWavesSpped: { value: 0.75 },

        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallIterations: { value: 4 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.925 },
        uColorMultiplier: { value: 1 },
      },
    });

    // Debug
    gui
      .addColor(debugObject, 'depthColor')
      .onChange(() => {
        // update uniform when change
        waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
      })
      .name('depthColor');
    gui
      .addColor(debugObject, 'surfaceColor')
      .onChange(() => {
        waterMaterial.uniforms.uSurfaceColor.value.set(
          debugObject.surfaceColor
        );
      })
      .name('surfaceColor');

    gui
      .add(waterMaterial.uniforms.uBigWavesElevation, 'value')
      .min(0)
      .max(1)
      .step(0.001)
      .name('uBigWavesElevation');
    gui
      .add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x')
      .min(0)
      .max(10)
      .step(0.001)
      .name('uBigWavesFrequencyX');
    gui
      .add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y')
      .min(0)
      .max(10)
      .step(0.001)
      .name('uBigWavesFrequencyY');
    gui
      .add(waterMaterial.uniforms.uBigWavesSpped, 'value')
      .min(0)
      .max(4)
      .step(0.001)
      .name('uBigWavesSpped');
    gui
      .add(waterMaterial.uniforms.uSmallWavesElevation, 'value')
      .min(0)
      .max(1)
      .step(0.001)
      .name('uSmallWavesElevation');
    gui
      .add(waterMaterial.uniforms.uSmallWavesFrequency, 'value')
      .min(0)
      .max(30)
      .step(0.001)
      .name('uSmallWavesFrequency');
    gui
      .add(waterMaterial.uniforms.uSmallWavesSpeed, 'value')
      .min(0)
      .max(4)
      .step(0.001)
      .name('uSmallWavesSpeed');
    gui
      .add(waterMaterial.uniforms.uSmallIterations, 'value')
      .min(0)
      .max(5)
      .step(1)
      .name('uSmallIterations');

    gui
      .add(waterMaterial.uniforms.uColorOffset, 'value')
      .min(0)
      .max(1)
      .step(0.001)
      .name('uColorOffset');
    gui
      .add(waterMaterial.uniforms.uColorMultiplier, 'value')
      .min(0)
      .max(10)
      .step(0.001)
      .name('uColorMultiplier');

    // Mesh
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI * 0.5;
    scene.add(water);

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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /**
     * Animate
     */
    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // update water
      waterMaterial.uniforms.uTime.value = elapsedTime;

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
      waterMaterial.dispose();
      renderer.dispose();
      gui.destroy();
    };
  }, [canvas.current]);
  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;
