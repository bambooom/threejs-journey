import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/sky.js';
import fireworkVertexShader from './shaders/34/vertex.glsl';
import fireworkFragmentShader from './shaders/34/fragment.glsl';
import GUI from 'lil-gui';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;
    // Debug
    const gui = new GUI();

    // Scene
    const scene = new THREE.Scene();

    // Loaders
    const textureLoader = new THREE.TextureLoader();

    /**
     * Sizes
     */
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio,
      // create a vector2 as resolution to be used in the shader, counting pixel ratio
      // which will makes particles looks same size on different devices
      resolution: new THREE.Vector2(
        window.innerWidth * pixelRatio,
        window.innerHeight * pixelRatio
      ),
    };

    const onResize = () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      // update pixel ratio
      sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);
      // update resolution, counting pixel ratio
      sizes.resolution.set(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio
      );

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
      25,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(1.5, 0, 6);
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
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    /**
     * Fireworks
     */
    const textures = [
      textureLoader.load('/particles/1.png'),
      textureLoader.load('/particles/2.png'),
      textureLoader.load('/particles/3.png'),
      textureLoader.load('/particles/4.png'),
      textureLoader.load('/particles/5.png'),
      textureLoader.load('/particles/6.png'),
      textureLoader.load('/particles/7.png'),
      textureLoader.load('/particles/8.png'),
    ];

    const createFirework = (
      count: number,
      position: THREE.Vector3,
      size: number,
      texture: THREE.Texture,
      radius: number,
      color: THREE.Color
    ) => {
      // Geometry
      const positionsArray = new Float32Array(count * 3);
      const sizesArray = new Float32Array(count);
      const timeMultiplierArray = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        const spherical = new THREE.Spherical(
          radius * (0.75 + Math.random() * 0.25), // base value 0.75 makes it more approaching to the sphere 表面, not the center core
          Math.random() * Math.PI, // phi, from bottom to top
          Math.random() * Math.PI * 2 // theta, horizontal, around
        );

        const position = new THREE.Vector3();
        position.setFromSpherical(spherical); // make point poston sphere like

        positionsArray[i3] = position.x;
        positionsArray[i3 + 1] = position.y;
        positionsArray[i3 + 2] = position.z;

        // positionsArray[i3] = Math.random() - 0.5;
        // positionsArray[i3 + 1] = Math.random() - 0.5;
        // positionsArray[i3 + 2] = Math.random() - 0.5;

        sizesArray[i] = Math.random();
        timeMultiplierArray[i] = 1 + Math.random();
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positionsArray, 3) // how many values per vertex
      );

      geometry.setAttribute(
        'aSize',
        new THREE.Float32BufferAttribute(sizesArray, 1)
      );

      geometry.setAttribute(
        'aTimeMultiplier',
        new THREE.Float32BufferAttribute(timeMultiplierArray, 1)
      );

      // Material
      texture.flipY = false; // flip the texture
      const material = new THREE.ShaderMaterial({
        vertexShader: fireworkVertexShader,
        fragmentShader: fireworkFragmentShader,
        uniforms: {
          uSize: new THREE.Uniform(size),
          uResolution: new THREE.Uniform(sizes.resolution),
          uTexture: new THREE.Uniform(texture),
          uColor: new THREE.Uniform(color),
          uProgress: new THREE.Uniform(0), // 0 to 1 value, control animation phases
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      // Points
      const firework = new THREE.Points(geometry, material);
      firework.position.copy(position);
      scene.add(firework);

      // Destroy
      const destroy = () => {
        scene.remove(firework);
        geometry.dispose();
        material.dispose();
        // don't need to dispose texture, may be used by other object
      };

      // Animate using gsap
      gsap.to(material.uniforms.uProgress, {
        value: 1,
        duration: 3, // 3s
        ease: 'linear',
        onComplete: destroy,
      });
    };

    const createRandomFireworks = () => {
      const count = Math.round(400 + Math.random() * 1000);
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random(),
        (Math.random() - 0.5) * 2
      );
      const size = 0.1 + Math.random() * 0.3;
      const texture = textures[Math.floor(Math.random() * textures.length)];
      const radius = 0.5 + Math.random();
      const color = new THREE.Color(
        Math.random(),
        Math.random(),
        Math.random()
      );

      createFirework(count, position, size, texture, radius, color);
    };

    createRandomFireworks();

    window.addEventListener('click', createRandomFireworks);

    /**
     * Sky
     *
     * example: https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_sky.html
     */
    // init Sky
    const sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    const sun = new THREE.Vector3();

    /// GUI

    const skyParameters = {
      turbidity: 10,
      rayleigh: 3,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.95,
      elevation: -2.2,
      azimuth: 180,
      exposure: renderer.toneMappingExposure,
    };

    function updateSky() {
      const uniforms = sky.material.uniforms;
      uniforms['turbidity'].value = skyParameters.turbidity;
      uniforms['rayleigh'].value = skyParameters.rayleigh;
      uniforms['mieCoefficient'].value = skyParameters.mieCoefficient;
      uniforms['mieDirectionalG'].value = skyParameters.mieDirectionalG;

      const phi = THREE.MathUtils.degToRad(90 - skyParameters.elevation);
      const theta = THREE.MathUtils.degToRad(skyParameters.azimuth);

      sun.setFromSphericalCoords(1, phi, theta);

      uniforms['sunPosition'].value.copy(sun);

      renderer.toneMappingExposure = skyParameters.exposure;
      renderer.render(scene, camera);
    }

    gui.add(skyParameters, 'turbidity', 0.0, 20.0, 0.1).onChange(updateSky);
    gui.add(skyParameters, 'rayleigh', 0.0, 4, 0.001).onChange(updateSky);
    gui
      .add(skyParameters, 'mieCoefficient', 0.0, 0.1, 0.001)
      .onChange(updateSky);
    gui
      .add(skyParameters, 'mieDirectionalG', 0.0, 1, 0.001)
      .onChange(updateSky);
    gui.add(skyParameters, 'elevation', -3, 90, 0.01).onChange(updateSky);
    gui.add(skyParameters, 'azimuth', -180, 180, 0.1).onChange(updateSky);
    gui.add(skyParameters, 'exposure', 0, 1, 0.0001).onChange(updateSky);

    updateSky();

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

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('click', createRandomFireworks);
      scene.clear();
      // geometry?.dispose();
      // material?.dispose();
      renderer.dispose();
      gui.destroy();
    };
  }, [canvas.current]);
  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;

/**
 * the animation is composed of 5 different phases:
 * - The particles start to expand fast in every direction
 * - They scale up even faster
 * - They start to fall down slowly
 * - They scale down
 * - They twinkle as they disappear
 */
