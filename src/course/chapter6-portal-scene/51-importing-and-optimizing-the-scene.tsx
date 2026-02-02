// 49 & 50 are lessons for building the model in Blender, so no web coding

import { type FC, useRef, useEffect, useState } from 'react';
import GUI from 'lil-gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// /**
//  * Spector JS
//  */
// const SPECTOR = require('spectorjs')
// const spector = new SPECTOR.Spector()
// spector.displayUI()

const Page: FC = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    if (!canvas.current) return;

    /**
     * Base
     */
    // Debug
    const gui = new GUI({
      width: 400,
    });

    // Scene
    const scene = new THREE.Scene();

    /**
     * Loaders
     */
    // Texture loader
    const textureLoader = new THREE.TextureLoader();

    // Draco loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');

    // GLTF loader
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    /**
     * Textures
     */
    const bakedTexture = textureLoader.load('/textures/baked.jpg');
    bakedTexture.flipY = false;
    bakedTexture.colorSpace = THREE.SRGBColorSpace;

    /**
     * Materials
     */
    // Baked material
    const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });

    // Portal light material
    const portalLightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    // Pole light material
    const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });

    /**
     * Model
     */
    gltfLoader.load('/models/portal.glb', (gltf) => {
      const bakedMesh = gltf.scene.children.find(
        (child) => child.name === 'baked',
      );
      const portalLightMesh = gltf.scene.children.find(
        (child) => child.name === 'portalLight',
      );
      const poleLightAMesh = gltf.scene.children.find(
        (child) => child.name === 'poleLightA',
      );
      const poleLightBMesh = gltf.scene.children.find(
        (child) => child.name === 'poleLightB',
      );

      (bakedMesh as THREE.Mesh).material = bakedMaterial;
      (portalLightMesh as THREE.Mesh).material = portalLightMaterial;
      (poleLightAMesh as THREE.Mesh).material = poleLightMaterial;
      (poleLightBMesh as THREE.Mesh).material = poleLightMaterial;

      scene.add(gltf.scene);
      setModelLoaded(true);
    });

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
      45,
      sizes.width / sizes.height,
      0.1,
      100,
    );
    camera.position.set(4, 2, 4);
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
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    /**
     * Animate
     */
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

    if (modelLoaded) tick();

    return () => {
      window.removeEventListener('resize', onResize);
      scene.clear();
      renderer.dispose();
      gui.destroy();
    };
  }, [modelLoaded]);

  return <canvas ref={canvas}></canvas>;
};

export default Page;
