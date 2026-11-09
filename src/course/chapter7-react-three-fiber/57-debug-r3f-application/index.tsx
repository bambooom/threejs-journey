import { type FC, StrictMode } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';
import { Leva } from 'leva';

const Page: FC = () => {
  return (
    <StrictMode>
      <div className='r3f-root'>
        {/* Leva debug panel, should be outside canvas */}
        <Leva collapsed />

        {/* canvas setting */}
        <Canvas
          camera={{
            fov: 45,
            near: 0.1,
            far: 200,
            position: [ - 4, 3, 6 ]
          }}
        >
          {/* mesh boxGeometry can be treated as a primitive component */}
          <Experience />
        </Canvas>
      </div>
    </StrictMode>
  );
};

export default Page;
