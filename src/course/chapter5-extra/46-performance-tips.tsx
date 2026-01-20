import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js';
import Stats from 'stats.js';

const Page: FC = () => {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;

    /**
     * Stats
     */
    const stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    // Scene
    const scene = new THREE.Scene();

    /**
     * Textures
     */
    const textureLoader = new THREE.TextureLoader();
    const displacementTexture = textureLoader.load(
      '/textures/displacementMap.png',
    );

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
      75,
      sizes.width / sizes.height,
      0.1,
      100,
    );
    camera.position.set(4, 1, -4);
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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    // renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    /**
     * Test meshes
     */
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial(),
    );
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.set(-5, 0, 0);
    // scene.add(cube);

    const torusKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1, 0.4, 128, 32),
      new THREE.MeshStandardMaterial(),
    );
    torusKnot.castShadow = true;
    torusKnot.receiveShadow = true;
    // scene.add(torusKnot);

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshStandardMaterial(),
    );
    sphere.position.set(5, 0, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    // scene.add(sphere);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial(),
    );
    floor.position.set(0, -2, 0);
    floor.rotation.x = -Math.PI * 0.5;
    floor.castShadow = true;
    floor.receiveShadow = true;
    // scene.add(floor);

    /**
     * Lights
     */
    const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.normalBias = 0.05;
    directionalLight.position.set(0.25, 3, 2.25);
    scene.add(directionalLight);

    /**
     * Animate
     */
    const clock = new THREE.Clock();

    const tick = () => {
      stats.begin();

      const elapsedTime = clock.getElapsedTime();

      // update passes
      // displacementPass.material.uniforms.uTime.value = elapsedTime;

      // Update controls
      controls.update();

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);

      stats.end();
    };

    tick();

    /**
     * Tips
     */

    // // Tip 4
    // console.log(renderer.info)

    // // Tip 5
    // keep an eye on the native JS code performance

    // // Tip 6, once object is not needed, dispose/remove it
    // scene.remove(cube)
    // cube.geometry.dispose()
    // cube.material.dispose()

    // // Tip 7
    // try to avoid using lights

    // // Tip 8
    // try not to add/remove lights

    // // Tip 9
    // try to avoid using too many shadows, use baked shadows

    // // Tip 10, make sure shadow maps fit perfectly with the scene, use camera helper to check
    // directionalLight.shadow.camera.top = 3
    // directionalLight.shadow.camera.right = 6
    // directionalLight.shadow.camera.left = - 6
    // directionalLight.shadow.camera.bottom = - 3
    // directionalLight.shadow.camera.far = 10
    // directionalLight.shadow.mapSize.set(1024, 1024) // use smaller map size possibly

    // const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
    // scene.add(cameraHelper)

    // // Tip 11, castShadow and receiveShadow wisely, when necessary
    // cube.castShadow = true
    // cube.receiveShadow = false

    // torusKnot.castShadow = true
    // torusKnot.receiveShadow = false // no object above it, no need to receive shadow

    // sphere.castShadow = true
    // sphere.receiveShadow = false

    // floor.castShadow = false
    // floor.receiveShadow = true

    // // Tip 12, deactivate shadow auto update
    // renderer.shadowMap.autoUpdate = false // no need to update shadow every frame, maybe update every 2 frames
    // renderer.shadowMap.needsUpdate = true

    // // Tip 13, resize texture as small as possible

    // // Tip 14, keep a power of 2 resolution

    // // Tip 15, use the right format, .jpg or .png
    // can try Basis format, https://github.com/BinomialLLC/basis_universal

    // // Tip 16, use BufferGeometry, but threejs is already updated to use BufferGeometry by default

    // // Tip 17, do not update vertices, avoid it if have huge geometries with a lot of vertices

    // // Tip 18, mutualize geometries, if have a lot of same geometries, use same geometry
    // const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    // for (let i = 0; i < 50; i++) {
    //   // const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    //   const material = new THREE.MeshNormalMaterial();

    //   const mesh = new THREE.Mesh(geometry, material);
    //   mesh.position.x = (Math.random() - 0.5) * 10;
    //   mesh.position.y = (Math.random() - 0.5) * 10;
    //   mesh.position.z = (Math.random() - 0.5) * 10;
    //   mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2;
    //   mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2;

    //   scene.add(mesh);
    // }

    // // Tip 19, merge geometries, use BufferGeometryUtils.mergeGeometries
    // const geometries = [];
    // for (let i = 0; i < 50; i++) {
    //   const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

    //   geometry.rotateX((Math.random() - 0.5) * Math.PI * 2);
    //   geometry.rotateY((Math.random() - 0.5) * Math.PI * 2);

    //   geometry.translate(
    //     (Math.random() - 0.5) * 10,
    //     (Math.random() - 0.5) * 10,
    //     (Math.random() - 0.5) * 10,
    //   );

    //   geometries.push(geometry);
    // }

    // const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
    // const material = new THREE.MeshNormalMaterial();
    // const mesh = new THREE.Mesh(mergedGeometry, material);
    // scene.add(mesh);

    // // Tip 20, mutualize materials
    // const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    // const material = new THREE.MeshNormalMaterial()

    // for(let i = 0; i < 50; i++)
    // {
    //     // const material = new THREE.MeshNormalMaterial()

    //     const mesh = new THREE.Mesh(geometry, material)
    //     mesh.position.x = (Math.random() - 0.5) * 10
    //     mesh.position.y = (Math.random() - 0.5) * 10
    //     mesh.position.z = (Math.random() - 0.5) * 10
    //     mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2
    //     mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2

    //     scene.add(mesh)
    // }

    // // Tip 21, use cheap materials
    // Some materials like MeshStandardMaterial or MeshPhysicalMaterial need more resources than materials such as MeshBasicMaterial, MeshLambertMaterial or MeshPhongMaterial.

    // // Tip 22, use InstancedMesh, only one mesh, and provide a transformation matrix for each "instance" of that mesh
    // the matrix has to be Matrix4
    // const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    // const material = new THREE.MeshNormalMaterial();
    // const mesh = new THREE.InstancedMesh(geometry, material, 50); // 50 is how many instances
    // // If you intend to change these matrices in the tick function, add this to the InstancedMesh:
    // mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // scene.add(mesh);

    // for (let i = 0; i < 50; i++) {
    //   // create matrix

    //   const position = new THREE.Vector3(
    //     (Math.random() - 0.5) * 10,
    //     (Math.random() - 0.5) * 10,
    //     (Math.random() - 0.5) * 10,
    //   );

    //   const quaternion = new THREE.Quaternion();
    //   quaternion.setFromEuler(
    //     new THREE.Euler(
    //       (Math.random() - 0.5) * Math.PI * 2,
    //       (Math.random() - 0.5) * Math.PI * 2,
    //       0,
    //     ),
    //   );

    //   const matrix = new THREE.Matrix4();
    //   matrix.makeRotationFromQuaternion(quaternion); // set rotation
    //   matrix.setPosition(position);

    //   mesh.setMatrixAt(i, matrix); // set matrix at index i

    //   // const mesh = new THREE.Mesh(geometry, material);
    //   // mesh.position.x = (Math.random() - 0.5) * 10;
    //   // mesh.position.y = (Math.random() - 0.5) * 10;
    //   // mesh.position.z = (Math.random() - 0.5) * 10;
    //   // mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2;
    //   // mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2;
    //   // scene.add(mesh);
    // }

    // // Tip 23, use low poly models

    // // Tip 24, use Draco compression

    // // Tip 25, try to use Gzip, compression on server side

    // // Tip 26, camera FOV, can reduce FOV, objects not in the view will not be rendered

    // // Tip 27, near and far, reduce near and far also can improve performance

    // // Tip 28, pixel ratio, max 2 is good enough
    // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // // Tip 29, Power preferences, Some devices may be able to switch between different GPU or different GPU usage
    // const renderer = new THREE.WebGLRenderer({
    //   canvas: canvas,
    //   powerPreference: 'high-performance', // 'default'
    // });

    // limit passes, merge passes

    // // Tip 31, 32, 34 and 35
    const shaderGeometry = new THREE.PlaneGeometry(10, 10, 256, 256);

    const shaderMaterial = new THREE.ShaderMaterial({
      precision: 'lowp', // can force the precision
      uniforms: {
        uDisplacementTexture: { value: displacementTexture },
        // uDisplacementStrength: { value: 1.5 },
      },
      // inside shader: avoid if statement, Make good use of swizzles and built-in functions.
      // vertexShader: `
      //       #define uDisplacementStrength 1.5 // use define instead of uniform, no need to set value

      //       uniform sampler2D uDisplacementTexture;
      //       // uniform float uDisplacementStrength;

      //       varying vec2 vUv;

      //       void main()
      //       {
      //           vec4 modelPosition = modelMatrix * vec4(position, 1.0);

      //           float elevation = texture2D(uDisplacementTexture, uv).r;
      //           // if(elevation < 0.5)
      //           // {
      //           //     elevation = 0.5;
      //           // }
      //           // elevation = max(elevation, 0.5);

      //           modelPosition.y += max(elevation, 0.5) * uDisplacementStrength;

      //           gl_Position = projectionMatrix * viewMatrix * modelPosition;

      //           vUv = uv;
      //       }
      //   `,
      vertexShader: `
          // Vertex shader
          #define uDisplacementStrength 1.5

          uniform sampler2D uDisplacementTexture;

          varying vec3 vColor;

          void main()
          {
              vec4 modelPosition = modelMatrix * vec4(position, 1.0);

              float elevation = texture2D(uDisplacementTexture, uv).r;
              modelPosition.y += clamp(elevation, 0.5, 1.0) * uDisplacementStrength;

              gl_Position = projectionMatrix * viewMatrix * modelPosition;

              vec3 depthColor = vec3(1.0, 0.1, 0.1);
              vec3 surfaceColor = vec3(0.1, 0.0, 0.5);
              vec3 finalColor = mix(depthColor, surfaceColor, max(elevation, 0.25));

              vColor = finalColor;
          }
      `,
      // less vertext than fragment, do calculation in vertex shader if possible
      fragmentShader: `
          varying vec3 vColor;

          void main()
          {
              gl_FragColor = vec4(vColor, 1.0);
          }
      `,

      // fragmentShader: `
      //       uniform sampler2D uDisplacementTexture;

      //       varying vec2 vUv;

      //       void main()
      //       {
      //           float elevation = texture2D(uDisplacementTexture, vUv).r;
      //           // if(elevation < 0.25)
      //           // {
      //           //     elevation = 0.25;
      //           // }
      //           elevation = max(elevation, 0.25);

      //           vec3 depthColor = vec3(1.0, 0.1, 0.1);
      //           vec3 surfaceColor = vec3(0.1, 0.0, 0.5);
      //           // vec3 finalColor = vec3(0.0);
      //           // finalColor.r += depthColor.r + (surfaceColor.r - depthColor.r) * elevation;
      //           // finalColor.g += depthColor.g + (surfaceColor.g - depthColor.g) * elevation;
      //           // finalColor.b += depthColor.b + (surfaceColor.b - depthColor.b) * elevation;
      //           //  => above is just doing mix()
      //           vec3 finalColor = mix(depthColor, surfaceColor, elevation);

      //           gl_FragColor = vec4(finalColor, 1.0);
      //       }
      //   `,
    });

    const shaderMesh = new THREE.Mesh(shaderGeometry, shaderMaterial);
    shaderMesh.rotation.x = -Math.PI * 0.5;
    scene.add(shaderMesh);

    return () => {
      window.removeEventListener('resize', onResize);
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;
