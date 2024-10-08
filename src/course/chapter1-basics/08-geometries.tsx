import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvas.current) return;

    // Scene
    const scene = new THREE.Scene();

    // Object
    // const geometry = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4) // cube: width, height, depth

    // custom buffer geometry
    const geometry = new THREE.BufferGeometry();
    // Float32Array: one dimension array with fixed size, can be specify the size and then fill it
    // or init with the values
    // const positionsArray = new Float32Array([
    //   0, 0, 0, // (x,y,z) for first vertex
    //   0, 1, 0, // (x,y,z) for second vertex
    //   1, 0, 0, // (x,y,z) for third vertex
    // ])
    // const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3); // 3 means how much values compose one vertex
    // // set the name of attribute being using
    // // related to three.js built-in shaders, so must using 'position' name
    // geometry.setAttribute('position', positionsAttribute); // get the triangle

    // create a bunch of random triangles
    const count = 50;
    const positionsArray = new Float32Array(count * 3 * 3); // 每个三角形有 3 个顶点，每个顶点有 3 个值
    for (let i = 0; i < count * 3 * 3; i++) {
      positionsArray[i] = (Math.random() - 0.5) * 2;
    }
    const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3); // 3 means how much values compose one vertex
    // set the name of attribute being using
    // related to three.js built-in shaders, so must using 'position' name
    geometry.setAttribute('position', positionsAttribute);

    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });
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
    }

    window.addEventListener('resize', onResize);

    // Camera
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

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.current,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Animate
    // const clock = new THREE.Clock();
    const tick = () => {
      // const elapsedTime = clock.getElapsedTime();

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
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    }
  }, [canvas.current]);

  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;
