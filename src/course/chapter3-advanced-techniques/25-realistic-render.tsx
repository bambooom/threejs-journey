import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
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
    const rgbeLoader = new RGBELoader();
    const textureLoader = new THREE.TextureLoader();

    // Debug
    const gui = new GUI();

    // Scene
    const scene = new THREE.Scene();

    /**
     * Update all materials
     */
    const updateAllMaterials = () => {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          // Activate shadow here
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    };

    /**
     * Environment map
     */
    // Intensity
    scene.environmentIntensity = 1;
    gui.add(scene, 'environmentIntensity').min(0).max(10).step(0.001);

    // HDR (RGBE) equirectangular
    rgbeLoader.load('/environmentMaps/0/2k.hdr', (environmentMap) => {
      environmentMap.mapping = THREE.EquirectangularReflectionMapping;

      scene.background = environmentMap;
      scene.environment = environmentMap;
    });

    /**
     * Directional light
     *  since environment map does not cast shadows, so need to add light
     *  roughly simulate the environment lighting
     */
    const directionalLight = new THREE.DirectionalLight('#ffffff', 6);
    directionalLight.position.set(-4, 6.5, 2.5);
    scene.add(directionalLight);

    gui
      .add(directionalLight, 'intensity')
      .min(0)
      .max(10)
      .step(0.001)
      .name('lightIntensity');
    gui
      .add(directionalLight.position, 'x')
      .min(-10)
      .max(10)
      .step(0.001)
      .name('lightX');
    gui
      .add(directionalLight.position, 'y')
      .min(-10)
      .max(10)
      .step(0.001)
      .name('lightY');
    gui
      .add(directionalLight.position, 'z')
      .min(-10)
      .max(10)
      .step(0.001)
      .name('lightZ');

    // Shadows
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.mapSize.set(512, 512);
    gui.add(directionalLight, 'castShadow');

    // shadow bias
    directionalLight.shadow.normalBias = 0.027;
    directionalLight.shadow.bias = -0.004;
    gui
      .add(directionalLight.shadow, 'normalBias')
      .min(-0.05)
      .max(0.05)
      .step(0.001);
    gui.add(directionalLight.shadow, 'bias').min(-0.05).max(0.05).step(0.001);

    // Helper
    // const directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
    // scene.add(directionalLightHelper)

    // Target
    // move target position a little higher for helmet
    directionalLight.target.position.set(0, 4, 0);
    // scene.add(directionalLight.target) // need to add to the scene to make position effect
    directionalLight.target.updateWorldMatrix(true, true); // or update the matrix

    /**
     * Models
     */
    // Helmet
    gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
      gltf.scene.scale.set(10, 10, 10);
      scene.add(gltf.scene);

      updateAllMaterials();
    });

    /**
     * Floor
     */
    const floorColorTexture = textureLoader.load(
      '/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg'
    );
    const floorNormalTexture = textureLoader.load(
      '/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.png'
    );
    const floorAORoughnessMetalnessTexture = textureLoader.load(
      '/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg'
    );
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshStandardMaterial({
        map: floorColorTexture,
        normalMap: floorNormalTexture,
        aoMap: floorAORoughnessMetalnessTexture,
        roughnessMap: floorAORoughnessMetalnessTexture,
        metalnessMap: floorAORoughnessMetalnessTexture,
      })
    );
    floorColorTexture.colorSpace = THREE.SRGBColorSpace;
    floor.rotation.x = -Math.PI * 0.5;
    scene.add(floor);

    /**
     * Wall
     */
    const wallColorTexture = textureLoader.load(
      '/textures/castle_brick_broken_06/castle_brick_broken_06_diff_1k.jpg'
    );
    const wallNormalTexture = textureLoader.load(
      '/textures/castle_brick_broken_06/castle_brick_broken_06_nor_gl_1k.png'
    );
    const wallAORoughnessMetalnessTexture = textureLoader.load(
      '/textures/castle_brick_broken_06/castle_brick_broken_06_arm_1k.jpg'
    );
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        normalMap: wallNormalTexture,
        aoMap: wallAORoughnessMetalnessTexture,
        roughnessMap: wallAORoughnessMetalnessTexture,
        metalnessMap: wallAORoughnessMetalnessTexture,
      })
    );
    wallColorTexture.colorSpace = THREE.SRGBColorSpace;
    wall.position.y = 4;
    wall.position.z = -4;
    scene.add(wall);

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

    // Tone mapping
    //  - intends to convert High Dynamic Range (HDR) values to Low Dynamic Range (LDR) values.
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 3;

    // While we are indeed talking about the same HDR as for the environment map, tone mapping in Three.js will actually fake the process of converting LDR to HDR even if the colors aren't HDR resulting in a very realistic render.
    // We call aliasing an artifact that might appear in some situations where we can see a stair - like effect, usually on the edge of the geometries. （锯齿状）
    // also depends on the pixel ratio

    gui.add(renderer, 'toneMapping', {
      No: THREE.NoToneMapping,
      Linear: THREE.LinearToneMapping,
      Reinhard: THREE.ReinhardToneMapping, // colors look washed out, but very realistic like with a poorly set camera
      Cineon: THREE.CineonToneMapping,
      ACESFilmic: THREE.ACESFilmicToneMapping,
    });
    gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001);

    // Shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

    tick();
  }, [canvas.current]);

  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;
