import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import testVertexShader from './shaders/test/vertex.glsl';
import testFragmentShader from './shaders/test/fragment.glsl';
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
     * Textures
     */
    const textureLoader = new THREE.TextureLoader();
    const flagTexture = textureLoader.load('/textures/flag-french.jpg');

    /**
     * Test mesh
     */
    // Geometry
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

    // create a aRandom attribute
    const count = geometry.attributes.position.count; // how many vertices, not the length of the array, but exact count
    const randoms = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      randoms[i] = Math.random();
    }
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1)); // just one random value per vertex
    // if we check the geometry.attributes now, it has the aRandom property

    // Material
    // const material = new THREE.MeshBasicMaterial();
    // we use RawShaderMaterial to create custom shader
    // use ShaderMaterial, and we can skip matrix definition and uv position in vertex.gsls
    const material = new THREE.ShaderMaterial({
      // insider here is the glsl code
      vertexShader: testVertexShader,
      fragmentShader: testFragmentShader,
      // transparent: true, // if we wan to set alpha below 1.0 in gl_FragColor
      // wireframe: true,
      // side: THREE.DoubleSide,
      //  ⬆️ still effective

      uniforms: {
        uFrequency: { value: new THREE.Vector2(10, 5) },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('orange') },
        uTexture: { value: flagTexture },
      },
    });

    gui
      .add(material.uniforms.uFrequency.value, 'x')
      .min(0)
      .max(20)
      .step(0.01)
      .name('frequencyX');
    gui
      .add(material.uniforms.uFrequency.value, 'y')
      .min(0)
      .max(20)
      .step(0.01)
      .name('frequencyY');

    // Mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.y = 2 / 3; // make it wider like a flag size
    scene.add(mesh);

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
    camera.position.set(0.25, -0.25, 1);
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
     * Animate
     */
    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // update material, uTime
      material.uniforms.uTime.value = elapsedTime;

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
      material.dispose();
      renderer.dispose();
      gui.destroy();
    };
  }, [canvas.current]);
  return <canvas className="webgl" ref={canvas}></canvas>;
}

export default Page;
