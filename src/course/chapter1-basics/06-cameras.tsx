import { type FC, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const Page: FC = () => {
  // Canvas
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvas.current) return;

    // Sizes
    const sizes = {
      width: 800,
      height: 600,
    };

    /**
     * Cursor
     */
    const cursor = {
      x: 0,
      y: 0,
    };
    window.addEventListener('mousemove', (event) => {
      // x 和 y 会在 -0.5 ~ 0.5 之间，这样会有 negative positive values，会更容易辨别 left right etc
      cursor.x = event.clientX / sizes.width - 0.5;
      cursor.y = -event.clientY / sizes.height + 0.5;
    });

    // Scene
    const scene = new THREE.Scene();

    // Object
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    scene.add(mesh);

    // Camera
    // 75： vertical degree field of view, fov.
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      1,
      1000
    );
    // const aspectRatio = sizes.width / sizes.height
    // const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100) // 会不像 cube，因为 render size 并不是 square
    // const camera = new THREE.OrthographicCamera(-1 * aspectRatio, 1 * aspectRatio, 1, -1, 0.1, 100)
    // camera.position.x = 2
    // camera.position.y = 2
    camera.position.z = 3;
    // console.log(camera.position.length()) // distance of the camera
    camera.lookAt(mesh.position);
    scene.add(camera);

    // Controls，使用 orbitcontrol 时就应该把 tick func 里的 camera position 修改去掉
    // 这样就可以 drag 来让 cube 转动
    const controls = new OrbitControls(camera, canvas.current); // 第二个参数是 canvas dom element
    controls.enableDamping = true; // 加速度以及缓冲效果
    // controls.target.y = 2
    // controls.update();

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.current,
    });
    renderer.setSize(sizes.width, sizes.height);

    // Animate
    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update objects
      mesh.rotation.y = elapsedTime; // make it rotating a little bit by a frame

      // update camera position with the cursor coordicates
      // camera.position.x = cursor.x * 10
      // camera.position.y = cursor.y * 10
      // 仅仅是上面的设置 position 的话，cube 会和 cursor 一直在反方向上，到处乱窜
      // camera.lookAt(new THREE.Vector3())
      // looking at 0，0，0，这样 cube 就会一直在 center 点上转动了
      // 或者可以 lookAt mesh, 和上面的 0,0,0 等价
      // camera.lookAt(mesh.position)
      // 上面的转动最多只能看到 cube 的 5面，front+上下左右，back 是看不到的, camera move on a flat plane

      // Move the camera around the center of the scene
      // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
      // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
      // camera.position.y = cursor.y * 5
      // camera.lookAt(mesh.position);

      controls.update(); // update controls 在 damping 效果

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();
  }, [canvas.current]);

  return <canvas className="webgl" ref={canvas}></canvas>;
};

export default Page;
