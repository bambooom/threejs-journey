import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvas.current) return;

    // Scene
    const scene = new THREE.Scene();

    // Object
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Sizes
    const sizes = {
      width: 800,
      height: 600,
    };

    // Camera
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.z = 3;
    scene.add(camera);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.current,
    });
    renderer.setSize(sizes.width, sizes.height);

    // Animations

    // 1. using Date time
    // let time = Date.now()
    // const tick = () => {
    //   // Time
    //   const currentTime = Date.now()
    //   const deltaTime = currentTime - time // around 16-17 milliseconds
    //   time = currentTime

    //   // update objects
    //   mesh.rotation.y += 0.002 * deltaTime // rotate the object

    //   // render part
    //   renderer.render(scene, camera);

    //   window.requestAnimationFrame(tick) // will repeated being called
    // }

    // 2. using Clock
    // const clock = new THREE.Clock()

    // const tick = () => {
    //   // Clock
    //   const elapsedTime = clock.getElapsedTime();
    //   // console.log(elapsedTime);
    //   // update objects
    //   mesh.rotation.y = elapsedTime; // rotate the object, updating as elapsedTime
    //   // 如果想每秒都转一圈，那么就设置成 elapsedTime * Math.PI * 2
    //   // mesh.position.y = Math.sin(elapsedTime) // 上下来回移动
    //   // mesh.position.x = Math.cos(elapsedTime) // 左右来回移动
    //   camera.position.y = Math.sin(elapsedTime); // 可以移动 camera，而不是 objects
    //   camera.position.x = Math.cos(elapsedTime); // 和上面的看起来是一样的
    //   camera.lookAt(mesh.position) // cube 的位置永远在 center，但是camera 在动，所以 cube 看到的角度就不同
    //   //   // render part
    //   renderer.render(scene, camera);

    //   window.requestAnimationFrame(tick) // will repeated being called
    // }

    // tick()

    /**
     * GreenSock animations
     */

    gsap.to(mesh.position, { x: 2, duration: 1, delay: 1 }); // cube 往右移动 2，delay 1 秒，duration 1 秒 就停止
    gsap.to(mesh.position, { x: 0, duration: 1, delay: 2 }); // cube go back to 0
    // gsap 有 自己的 tick ，所以不在 tick function 里进行 update，在 tick 中仅需要 renderer

    const tick = () => {
      renderer.render(scene, camera);

      window.requestAnimationFrame(tick);
    };
    tick();
  }, [canvas.current]);

  return <canvas ref={canvas}></canvas>;
}

export default Page
