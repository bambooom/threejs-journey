import { useFrame } from '@react-three/fiber'
import { meshBounds, useGLTF, OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

export default function Experience() {
  const cube = useRef<THREE.Mesh>(null)

  const hamburger = useGLTF('/models/hamburger.glb')

  useFrame((state, delta) => {
    if (cube.current)
      cube.current.rotation.y += delta * 0.2
  })

  const eventHandler = () => {
    // console.log('the event occurred')
    // console.log('---')
    // console.log('distance', event.distance) // Distance between camera and hit point
    // console.log('point', event.point) // Hit point coordinates (in 3D)
    // console.log('uv', event.uv) // UV coordinates on the geometry (in 2D)
    // console.log('object', event.object) // The object that triggered the event
    // console.log('eventObject', event.eventObject) // The object that was listening to the event (useful where there are objects in objects)

    // console.log('---')
    // console.log('x', event.x) // 2D screen coordinates of the pointer
    // console.log('y', event.y) // 2D screen coordinates of the pointer

    // console.log('---')
    // console.log('shiftKey', event.shiftKey) // If the SHIFT key was pressed
    // console.log('ctrlKey', event.ctrlKey) // If the CTRL key was pressed
    // console.log('metaKey', event.metaKey) // If the COMMAND key was pressed
    cube.current?.material.color.set(`hsl(${Math.random() * 360}, 100%, 75%)`)
  }

  return <>

    <OrbitControls makeDefault />

    <directionalLight position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
    <ambientLight intensity={ 1.5 } />

    {/* stop propagation make sphere occlude the cube, we can't click through it */}
    <mesh
      position-x={ - 2 }
      onClick={ (event) => event.stopPropagation() }
      onPointerEnter={ (event) => event.stopPropagation() }
    >
      <sphereGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>

    {/* meshBounds create a theoretical sphere around the mesh (called bounding sphere) and the pointer events will be tested on that sphere instead of testing the geometry of the mesh.
    This is useful if you don’t need a very precise detection on a complex geometry.
    We are going to test it on the cube. Be aware that meshBounds only works on single meshes which is why we can’t use it on the hamburger since it’s composed of multiple meshes.
    */}

    <mesh
      raycast={ meshBounds }
      ref={ cube }
      position-x={ 2 }
      scale={ 1.5 }
      onClick={ eventHandler }
      onPointerEnter={ () => { document.body.style.cursor = 'pointer' } }
      onPointerLeave={ () => { document.body.style.cursor = 'default' } }
    >
      <boxGeometry />
      <meshStandardMaterial color="mediumpurple" />
    </mesh>

    <primitive
      object={ hamburger.scene }
      scale={ 0.25 }
      position-y={ 0.5 }
      onClick={ (event) => {
        // console.log(event.object)
        event.stopPropagation() // The first object that will trigger the event (whatever it is) will prevent the other ones behind that first object from triggering another event.
      }}
    />

    <mesh position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
      <planeGeometry />
      <meshStandardMaterial color="greenyellow" />
    </mesh>

  </>
}


// Avoid events that need to be tested every time the pointer moves (up to once per frame) if possible: onPointerOver, onPointerEnter, onPointerOut, onPointerLeave, onPointerMove
// Try to minimise the number of objects that listen to events and avoid testing complex geometries. If you notice a freeze, even a short one when interacting, you’ll have some more optimisation to do.
