import { type FC } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';
import * as THREE from 'three'

const Page: FC = () => {
  return (
    <div className='r3f-root'>
      {/* canvas setting */}
      <Canvas
        shadows
        dpr={ [ 1, 2 ] }
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [ 3, 2, 6 ]
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace
        }}
      >
        {/* mesh boxGeometry can be treated as a primitive component */}
        <Experience />
      </Canvas>
    </div>
  );
};

export default Page;
