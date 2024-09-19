import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
// import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'; // used for load .exr enviroment map
import GUI from 'lil-gui';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;

    /**
     * Loaders
     */
    const gltfLoader = new GLTFLoader();
    // const cubeTextureLoader = new THREE.CubeTextureLoader();
    // const rgbeLoader = new RGBELoader();
    const textureLoader = new THREE.TextureLoader();

    // Debug
    const gui = new GUI();

    // Scene
    const scene = new THREE.Scene();

    /**
     * Environment map:
     * - create a massive cube around the scene
     * - set its 6 faces to be visible on the inside
     * - Apply the texture to it
     */
    scene.environmentIntensity = 1; // high make brighter
    scene.backgroundBlurriness = 0; // low more blur
    scene.backgroundIntensity = 1;
    // scene.backgroundRotation.x = 1;
    // scene.environmentRotation.x = 1;

    gui.add(scene, 'environmentIntensity').min(0).max(10).step(0.001);
    gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001);
    gui.add(scene, 'backgroundIntensity').min(0).max(10).step(0.001);
    gui
      .add(scene.backgroundRotation, 'y')
      .min(0)
      .max(Math.PI * 2)
      .step(0.001)
      .name('background rotation Y');
    gui
      .add(scene.environmentRotation, 'y')
      .min(0)
      .max(Math.PI * 2)
      .step(0.001)
      .name('environment rotation Y');

    // LDR cube texture
    // const environmentMap = cubeTextureLoader.load([
    //   '/environmentMaps/0/px.png', // positive x
    //   '/environmentMaps/0/nx.png', // negative x
    //   '/environmentMaps/0/py.png', // positive y
    //   '/environmentMaps/0/ny.png', // negative y
    //   '/environmentMaps/0/pz.png', // positive z
    //   '/environmentMaps/0/nz.png'  // negative z
    // ])
    // scene.environment = environmentMap; // apply environment map as the lighting to the whole scene
    // scene.background = environmentMap;

    // HDR (RGBE) euirectangular
    // hdr file and heavier
    // /environmentMaps/0/2k.hdr
    // rgbeLoader.load('/environmentMaps/blender-2k.hdr', (environmentMap) => {
    //   environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    //   scene.environment = environmentMap;
    //   // scene.background = environmentMap;
    // })

    /**
     * Real time environment map
     */
    const environmentMap = textureLoader.load(
      '/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg'
    );
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    environmentMap.colorSpace = THREE.SRGBColorSpace;

    scene.background = environmentMap;

    // Holy donut
    const holyDonut = new THREE.Mesh(
      new THREE.TorusGeometry(8, 0.5),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(10, 4, 2),
      })
    );
    holyDonut.layers.enable(1); // same layer as the cubeCamera
    holyDonut.position.y = 3.5;
    scene.add(holyDonut);

    // cube render target
    // 256, is the resolution
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
      type: THREE.HalfFloatType, // here same as FloatType
      // format: THREE.RGBAFormat,
      // generateMipmaps: true,
      // minFilter: THREE.LinearMipmapLinearFilter
    });
    scene.environment = cubeRenderTarget.texture;

    // Cube camera
    const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
    cubeCamera.layers.set(1); // it should only see holyDonut by using layer

    /**
     * Torus Knot
     */
    const torusKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
      new THREE.MeshStandardMaterial({
        roughness: 0.3,
        metalness: 1,
        color: 0xaaaaaa,
      })
    );
    // torusKnot.material.envMap = environmentMap; // apply environment map to the material so that there will be light
    torusKnot.position.x = -4;
    torusKnot.position.y = 4;
    scene.add(torusKnot);

    /**
     * Models
     */
    gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
      gltf.scene.scale.set(10, 10, 10);
      scene.add(gltf.scene);
    });

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
    camera.position.set(4, 5, 4);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas.current);
    controls.target.y = 3.5;
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
      // Time
      const elapsedTime = clock.getElapsedTime();

      // real time environmentmap
      if (holyDonut) {
        holyDonut.rotation.x = Math.sin(elapsedTime) * 2;

        // render the scene to update
        cubeCamera.update(renderer, scene);
      }

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
