import { type FC, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import particlesVertexShader from './shaders/40/vertex.glsl';
import particlesFragmentShader from './shaders/40/fragment.glsl';
import GUI from 'lil-gui';
import gsap from 'gsap';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    if (!canvas.current) return;
    // Debug
    const gui = new GUI({ width: 340 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const debugObject: Record<string, any> = {};

    // Scene
    const scene = new THREE.Scene();

    // Loaders
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
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

      // update material
      if (particles) {
        particles.material?.uniforms.uResolution.value.set(
          sizes.width * sizes.pixelRatio,
          sizes.height * sizes.pixelRatio
        );
      }

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
    camera.position.set(0, 0, 8 * 2);
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
    debugObject.clearColor = '#160920';
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(debugObject.clearColor);
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    gui.addColor(debugObject, 'clearColor').onChange(() => {
      renderer.setClearColor(debugObject.clearColor);
    });

    /**
     * Particles
     */

    // Load models
    let particles: {
      geometry?: THREE.BufferGeometry;
      material?: THREE.ShaderMaterial;
      points?: THREE.Points;
      maxCount?: number;
      positions?: THREE.Float32BufferAttribute[];
      index?: number;
      morph?: (index: number) => void;
      morph0?: () => void;
      morph1?: () => void;
      morph2?: () => void;
      morph3?: () => void;
      colorA?: string;
      colorB?: string;
    } | null = null;
    gltfLoader.load('/models/modelsParticleMorphing.glb', (gltf) => {
      particles = {
        index: 0, // current index of the model
      };

      // Positions
      const positions = gltf.scene.children.map((child) => {
        return (child as THREE.Mesh).geometry.attributes.position;
      }); // vertices of the 4 objects

      particles.maxCount = 0; // init by 0
      // find the max count of vertices
      for (const pos of positions) {
        if (pos.count > particles.maxCount) {
          particles.maxCount = pos.count;
        }
      }

      particles.positions = [];
      for (const pos of positions) {
        const originalArray = pos.array;
        const newArray = new Float32Array(particles.maxCount * 3);

        for (let i = 0; i < particles.maxCount; i++) {
          const i3 = i * 3;
          if (i3 < originalArray.length) {
            newArray[i3] = originalArray[i3];
            newArray[i3 + 1] = originalArray[i3 + 1];
            newArray[i3 + 2] = originalArray[i3 + 2];
          } else {
            const randomIndex = Math.floor(pos.count * Math.random()) * 3;
            newArray[i3] = originalArray[randomIndex];
            newArray[i3 + 1] = originalArray[randomIndex + 1];
            newArray[i3 + 2] = originalArray[randomIndex + 2];
          }
        }

        particles.positions.push(new THREE.Float32BufferAttribute(newArray, 3));
      }

      // Geometry
      const sizesArray = new Float32Array(particles.maxCount);
      for (let i = 0; i < particles.maxCount; i++) {
        sizesArray[i] = Math.random();
      }

      particles.geometry = new THREE.BufferGeometry();
      particles.geometry.setAttribute(
        'position',
        particles.positions[particles.index!]
      );
      particles.geometry.setAttribute(
        'aPositionTarget',
        particles.positions[3]
      );
      particles.geometry.setAttribute(
        'aSize',
        new THREE.BufferAttribute(sizesArray, 1)
      );

      // particles.geometry.setIndex(null);
      // remove multiple index for performance issue and the particles won't seems too bright
      // no need to setIndex null when using loaded models, as those models are already smoothed in Blender, smooth will make the model get 1 vertex per point, no extra vertex

      // Material
      particles.colorA = '#ff7300';
      particles.colorB = '#0091ff';
      particles.material = new THREE.ShaderMaterial({
        vertexShader: particlesVertexShader,
        fragmentShader: particlesFragmentShader,
        uniforms: {
          uSize: new THREE.Uniform(0.4),
          uResolution: new THREE.Uniform(
            new THREE.Vector2(
              sizes.width * sizes.pixelRatio,
              sizes.height * sizes.pixelRatio
            )
          ),
          uProgress: new THREE.Uniform(0),
          uColorA: new THREE.Uniform(new THREE.Color(particles.colorA)),
          uColorB: new THREE.Uniform(new THREE.Color(particles.colorB)),
        },
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      // Points
      particles.points = new THREE.Points(
        particles.geometry,
        particles.material
      );
      particles.points.frustumCulled = false; // tell three.js we don't care this
      // as ask three.js to re-compute the bounding is kind of difficult to do, but we actually don't care the previous geometry attributes
      scene.add(particles.points);

      window.requestAnimationFrame(() => {
        console.log(particles?.points?.geometry.boundingSphere);
      });

      // Methods
      particles.morph = (index: number) => {
        // update attributes
        particles!.geometry!.attributes.position =
          particles!.positions![particles!.index!];
        particles!.geometry!.attributes.aPositionTarget =
          particles!.positions![index];

        // Animate uProgress
        gsap.fromTo(
          particles!.material!.uniforms.uProgress,
          // from
          {
            value: 0,
          },
          // to
          {
            value: 1,
            duration: 3,
            ease: 'linear',
          }
        );

        // update index
        particles!.index = index;
      };

      particles.morph0 = () => {
        particles!.morph!(0);
      };
      particles.morph1 = () => {
        particles!.morph!(1);
      };
      particles.morph2 = () => {
        particles!.morph!(2);
      };
      particles.morph3 = () => {
        particles!.morph!(3);
      };

      // Tweaks
      gui
        .add(particles.material.uniforms.uProgress, 'value')
        .min(0)
        .max(1)
        .step(0.001)
        .name('uProgress')
        .listen();

      gui.add(particles, 'morph0');
      gui.add(particles, 'morph1');
      gui.add(particles, 'morph2');
      gui.add(particles, 'morph3');

      gui.addColor(particles, 'colorA').onChange(() => {
        particles!.material!.uniforms.uColorA.value.set(particles!.colorA);
      });
      gui.addColor(particles, 'colorB').onChange(() => {
        particles!.material!.uniforms.uColorB.value.set(particles!.colorB);
      });

      setModelLoaded(true);
    });

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

    if (modelLoaded) {
      tick();
    }

    return () => {
      window.removeEventListener('resize', onResize);
      scene.clear();
      // particles.material.dispose();
      renderer.dispose();
      gui.destroy();
    };
  }, [canvas.current, modelLoaded]);

  return <canvas ref={canvas}></canvas>;
};

export default Page;
