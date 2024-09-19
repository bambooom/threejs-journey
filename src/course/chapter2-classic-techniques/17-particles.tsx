import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
     * Textures
     */
    const textureLoader = new THREE.TextureLoader();
    const particleTexture = textureLoader.load('/textures/particles/10.png');

    /**
     * Particles
     */
    // geomrtry
    // const particlesGeometry = new THREE.SphereGeometry(1, 32, 32);

    // custom geometry
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 20000;

    const positions = new Float32Array(count * 3); // xyz, xyz, xyz ...
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
      colors[i] = Math.random();
    }
    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    particlesGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colors, 3)
    ); // rgb

    // material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true, // create perspective effect
    });
    particlesMaterial.color = new THREE.Color(0xff88cc);
    particlesMaterial.transparent = true;
    particlesMaterial.alphaMap = particleTexture;
    // particlesMaterial.alphaTest = 0.001; // a value between 0 and 1 that enables the WebGL to know when not to render the pixel according to that pixel's transparency, by defaul the value is 0 meaning that the pixel will be rendered anyway, so change to use 0,001
    // particlesMaterial.depthTest = false; // GPU not trying to guess which is in front or back
    // but deactivate depth test, there will be bugs if you have other objects in your scene or particles with different colors

    particlesMaterial.depthWrite = false; // tell WebGL not to write particles in that depth buffer with depthTest

    particlesMaterial.blending = THREE.AdditiveBlending; // looks illuminated, bright. like combining lights, but have imapct on performance
    particlesMaterial.vertexColors = true; // make vertext not same colors

    // points
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    /**
     * Test cube
     */
    // const cube = new THREE.Mesh(
    //   new THREE.BoxGeometry(1, 1, 1),
    //   new THREE.MeshBasicMaterial()
    // );
    // scene.add(cube);

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    window.addEventListener('resize', () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

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
    camera.position.z = 3;
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

      // Update particles
      // particles.rotation.y = 0.2 * elapsedTime

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = particlesGeometry.attributes.position.array[i3];
        particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(
          elapsedTime + x
        );
      }
      // however, should avoid to do this because it's bad for performance
      // better to create your own material and your own shader

      particlesGeometry.attributes.position.needsUpdate = true;

      // Update controls
      controls.update();

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();
  }, [canvas.current]);

  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;
