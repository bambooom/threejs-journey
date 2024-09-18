import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;
    // 4 basic elements:
    // - Scene
    // - Objects
    // - Camera
    // - Renderer

    // Scene
    const scene = new THREE.Scene();

    /**
     * Objects - can be many things like primitive geometrcs, imported models,
     * particles, lights..etc.
     *
     * Mesh - combination of a geometry (the shape) and a material (how it looks)
     */
    const geometry = new THREE.BoxGeometry(1, 1, 1); // cube: width, height, depth
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // red, using hex
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh); // need to add to scene

    /**
     * Sizes
     */
    const sizes = {
      width: 800,
      height: 600,
    };

    /**
     * Camera - theoretical point of view used when rendering, can have multiple cameras
     * basic - PerspectiveCamera
     */
    // 75 - field of view, how large your vision angle is, unit in degrees and corresponds to the vertical vision angle
    // 75的角度在实际情况来说可能太大。但对初学者来说，比较合适，不会跟丢 objects。多数 website， around 35
    // width / height - aspect ratio，画布的 宽高比
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    // camera.position.x = 1
    // camera.position.y = 1
    camera.position.z = 3; // by default, everything is at the center, so need to move camera backwards to be able to see objects
    scene.add(camera); // might result in bugs

    /**
     * Renderer - render the scene from the camera's point of view, drawn in canvas
     * like renderer taking pictures of your scene
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.current,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.render(scene, camera);

  }, [canvas.current]);

  return <canvas ref={canvas}></canvas>;
}

export default Page;
