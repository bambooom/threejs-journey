import { type FC } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';

const Page: FC = () => {
  return (
    <div className='r3f-root'>
      <Canvas
        shadows
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [ -4, 3, 6 ]
        }}
      >
        <Experience />
      </Canvas>
    </div>
  );
};

export default Page;
