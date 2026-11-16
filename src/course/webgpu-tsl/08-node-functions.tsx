import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
import { Inspector } from 'three/addons/inspector/Inspector.js'
import { bool, Discard, float, Fn, If, int, Loop, not, uv, vec2, vec3 } from 'three/tsl'


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

      const material = new THREE.MeshStandardNodeMaterial({
        map: uvChecker,
        transparent: true,
        side: THREE.DoubleSide
      })

      // Node Function, to draw a circle on floor
      // goal: return a float(1) when coordicate inside the circle shape, otherwise float(0)
      const circle = Fn(
        ({
          coordinates = uv(),
          center = vec2(0.5),
          radius = float(0.25),
          thickness = float(0.02),
          inverted = bool(false),
          discarded = bool(false) // Discard is an instruction in the fragment shader indicating that we don’t want to render anything there.
        }: any) => {
          const distanceToCenter = coordinates.distance(center);
          const lineSDF = distanceToCenter.sub(radius) // get SDF value, 0 at the exact shape edge, minus something inside, positive something outside
          // const line = float(1).sub(lineSDF.abs().step(thickness.div(2))) // make lineSDF absolute (only positive), and use a step() with thickness as the threshold to get a sharp change
          // div 2 is because it's on both sides
          // 1 - xx to get converted value, but cannot use javascript calculation, need to use node calculation
          // or use oneMinus() in the end, they are the same
          const line = lineSDF.abs().step(thickness.div(2))

          // or `inverted.not()`
          If(not(inverted), () => {
            // console.log('This is inside the If') // is always executed
            // All those nodes we are providing are instructions to build the final shader. It’s not the actual logic happening in JavaScript.

            // node way to assign the value again
            line.assign(line.oneMinus())
          })

          // if less than 0, discard it
          // If(line.lessThanEqual(0).and(discarded), () => {
          //   Discard()
          // })
          // or write like:
          Discard(line.lessThanEqual(0).and(discarded))
          // or
          line.lessThanEqual(0).and(discarded).discard()
          // or, not so readable
          // and(lessThanEqual(line, 0), discarded).discard()

          return line;
        },
        { // second argument for Fn(), which we specify the parameters type so that TSL can create  dedicated shader function
          // makes TSL less permissive, but it’s a way to optimize the shader
          coordinates: 'vec2',
          center: 'vec2',
          radius: 'float',
          thickness: 'float',
          inverted: 'bool',
          discarded: 'bool',
          return: 'float'
        }
      )

      // use loop
      const circles = Fn(
        ({
          coordinates = uv(),
          center = vec2(0.5),
          radius = float(0.25),
          thickness = float(0.02),
          inverted = bool(false),
          discarded = bool(false),
          count = int(5), // how many circles to draw
          span = float(0.1)  // how far away the circles are from each other
        }: any) => {
          const lines = float(0)

          // Loop(count, ({ i }) => {
          //   console.log('loop!') // will log only one loop! in console, this is not the real loop in js
          // })

          // i will be float
          Loop({start: float(0), end: count, type: 'float', condition: '<', name: 'i'}, ({ i }) => {
            lines.addAssign(circle({     // addAssign() is a shortcut to add a value to a node, and immediately re-assign it.
              coordinates,
              center,
              radius: radius.add(i.mul(span)),
              thickness,
              // inverted,
              inverted: bool(false),
              discarded: bool(false)
            }))
          })

          If(inverted, () => {
            lines.assign(lines.oneMinus())
          })

          lines.lessThanEqual(0).and(discarded).discard()

          return lines
        })

      // material.colorNode = vec3(circle({
      //   // inverted: bool(true)
      //   discarded: bool(true)
      // })) // need to call circle, it's a function

      // lower radius, can see all 5 circles, larger radius will fade out some circles
      material.colorNode = vec3(
        circles({ radius: float(0.075) }).toVar('circlesOutput')
      )

      const fade = uv().sub(0.5).length().smoothstep(0.5, 0.2)
      material.opacityNode = fade

      const mesh = new THREE.Mesh(geometry, material)
      mesh.rotation.x = - Math.PI * 0.5
      mesh.receiveShadow = true
      scene.add(mesh)

      void renderer.debug.getShaderAsync(scene, camera, mesh).then((program) => {
        console.log(program.fragmentShader) // built shader for the circles
      })

    }

    /**
     * Torus Knot
     */
    {
      const geometry = new THREE.TorusKnotGeometry(0.5, 0.24, 128, 32)

      const material = new THREE.MeshStandardNodeMaterial()

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



// many more nodes related to conditional logic:
// Else()
// ElseIf()
// Switch()
// and()
// or()
// greaterThan()
// lessThan()
// greaterThanEqual()
// lessThanEqual()
