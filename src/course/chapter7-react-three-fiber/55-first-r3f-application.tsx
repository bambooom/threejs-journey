// using R3F

import { type FC } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';
import * as THREE from 'three'

/**
 * React convention. Native host elements (the ones available in the renderer) are in camelCase while custom components are written in PascalCase.
 * In the case of R3F, we can think of it like:
 **** Automatically generated primitive components are in camelCase
 **** More specific components are in PascalCase
 */



const Page: FC = () => {
  return (
    <div className='r3f-root'>
      {/* canvas setting */}
      <Canvas
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

/**
You can’t really see it because nothing is moving, but the scene is being rendered on each frame.
We didn’t have to create a Scene.
We didn’t have to create the WebGLRenderer and the default settings are actually making sure that it looks appealing (antialias, colorSpace, etc.)
We didn’t have to place a PerspectiveCamera and, even better, we didn’t have to pull it back from the center of the scene.
When you resize the viewport, everything that needs resizing is handled automatically.
We didn’t have to provide any specific value for the <torusKnotGeometry> because R3F provides default parameters for most components.
We didn’t have to import the Mesh, nor the SphereGeometry, nor the MeshNormalMaterial.
Most of the time, we don’t even have to reload the page. React and R3F implement hot reloading and auto dispose. This means that we can add an object or change a color while our application is running. Be careful though, as some changes require reloading the page. If you don’t see the expected behaviour, hit reload.
*/
