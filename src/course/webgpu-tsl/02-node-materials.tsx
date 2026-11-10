import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three/webgpu'
import { sin, positionLocal, checker, uv, float, vec3, vec2, vec4, time, mx_noise_vec3, vertexStage } from 'three/tsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

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
    camera.position.set(5, 4.5, 3.5);
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
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x111111);

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

      const geometry = new THREE.PlaneGeometry(10, 10, 10, 10);

      const material = new THREE.MeshStandardNodeMaterial({
        map: textureColor,
        transparent: true,
      });

      // use uv to add gradient fade
      // subtract 0.5 from uv to center the gradient on the plane, then use length to get the distance from the center of the plane, this will give us a value between 0 and 0.5, we can then use this value to fade out the color of the material
      // remap the value from 0.2 to 0.5 to 1 to 0, this will give us a fade that starts at 1 and ends at 0, with a smooth transition between the two values
      // but remap it too linear, use smoothstep instead, only need to invert the values, so 0.5 to 0.2 becomes 0.2 to 0.5, and 1 to 0 becomes 0 to 1, so we can use smoothstep(0.2, 0.5, value) to get the fade value
      const fade = uv().sub(0.5).length().smoothstep(0.5, 0.2)
      // outputNode almost the last node, it's after colorNode, and after lighting and shadow are applied
      // material.outputNode = vec4(vec3(fade), 1)

      // use opacityNode to fade out the material, this will make the material transparent, and will allow us to see through the material, but it will also make the material not receive shadows, so we need to use outputNode instead
      material.opacityNode = fade;

      // visualize the noise pattern on the floor, this will help us see how the noise is applied to the material, and how it affects the color of the material
      const noise = vertexStage(mx_noise_vec3(uv().mul(4)))
      // also can convert to varying, main diff is that we can choose a specific name for the varying
      // const noise = mx_noise_vec3(uv().mul(4)).toVarying('badAssNoise')
      material.colorNode = noise
      // mx_noise_vec3 is expensive, but colorNode is executed on fragment stage
      // moving calculation to vertexStage being interpolated to fragment stage, this will reduce the number of calculations being done on the fragment stage, and will improve performance

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI * 0.5;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }

    /**
     * Torus Knot
     */
    {
      const geometry = new THREE.TorusKnotGeometry(0.5, 0.24, 128, 32);

      // replace the standard material with a node material
      // exposing nodes
      const material = new THREE.MeshStandardNodeMaterial({
        color: 0xff0000,
        metalness: 0.5,
        roughness: 0.25,
      });
      // colorNode overides the color property of the material, and allows you to use a node instead of a static color
      // material.colorNode = vec3(1, 0.4, 0.1)

      // multiply uv by 10 to repeat the pattern 10 times across the surface of the geometry
      // add time to animate the pattern across the surface of the geometry, add multiply by 0.02 to slow down the animation
      const pattern = checker(
        uv()
          .add(time.mul(0.02))
          .mul(vec2(40, 5))); // vec2(x, y) to repeat the pattern x times across the surface of the geometry in the u direction and y times in the v direction
      material.colorNode = vec3(pattern, 0, 0) // red and black checker pattern
      material.roughnessNode = pattern;

      // add sin to the z position of the geometry to animate it left and right over time
      // add positionLocal.y to the sin function to make the animation dependent on the y position of the geometry, this will make the animation look like a wave
      // multiply by 3 to increase the frequency of the wave, more like a wiggle
      const zOffset = sin(time.add(positionLocal.y.mul(3))).mul(0.4); // multiply by 0.5 to reduce the amplitude of the wave
      material.positionNode = positionLocal.add(vec3(0, 0, zOffset)); // move the geometry in the z direction over time, this is useful for animating the geometry without having to move the mesh itself

      // positionNode allows you to move the geometry around in the scene, it is a node that takes a vec3 as input and outputs a vec3, it is added to the position of the geometry before it is rendered
      // material.positionNode = positionLocal.add(vec3(2, 0, 0));
      // move the geometry 2 units in the x direction, this is useful for moving the geometry around in the scene without having to move the mesh itself

      // expecting float
      // material.roughnessNode = float(0); // 0 will be consider false in js, should convert to float explicitly

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.y = 1;
      scene.add(mesh);
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
