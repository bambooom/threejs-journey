import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import galaxyVertexShader from './shaders/30/vertex.glsl';
// import galaxyFragmentShader from './shaders/30/fragment.glsl';
import GUI from 'lil-gui';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;
    // Debug
    const gui = new GUI();

    // Scene
    const scene = new THREE.Scene();

    /**
     * Loaders
     */
    const textureLoader = new THREE.TextureLoader();
    const gltfLoader = new GLTFLoader();
    const cubeTextureLoader = new THREE.CubeTextureLoader();

    /**
     * Update all materials
     */
    const updateAllMaterials = () => {
      scene.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshStandardMaterial
        ) {
          child.material.envMapIntensity = 1;
          child.material.needsUpdate = true;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    };

    /**
     * Environment map
     */
    const environmentMap = cubeTextureLoader.load([
      '/environmentMaps/3/px.jpg',
      '/environmentMaps/3/nx.jpg',
      '/environmentMaps/3/py.jpg',
      '/environmentMaps/3/ny.jpg',
      '/environmentMaps/3/pz.jpg',
      '/environmentMaps/3/nz.jpg',
    ]);

    scene.background = environmentMap;
    scene.environment = environmentMap;

    /**
     * Material
     */

    // Textures
    const mapTexture = textureLoader.load('/models/LeePerrySmith/color.jpg');
    mapTexture.colorSpace = THREE.SRGBColorSpace;
    const normalTexture = textureLoader.load(
      '/models/LeePerrySmith/normal.jpg'
    );

    // Material
    const material = new THREE.MeshStandardMaterial({
      map: mapTexture,
      normalMap: normalTexture,
    });

    const customUniforms = {
      uTime: { value: 0 },
    };

    // use the hook to alter the shader, not changing all
    material.onBeforeCompile = (shader) => {
      // console.log(shader); // can access vertex and fragment shader contents

      shader.uniforms.uTime = customUniforms.uTime; // add uTime uniform

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `
            #include <common>

            uniform float uTime; // retrive the custom uniform

            mat2 get2dRotateMatrix(float _angle)
            {
                return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
            }
          `
        )
        // normals are coordinates associated with each vertices that tell what direction the faces are facing
        // If we were to see those normals, they would be arrows all over the model pointing on the outside
        // Those normals are used for things like lighting, reflecting and shadowing.
        // When we rotated our vertices, we merely rotated the positions, but we didn't rotate the normals.
        // We need to modify the chunk that handles normals.
        // The chunk handling the normals first is called beginnormal_vertex
        .replace(
          '#include <beginnormal_vertex>',
          `
            #include <beginnormal_vertex>

            float angle = (position.y + uTime) * 0.9;
            // float angle = (sin(position.y + uTime)) * 0.4;
            mat2 rotatedMatrix = get2dRotateMatrix(angle);

            objectNormal.xz = rotatedMatrix * objectNormal.xz;
          `
        )
        .replace(
          '#include <begin_vertex>',
          `
            #include <begin_vertex>

            transformed.y -= 2.0;

            // float angle = (position.y + uTime) * 0.9; // no need, already defined above
            // mat2 rotatedMatrix = get2dRotateMatrix(angle);

            transformed.xz = rotatedMatrix * transformed.xz;
          `
        );
    };

    // create custom material to fix shadow
    const depthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking, // a better way of storing the depth by using the r, g, b, and a separately for better precision and Three.js needs it.
    });

    // apply all changes to the shader we've made before but for depthMaterial
    // so that the shadow on the white plane will be twisted also
    // depthMaterial only handles drop shadow, core shadow's problem need to change on the material's shader
    depthMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = customUniforms.uTime;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
          #include <common>

          uniform float uTime;

          mat2 get2dRotateMatrix(float _angle)
          {
              return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
          }
        `
      );
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
          #include <begin_vertex>

          float angle = (position.y + uTime) * 0.9;
          mat2 rotateMatrix = get2dRotateMatrix(angle);

          transformed.xz = rotateMatrix * transformed.xz;
        `
      );
    };

    /**
     * Models
     */
    gltfLoader.load('/models/LeePerrySmith/LeePerrySmith.glb', (gltf) => {
      // Model
      const mesh = gltf.scene.children[0];
      mesh.rotation.y = Math.PI * 0.5;
      (mesh as THREE.Mesh).material = material; // update the material
      mesh.customDepthMaterial = depthMaterial; // Update the depth material
      scene.add(mesh);

      // Update materials
      updateAllMaterials();
    });

    /**
     * Lights
     */
    const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.normalBias = 0.05;
    directionalLight.position.set(0.25, 2, -2.25);
    scene.add(directionalLight);

    /**
     * Plane
     */
    // add a plane to help see the shadow, the shadow won't twist when we make the head rotating
    // we need to find a way to twist that material too.
    // The material used for the shadows is a MeshDepthMaterial and we cannot access that material easily, but we can override it with the property customDepthMaterial on the mesh in order to tell Three.js to use a custom material.
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 15, 15),
      new THREE.MeshStandardMaterial()
    );
    plane.rotation.y = Math.PI;
    plane.position.y = -5;
    plane.position.z = 5;
    scene.add(plane);

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const onResize = () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
      100
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
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /**
     * Animate
     */
    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // update utime
      if (material) {
        customUniforms.uTime.value = elapsedTime;
      }

      // Update controls
      controls.update();

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener('resize', onResize);
      scene.clear();
      // geometry?.dispose();
      material?.dispose();
      renderer.dispose();
      gui.destroy();
    };
  }, [canvas.current]);
  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;
