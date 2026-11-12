import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
import { Inspector } from 'three/addons/inspector/Inspector.js'
import { blendColor, blendDodge, float, grayscale, hue, materialColor, mix, normalLocal, oscSine, positionLocal, rotateUV, saturation, texture, time, triplanarTexture, uv, vec2, vec4, vibrance } from 'three/tsl'

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
    uvChecker.wrapS = THREE.MirroredRepeatWrapping
    uvChecker.wrapT = THREE.MirroredRepeatWrapping
    uvChecker.repeat.set(3, 3)
    uvChecker.rotation = 1

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
      // const textureColor = textureLoader.load('/textures/floor-color.jpg');
      // textureColor.colorSpace = THREE.SRGBColorSpace;

      const geometry = new THREE.PlaneGeometry(10, 10, 10, 10)

      const material = new THREE.MeshStandardNodeMaterial({
        // map: uvChecker,
        color: 'crimson',
        transparent: true,
      })

      // texture() will automatically use the uv() node
      // material.colorNode = texture(uvChecker); // not using map but using texture node
      // material.colorNode = texture(
      //   uvChecker,
      //   rotateUV(uv().mul(3), -1, vec2(0)), // if provided uv() as second parameter, previous repeat and rotate setting are ignored, need to handle it like this
      //   //5 // third parameter allows us to select a different mipmap level
      //   // Mipmaps are scaled down versions of a texture, making the texture look blurry
      //   // used to avoid visual artifacts when the texture is seen in specific conditions such as a narrow angle, or from far away. The usage of those mipmaps is dictated by the minification and magnification filters.
      // )

      const oscillation = oscSine(time.mul(0.2)); // a value oscillating between 0 and 1
      // ===== Color =====
      //
      // material.colorNode = mix(
      //   texture(uvChecker).rgb,
      //   materialColor,
      //   oscillation, // mix strength
      // )

      // ===== blendDodge =====
      // - It’s designed to lighten the base layer’s colors based on the color of the blend layer.
      // - It significantly increases the brightness of the base layer, making the colors lighter and more vibrant.
      // - The brighter the color in the blend layer, the stronger the lightening and contrast effect on the base layer.
      // material.colorNode = blendDodge(
      //   texture(uvChecker).rgb,
      //   materialColor
      // )
      // blendBurn: darken the base layer

      // ===== blendColor =====
      // material.colorNode = blendColor(
      //   vec4(texture(uvChecker).rgb, 0.7),
      //   vec4(materialColor, 0.5)
      // )

      // saturate color, 色彩饱和度
      // material.colorNode = saturation(texture(uvChecker).rgb, oscillation.mul(2))

      // grayscale different with saturation=0
      // material.colorNode = grayscale(texture(uvChecker).rgb)
      // luminance() returns a float(), while grayscale() returns the luminance() as a vec3()
      // more natural version compared to the saturation() at 0

      // Selectively enhance the intensity of less saturated RGB colors. Can result in a more natural and visually appealing image with enhanced color depth compared to saturation()
      // not so sure about diff with saturation
      material.colorNode = vibrance(texture(uvChecker).rgb, oscillation)

      // hue() node allows us to shift the input color on that color wheel. no weird transition
      material.colorNode = hue(
        texture(uvChecker).rgb,
        time
      )

      const fade = uv().sub(0.5).length().smoothstep(0.5, 0.2)
      material.opacityNode = fade

      const mesh = new THREE.Mesh(geometry, material)
      mesh.rotation.x = - Math.PI * 0.5
      mesh.receiveShadow = true
      scene.add(mesh)

      // Tweaks
      const gui = renderer.inspector.createParameters('Floor')
      gui.addColor(material, 'color')

    }

    /**
     * Torus Knot
     */
    // {
      const geometry = new THREE.TorusKnotGeometry(0.5, 0.24, 128, 32)

      const material = new THREE.MeshStandardNodeMaterial()

      // When you want to apply a texture on a complex geometry with a UV unsuited for a classic texture projection, the solution might be to use the triplanar sampling
      // triplanar sampling: we sample the texture 3 times, each one relative to two axes of the 3D coordinate.
      // Then we blend the 3 samples together, usually according to the normal orientation
      material.colorNode = triplanarTexture(
        texture(uvChecker),     // textureXNode: The texture to sample, but as a node, which is why we use the texture() node
        null,                   // textureYNode: Same, but in case we want a different texture for the y plane
        null,                   // textureZNode: Same, but in case we want a different texture for the z plane
        float(1),               // scaleNode: A scale value where smaller scale equals bigger texture (defaults to float(1) already)
        positionLocal,          // The position to sample the texture (defaults to positionLocal already)
        normalLocal             // The normal, to blend the final texture (defaults to normalLocal already)
      )

      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.position.y = 1
      scene.add(mesh)

      // TransformControl
      const transformControls = new TransformControls(camera, canvas.current)
      transformControls.attach(mesh)
      scene.add(transformControls.getHelper())

      transformControls.addEventListener('dragging-changed', (event) =>
      {
          controls.enabled = !event.value
      })

      const onKeyDown = (event: any) =>
      {
          if(event.key === 'g')
              transformControls.setMode('translate')
          else if(event.key === 'r')
              transformControls.setMode('rotate')
          else if(event.key === 's')
              transformControls.setMode('scale')
      };

      window.addEventListener('keydown', onKeyDown)
    // }

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
      window.removeEventListener('keydown', onKeyDown);
      scene.clear();
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas className="webgpu" ref={canvas}></canvas>;
};

export default Page;
