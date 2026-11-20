import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Inspector } from 'three/addons/inspector/Inspector.js'
import { add, atan, color, cos, float, Fn, hash, mix, mul, mx_noise_float, mx_worley_noise_float, parallaxUV, PI, rand, time, uv, vec2, vec3 } from 'three/tsl'

// By Inigo Quilez (https://iquilezles.org/articles/palettes/)
export const palette = Fn( ( args: any ) => {
  const [ t, a, b, c, d ] = args;
	return a.add( b.mul( cos( mul( 6.283185, c.mul( t ).add( d ) ) ) ) );
}, { t: 'float', a: 'vec3', b: 'vec3', c: 'vec3', d: 'vec3', return: 'vec3' } );

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
    camera.position.set(1.25, 2, 4);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas.current);
    // controls.target.set(0, 1, 0);
    controls.target.set(0, 0, 0)
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

      const geometry = new THREE.PlaneGeometry(10, 10)

      const material = new THREE.MeshStandardNodeMaterial({ map: textureColor, transparent: true })
      material.opacityNode = uv().sub(0.5).length().smoothstep(0.5, 0.2)

      const mesh = new THREE.Mesh(geometry, material)
      mesh.rotation.x = - Math.PI * 0.5
      mesh.receiveShadow = true
      scene.add(mesh)

    }

    /**
     * Patterns
     */
    // Geometry
    // const geometry = new THREE.PlaneGeometry(2, 2, 1, 1)
    const geometry = new THREE.CircleGeometry(2, 32)

    // UV coordinates of the plane, and it will be the main input of every upcoming pattern
    // Material
    const material = new THREE.MeshBasicNodeMaterial()
    // pattern 1
    material.colorNode = vec3(uv(), 1)
    // Pattern 2, grayscale on x
    material.colorNode = vec3(uv().x)
    // Pattern 3, gray faster use fract to make 条纹 repeat
    material.colorNode = vec3(uv().x.mul(10).fract())
    // Pattern 4, checker board
    material.colorNode = vec3(
        add(
            uv().x.mul(10).fract().step(0.5),
            uv().y.mul(10).fract().step(0.5)
        )   // here we can have three values 0,1,2, so use sub(1).abs() to make it 0,1
        .sub(1).abs()
    )
    // Pattern 5， radial gradient, based on the distance to the center of the plane
    material.colorNode = vec3(uv().distance(0.5))
      // same as:
      // vec3(uv().distance(vec2(0.5)))
      // vec3(uv().sub(vec2(0.5)).length())

    // Pattern 6， angular gradient
    const polarUv = uv().sub(0.5) // 2D coordinates to be 0, 0 at the center
    const angle = atan(polarUv.x, polarUv.y) //  turn into angle, -pi to pi
    material.colorNode = vec3(angle.remap(PI.negate(), PI, 0, 1)) // remap to 0-1

    // Pattern 7, pseudo randomness checker
    const subdivisions = 10
    const gridUv = uv().mul(subdivisions).floor()
    // const random = hash(gridUv.x.mul(subdivisions).add(gridUv.y))
      // hash(gridUv) not working on y
    const random = rand(gridUv) // or simply use rand()
    material.colorNode = vec3(random)

    // Pattern 8
    const perlinUv = uv().mul(5) // increase freq
    const perlinNoise = mx_noise_float(perlinUv)
    material.colorNode = vec3(perlinNoise.mul(5).add(time).fract().step(0.8))
    // add time to animate, retrieve only the fraction of time
    // .mul(5) multiply the noise to get a higher frequency of lines

    // Pattern 9, based on the Worley noise, also called “Voronoi noise”, or “Cell noise”,
    // which can be generated with mx_worley_noise_ nodes
    // like 细胞,
    const worleyUv = uv().mul(10)
    const worleyNoise = mx_worley_noise_float(vec3(worleyUv, time)).pow(2)
    // used the _float version, we only get the distance to the closest point
    // use vec3(worleyUv, time) to animate, perfect to create underwater caustics
    material.colorNode = palette(
      worleyNoise,
      vec3(0.5, 0.3, 0.4),
      vec3(0.9, 0.5, 0.4),
      vec3(1.0, 1.0, 1.0),
      vec3(0.0, 0.1, 0.2)
    ) // use the Inigo Quilez palette

    // Pattern 10, parallax UV
    //  output is composed of 3 effects:
    //   - The water caustics
    //   - The surface foam
    //   - Some lily pads (that looks more like mold)
    //  And if you move the camera, you’ll notice that the depth of the water, represented by the caustics, seems to be further away, even though the plane is perfectly flat.
    const depthUv = parallaxUV(uv(), 0.5).xy; // 0.5 corresponds to how far behind the UV must be projected. This is just an illusion
    // depthUv need to return vec2
    // parallax effect is the perceptual difference of speed for moving objects at a different distance. Objects close look like they are moving fast, and objects far look like they are moving slow.
    const causticsInput = vec3(depthUv.mul(6), time.mul(0.3)) // use time to animate
    const causticsNoise = mx_worley_noise_float(causticsInput).pow(6) // pow(6) to make effect more intense
    const depthColor = mix(color(0x1b3956), color(0x11eeff), causticsNoise) // add some mix color
    // material.colorNode = vec3(depthColor)

    // form part, from perlin noise
    const foamInput = vec3(uv().mul(5), time.mul(0.1))
    const foamNoise = mx_noise_float(foamInput)
    const foamMask = foamNoise.abs().step(0.05).oneMinus() // abs() make range from -1~1 to 0~1
    const foamColor = color(0xe5f7ff)
    // material.colorNode = vec3(foamMask)

    // lily pads part, draw discs and circles
    const lilyPadInput = uv().mul(4).add(6) // .add(6) to offset to fill the gap of pattern
    const lilyPadNoise = mx_worley_noise_float(lilyPadInput)
    const lilyPadMask = lilyPadNoise.step(0.4).oneMinus()
    const lilyPadColor = mix(color(0xd7e689), color(0x329a89), lilyPadNoise.div(0.4)) // .div(0.4) make lilyPadNoise to increase faster, so that we can see other colors
    // material.colorNode = vec3(lilyPadColor).mul(lilyPadMask)

    let final = mix(depthColor, foamColor, foamMask)
    final = mix(final, lilyPadColor, lilyPadMask) // mix lily pads
    material.colorNode = final


    // Mesh
    const mesh = new THREE.Mesh(geometry, material)
    // mesh.position.y = 1
    mesh.rotation.x = - Math.PI * 0.5
    mesh.position.y = 0.01
    scene.add(mesh)

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
