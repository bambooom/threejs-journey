import { type FC, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const Page: FC = () => {
  const [isEnvironmentMapLoaded, setIsEnvironmentMapLoaded] = useState(false);
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvas.current) return;

    /**
     * Debug
     */
    const gui = new GUI();

    // Scene
    const scene = new THREE.Scene();

    /**
     * Textures
     */
    const textureLoader = new THREE.TextureLoader();

    const doorColorTexture = textureLoader.load('/textures/door/color.jpg');

    // const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg');
    // const doorHeightTexture = textureLoader.load('/textures/door/height.jpg');
    // const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg');
    // const doorAmbientOcclusionTexture = textureLoader.load(
    //   '/textures/door/ambientOcclusion.jpg'
    // );
    // const doorMetalnessTexture = textureLoader.load(
    //   '/textures/door/metalness.jpg'
    // );
    // const doorRoughnessTexture = textureLoader.load(
    //   '/textures/door/roughness.jpg'
    // );

    const matcapTexture = textureLoader.load('/textures/matcaps/8.png');
    // const gradientTexture = textureLoader.load('/textures/gradients/5.jpg');

    doorColorTexture.colorSpace = THREE.SRGBColorSpace;
    matcapTexture.colorSpace = THREE.SRGBColorSpace;

    /**
     * Objects
     */
    // MeshBasicMaterial
    // const material = new THREE.MeshBasicMaterial();
    // material.map = doorColorTexture;
    // material.color = new THREE.Color('red');
    // material.wireframe = true;
    // material.transparent = true;
    // material.opacity = 0.5; // set opacity should also set transparent=true
    // material.alphaMap = doorAlphaTexture; // need to set transparent=true
    // material.side = THREE.DoubleSide // default won't be visible on the back side, avoid using DoubleSide whenever possible as it requires more resources

    // MeshNormalMaterial
    // const material = new THREE.MeshNormalMaterial();
    // material.flatShading = true; // make it like flat faces

    // MeshMatcapMaterial
    // const material = new THREE.MeshMatcapMaterial();
    // material.matcap = matcapTexture; // looks like there's light, illuminated, but it's an illusion created by the texture

    // MeshDepthMaterial: ? cannot see
    // const material = new THREE.MeshDepthMaterial();

    // MeshLambertMaterial, requires light, most performant material that uses lights
    // const material = new THREE.MeshLambertMaterial();

    // MeshPhongMaterial, less performant than MeshLambertMaterial
    // const material = new THREE.MeshPhongMaterial();
    // material.shininess = 100;
    // material.specular = new THREE.Color(0x1188ff) // reflection of lights, 反光效果

    // MeshToonMaterial, cell shading, 有一条很明显的分界线
    // const material = new THREE.MeshToonMaterial();
    // gradientTexture.minFilter = THREE.NearestFilter;
    // gradientTexture.magFilter = THREE.NearestFilter; // deactivate mipmapping
    // gradientTexture.generateMipmaps = false;
    // material.gradientMap = gradientTexture;

    // MeshStandardMaterial, uses physically based rendering principles, supports light but with more realistic algorithms
    // const material = new THREE.MeshStandardMaterial();
    // material.metalness = 1
    // material.roughness = 1
    // material.map = doorColorTexture;
    // material.aoMap = doorAmbientOcclusionTexture; // will add shadowas where the texture is dark, add contrast, details
    // material.aoMapIntensity = 1;
    // material.displacementMap = doorHeightTexture; // need to add subdivisions for sphere/plane/torus, 这样才能显示高度，会有凹凸不一样的地方
    // material.displacementScale = 0.1;
    // material.metalnessMap = doorMetalnessTexture; // 只有金属的部分会有反光效果
    // material.roughnessMap = doorRoughnessTexture; // roughness are multiplied with metalness property before
    // material.normalMap = doorNormalTexture;
    // material.normalScale.set(0.5, 0.5); // control intensity
    // material.transparent = true;
    // material.alphaMap = doorAlphaTexture; // 隐藏一部分

    // // gui debug
    // gui.add(material, 'metalness').min(0).max(1).step(0.0001);
    // gui.add(material, 'roughness').min(0).max(1).step(0.0001);

    // MeshPhysicalMaterial, similar to MeshStandardMaterial but with more properties, worst performance
    const material = new THREE.MeshPhysicalMaterial();
    material.metalness = 0;
    material.roughness = 0;
    // material.map = doorColorTexture;
    // material.aoMap = doorAmbientOcclusionTexture; // will add shadowas where the texture is dark, add contrast, details
    // material.aoMapIntensity = 1;
    // material.displacementMap = doorHeightTexture; // need to add subdivisions for sphere/plane/torus, 这样才能显示高度，会有凹凸不一样的地方
    // material.displacementScale = 0.1;
    // material.metalnessMap = doorMetalnessTexture; // 只有金属的部分会有反光效果
    // material.roughnessMap = doorRoughnessTexture; // roughness are multiplied with metalness property before
    // material.normalMap = doorNormalTexture;
    // material.normalScale.set(0.5, 0.5); // control intensity
    // material.transparent = true;
    // material.alphaMap = doorAlphaTexture; // 隐藏一部分

    // gui debug
    gui.add(material, 'metalness').min(0).max(1).step(0.0001);
    gui.add(material, 'roughness').min(0).max(1).step(0.0001);

    // Clearcoat,
    // material.clearcoat = 1
    // material.clearcoatRoughness = 0
    // gui.add(material, 'clearcoat').min(0).max(1).step(0.0001);
    // gui.add(material, 'clearcoatRoughness').min(0).max(1).step(0.0001);

    // Sheen, 有点绒毛效果，highlights the material when seen from a narrow angle, usually on fluffy material like fabric
    // material.sheen = 1
    // material.sheenRoughness = 0.25
    // material.sheenColor.set(1,1,1)
    // gui.add(material, 'sheen').min(0).max(1).step(0.0001);
    // gui.add(material, 'sheenRoughness').min(0).max(1).step(0.0001);
    // gui.addColor(material, 'sheenColor')

    // Iridescence, bubble、laser disc 上的彩虹反光效果
    // material.iridescence = 1
    // material.iridescenceIOR = 1
    // material.iridescenceThicknessRange = [100, 800]
    // gui.add(material, 'iridescence').min(0).max(1).step(0.0001);
    // gui.add(material, 'iridescenceIOR').min(1).max(2.333).step(0.0001);
    // gui.add(material.iridescenceThicknessRange, '0').min(1).max(1000).step(1);
    // gui.add(material.iridescenceThicknessRange, '1').min(1).max(1000).step(1);

    // transimission, 透光
    material.transmission = 1;
    material.ior = 1.5; // index of refraction
    material.thickness = 0.5;

    gui.add(material, 'transmission').min(0).max(1).step(0.0001);
    gui.add(material, 'ior').min(1).max(10).step(0.0001);
    gui.add(material, 'thickness').min(0).max(1).step(0.0001);

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 64, 64),
      material
    );
    sphere.position.x = -1.5;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1, 100, 100),
      material
    );
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.2, 64, 128),
      material
    );
    torus.position.x = 1.5;
    scene.add(sphere, plane, torus);

    /**
     * Lights
     */
    // const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    // scene.add(ambientLight);
    // const pointLight = new THREE.PointLight(0xffffff, 30);
    // pointLight.position.x = 2
    // pointLight.position.y = 3
    // pointLight.position.z = 4
    // scene.add(pointLight)

    /**
     * Environment map, contains lighting, can remove lighting
     * you can see the reflection of the light
     */
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('/textures/environmentMap/2k.hdr', (environmentMap) => {
      environmentMap.mapping = THREE.EquirectangularReflectionMapping;
      // set
      scene.background = environmentMap;
      scene.environment = environmentMap;
      material.needsUpdate = true;
      setIsEnvironmentMapLoaded(true);
    });

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
    camera.position.x = 1;
    camera.position.y = 1;
    camera.position.z = 2;
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas.current);
    controls.enableDamping = true;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.current,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /**
     * Animate
     */
    const clock = new THREE.Clock();
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // update objects, rotating
      sphere.rotation.y = 0.1 * elapsedTime;
      plane.rotation.y = 0.1 * elapsedTime;
      torus.rotation.y = 0.1 * elapsedTime;

      sphere.rotation.x = -0.15 * elapsedTime;
      plane.rotation.x = -0.15 * elapsedTime;
      torus.rotation.x = -0.15 * elapsedTime;

      // Update controls
      controls.update();
      // Render
      renderer.render(scene, camera);
      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    if (isEnvironmentMapLoaded) {
      // 不检查 environment map 是否 loaded 的话，会报错： WebGL: INVALID_OPERATION: uniformMatrix4fv: location is not from the associated program
      tick();
    }

    return () => {
      window.removeEventListener('resize', onResize);
      scene.clear();
      material.dispose();
      renderer.dispose();
      gui.destroy();
    }
  }, [canvas.current]);

  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;
