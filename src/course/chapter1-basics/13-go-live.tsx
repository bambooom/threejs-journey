import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvas.current) return;

    // Scene
    const scene = new THREE.Scene();

    /**
     * Axes helper
     */
    // const axesHelper = new THREE.AxesHelper();
    // scene.add(axesHelper);

    /**
     * Textures
     */
    const textureLoader = new THREE.TextureLoader();
    const matcapTexture = textureLoader.load('/textures/matcaps/3.png');
    matcapTexture.colorSpace = THREE.SRGBColorSpace;

    /**
     * Fonts
     */
    const fontLoader = new FontLoader();
    fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
      const textGeometry = new TextGeometry('Hello, Zhuzi', {
        font,
        size: 0.5,
        depth: 0.2, // height
        curveSegments: 12, // "o" 圆形的弧
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5, // 一些直线连接部分的弧线
      });
      // textGeometry.computeBoundingBox()
      // // console.log(textGeometry.boundingBox) // Box3 class, just mathematics, not real
      // // we get min value all are very close to 0, but values like -0,019999, which is possibly caused by bevel
      // // move the geometry to center, instead of moving mesh
      // textGeometry.translate(
      //   - textGeometry.boundingBox.max.x * 0.5,
      //   - textGeometry.boundingBox.max.y * 0.5,
      //   - textGeometry.boundingBox.max.z * 0.5
      // );
      // textGeometry.computeBoundingBox();
      // console.log(textGeometry.boundingBox); // re-compute the bounding box. value changed

      // or simply use center()
      textGeometry.center();

      const material = new THREE.MeshMatcapMaterial(); // material for both text and donut
      material.matcap = matcapTexture;
      const text = new THREE.Mesh(textGeometry, material);
      scene.add(text);

      // use same material and ssame geometry on multiple meshes
      const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 32, 64);

      for (let i = 0; i < 100; i++) {
        const donut = new THREE.Mesh(donutGeometry, material);

        donut.position.x = (Math.random() - 0.5) * 10;
        donut.position.y = (Math.random() - 0.5) * 10;
        donut.position.z = (Math.random() - 0.5) * 10;

        donut.rotation.x = Math.random() * Math.PI;
        donut.rotation.y = Math.random() * Math.PI;

        const scale = Math.random();
        donut.scale.set(scale, scale, scale);

        scene.add(donut);
      }
    });

    /**
     * Object
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

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.x = 1;
    camera.position.y = 1;
    camera.position.z = 2;
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
  }, [canvas.current]);

  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;
