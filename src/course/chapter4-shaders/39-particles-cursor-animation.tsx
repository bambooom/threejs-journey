import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
// import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import particlesVertexShader from './shaders/39/vertex.glsl';
import particlesFragmentShader from './shaders/39/fragment.glsl';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;
    // Debug
    // const gui = new GUI();

    // Scene
    const scene = new THREE.Scene();

    // Loaders
    const textureLoader = new THREE.TextureLoader();

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
      particlesMaterial.uniforms.uResolution.value.set(
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
    camera.position.set(0, 0, 18);
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
    renderer.setClearColor('#181818');
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    /**
     * Displacement, 2D canvas related
     */
    const displacement: {
      canvas: HTMLCanvasElement;
      context?: CanvasRenderingContext2D;
      glowImage: HTMLImageElement;
      interactivePlane?: THREE.Mesh;
      raycaster?: THREE.Raycaster;
      screenCursor?: THREE.Vector2;
      canvasCursor?: THREE.Vector2;
      canvasCursorPrevious?: THREE.Vector2;
      texture?: THREE.CanvasTexture;
    } = {
      canvas: document.createElement('canvas'),
      glowImage: new Image(),
    };
    displacement.canvas.width = 128;
    displacement.canvas.height = 128;
    displacement.canvas.style.position = 'fixed';
    displacement.canvas.style.top = '0';
    displacement.canvas.style.left = '0';
    displacement.canvas.style.width = '256px';
    displacement.canvas.style.height = '256px';
    displacement.canvas.style.zIndex = '10';
    document.body.append(displacement.canvas);
    // Context
    displacement.context = displacement.canvas.getContext('2d')!;
    // displacement.context.fillStyle = 'red';
    displacement.context.fillRect(
      0,
      0,
      displacement.canvas.width,
      displacement.canvas.height
    );

    // Glow image
    displacement.glowImage.src = '/textures/cursor-animation/glow.png';
    // setTimeout(() => {
    //   displacement.context!.drawImage(displacement.glowImage, 20, 20, 32, 32);
    // }, 1000);

    // Interactive plane, use Raycaster on this invisible plane, unable to use it on Particles
    displacement.interactivePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshBasicMaterial({ color: 'red', side: THREE.DoubleSide })
    );
    displacement.interactivePlane.visible = false; // hide it
    scene.add(displacement.interactivePlane);

    // Raycaster
    displacement.raycaster = new THREE.Raycaster();

    // Coordinates
    displacement.screenCursor = new THREE.Vector2(9999, 9999); // far away, cannot see by default
    displacement.canvasCursor = new THREE.Vector2(9999, 9999);
    displacement.canvasCursorPrevious = new THREE.Vector2(9999, 9999);

    const onPointerMove = (event: PointerEvent) => {
      // convert the screen coordinates to clip space coordinates (from -1 to +1)
      displacement.screenCursor!.x = (event.clientX / sizes.width) * 2 - 1;
      displacement.screenCursor!.y = -(event.clientY / sizes.height) * 2 + 1;
    };

    window.addEventListener('pointermove', onPointerMove);

    // use the canvas as the texture, and send to shader
    displacement.texture = new THREE.CanvasTexture(displacement.canvas);

    /**
     * Particles
     */
    const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128);
    particlesGeometry.setIndex(null); // we dont't care about index of trangles since we are drawing particles, so we dont's need index
    particlesGeometry.deleteAttribute('normal'); // also we don't use the normal, we can remove it

    // the particles animation when hovering
    const intensitiesArray = new Float32Array(
      particlesGeometry.attributes.position.count
    );
    // need random angles
    const anglesArray = new Float32Array(
      particlesGeometry.attributes.position.count
    );
    for (let i = 0; i < particlesGeometry.attributes.position.count; i++) {
      intensitiesArray[i] = Math.random();
      anglesArray[i] = Math.random() * Math.PI * 2; // random angle from 0 to 2PI, circle
    }
    particlesGeometry.setAttribute(
      'aIntensity',
      new THREE.BufferAttribute(intensitiesArray, 1)
    );
    particlesGeometry.setAttribute(
      'aAngle',
      new THREE.BufferAttribute(anglesArray, 1)
    );

    const particlesMaterial = new THREE.ShaderMaterial({
      vertexShader: particlesVertexShader,
      fragmentShader: particlesFragmentShader,
      uniforms: {
        uResolution: new THREE.Uniform(
          new THREE.Vector2(
            sizes.width * sizes.pixelRatio,
            sizes.height * sizes.pixelRatio
          )
        ),
        uPictureTexture: new THREE.Uniform(
          textureLoader.load('/textures/cursor-animation/picture-1.png')
        ),
        uDisplacementTexture: new THREE.Uniform(displacement.texture!), // send canvas texture to shader
      },
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    /**
     * Animate
     */
    // const clock = new THREE.Clock();

    const tick = () => {
      // const elapsedTime = clock.getElapsedTime();

      // Update controls
      controls.update();

      /**
       * Raycaster
       */
      displacement.raycaster!.setFromCamera(displacement.screenCursor!, camera);
      const intersections = displacement.raycaster!.intersectObject(
        displacement.interactivePlane!
      );
      if (intersections.length) {
        const uv = intersections[0].uv; // raycaster can retrive the uv coordinates
        displacement.canvasCursor!.x = uv!.x * displacement.canvas.width;
        displacement.canvasCursor!.y = (1 - uv!.y) * displacement.canvas.height;
      }

      /**
       * Displacement
       */
      // Fading out
      displacement.context!.globalCompositeOperation = 'source-over'; // default mode, just fill all black
      displacement.context!.globalAlpha = 0.02; // lower the alpha, the fading process will be longer, one can see the trail clearly
      displacement.context!.fillRect(
        0,
        0,
        displacement.canvas.width,
        displacement.canvas.height
      );

      // Speed alpha
      const cursorDistance = displacement.canvasCursorPrevious!.distanceTo(
        displacement.canvasCursor!
      );
      const alpha = Math.min(cursorDistance * 0.1, 1);
      displacement.canvasCursorPrevious!.copy(displacement.canvasCursor!);

      // Draw glow
      const glowSize = displacement.canvas.width * 0.25;
      displacement.context!.globalCompositeOperation = 'lighten'; // make it like AdditiveBlending mode
      displacement.context!.globalAlpha = alpha; // restore the alpha
      displacement.context!.drawImage(
        displacement.glowImage,
        displacement.canvasCursor!.x - glowSize * 0.5,
        displacement.canvasCursor!.y - glowSize * 0.5, // subtract both half the size to move the center back a little
        glowSize,
        glowSize
      );

      // Canvas Texture
      displacement.texture!.needsUpdate = true;

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      scene.clear();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [canvas.current]);

  return <canvas ref={canvas}></canvas>;
};

export default Page;
