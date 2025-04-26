import { type FC, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GUI from 'lil-gui';
import coffeeSmokeVertexShader from './shaders/32/vertex.glsl';
import coffeeSmokeFragmentShader from './shaders/32/fragment.glsl';

const Page: FC = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    if (!canvas.current) return;
    // Debug
    const gui = new GUI();

    // Scene
    const scene = new THREE.Scene();

    // Loaders
    const textureLoader = new THREE.TextureLoader();
    const gltfLoader = new GLTFLoader();

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
      25,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(8, 10, 12);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas.current);
    controls.target.y = 3;
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
     * Model
     */
    gltfLoader.load('/models/bakedMugModel.glb', (gltf) => {
      const bakedMesh = gltf.scene.getObjectByName('baked') as THREE.Mesh;
      if (bakedMesh?.material) {
        const material = bakedMesh.material as THREE.MeshStandardMaterial;
        if (material.map) {
          material.map.anisotropy = 8;
        }
      }
      scene.add(gltf.scene);
      setModelLoaded(true);
    });

    /**
     * Smoke, just a plane
     */
    // geometry
    const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 16);
    smokeGeometry.translate(0, 0.5, 0); // translate it on y, move it up to its bottom base is at 0,0,0
    // applying translate to the geometry (not on mesh) will make the upcoming vertex calculations more convenient.
    smokeGeometry.scale(1.5, 6, 1.5);

    // Perlin texture, use it in fragment shader
    const perlinTexture = textureLoader.load('/textures/perlin.png');
    perlinTexture.wrapS = THREE.RepeatWrapping;
    perlinTexture.wrapT = THREE.RepeatWrapping;
    // make sure the texture repeat it self

    // material
    const smokeMaterial = new THREE.ShaderMaterial({
      vertexShader: coffeeSmokeVertexShader,
      fragmentShader: coffeeSmokeFragmentShader,
      uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(perlinTexture), // use THREE.Uniform class
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false, // Transparency occluding problems, if true, it'll occlude anything behind it, including itself. 阻挡自身
      // wireframe: true,
    });

    // mesh
    const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
    smoke.position.y = 1.83; // move the mesh up to make it up the water/drink inside the mug
    scene.add(smoke);

    /**
     * Animate
     */
    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // update smoke
      smokeMaterial.uniforms.uTime.value = elapsedTime;

      // Update controls
      controls.update();
      // Render
      renderer.render(scene, camera);
      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    if (modelLoaded) {
      tick();
    }

    return () => {
      window.removeEventListener('resize', onResize);
      scene.clear();
      renderer.dispose();

      gui.destroy();
    };
  }, [canvas.current, modelLoaded]);
  return <canvas className="webgl" ref={canvas}></canvas>;
}

export default Page;
