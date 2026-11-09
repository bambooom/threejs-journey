// import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei';
import { useControls, button } from 'leva';
import { Perf } from 'r3f-perf';
// import { useRef } from 'react';
// import Cube from './Cube';

export default function Experience() {

  const { perfVisible } = useControls({
    perfVisible: true,
  });

  // each time change the value, component will re-render
  // deconstructure the value from useControls
  const { position, color, visible } = useControls('Sphere', {
    // add first string to add a level folder name,
    position: {
      value: {x: -2, y:0},
      // min: -4,
      // max: 4,
      step: 0.01,
      joystick: 'invertY', // make the joystick move in the opposite direction, but follow the mouse movement
    },
    color: 'orange',
    visible: true,
    // range
    myInterval: {
      min: 0,
      max: 10,
      value: [4, 5],
    },
    clickMe: button(() => {
      console.log('button clicked')
    }),
    choice: {
      options: ['a', 'b', 'c'],
    },
  })

  // another folder
  const { scale } = useControls('Cube', {
    scale: {
      value: 1.5,
      min: 0,
      max: 5,
      step: 0.01,
    },
  });

  return <>
    {/* show cpu, gpu, memory, fps, triangles. etc  */}
    { perfVisible && <Perf position='top-left' /> }
    <OrbitControls makeDefault />
    <directionalLight position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
    <ambientLight intensity={ 1.5 } />

    {/* change the position through debug tool */}
    <mesh position={ [position.x, position.y, 0] } visible={ visible }>
      <sphereGeometry />
      <meshStandardMaterial color={color} />
    </mesh>

    {/* <Cube scale={ 2 } /> */}

    <mesh position-x={ 2 } scale={ scale }>
      <boxGeometry />
      <meshStandardMaterial color="mediumpurple" />
    </mesh>

    <mesh position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
      <planeGeometry />
      <meshStandardMaterial color="greenyellow" />
    </mesh>

  </>
}
