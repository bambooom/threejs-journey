import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
import { Inspector } from 'three/addons/inspector/Inspector.js'
import { attribute, bufferAttribute, color, positionWorld, time, uniform, uniformArray, uv, vec2 } from 'three/tsl'

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;

    // Scene
    const scene = new THREE.Scene();

    // Loaders
    const textureLoader = new THREE.TextureLoader();

    /**
     * Textures
     */
    const uvChecker = textureLoader.load('/textures/uvChecker.png')
    uvChecker.colorSpace = THREE.SRGBColorSpace
    // uvChecker.wrapS = THREE.MirroredRepeatWrapping
    // uvChecker.wrapT = THREE.MirroredRepeatWrapping
    // uvChecker.repeat.set(3, 3)
    // uvChecker.rotation = 1

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

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
    camera.position.set(5, 4.5, 2.5);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas.current);
    controls.target.set(0, 1, 0);
    controls.enableDamping = true;

    /**
     * Renderer
     */
    const renderer = new THREE.WebGPURenderer({
      canvas: canvas.current,
      antialias: true,
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x111111);
    renderer.inspector = new Inspector()

    const onResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', onResize);

    /**
     * Floor
     */
    {
      const geometry = new THREE.PlaneGeometry(10, 10, 10, 10)

      const count = geometry.attributes.position.count // retrieve the amount of vertices
      // console.log(count); // 121
      const randomArray = new Float32Array(count)

      for(let i = 0; i < count; i++)
        randomArray[i] = Math.random() // fill in array

      // initiate random buffer
      const randomBuffer = new THREE.BufferAttribute(randomArray, 1)
      // geometry.setAttribute('random', randomBuffer) // bind it to the geometry using the setAttribute() method
      // can be ignored if using buffterAttribute, they can be associated automatically

      const material = new THREE.MeshStandardNodeMaterial({
        map: uvChecker,
        transparent: true,
      })

      // retrieve the attribute named random
      // const random = attribute('random')
      // material.colorNode = random

      const random = bufferAttribute(randomBuffer, 'float') // make sure output is float
      material.colorNode = random

      const fade = uv().sub(0.5).length().smoothstep(0.5, 0.2)
      material.opacityNode = fade

      const mesh = new THREE.Mesh(geometry, material)
      mesh.rotation.x = - Math.PI * 0.5
      mesh.receiveShadow = true
      scene.add(mesh)

    }

    /**
     * Torus Knot
     */
    {
      const geometry = new THREE.TorusKnotGeometry(0.5, 0.24, 128, 32)

      const material = new THREE.MeshStandardNodeMaterial()

      const frequency = uniform(2);
      const frequencies = uniform(vec2(2, 0.25)) // animation frequency
      const _color = uniform(color('crimson'))
      const colors = uniformArray([
          new THREE.Color(0x0b5d79),
          new THREE.Color(0x5ed6c2),
          new THREE.Color(0xfeedaa),
          new THREE.Color(0xfc8f74),
          new THREE.Color(0xcf2c65)
      ]) // updating the uniformArray() array length won’t automatically update later pattern's mul()

      const pattern = positionWorld.y
        .mul(frequencies.x) // use the uniform, more make slower
        .sub(time.mul(frequencies.y)) // make pattern animate with time
        .fract()   // make the pattern loop back to 0 when reaching 1
        .mul(colors.array.length)
        .floor()
        .toInt()
      // material.colorNode = pattern;
      // material.colorNode = _color.mul(pattern)
      material.colorNode = colors.element(pattern) // make multiple colors together 条纹。 pick the right value from the array,

      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.position.y = 1
      scene.add(mesh)

      // Tweaks
      const gui = renderer.inspector.createParameters('Torus Knot')
      // gui.add(frequency, 'value', 0, 10, 0.01).name('frequency') // change the frequency using gui
      gui.add(frequencies.value, 'x', 0, 10, 0.01).name('positionFrequency')
      gui.add(frequencies.value, 'y', 0, 10, 0.01).name('timeFrequency')
      // gui.addColor(_color, 'value').name('color')

    }

    /**
     * Lights
     */
    const directionalLight = new THREE.DirectionalLight(0xffffff, 4.5);
    directionalLight.castShadow = true;
    directionalLight.position.set(2, 0.75, -1).normalize().multiplyScalar(10);
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.near = 0.01;
    directionalLight.shadow.camera.far = 20;
    directionalLight.shadow.radius = 3;
    directionalLight.shadow.normalBias = 0.1;
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x859dff, 1);
    scene.add(ambientLight);

    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
    };

    const initRenderer = async () => {
      await renderer.init();
      renderer.setAnimationLoop(tick);
    };

    void initRenderer();

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener('resize', onResize);
      scene.clear();
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas className="webgpu" ref={canvas}></canvas>;
};

export default Page;
