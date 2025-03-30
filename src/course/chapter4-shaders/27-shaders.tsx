import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import testVertexShader from './shaders/test/vertex.glsl';
import testFragmentShader from './shaders/test/fragment.glsl';
// import GUI from 'lil-gui';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;
    // Debug
    // const gui = new GUI();

    // Scene
    const scene = new THREE.Scene();

    /**
     * Test mesh
     */
    // Geometry
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

    // Material
    // const material = new THREE.MeshBasicMaterial();
    // we use RawShaderMaterial to create custom shader
    const material = new THREE.RawShaderMaterial({
      // insider here is the glsl code
      vertexShader: testVertexShader,
      fragmentShader: testFragmentShader,
      // wireframe: true,
      // side: THREE.DoubleSide,
      //  ⬆️ still effective
    });

    // Mesh
    const mesh = new THREE.Mesh(geometry, material);
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
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.set(0.25, - 0.25, 1)
    scene.add(camera)

    // Controls
    const controls = new OrbitControls(camera, canvas.current)
    controls.enableDamping = true

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas.current,
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


    /**
     * Animate
     */
    const clock = new THREE.Clock()

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

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
      // gui.destroy();
    }
  }, [canvas.current]);
  return <canvas className="webgl" ref={canvas}></canvas>;
}

export default Page;
