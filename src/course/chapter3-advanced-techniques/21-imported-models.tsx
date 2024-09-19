import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
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
     * Models
     */
    const dracoLoader = new DRACOLoader(); // better before gltf loader
    // copy `/node_modules/three/examples/jsm/libs/draco`  folder to under static folder, and set the decoder path
    dracoLoader.setDecoderPath('/draco/');
    const gltfLoader = new GLTFLoader();
    // provide draco loader instance to gltf loader instance
    gltfLoader.setDRACOLoader(dracoLoader);

    /**
     * Draco compression:
     *
     * need to import draco loader and decoder files, also not small
     *
     * the geometries are lighter, but also take time and resource for your computer to decode compressed data files.
     */

    // gltfLoader.load(
    //   '/models/Duck/glTF/Duck.gltf',
    //   (gltf) => {
    //     scene.add(gltf.scene.children[0]) // duck
    //   },
    // );

    // gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
    //   // const children = [...gltf.scene.children];
    //   // for (const child of children) {
    //   //   scene.add(child)
    //   // }
    //   scene.add(gltf.scene) // it's a Group
    // });

    // Draco compression, need to import DRACOLoader
    // gltfLoader.load(
    //   '/models/Duck/glTF-Draco/Duck.gltf',
    //   (gltf) => {
    //     scene.add(gltf.scene)
    //   }
    // )

    // Fox model, animated
    let mixer: THREE.AnimationMixer | null = null;
    gltfLoader.load('/models/Fox/glTF/Fox.gltf', (gltf) => {
      // console.log(gltf.animations) // animataion key frames AnimationClip class
      mixer = new THREE.AnimationMixer(gltf.scene);
      const action = mixer.clipAction(gltf.animations[2]);
      action.play(); // need to update mixer in each frame under animation function
      gltf.scene.scale.set(0.025, 0.025, 0.025);
      scene.add(gltf.scene);
    });

    /**
     * Floor
     */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5,
      })
    );
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI * 0.5;
    scene.add(floor);

    /**
     * Lights
     */
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.camera.left = -7;
    directionalLight.shadow.camera.top = 7;
    directionalLight.shadow.camera.right = 7;
    directionalLight.shadow.camera.bottom = -7;
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

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
    camera.position.set(2, 2, 2);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas.current);
    controls.target.set(0, 0.75, 0);
    controls.enableDamping = true;

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.current,
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /**
     * Animate
     */
    const clock = new THREE.Clock();
    let previousTime = 0;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;

      // update mixer
      if (mixer) {
        mixer.update(deltaTime);
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

  return <canvas ref={canvas}></canvas>;
};

export default Page;
