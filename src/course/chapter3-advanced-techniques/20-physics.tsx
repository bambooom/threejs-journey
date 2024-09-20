import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import * as CANNON from 'cannon-es';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;
    // Debug
    const gui = new GUI();
    const debugObject: Record<string, object> = {};

    debugObject.createSphere = () => {
      createSphere(0.5 * Math.random(), {
        x: (Math.random() - 0.5) * 3,
        y: 3,
        z: (Math.random() - 0.5) * 3,
      } as CANNON.Vec3);
    };
    gui.add(debugObject, 'createSphere');

    debugObject.createBox = () => {
      createBox(Math.random(), Math.random(), Math.random(), {
        x: (Math.random() - 0.5) * 3,
        y: 3,
        z: (Math.random() - 0.5) * 3,
      } as CANNON.Vec3);
    };
    gui.add(debugObject, 'createBox');

    debugObject.reset = () => {
      for (const object of objectsToUpdate) {
        // remove body
        object.body.removeEventListener('collide', playHitSound);
        world.removeBody(object.body);
        // remove mesh
        scene.remove(object.mesh);
      }
      objectsToUpdate.length = 0;
    };
    gui.add(debugObject, 'reset');

    // Scene
    const scene = new THREE.Scene();

    /**
     * Sounds
     */
    const hitSound = new Audio('/sounds/hit.mp3');
    const playHitSound = (collision: { contact: CANNON.ContactEquation }) => {
      // collision event data
      const impact = collision.contact.getImpactVelocityAlongNormal();

      if (impact > 1.5) {
        hitSound.volume = Math.random();
        hitSound.currentTime = 0;
        hitSound.play();
      }
    };

    /**
     * Textures
     */
    // const textureLoader = new THREE.TextureLoader();
    const cubeTextureLoader = new THREE.CubeTextureLoader();

    const environmentMapTexture = cubeTextureLoader.load([
      '/textures/environmentMaps/0/px.png',
      '/textures/environmentMaps/0/nx.png',
      '/textures/environmentMaps/0/py.png',
      '/textures/environmentMaps/0/ny.png',
      '/textures/environmentMaps/0/pz.png',
      '/textures/environmentMaps/0/nz.png',
    ]);

    /**
     * Physics world
     */
    const world = new CANNON.World(); // empty space
    // add gravity, it's vec3
    world.gravity.set(0, -9.82, 0); // y axis, go down, which is G
    // it's a test for collision detection
    world.broadphase = new CANNON.SAPBroadphase(world); // defaul tis Naive one, this one is better
    world.allowSleep = true; // far and not moving objects

    // Materials, bouncing and friction behaviour
    // const concreteMaterial = new CANNON.Material('concrete');
    // const plasticMaterial = new CANNON.Material('plastic');
    // // contactmaterial is the combination of two materials and how they should collide
    // const concretePlasticContactMaterial = new CANNON.ContactMaterial(
    //   concreteMaterial,
    //   plasticMaterial,
    //   {
    //     friction: 0.1, // how much does it rub, default 0.3 摩擦力
    //     restitution: 0.7, // how much does it bounce, default 0.3
    //   }
    // );
    // world.addContactMaterial(concretePlasticContactMaterial);

    // can use default meterial for everything, as it's not realistic
    const defaultMaterial = new CANNON.Material();
    const defaultContactMaterial = new CANNON.ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      {
        friction: 0.1, // how much does it rub, default 0.3 摩擦力
        restitution: 0.7, // how much does it bounce, default 0.3
      }
    );
    world.addContactMaterial(defaultContactMaterial);
    world.defaultContactMaterial = defaultContactMaterial;

    // create a Body (which are objects in the physics world that will fall and collide with other bodies)
    // Sphere
    // const sphereShape = new CANNON.Sphere(0.5); // 0.5 is same size as the buffer test sphere
    // const sphereBody = new CANNON.Body({
    //   mass: 1,
    //   position: new CANNON.Vec3(0, 3, 0), // higher than the floor
    //   shape: sphereShape,
    //   // material: plasticMaterial,
    // });
    // // pushing the sphere to origin
    // sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0))
    // world.addBody(sphereBody);

    // need to update cannon world and threejs scene

    // Floor phsics
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body();
    // floorBody.material = concreteMaterial;
    floorBody.mass = 0; // default mass is 0, it means static, won't move
    floorBody.addShape(floorShape);
    // since threejs floor is rotated, need to rotate the cannon floor, which is harder than in threejs
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI * 0.5
    );
    world.addBody(floorBody);

    /**
     * Test sphere
     */
    // const sphere = new THREE.Mesh(
    //   new THREE.SphereGeometry(0.5, 32, 32),
    //   new THREE.MeshStandardMaterial({
    //     metalness: 0.3,
    //     roughness: 0.4,
    //     envMap: environmentMapTexture,
    //     envMapIntensity: 0.5,
    //   })
    // );
    // sphere.castShadow = true;
    // sphere.position.y = 0.5;
    // scene.add(sphere);

    /**
     * Floor
     */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5,
      })
    );
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI * 0.5;
    scene.add(floor);

    /**
     * Lights
     */
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.camera.left = -7;
    directionalLight.shadow.camera.top = 7;
    directionalLight.shadow.camera.right = 7;
    directionalLight.shadow.camera.bottom = -7;
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

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
    camera.position.set(-3, 3, 3);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas.current);
    controls.enableDamping = true;

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.current,
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /**
     * Utils, create sphere
     */
    const objectsToUpdate: { mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap> | THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>; body: CANNON.Body; }[] = [];

    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.3,
      roughness: 0.4,
      envMap: environmentMapTexture,
    });
    const createSphere = (radius: number, position: CANNON.Vec3) => {
      // threejs mesh
      const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
      mesh.scale.set(radius, radius, radius);
      mesh.castShadow = true;
      mesh.position.copy(position);
      scene.add(mesh);

      // cannonjs body
      const shape = new CANNON.Sphere(radius);
      const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial,
      });
      body.position.copy(position);
      body.addEventListener('collide', playHitSound);
      world.addBody(body);

      // save in object to update
      objectsToUpdate.push({
        mesh,
        body,
      });
    };

    // Box
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.3,
      roughness: 0.4,
      envMap: environmentMapTexture,
    });
    const createBox = (width: number, height: number, depth: number, position: CANNON.Vec3) => {
      // threejs mesh
      const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
      mesh.scale.set(width, height, depth);
      mesh.castShadow = true;
      mesh.position.copy(position);
      scene.add(mesh);

      // cannonjs body
      const shape = new CANNON.Box(
        new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
      );
      const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial,
      });
      body.position.copy(position);
      body.addEventListener('collide', playHitSound);
      world.addBody(body);

      // save in object to update
      objectsToUpdate.push({
        mesh,
        body,
      });
    };

    /**
     * Animate
     */
    const clock = new THREE.Clock();
    let oldElapsedTime = 0;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - oldElapsedTime;
      oldElapsedTime = elapsedTime;

      // update physics world
      // apply force to the sphere, mimic wind on each frame
      // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position)
      // step(a fixed time step, how much time passed since last step, how much iterations the world can apply to catch up with a potential delay)
      // first parameter: we want our experience to run at 60fps, so it;s 1/60

      for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position);
        // for box, we need to fix rotation when colliding, sphere no diffirence
        object.mesh.quaternion.copy(object.body.quaternion);
      }

      world.step(1 / 60, deltaTime, 3);

      // update position from cannon to threejs, you will see the sphere fall down
      // sphere.position.copy(sphereBody.position) // which just do below copy x, y, z
      // sphere.position.x = sphereBody.position.x;
      // sphere.position.y = sphereBody.position.y;
      // sphere.position.z = sphereBody.position.z;

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
      sphereMaterial.dispose();
      sphereGeometry.dispose();
      boxMaterial.dispose();
      boxGeometry.dispose();
      renderer.dispose();
      gui.destroy();
    };
  }, [canvas.current]);

  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;
