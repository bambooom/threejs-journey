import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvas.current) return;
    // Scene
    const scene = new THREE.Scene();

    /**
     * Objects
     */
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    // mesh.position.x = 0.7 // unit us arbitrary, can define by yourself
    // mesh.position.y = - 0.6
    // mesh.position.z = 1 // go forward to the camera, 走近

    // update position at once using set()
    mesh.position.set(0.7, -0.6, 1);

    // scene.add(mesh)

    // console.log(mesh.position.length()) // 1.3601470508735443, kindof distance between center of the scene and our object's position
    // console.log(mesh.position.normalize())

    /**
     * Scale
     */
    // mesh.scale.x = 2
    // mesh.scale.y = 0.5
    // mesh.scale.z = 0.5
    mesh.scale.set(2, 0.5, 0.5);

    /**
     * Rotation - with rotation
     */
    mesh.rotation.reorder('YXZ');
    // Resets the euler angle with a new order by creating a quaternion from this euler angle and then setting this euler angle with the quaternion and the new order.
    // 也就是不管下面的 rotation 代码写的顺序是怎样，都是会按照这个设定的顺序来执行
    // do this before changing rotation
    mesh.rotation.x = Math.PI * 0.25;
    mesh.rotation.y = Math.PI * 0.25;

    /**
     * Group
     */
    const group = new THREE.Group();
    scene.add(group);

    const cube1 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    group.add(cube1);

    const cube2 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0x0000ff })
    );
    cube2.position.x = -2;
    group.add(cube2);

    const cube3 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0x00f0f0 })
    );
    cube3.position.x = 2;
    group.add(cube3);

    // move whole group
    group.position.y = 1;
    group.scale.y = 1.5;
    group.rotation.y = 1;

    /**
     * Axes Helper
     */
    const axesHelper = new THREE.AxesHelper(2); // 3 是 axes helper length
    scene.add(axesHelper);
    // show red one: x, green one: y, blue one: z

    /**
     * Sizes
     */
    const sizes = {
      width: 800,
      height: 600,
    };

    /**
     * Camera
     */
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.z = 3;
    // camera.position.y = 1
    // camera.position.x = 1
    scene.add(camera);

    console.log(mesh.position.distanceTo(camera.position)); // distance between mesh and camera

    // camera.lookAt(mesh.position) // mesh 的 center 点就会被放成 中心点位置

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.current,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.render(scene, camera);

    return () => {
      scene.clear();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [canvas.current]);

  return <canvas ref={canvas}></canvas>;
};

export default Page;
