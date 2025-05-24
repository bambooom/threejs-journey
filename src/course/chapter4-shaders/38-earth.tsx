import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import earthVertexShader from './shaders/38/earth/vertex.glsl';
import earthFragmentShader from './shaders/38/earth/fragment.glsl';
import atmosphereVertexShader from './shaders/38/atmosphere/vertex.glsl';
import atmosphereFragmentShader from './shaders/38/atmosphere/fragment.glsl';

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
     * Earth
     */
    const earthParameters = {
      atmosphereDayColor: '#00aaff',
      atmosphereTwilightColor: '#ff6600',
    };

    gui.addColor(earthParameters, 'atmosphereDayColor').onChange(() => {
      earthMaterial.uniforms.uAtmosphereDayColor.value.set(
        earthParameters.atmosphereDayColor
      );
      atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(
        earthParameters.atmosphereDayColor
      );
    });
    gui.addColor(earthParameters, 'atmosphereTwilightColor').onChange(() => {
      earthMaterial.uniforms.uAtmosphereNightColor.value.set(
        earthParameters.atmosphereTwilightColor
      );
      atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(
        earthParameters.atmosphereTwilightColor
      );
    });

    // Texture
    const earthDayTexture = textureLoader.load('/textures/earth/day.jpg');
    earthDayTexture.colorSpace = THREE.SRGBColorSpace;
    earthDayTexture.anisotropy = 8; // use 8 is good enough, and should work on all devices
    const earthNightTexture = textureLoader.load('/textures/earth/night.jpg');
    earthNightTexture.colorSpace = THREE.SRGBColorSpace;
    earthNightTexture.anisotropy = 8;
    const earthSpecularCloudsTexture = textureLoader.load(
      '/textures/earth/specularClouds.jpg'
    ); // no need to set color space for this one
    earthSpecularCloudsTexture.anisotropy = 8;

    // Mesh
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
    const earthMaterial = new THREE.ShaderMaterial({
      vertexShader: earthVertexShader,
      fragmentShader: earthFragmentShader,
      uniforms: {
        uDayTexture: new THREE.Uniform(earthDayTexture),
        uNightTexture: new THREE.Uniform(earthNightTexture),
        uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(
          new THREE.Color(earthParameters.atmosphereDayColor)
        ),
        uAtmosphereTwilightColor: new THREE.Uniform(
          new THREE.Color(earthParameters.atmosphereTwilightColor)
        ),
      },
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Fake atmosphere with a bigger sphere, but only see the backside
    const atmosphereMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(
          new THREE.Color(earthParameters.atmosphereDayColor)
        ),
        uAtmosphereTwilightColor: new THREE.Uniform(
          new THREE.Color(earthParameters.atmosphereTwilightColor)
        ),
      },
    });
    const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial);
    atmosphere.scale.set(1.04, 1.04, 1.04); // more realistic may use 1.015
    scene.add(atmosphere);

    /**
     * Sun
     */
    const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5);
    const sunDirection = new THREE.Vector3();

    const debugSun = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.1, 2),
      new THREE.MeshBasicMaterial()
    );
    scene.add(debugSun);

    //update
    const updateSun = () => {
      // Sun Direction
      sunDirection.setFromSpherical(sunSpherical);

      // Debug
      debugSun.position.copy(sunDirection).multiplyScalar(5); // if not multiply, it will be inside the earth, cannot see

      // Update earth material uniform
      earthMaterial.uniforms.uSunDirection.value.copy(sunDirection);
      // Update atmosphere material uniform
      atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);
    };
    updateSun();

    gui.add(sunSpherical, 'phi').min(0).max(Math.PI).onChange(updateSun);
    gui
      .add(sunSpherical, 'theta')
      .min(-Math.PI)
      .max(Math.PI)
      .onChange(updateSun);

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
      25,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(12, 5, 4);
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
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor('#000011');
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    // **anisotropy** is a property available on textures that will improve the sharpness of the texture when seen at a narrow angle by applying different levels of filtering
    // using this to get the max anisotropy, mine is 16
    // console.log(renderer.capabilities.getMaxAnisotropy());

    /**
     * Animate
     */
    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      earth.rotation.y = elapsedTime * 0.1;

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
      scene.clear();
      earthMaterial.dispose();
      renderer.dispose();
      gui.destroy();
    };
  }, [canvas.current]);

  return <canvas ref={canvas}></canvas>;
};

export default Page;
