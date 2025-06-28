import { type FC, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  GLTFLoader,
  type GLTF,
} from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';
import particlesVertexShader from './shaders/41/particles/vertex.glsl';
import particlesFragmentShader from './shaders/41/particles/fragment.glsl';
import gpgpuParticlesShader from './shaders/41/gpgpu/particles.glsl';
import GUI from 'lil-gui';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const model = useRef<GLTF | null>(null);

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

      // Materials
      particles.material?.uniforms.uResolution.value.set(
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
      35,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(4.5, 4, 11);
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
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);
    debugObject.clearColor = '#29191f';
    renderer.setClearColor(debugObject.clearColor);

    /**
     * Load model first
     */
    gltfLoader.load('/models/boat.glb', (gltf) => {
      model.current = gltf;
      // Set model loaded state to trigger useEffect re-run
      setModelLoaded(true);
    });

    // Early return if model not loaded yet
    if (!modelLoaded || !model.current) {
      return;
    }

    // Use loaded model geometry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseGeometry: Record<string, any> = {
      instance: (model.current.scene.children[0] as THREE.Mesh).geometry,
    };
    baseGeometry.count = baseGeometry.instance.attributes.position.count;

    /**
     * GPU Compute
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gpgpu: Record<string, any> = {};
    gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count)); // the size of the texture
    gpgpu.computation = new GPUComputationRenderer(
      gpgpu.size,
      gpgpu.size,
      renderer
    );

    // Base particles
    const baseParticlesTexture = gpgpu.computation.createTexture();
    // It's a DataTexture which is similar to other Three.js textures but the pixels data is set up as an array which we can access in baseParticlesTexture.image.data
    // almost like an image

    for (let i = 0; i < baseGeometry.count; i++) {
      const i3 = i * 3;
      const i4 = i * 4;

      // Position based on geometry, rgba, 4x4
      baseParticlesTexture.image.data[i4 + 0] =
        baseGeometry.instance.attributes.position.array[i3 + 0];
      baseParticlesTexture.image.data[i4 + 1] =
        baseGeometry.instance.attributes.position.array[i3 + 1];
      baseParticlesTexture.image.data[i4 + 2] =
        baseGeometry.instance.attributes.position.array[i3 + 2];
      baseParticlesTexture.image.data[i4 + 3] = Math.random(); // different lifespan
    }
    // console.log(baseParticlesTexture.image.data); // FLoat32Array

    // GPUComputationRenderer works in a way where each type of data that will be computed is called a “variable”. In our case, we have only one variable and it’s the particles.
    // To create a variable, we send the base texture (baseParticlesTexture) that we created earlier. In addition, we need to send a shader that will update that texture.

    // Particles variable
    gpgpu.particlesVariable = gpgpu.computation.addVariable(
      'uParticles', // name we choose for the texture
      gpgpuParticlesShader,
      baseParticlesTexture
    );
    // The “variable” needs to be re-injected into itself.
    gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [
      gpgpu.particlesVariable,
    ]); // second parameter is an array containing the dependencies
    // so we create a loop, which allows us to keep on sending and updating the same texture

    // Uniforms
    gpgpu.particlesVariable.material.uniforms.uTime = new THREE.Uniform(0);
    gpgpu.particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0);
    gpgpu.particlesVariable.material.uniforms.uBase = new THREE.Uniform(
      baseParticlesTexture
    ); // send original texture
    gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence =
      new THREE.Uniform(0.5);
    gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength =
      new THREE.Uniform(2);
    gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency =
      new THREE.Uniform(0.5);

    // Init
    gpgpu.computation.init();

    // Debug
    gpgpu.debug = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 3),
      new THREE.MeshBasicMaterial({
        map: gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable)
          .texture,
      })
    );
    gpgpu.debug.visible = false; // hide debug plane
    gpgpu.debug.position.x = 3;
    scene.add(gpgpu.debug);

    // We want to apply the GPUComputationRenderer output texture to that plane and we can access it using the getCurrentRenderTarget()
    // console.log(
    //   gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture
    // ); // output WebGLRenderTarget

    /**
     * Particles
     */
    const particles: {
      geometry?: THREE.BufferGeometry;
      material?: THREE.ShaderMaterial;
      points?: THREE.Points;
    } = {};

    // Geometry
    const particlesUvArray = new Float32Array(baseGeometry.count * 2); // we want uv coordinates for particles
    const sizesArray = new Float32Array(baseGeometry.count);
    for (let y = 0; y < gpgpu.size; y++) {
      for (let x = 0; x < gpgpu.size; x++) {
        const i = y * gpgpu.size + x;
        const i2 = i * 2;

        // Particles UV
        const uvX = (x + 0.5) / gpgpu.size;
        const uvY = (y + 0.5) / gpgpu.size;

        particlesUvArray[i2 + 0] = uvX;
        particlesUvArray[i2 + 1] = uvY;

        // random Sizes
        sizesArray[i] = Math.random();
      }
    }

    particles.geometry = new THREE.BufferGeometry();
    particles.geometry.setDrawRange(0, baseGeometry.count); // define a range of vertices:
    particles.geometry.setAttribute(
      'aParticlesUv',
      new THREE.BufferAttribute(particlesUvArray, 2)
    ); // set the uv coordinates
    particles.geometry.setAttribute(
      'aColor',
      baseGeometry.instance.attributes.color
    ); // color already in model
    particles.geometry.setAttribute(
      'aSize',
      new THREE.BufferAttribute(sizesArray, 1)
    ); // sizes array

    // Material
    particles.material = new THREE.ShaderMaterial({
      vertexShader: particlesVertexShader,
      fragmentShader: particlesFragmentShader,
      uniforms: {
        uSize: new THREE.Uniform(0.07),
        uResolution: new THREE.Uniform(
          new THREE.Vector2(
            sizes.width * sizes.pixelRatio,
            sizes.height * sizes.pixelRatio
          )
        ),
        uParticlesTexture: new THREE.Uniform(null), // no need to provide params
      },
    });

    // Points
    particles.points = new THREE.Points(particles.geometry, particles.material);
    scene.add(particles.points);

    /**
     * Tweaks
     */
    gui.addColor(debugObject, 'clearColor').onChange(() => {
      renderer.setClearColor(debugObject.clearColor);
    });
    gui
      .add(particles.material.uniforms.uSize, 'value')
      .min(0)
      .max(1)
      .step(0.001)
      .name('uSize');
    gui
      .add(
        gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence,
        'value'
      )
      .min(0)
      .max(1)
      .name('uFlowFieldInfluence');
    gui
      .add(
        gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength,
        'value'
      )
      .min(0)
      .max(10)
      .name('uFlowFieldStrength');
    gui
      .add(
        gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency,
        'value'
      )
      .min(0)
      .max(1)
      .step(0.001)
      .name('uFlowFieldStrength');

    /**
     * Animate
     */
    const clock = new THREE.Clock();
    let previousTime = 0;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;

      // Update controls
      controls.update();

      // GPGPU Update
      gpgpu.particlesVariable.material.uniforms.uTime.value = elapsedTime; // before compute
      gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime; // use deltatime to solve different on different device frame rate
      gpgpu.computation.compute();
      // update material by texture
      particles.material!.uniforms.uParticlesTexture.value =
        gpgpu.computation.getCurrentRenderTarget(
          gpgpu.particlesVariable
        ).texture;

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    if (modelLoaded) tick();

    return () => {
      window.removeEventListener('resize', onResize);
      scene.clear();
      particles.material?.dispose();
      renderer.dispose();
      gui.destroy();
    };
  }, [modelLoaded]); // Re-run when model loads

  return <canvas ref={canvas}></canvas>;
};

export default Page;
