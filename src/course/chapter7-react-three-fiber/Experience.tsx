import { useFrame, extend, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import CustomObject from './CustomObject';

// extend allows us to use non-primitive components in R3F. In this case, we are extending the OrbitControls component from Three.js so that we can use it in our R3F scene.
// // extend automatically convert a three.js class into a declarative version and make it available as a JSX component.
extend({ OrbitControls });

export default function Experience() {
  const cubeRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();
  // console.log(three); // useThree hook gives us access to the Three.js state, which includes the scene, camera, renderer, and other useful properties.

  // hook called on each frame, before the scene is rendered
  useFrame((state, delta) => {
    // console.log('frame');
    // console.log('state', state);
    // console.log('delta', delta);
    if (cubeRef.current) {
      // rotate the cube on each frame
      // use delta to make the rotation independent of the frame rate
      cubeRef.current.rotation.y += delta;
    }
  });
  return <>
  {/* order not relevant */}
    <orbitControls args={[camera, gl.domElement]} />

    <directionalLight
      position={[1, 2, 3]}
      intensity={4.5}
      castShadow
      shadow-mapSize={[1024, 1024]}
    />
    <ambientLight intensity={ 1.5 } />

    <group ref={groupRef}>
      <mesh position-x={ -2 } castShadow receiveShadow>
        {/* parameters for sphereGeometry: radius, widthSegments, heightSegments */}
        <sphereGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>

      <mesh ref={cubeRef} scale={1.5} position-x={2} rotation-y={Math.PI * 0.25} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color="mediumpurple" wireframe={false} />
      </mesh>
    </group>

    <mesh position-y={-1} rotation-x={-Math.PI * 0.5} scale={10} receiveShadow>
      <planeGeometry />
      <meshStandardMaterial color="greenyellow" />
    </mesh>

    <CustomObject />
  </>
}
