import { type FC } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';
// import * as THREE from 'three'

const Page: FC = () => {
  // const created = ({ gl, scene }: { gl: THREE.WebGLRenderer; scene: THREE.Scene }) => {
    // change the background color
    // gl.setClearColor('#ff0000', 1)
    // scene.background = new THREE.Color('#ff0000');
  // };
  return (
    <div className='r3f-root'>
      {/* canvas setting */}
      <Canvas
        shadows={false} // activate shadow rendering
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [ -4, 3, 6 ]
        }}
        // onCreated={ created }
      >
        {/* create a Color instance, and attach to background to set the background color */}
        <color args={ [ 'ivory' ] } attach="background" />
        <Experience />
      </Canvas>
    </div>
  );
};

export default Page;
