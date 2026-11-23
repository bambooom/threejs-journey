import { type FC } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';

const Page: FC = () => {
  return (
    <div className='r3f-root'>
      {/* flat: R3F by default sets a toneMapping, This toneMapping is usually welcome and colors look better with it, but, in our case, we don’t want it because our scene has been baked from Blender and Blender already applies tone mapping with its color management system.
        so use flat to remove it and get the exact same color as the one we baked in Blender.
        Setting flat on the <Canvas> will set the toneMapping to THREE.NoToneMapping.
      */}
      <Canvas
        flat
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [1, 2, 6 ]
        }}
      >
        <Experience />
      </Canvas>
    </div>
  );
};

export default Page;
