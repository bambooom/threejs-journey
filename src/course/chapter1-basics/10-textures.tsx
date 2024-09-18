import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvas.current) return;

    /**
     * Textures
     */
    // const image = new Image()
    // // create a texture
    // const texture = new THREE.Texture(image)
    // // Textures used as map and matcap are supposed to be encoded in sRGB
    // // need to specify colorspace
    // texture.colorSpace = THREE.SRGBColorSpace;
    // image.onload = () => {
    //     texture.needsUpdate = true;
    // }
    // image.src = '/textures/door/color.jpg'

    /**
     * TextureLoader
     * do the same thing to load the texture like before
     * more simpler
     *
     * one loader can load multiple textures
     */
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onStart = () => {
      console.log('onStart');
    };
    loadingManager.onProgress = () => {
      console.log('onProgress');
    };
    loadingManager.onLoad = () => {
      console.log('onLoaded');
    };
    loadingManager.onError = () => {
      console.log('onError');
    };

    const textureLoader = new THREE.TextureLoader(loadingManager);
    // when loading, can specify 3 callbacks, but prefer LoadingManager
    // const colorTexture = textureLoader.load(
    // '/textures/door/color.jpg',
    // () => {
    //   console.log('load')
    // },
    // () => {
    //   console.log('progress') // not recommended
    // },
    // () => {
    //   console.log('error')
    // }
    // );
    // changing to checkerboard
    // const colorTexture = textureLoader.load('/textures/checkerboard-8x8.png');
    const colorTexture = textureLoader.load('/textures/minecraft.png');
    colorTexture.colorSpace = THREE.SRGBColorSpace;

    // const alphaTexture = textureLoader.load('/textures/door/alpha.jpg');
    // alphaTexture.colorSpace = THREE.SRGBColorSpace;
    // const heightTexture = textureLoader.load('/textures/door/height.jpg');
    // heightTexture.colorSpace = THREE.SRGBColorSpace;
    // const normalTexture = textureLoader.load('/textures/door/normal.jpg');
    // normalTexture.colorSpace = THREE.SRGBColorSpace;
    // const ambientOcclusionTexture = textureLoader.load(
    //   '/textures/door/ambientOcclusion.jpg'
    // );
    // ambientOcclusionTexture.colorSpace = THREE.SRGBColorSpace;
    // const metalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
    // metalnessTexture.colorSpace = THREE.SRGBColorSpace;
    // const roughnessTexture = textureLoader.load('/textures/door/roughness.jpg');
    // roughnessTexture.colorSpace = THREE.SRGBColorSpace;

    // repeat: 2D vector
    // colorTexture.repeat.x = 2
    // colorTexture.repeat.y = 3
    // colorTexture.wrapS = THREE.RepeatWrapping
    // colorTexture.wrapT = THREE.RepeatWrapping
    // // so you get 6 doors on one side

    // // you can have offset
    // colorTexture.offset.x = 0.5
    // colorTexture.offset.y = 0.5
    // rotation inside 2D space
    // colorTexture.rotation = Math.PI / 4 // 45degree

    // colorTexture.rotation = Math.PI * 0.25
    // colorTexture.center.x = 0.5
    // colorTexture.center.y = 0.5 // set x and y to 0.5 to make it rotate around the center

    // default is Linear Filter
    // colorTexture.minFilter = THREE.NearestFilter // nearest filter will be sharpper than linear filter
    // checkerboard texture will show 莫列波纹/摩尔纹效果, so need to avoid

    // colorTexture.magFilter = THREE.NearestFilter // NearestFilter 用在小图的texture上, 显得sharper

    // NearestFilter cheaper than other filters, better performance

    // 设置 minFilter and magFilter, you can deactivate mipmaps
    colorTexture.generateMipmaps = false; // offload GPU
    colorTexture.minFilter = THREE.NearestFilter;
    colorTexture.magFilter = THREE.NearestFilter;

    // Scene
    const scene = new THREE.Scene();

    /**
     * Object
     */
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    console.log(geometry.attributes); // will log normal, position and uv coordinates
    // const geometry = new THREE.TorusGeometry(1, 0.35, 32, 100) // donut
    // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    // using texture on material like this =>
    const material = new THREE.MeshBasicMaterial({ map: colorTexture });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

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
    camera.position.x = 1;
    camera.position.y = 1;
    camera.position.z = 1;
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
