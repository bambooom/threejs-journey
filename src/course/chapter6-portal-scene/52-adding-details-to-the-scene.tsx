// Starting with 51, adding details like shaders and more

import { type FC, useRef, useEffect, useState } from 'react';
import GUI from 'lil-gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

import firefliesVertexShader from './shaders/fireflies/vertex.glsl';
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl';

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
    const debugObject: Record<string, any> = {};
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
     * Fireflies, using particles
     */
    // Geometry
    const firefliesGeometry = new THREE.BufferGeometry();
    const firefliesCount = 30;
    const positionsArray = new Float32Array(firefliesCount * 3);
    const scaleArray = new Float32Array(firefliesCount);

    for (let i = 0; i < firefliesCount * 3; i++) {
      positionsArray[i * 3] = (Math.random() - 0.5) * 4;
      positionsArray[i * 3 + 1] = Math.random() * 4;
      positionsArray[i * 3 + 2] = (Math.random() - 0.5) * 4;

      scaleArray[i] = Math.random();
    }

    firefliesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positionsArray, 3),
    );
    firefliesGeometry.setAttribute(
      'aScale',
      new THREE.BufferAttribute(scaleArray, 1),
    );

    // Material
    // const firefliesMaterial = new THREE.PointsMaterial({
    //   size: 0.1,
    //   sizeAttenuation: true,
    // });

    // changes to use custom shaders
    const firefliesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 150 },
      },
      vertexShader: firefliesVertexShader,
      fragmentShader: firefliesFragmentShader,

      transparent: true,
      depthWrite: false, // fix some clipping issues
      blending: THREE.AdditiveBlending, // bad for performance, but looks nice
    });

    gui
      .add(firefliesMaterial.uniforms.uSize, 'value')
      .min(0)
      .max(500)
      .step(1)
      .name('firefliesSize');

    // Points
    const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
    scene.add(fireflies);

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

      // Update fireflies
      firefliesMaterial.uniforms.uPixelRatio.value = Math.min(
        window.devicePixelRatio,
        2,
      );
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

    // background color
    debugObject.clearColor = '#201919';
    renderer.setClearColor(debugObject.clearColor);
    gui.addColor(debugObject, 'clearColor').onChange(() => {
      renderer.setClearColor(debugObject.clearColor);
    });

    /**
     * Animate
     */
    const clock = new THREE.Clock();
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update fireflies materials
      firefliesMaterial.uniforms.uTime.value = elapsedTime;

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
