import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Inspector } from 'three/addons/inspector/Inspector.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { float, Fn, min, mul, mx_noise_float, mx_noise_vec3, positionLocal, rotate, time, uv, vec2, vec3 } from 'three/tsl';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;

    // Scene
    const scene = new THREE.Scene();

    // Loaders
    const gltfLoader = new GLTFLoader()

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
    camera.position.set(8, 10, 12);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas.current);
    controls.target.set(0, 3, 0)
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
     * Model
     */
    void gltfLoader.loadAsync('/models/bakedMugModel.glb').then((model) => {
      const baked = model.scene.getObjectByName('baked')

      if (baked instanceof THREE.Mesh) {
        const material = baked.material as THREE.MeshStandardMaterial
        if (material.map) {
          material.map.anisotropy = 8
        }
      }

      scene.add(model.scene)
    })

    /**
     * Smoke
     */
    {
      // Geometry
      const geometry = new THREE.PlaneGeometry(1, 1, 16, 64)
      geometry.translate(0, 0.5, 0)
      geometry.scale(1.5, 6, 1.5)

      // Material
      const material = new THREE.MeshBasicNodeMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        wireframe: false,
        color: 0x7e583a
      })

      // Position, we want to move vertices, so need to use positionNode
      material.positionNode = Fn(() => {
        /**
         * Tip: positionGeometry corresponds to the position attribute, and positionLocal corresponds to the positionGeometry with added displacement (if displacement there is).
         */
        // cannot use positionGeometry, since it returning the actual attribute, which can’t be mutated
        const newPosition = positionLocal
        // newPosition.x.addAssign(2) // move on X axis

        // Twist
        // const angle = positionLocal.y.mul(0.3).sub(time.mul(0.2)).sin().mul(3) // use sin() to look like sometime one direction, sometime another direction
        // newPosition.xz.assign(rotate(newPosition.xz, angle)) // rotating at xz plane

        // Wind, use perlin noise again
        const windCoordinates = newPosition.sub(vec3(0, time.mul(0.3), 0)).mul(0.4) // Multiplying by a value below 1 or dividing by a value above 1 would have had the same result. This preference for multiplier is an old personal habit that used to be justified by a slight performance improvement in some technical context, and also to avoid the risk of ending up with a per 0 division.
        const windStrength = uv().y.mul(5)
        const wind = mx_noise_vec3(windCoordinates).mul(windStrength)
        newPosition.addAssign(wind)

        return newPosition
      })()

      // Opacity
      const smoke = mx_noise_float(uv().mul(vec2(3, 2)).sub(vec2(0, time.mul(0.1))))
      // const edgeFade = uv().y.mul(10)
      const edgeFade = min(
        uv().y.mul(10),          // Bottom
        uv().y.oneMinus(),       // Top
        uv().x.mul(5),           // Left
        uv().x.oneMinus().mul(5) // Right
      )
      material.opacityNode = mul(smoke, edgeFade).clamp(0, 1) // combine two, .clamp(0, 1) to add limits

      // Mesh
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.y = 1.83
      scene.add(mesh)
    }


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
