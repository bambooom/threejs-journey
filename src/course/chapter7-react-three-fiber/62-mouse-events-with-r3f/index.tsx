import { type FC } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';
import { Bvh } from '@react-three/drei'
// If you have very complex geometries and still need the pointer events to be accurate and performant, you can also use the BVH (Bounding Volume Hierarchy).
// only downside is that it needs to generate a boundsTree which will then be used internally by Bvh. This process needs to be done only once for each Mesh but can result in a short freeze according to the geometries complexity.

const Page: FC = () => {
  return (
    <div className='r3f-root'>
      <Canvas
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [-4, 3, 6 ]
        }}
      >
        <Bvh>
          <Experience />
        </Bvh>
      </Canvas>
    </div>
  );
};

export default Page;
