import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Timer } from 'three/examples/jsm/misc/Timer.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
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
     * Textures
     */
    const textureLoader = new THREE.TextureLoader();

    // floor
    const floorAlphaTexture = textureLoader.load('/textures/floor/alpha.jpg');
    const floorColorTexture = textureLoader.load(
      '/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp'
    );
    const floorARMTexture = textureLoader.load(
      '/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp'
    );
    const floorNormalTexture = textureLoader.load(
      '/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp'
    );
    const floorDisplacementTexture = textureLoader.load(
      '/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp'
    );

    floorColorTexture.colorSpace = THREE.SRGBColorSpace; // sRGB, only for color texture

    floorColorTexture.repeat.set(8, 8);
    floorARMTexture.repeat.set(8, 8);
    floorNormalTexture.repeat.set(8, 8);
    floorDisplacementTexture.repeat.set(8, 8);

    floorColorTexture.wrapS = THREE.RepeatWrapping;
    floorARMTexture.wrapS = THREE.RepeatWrapping;
    floorNormalTexture.wrapS = THREE.RepeatWrapping;
    floorDisplacementTexture.wrapS = THREE.RepeatWrapping;

    floorColorTexture.wrapT = THREE.RepeatWrapping;
    floorARMTexture.wrapT = THREE.RepeatWrapping;
    floorNormalTexture.wrapT = THREE.RepeatWrapping;
    floorDisplacementTexture.wrapT = THREE.RepeatWrapping;

    // Wall
    const wallColorTexture = textureLoader.load(
      '/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp'
    );
    const wallARMTexture = textureLoader.load(
      '/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp'
    );
    const wallNormalTexture = textureLoader.load(
      '/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp'
    );

    wallColorTexture.colorSpace = THREE.SRGBColorSpace;

    // Roof
    const roofColorTexture = textureLoader.load(
      '/textures/roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp'
    );
    const roofARMTexture = textureLoader.load(
      '/textures/roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp'
    );
    const roofNormalTexture = textureLoader.load(
      '/textures/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp'
    );

    roofColorTexture.colorSpace = THREE.SRGBColorSpace;
    roofColorTexture.repeat.set(3, 1);
    roofARMTexture.repeat.set(3, 1);
    roofNormalTexture.repeat.set(3, 1);

    roofColorTexture.wrapS = THREE.RepeatWrapping;
    roofARMTexture.wrapS = THREE.RepeatWrapping;
    roofNormalTexture.wrapS = THREE.RepeatWrapping;

    // Unless the repeat.y gets higher than 1, there’s no need to change the wrapT

    // Bushes
    const bushColorTexture = textureLoader.load(
      '/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp'
    );
    const bushARMTexture = textureLoader.load(
      '/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp'
    );
    const bushNormalTexture = textureLoader.load(
      '/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp'
    );

    bushColorTexture.colorSpace = THREE.SRGBColorSpace;

    bushColorTexture.repeat.set(2, 1);
    bushARMTexture.repeat.set(2, 1);
    bushNormalTexture.repeat.set(2, 1);

    bushColorTexture.wrapS = THREE.RepeatWrapping;
    bushARMTexture.wrapS = THREE.RepeatWrapping;
    bushNormalTexture.wrapS = THREE.RepeatWrapping;

    // Graves
    const graveColorTexture = textureLoader.load(
      '/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp'
    );
    const graveARMTexture = textureLoader.load(
      '/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp'
    );
    const graveNormalTexture = textureLoader.load(
      '/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp'
    );

    graveColorTexture.colorSpace = THREE.SRGBColorSpace;

    graveColorTexture.repeat.set(0.3, 0.4);
    graveARMTexture.repeat.set(0.3, 0.4);
    graveNormalTexture.repeat.set(0.3, 0.4);

    // Door
    const doorColorTexture = textureLoader.load('/textures/door/color.webp');
    const doorAlphaTexture = textureLoader.load('/textures/door/alpha.webp');
    const doorAmbientOcclusionTexture = textureLoader.load(
      '/textures/door/ambientOcclusion.webp'
    );
    const doorHeightTexture = textureLoader.load('/textures/door/height.webp');
    const doorNormalTexture = textureLoader.load('/textures/door/normal.webp');
    const doorMetalnessTexture = textureLoader.load(
      '/textures/door/metalness.webp'
    );
    const doorRoughnessTexture = textureLoader.load(
      '/textures/door/roughness.webp'
    );

    doorColorTexture.colorSpace = THREE.SRGBColorSpace;

    /**
     * House
     */
    // const houseMeasurements = {
    //   width: 4,
    //   height: 2.5,
    //   depth: 4
    // };
    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20, 100, 100), // will be fading out on edges
      new THREE.MeshStandardMaterial({
        alphaMap: floorAlphaTexture,
        transparent: true,
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture, // need more vertex, change to 100x100
        displacementScale: 0.3,
        displacementBias: -0.2, // offset everything down
      }) // for a realist look
    );
    floor.rotation.x = -Math.PI * 0.5; // rotate the floor make it flat
    scene.add(floor);

    gui
      .add(floor.material, 'displacementScale')
      .min(0)
      .max(1)
      .step(0.001)
      .name('floorDisplacementScale');
    gui
      .add(floor.material, 'displacementBias')
      .min(-1)
      .max(1)
      .step(0.001)
      .name('floorDisplacementBias');

    // House container, make it as a group
    const house = new THREE.Group();
    scene.add(house);
    // next we add components to house, not scene

    // walls
    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.5, 4),
      new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        aoMap: wallARMTexture,
        roughnessMap: wallARMTexture,
        metalnessMap: wallARMTexture,
        normalMap: wallNormalTexture,
      })
    );
    walls.position.y = 1.25; // make it upon the floor
    house.add(walls);

    // roof, pyramid, use cone geometry with 4 sides
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.5, 1.5, 4),
      new THREE.MeshStandardMaterial({
        map: roofColorTexture,
        aoMap: roofARMTexture,
        roughnessMap: roofARMTexture,
        metalnessMap: roofARMTexture,
        normalMap: roofNormalTexture,
      })
    );
    roof.position.y = 2.5 + 0.75; // 0.75 is half of the roof's height because the cone's origin is at its center
    roof.rotation.y = Math.PI * 0.25;
    house.add(roof);

    // door
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
      new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        roughnessMap: doorRoughnessTexture,
        metalnessMap: doorMetalnessTexture,
        normalMap: doorNormalTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.15,
        displacementBias: -0.04,
      })
    );
    door.position.y = 1;
    door.position.z = 2 + 0.01; // 0.01 to avoid z-fighting
    house.add(door);

    // 4 Bushes
    const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
    const bushMaterial = new THREE.MeshStandardMaterial({
      color: '#ccffcc', // make it more green
      map: bushColorTexture,
      aoMap: bushARMTexture,
      roughnessMap: bushARMTexture,
      metalnessMap: bushARMTexture,
      normalMap: bushNormalTexture,
    });
    const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush1.scale.setScalar(0.5);
    bush1.position.set(0.8, 0.2, 2.2);
    bush1.rotation.x = -0.75; // rotate a little to hide a little strentch on the top of the cone/sphere
    const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush2.scale.setScalar(0.25);
    bush2.position.set(1.4, 0.1, 2.1);
    bush2.rotation.x = -0.75;
    const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush3.scale.setScalar(0.4);
    bush3.position.set(-0.8, 0.1, 2.2);
    bush3.rotation.x = -0.75;
    const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush4.scale.setScalar(0.15);
    bush4.position.set(-1, 0.05, 2.6);
    bush4.rotation.x = -0.75;

    house.add(bush1, bush2, bush3, bush4);

    // Graves, but should not in walls
    const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
    const graveMaterial = new THREE.MeshStandardMaterial({
      map: graveColorTexture,
      aoMap: graveARMTexture,
      roughnessMap: graveARMTexture,
      metalnessMap: graveARMTexture,
      normalMap: graveNormalTexture,
    });
    const graves = new THREE.Group();
    scene.add(graves);
    for (let i = 0; i < 30; i++) {
      // put on circular pattern
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 6;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      // Mesh
      const grave = new THREE.Mesh(graveGeometry, graveMaterial);
      grave.position.set(x, Math.random() * 0.4, z);
      grave.rotation.set(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      );
      // add to gravesgroup
      graves.add(grave);
    }

    /**
     * Lights
     */
    // Ambient light
    const ambientLight = new THREE.AmbientLight('#86cdff', 0.275); // #86cdff is light blue, like dark moonlight
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight('#86cdff', 1);
    directionalLight.position.set(3, 2, -8);
    scene.add(directionalLight);

    // Door light
    const doorLight = new THREE.PointLight('#ff7d46', 5);
    doorLight.position.set(0, 2.2, 2.5);
    house.add(doorLight);

    /**
     * Ghosts, using lights to simulate
     */
    const ghost1 = new THREE.PointLight('#8800ff', 6);
    const ghost2 = new THREE.PointLight('#ff0088', 6);
    const ghost3 = new THREE.PointLight('#ff0000', 6);
    scene.add(ghost1, ghost2, ghost3);
    // then animate them in tick function

    // Sizes
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
    camera.position.x = 4;
    camera.position.y = 2;
    camera.position.z = 5;
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
     * Shadows
     */
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // cast and receive
    directionalLight.castShadow = true;
    ghost1.castShadow = true;
    ghost2.castShadow = true;
    ghost3.castShadow = true;

    // door light no need to cast shadow, since none of the objects are in the shadow, not big impact

    // objects
    walls.castShadow = true;
    walls.receiveShadow = true;
    roof.castShadow = true; // 生成了shadow 然后在wall 上显示出来了
    floor.receiveShadow = true;

    // cast shadow for grave group, need to cast shadow for each children
    for (const grave of graves.children) {
      grave.castShadow = true;
      grave.receiveShadow = true;
    }

    // Mapping
    // optimize the shadows
    directionalLight.shadow.mapSize.width = 256;
    directionalLight.shadow.mapSize.height = 256;
    directionalLight.shadow.camera.top = 8;
    directionalLight.shadow.camera.right = 8;
    directionalLight.shadow.camera.bottom = -8;
    directionalLight.shadow.camera.left = -8;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 20;

    ghost1.shadow.mapSize.width = 256;
    ghost1.shadow.mapSize.height = 256;
    ghost1.shadow.camera.far = 10;

    ghost2.shadow.mapSize.width = 256;
    ghost2.shadow.mapSize.height = 256;
    ghost2.shadow.camera.far = 10;

    ghost3.shadow.mapSize.width = 256;
    ghost3.shadow.mapSize.height = 256;
    ghost3.shadow.camera.far = 10;

    /**
     * Sky
     */
    const sky = new Sky();
    sky.scale.set(100, 100, 100); // otherwise, it's too small
    scene.add(sky);

    sky.material.uniforms['turbidity'].value = 10;
    sky.material.uniforms['rayleigh'].value = 3;
    sky.material.uniforms['mieCoefficient'].value = 0.1;
    sky.material.uniforms['mieDirectionalG'].value = 0.95;
    sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95);

    /**
     * Fog
     */
    scene.fog = new THREE.FogExp2('#02343f', 0.1); // pick a color same with the bacground, bottom part of the sky

    /**
     * Animate
     */
    const timer = new Timer(); // threejs addon timer, tests if the tab is inactive and prevents large weird time values

    const tick = () => {
      // Timer
      timer.update(); // need to update the timer every frame
      const elapsedTime = timer.getElapsed();

      // Ghosts
      const ghost1Angle = elapsedTime * 0.5;
      ghost1.position.x = Math.cos(ghost1Angle) * 4;
      ghost1.position.z = Math.sin(ghost1Angle) * 4;
      ghost1.position.y =
        Math.sin(ghost1Angle) *
        Math.sin(ghost1Angle * 2.34) *
        Math.sin(ghost1Angle * 3.45);

      const ghost2Angle = -elapsedTime * 0.38;
      ghost2.position.x = Math.cos(ghost2Angle) * 5;
      ghost2.position.z = Math.sin(ghost2Angle) * 5;
      ghost2.position.y =
        Math.sin(ghost2Angle) *
        Math.sin(ghost2Angle * 2.34) *
        Math.sin(ghost2Angle * 3.45);

      const ghost3Angle = elapsedTime * 0.23;
      ghost3.position.x = Math.cos(ghost3Angle) * 6;
      ghost3.position.z = Math.sin(ghost3Angle) * 6;
      ghost3.position.y =
        Math.sin(ghost3Angle) *
        Math.sin(ghost3Angle * 2.34) *
        Math.sin(ghost3Angle * 3.45);

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
      bushGeometry.dispose();
      bushMaterial.dispose();
      graveGeometry.dispose();
      graveMaterial.dispose();
      renderer.dispose();
      gui.destroy();
    };
  }, [canvas.current]);

  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;
