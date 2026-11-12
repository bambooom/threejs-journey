import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { hash, mx_noise_float, mx_noise_vec3, positionLocal, positionWorld, rand, rotate, time, uv, vec2, vec3 } from 'three/tsl';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
// import TSLGraphEditor from 'three/addons/inspector/extensions/tsl-graph/TSLGraphEditor.js'

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
      const textureColor = textureLoader.load('/textures/floor-color.jpg');
      textureColor.colorSpace = THREE.SRGBColorSpace;

      const geometry = new THREE.PlaneGeometry(10, 10, 10, 10)

      const material = new THREE.MeshStandardNodeMaterial({ map: textureColor, transparent: true })
      // time contains the elapsed seconds since the rendering started, updated automatically
      // material.colorNode = time.sin().mul(0.5).add(0.5);
      // material.colorNode = time.sin().remap(-1, 1); // same as remap

      // hash() will return a random float() from 0 to 1 according to an int()
      // using uv.x * 100 to make the pattern like 灰色系条纹
      // const pattern = hash(uv().x.mul(100))

      // rand(uv()), return a pseudo random float() from 0 to 1 according to a 2D coordinate
      const pattern = rand(uv().mul(100).floor()) // get a more stable pattern by rounding. this pattern like a 马赛克瓷砖
      material.colorNode = vec3(pattern);

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
      material.userData.graphId = 'torus-physical'

      // classic noise starting with mx_, stands for materialX, previous three.js addon
      // multiply vec2 to apply different value on X and Y
      // const noise = mx_noise_float(uv().mul(vec2(50, 10)))
      // const noise = mx_noise_float(positionWorld.mul(4)) // similar to noise
      // material.colorNode = vec3(noise)

      // use vec3 version
      const noise = mx_noise_vec3(positionWorld.mul(10))
      material.colorNode = noise

      // rotate the torus knot around the y axis, the noise pattern like 投影
      const angle = time.add(positionLocal.y).sin() // rotating the mesh itself
      const newXZ = rotate(positionLocal.xz, angle) // want to rotate around the y axis, it means we want to update the x and z axes
      material.positionNode = vec3( // reconstruct position
        newXZ.x,
        positionLocal.y,
        newXZ.y
      )

      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.position.y = 1
      scene.add(mesh)
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
