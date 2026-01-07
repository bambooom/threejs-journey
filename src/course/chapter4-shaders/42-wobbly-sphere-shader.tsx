import { type FC, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'; // use to remove duplicate vertices
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
// this package extend Three.js standard materials with your own shaders
// vanilla indicates that it's the classic implementation, it doesn't have any other dependencies on React
import GUI from 'lil-gui';

import wobbleVertexShader from './shaders/42/wobble/vertex.glsl';
import wobbleFragmentShader from './shaders/42/wobble/fragment.glsl';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  // const model = useRef<GLTF | null>(null);

  useEffect(() => {
    if (!canvas.current) return;
    // Debug
    const gui = new GUI({ width: 325 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const debugObject: Record<string, any> = {};

    // Scene
    const scene = new THREE.Scene();

    // Loaders
    const rgbeLoader = new RGBELoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    /**
     * Environment map
     */
    rgbeLoader.load(
      '/environmentMaps/urban_alley_01_1k.hdr',
      (environmentMap) => {
        environmentMap.mapping = THREE.EquirectangularReflectionMapping;

        scene.background = environmentMap;
        scene.environment = environmentMap;
      }
    );

    /**
     * Wobble
     */
    debugObject.colorA = '#0000ff';
    debugObject.colorB = '#ff0000';

    const uniforms = {
      uTime: new THREE.Uniform(0),

      uPositionFrequency: new THREE.Uniform(0.5),
      uTimeFrequency: new THREE.Uniform(0.4),
      uStrength: new THREE.Uniform(0.3),

      uWarpPositionFrequency: new THREE.Uniform(0.38),
      uWarpTimeFrequency: new THREE.Uniform(0.12),
      uWarpStrength: new THREE.Uniform(1.7),

      uColorA: new THREE.Uniform(new THREE.Color(debugObject.colorA)),
      uColorB: new THREE.Uniform(new THREE.Color(debugObject.colorB)),
    };

    // Material
    const material = new CustomShaderMaterial({
      // CSM
      baseMaterial: THREE.MeshPhysicalMaterial,
      vertexShader: wobbleVertexShader,
      fragmentShader: wobbleFragmentShader,
      uniforms,

      // MeshPhysicalMaterial
      metalness: 0,
      roughness: 0.5,
      color: '#ffffff',
      transmission: 0,
      ior: 1.5,
      thickness: 1.5,
      transparent: true,
      wireframe: false,
    });

    // this material is used for the shadows rendering
    const depthMaterial = new CustomShaderMaterial({
      // CSM
      baseMaterial: THREE.MeshDepthMaterial,
      vertexShader: wobbleVertexShader,
      uniforms,
      // no need fragment shader
      // silent: true,

      // MeshDepthMaterial
      depthPacking: THREE.RGBADepthPacking, // encode the depth in all 4 channels instead of grayscale depth to improve the precisiton
    });

    // Tweaks
    gui
      .add(uniforms.uPositionFrequency, 'value', 0, 2, 0.001)
      .name('uPositionFrequency');
    gui
      .add(uniforms.uTimeFrequency, 'value', 0, 2, 0.001)
      .name('uTimeFrequency');
    gui.add(uniforms.uStrength, 'value', 0, 1, 0.001).name('uStrength');
    gui
      .add(uniforms.uWarpPositionFrequency, 'value', 0, 2, 0.001)
      .name('uPositionFrequency');
    gui
      .add(uniforms.uWarpTimeFrequency, 'value', 0, 2, 0.001)
      .name('uTimeFrequency');
    gui.add(uniforms.uWarpStrength, 'value', 0, 2, 0.001).name('uWarpStrength');

    gui.addColor(debugObject, 'colorA').onChange(() => {
      uniforms.uColorA.value.set(debugObject.colorA);
    });
    gui.addColor(debugObject, 'colorB').onChange(() => {
      uniforms.uColorB.value.set(debugObject.colorB);
    });

    gui.add(material, 'metalness', 0, 1, 0.001);
    gui.add(material, 'roughness', 0, 1, 0.001);
    gui.add(material, 'transmission', 0, 1, 0.001);
    gui.add(material, 'ior', 0, 10, 0.001);
    gui.add(material, 'thickness', 0, 10, 0.001);

    // Geometry
    // const geometry = mergeVertices(new THREE.IcosahedronGeometry(2.5, 50));
    // geometry.computeTangents();
    // console.log(geometry.attributes); // normal, position, uv
    // after mergeVertices, we get index for the geometry,
    // so we can compute the tangents, the above log will contain normal, position, uv, tangent

    // Mesh
    // const wobble = new THREE.Mesh(geometry, material);
    // wobble.customDepthMaterial = depthMaterial; // Update the depth material, make the shadows on plane correct
    // wobble.receiveShadow = true;
    // wobble.castShadow = true;
    // scene.add(wobble);

    // Model
    let suzanne: THREE.Mesh | null = null;
    gltfLoader.load('/models/suzanneWobble.glb', (gltf) => {
      suzanne = gltf.scene.children[0] as THREE.Mesh;
      suzanne.receiveShadow = true;
      suzanne.castShadow = true;
      suzanne.material = material;
      suzanne.customDepthMaterial = depthMaterial;

      scene.add(suzanne);
      setModelLoaded(true);
    });

    /**
     * Plane
     */
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 15, 15),
      new THREE.MeshStandardMaterial()
    );
    plane.receiveShadow = true;
    plane.rotation.y = Math.PI;
    plane.position.y = -5;
    plane.position.z = 5;
    scene.add(plane);

    /**
     * Lights
     */
    const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.normalBias = 0.05;
    directionalLight.position.set(0.25, 2, -2.25);
    scene.add(directionalLight);

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
      35,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(13, -3, -5);
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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    /**
     * Animate
     */
    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // Material
      uniforms.uTime.value = elapsedTime;

      // Update controls
      controls.update();

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    // if (modelLoaded) tick();
    tick();

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
