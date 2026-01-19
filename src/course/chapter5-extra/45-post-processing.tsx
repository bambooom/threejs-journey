import { type FC, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { GammaCorrectionShader } from 'three/examples/jsm/Addons.js';
import { SMAAPass } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';

const Page: FC = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    if (!canvas.current) return;

    /**
     * Base
     */
    // Debug
    const gui = new GUI();

    // Scene
    const scene = new THREE.Scene();

    /**
     * Loaders
     */
    const gltfLoader = new GLTFLoader();
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const textureLoader = new THREE.TextureLoader();

    /**
     * Update all materials
     */
    const updateAllMaterials = () => {
      scene.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshStandardMaterial
        ) {
          child.material.envMapIntensity = 2.5;
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
      '/textures/environmentMaps/1/px.png',
      '/textures/environmentMaps/1/nx.png',
      '/textures/environmentMaps/1/py.png',
      '/textures/environmentMaps/1/ny.png',
      '/textures/environmentMaps/1/pz.png',
      '/textures/environmentMaps/1/nz.png',
    ]);

    scene.background = environmentMap;
    scene.environment = environmentMap;

    /**
     * Models
     */

    gltfLoader.load('/models/DamagedHelmet/glTF/DamagedHelmet.gltf', (gltf) => {
      gltf.scene.scale.set(2, 2, 2);
      gltf.scene.rotation.y = Math.PI * 0.5;
      scene.add(gltf.scene);
      setModelLoaded(true);

      updateAllMaterials();
    });

    /**
     * Lights
     */
    const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.far = 15;
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

      // update effect composer
      effectComposer.setSize(sizes.width, sizes.height);
      effectComposer.setPixelRatio(sizes.pixelRatio);
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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    // renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    /**
     * Post processing
     */
    // Reder target
    const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
      samples: renderer.getPixelRatio() === 1 ? 2 : 0, // anti alias
      // the more samples, the better the antialias, 0 corresponds to no samples, every increase will lower the performance
      // if pixel ratio above 1, the pixel density is high enough, no need to increase samples
    });

    const effectComposer = new EffectComposer(renderer, renderTarget);
    effectComposer.setSize(sizes.width, sizes.height);
    effectComposer.setPixelRatio(sizes.pixelRatio);

    // render pass
    const renderPass = new RenderPass(scene, camera);
    effectComposer.addPass(renderPass);

    // dot screen pass
    const dotScreenPass = new DotScreenPass();
    dotScreenPass.enabled = false;
    effectComposer.addPass(dotScreenPass);

    // glitch pass
    const glitchPass = new GlitchPass();
    glitchPass.goWild = false;
    glitchPass.enabled = false;
    effectComposer.addPass(glitchPass);

    // rgb shift pass
    const rgbShiftPass = new ShaderPass(RGBShiftShader);
    rgbShiftPass.enabled = false;
    effectComposer.addPass(rgbShiftPass);

    // unreal bloom pass
    const unrealBloomPass = new UnrealBloomPass(
      new THREE.Vector2(sizes.width, sizes.height),
      0.3,
      1,
      0.6,
    );
    rgbShiftPass.enabled = false;
    effectComposer.addPass(unrealBloomPass);

    gui.add(unrealBloomPass, 'enabled');
    gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001);
    gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001);
    gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001);

    // gamma correction pass
    const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
    effectComposer.addPass(gammaCorrectionPass);

    // Tint pass, create own pass, 1st pass
    const TintShader = {
      uniforms: {
        tDiffuse: { value: null }, // texture
        uTint: { value: null },
      },
      vertexShader: `
        varying vec2 vUv;

        void main()
        {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

          vUv = uv;
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 uTint;

        varying vec2 vUv;

        void main()
        {
          vec4 color = texture2D(tDiffuse, vUv);
          color.rgb += uTint;

          gl_FragColor = color;
        }
      `,
    };
    const tintPass = new ShaderPass(TintShader);
    tintPass.material.uniforms.uTint.value = new THREE.Vector3();
    effectComposer.addPass(tintPass);

    gui
      .add(tintPass.material.uniforms.uTint.value, 'x')
      .min(-1)
      .max(1)
      .step(0.001)
      .name('red');
    gui
      .add(tintPass.material.uniforms.uTint.value, 'y')
      .min(-1)
      .max(1)
      .step(0.001)
      .name('green');
    gui
      .add(tintPass.material.uniforms.uTint.value, 'z')
      .min(-1)
      .max(1)
      .step(0.001)
      .name('blue');

    // Displacement pass, create own pass, 1st pass
    const DisplacementShader = {
      uniforms: {
        tDiffuse: { value: null }, // texture
        // uTime: { value: null },
        uNormalMap: { value: null },
      },
      vertexShader: `
        varying vec2 vUv;

        void main()
        {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

          vUv = uv;
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        // uniform float uTime;
        uniform sampler2D uNormalMap;

        varying vec2 vUv;

        void main()
        {
          vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;

          // vec2 newUv = vec2(vUv.x, vUv.y + sin(vUv.x * 10.0 + uTime) * 0.1);
          vec2 newUv = vUv + normalColor.xy * 0.1;
          vec4 color = texture2D(tDiffuse, newUv);

          vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
          float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
          color += lightness * 2.0;

          gl_FragColor = color;
        }
      `,
    };
    const displacementPass = new ShaderPass(DisplacementShader);
    // displacementPass.material.uniforms.uTime.value = 0;
    displacementPass.material.uniforms.uNormalMap.value = textureLoader.load(
      '/textures/interfaceNormalMap.png',
    );
    effectComposer.addPass(displacementPass);

    // SMAA pass
    if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
      // check pixel ratio and if webgl2 is supported, if not, use SMAA pass to do antialiasing
      // SMAA pass, doing antialiasing, need to do this after other pass
      const smaaPass = new SMAAPass();
      effectComposer.addPass(smaaPass);
    }

    /**
     * Animate
     */
    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // update passes
      // displacementPass.material.uniforms.uTime.value = elapsedTime;

      // Update controls
      controls.update();

      // Render
      // renderer.render(scene, camera);
      effectComposer.render();

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    if (modelLoaded) tick();

    return () => {
      window.removeEventListener('resize', onResize);
      scene.clear();
      renderer.dispose();
      gui.destroy();
    };
  }, [modelLoaded]);
  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;
