import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

const Page: FC = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const loadingBar = useRef<HTMLDivElement>(null);
  let sceneReady = false;

  useEffect(() => {
    if (!canvas.current) return;
    /**
     * Loaders
     */
    const loadingManager = new THREE.LoadingManager(
      // loaded
      () => {
        gsap.delayedCall(0.5, () => {
          gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 });
          loadingBar.current!.classList.add('ended');
        });
        setTimeout(() => {
          sceneReady = true;
        }, 2000);
        // setTimeout(() => {
        //   gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 });
        //   loadingBar.current!.classList.add('ended');
        // }, 500); // transition delay
      },

      // progress
      (_itemUrl, itemsLoaded, itemsTotal) => {
        // console.log(
        //   `Loading file: ${itemUrl}, Loaded ${itemsLoaded} of ${itemsTotal}`,
        // );
        // update the loading bar here
        loadingBar.current!.style.transform = `scaleX(${itemsLoaded / itemsTotal})`;
      },
    );
    const gltfLoader = new GLTFLoader(loadingManager);
    const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

    /**
     * Base
     */
    // Debug
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const debugObject: Record<string, any> = {};

    // Scene
    const scene = new THREE.Scene();

    /**
     * Overlay
     */
    // add an overlay always facing the camera, to show loading progress, and fade away if ready
    // using vertex shader to make it always facing the camera
    const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1); // 2x2 can cover the whole screen
    const overlayMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uAlpha: { value: 1 },
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0); // make the plane always facing the camera
        }
      `,
      fragmentShader: `
        uniform float uAlpha;

        void main() {
          gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
      `,
    });
    const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
    scene.add(overlay);

    /**
     * Update all materials
     */
    const updateAllMaterials = () => {
      scene.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshStandardMaterial
        ) {
          // child.material.envMap = environmentMap
          child.material.envMapIntensity = debugObject.envMapIntensity;
          child.material.needsUpdate = true;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    };

    /**
     * Environment map
     */
    const environmentMap = cubeTextureLoader.load([
      '/textures/environmentMaps/6/px.jpg',
      '/textures/environmentMaps/6/nx.jpg',
      '/textures/environmentMaps/6/py.jpg',
      '/textures/environmentMaps/6/ny.jpg',
      '/textures/environmentMaps/6/pz.jpg',
      '/textures/environmentMaps/6/nz.jpg',
    ]);

    environmentMap.colorSpace = THREE.SRGBColorSpace;

    scene.background = environmentMap;
    scene.environment = environmentMap;

    debugObject.envMapIntensity = 2.5;

    /**
     * Models
     */
    gltfLoader.load('/models/DamagedHelmet/glTF/DamagedHelmet.gltf', (gltf) => {
      gltf.scene.scale.set(2.5, 2.5, 2.5);
      gltf.scene.rotation.y = Math.PI * 0.5;
      scene.add(gltf.scene);

      updateAllMaterials();
    });

    /**
     * Points of interest
     */
    const points = [
      {
        position: new THREE.Vector3(1.55, 0.3, -0.6),
        element: document.querySelector('.point-0') as HTMLElement,
      },
      {
        position: new THREE.Vector3(0.5, 0.8, -1.6),
        element: document.querySelector('.point-1') as HTMLElement,
      },
      {
        position: new THREE.Vector3(1.6, -1.3, -0.7),
        element: document.querySelector('.point-2') as HTMLElement,
      },
    ];

    /**
     * Lights
     */
    const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.normalBias = 0.05;
    directionalLight.position.set(0.25, 3, -2.25);
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
      75,
      sizes.width / sizes.height,
      0.1,
      100,
    );
    camera.position.set(4, 1, -4);
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
    const raycaster = new THREE.Raycaster();

    const tick = () => {
      // Update controls
      controls.update();
      if (sceneReady) {
        // update points of interest
        for (const p of points) {
          // we need to get 2D screen position of the 3D scene position of the point
          const screenPosition = p.position.clone(); // not affect the original position
          screenPosition.project(camera);

          raycaster.setFromCamera(
            new THREE.Vector2(screenPosition.x, screenPosition.y),
            camera,
          );
          const intersects = raycaster.intersectObjects(scene.children, true);

          if (intersects.length === 0) {
            p.element.classList.add('visible'); // no intersects, nothing blocking it
          } else {
            const intersectionDistance = intersects[0].distance;
            const pointDistance = p.position.distanceTo(camera.position);

            if (intersectionDistance < pointDistance) {
              p.element.classList.remove('visible'); // intersected by something else, blocking by something, so not visible
            } else {
              p.element.classList.add('visible'); // intersected, but the point is closer to the camera than the intersection, so visible
            }
          }

          const translateX = (screenPosition.x * sizes.width) / 2;
          const translateY = (-screenPosition.y * sizes.height) / 2; // -screenPosition.y because y is inverted in 3D

          p.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
        }
      }

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener('resize', onResize);
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas className="webgl" ref={canvas}></canvas>
      <div className="loading-bar" ref={loadingBar}></div>
      <div className="point point-0">
        <div className="label">1</div>
        <div className="text">
          Front and top screen with HUD aggregating terrain and battle
          informations.
        </div>
      </div>
      <div className="point point-1">
        <div className="label">2</div>
        <div className="text">
          Ventilation with air purifier and detection of environment toxicity.
        </div>
      </div>
      <div className="point point-2">
        <div className="label">3</div>
        <div className="text">
          Cameras supporting night vision and heat vision with automatic
          adjustment.
        </div>
      </div>
    </>
  );
};

export default Page;
