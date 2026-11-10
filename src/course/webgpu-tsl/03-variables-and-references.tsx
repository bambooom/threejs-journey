import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { attribute, checker, materialColor, modelNormalMatrix, modelPosition, normalLocal, normalView, normalWorld, positionGeometry, positionLocal, positionWorld, screenCoordinate, screenUV, userData, uv, vec2, vec3, vec4, viewportUV } from 'three/tsl';
import { TransformControls } from 'three/addons/controls/TransformControls.js'

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

    // make viewport very small
    // renderer.setViewport(100, 100, sizes.width / 4, sizes.height / 4)

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
      });

      // make floor be checker pattern, black white one
      const pattern = vec3(checker(uv().mul(4)))
      // material.colorNode = pattern;
      // to keep the map texture and put checker over on it
      // materialColor node contains the map multiplied by the color of the material
      material.colorNode = materialColor.mul(pattern)

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI * 0.5;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }

    /**
     * Torus Knot
     */
    // {
      const geometry = new THREE.TorusKnotGeometry(0.5, 0.24, 128, 32)

      const material = new THREE.MeshStandardNodeMaterial()

      material.colorNode = vec3(1)

      // can also use swizzle format
      // const foo = vec2(0.5, 1)
      // material.colorNode = foo.xxy

      // Choose one
      // const foo = color('#ff0000')
      // const foo = color(0xff0000)
      // const foo = color(1, 0, 0)
      // const foo = color({ r: 1, g: 0, b: 0 })
      // const foo = color(new THREE.Color('crimson'))
      // material.colorNode = foo

      // material.outputNode = vec4(1, 0, 0, 1)
      // material.outputNode = vec4(positionLocal, 1); // get colorful one, 0,0,0 at center
      // positionWorld: absolute world position, obtained by applying the model matrix to positionLocal
      // material.outputNode = vec4(positionWorld, 1)

      // positionGeometry looks similar to positionLocal, but displacement has not been applied yet
      // material.outputNode = vec4(positionGeometry, 1)

      // material.outputNode = vec4(uv(), 1, 1)

      // normal references * modelNormalMatrix
      // material.outputNode = vec4(modelNormalMatrix.mul(normalLocal), 1)
      // is just normal world
      // material.outputNode = vec4(normalWorld, 1)

      // view version, more blue
      // material.outputNode = vec4(normalView, 1)

      // screen and viewport references
      // material.outputNode = vec4(screenUV, 1, 1) // will change color relavent to viewport

      // It looks all white because it’s the pixel coordinate. The one on the top left corner is 0, 0, the one to its right is 1, 0, then 2, 0, and so on, so most of the pixels on screen have values at or beyond 1, making them look white.
      // You can test that theory by dividing screenCoordinate by a big number such as 1000
      // material.outputNode = vec4(screenCoordinate.div(1000), 1, 1)

      // material.outputNode = vec4(viewportUV, 1, 1)

      // model and camera references
      // and also modelScale, modelDirection
      // material.outputNode = vec4(modelPosition, 1)

      // can use the userData
      // material.outputNode = vec4(userData('foo'), 1)

      // use attribute
      material.outputNode = vec4(attribute('position'), 1, 1)


      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.position.y = 1

      // custom data put in userData
      mesh.userData.foo = new THREE.Color('#705DF2')

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
