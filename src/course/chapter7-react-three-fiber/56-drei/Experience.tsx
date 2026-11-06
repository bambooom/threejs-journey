// import { useThree, extend } from '@react-three/fiber'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// extend({ OrbitControls })
import * as THREE from 'three'
import { OrbitControls, TransformControls, PivotControls, Html, Text, Float, MeshReflectorMaterial } from '@react-three/drei';
import { useRef } from 'react';

export default function Experience()
{
    // const { camera, gl } = useThree()
    const cubeRef = useRef<THREE.Mesh>(null)
    const sphereRef = useRef<THREE.Mesh>(null)

    return <>

        {/* <orbitControls args={ [ camera, gl.domElement ] } /> */}

        <OrbitControls enableDamping makeDefault />

        <directionalLight position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
        <ambientLight intensity={ 1.5 } />

        {/* Pivot Controls, same as Transform Controls but more features and looking good, can be used not only for debug purpose, but also for end user interaction */}
        {/* put 0,0,0 to put it at object center, using depthTest=false make the control draw on top of other objects */}
        {/* fixed=true, scale is around the pixel size */}
        <PivotControls
          anchor={[0,0,0]}
          depthTest={false}
          lineWidth={4}
          axisColors={['#9381ff', '#ff4d6d', '#7ae582']}
          scale={100}
          fixed={true}
        >
          <mesh position-x={ - 2 } ref={ sphereRef }>
            <sphereGeometry />
            <meshStandardMaterial color="orange" />
            {/* use distanceFactor to control the size of the HTML element based on its distance from the camera */}
            {/* occlude is an array of objects that will occlude the HTML element, if cover will hide the html element */}
            <Html
              position={[1, 1, 0]}
              wrapperClass='drei-label'
              center
              distanceFactor={6}
              occlude={[sphereRef, cubeRef]}
            >That's a sphere 👍</Html>
          </mesh>
        </PivotControls>

        {/* separate them and re-associate them using a reference and an attribute. */}
        <mesh ref={ cubeRef } scale={ 1.5 } position-x={ 2 } >
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" />
        </mesh>
        {/* use ref and object to re-associate them */}
        <TransformControls object={ cubeRef } mode="translate" >
          {/* When writing the <mesh> inside the <TransformControls>, R3F will actually create an object inside another object. */}
          {/* then there will be offset, one solution is to move position-x from mesh to controls */}
          {/* <mesh scale={ 1.5 }>
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" />
          </mesh> */}
        </TransformControls>

        <mesh position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
            <planeGeometry />
            {/* <meshStandardMaterial color="greenyellow" /> */}

            {/* make plane reflect, can make it blurry */}
            {/* mirror={ 0.5 } to make the reflection more clearer */}
            {/* add color if want to add a tint */}
            <MeshReflectorMaterial
              resolution={ 512 }
              blur={ [ 1000, 1000 ] }
              mixBlur={ 1 }
              mirror={ 0.7 }
              color="greenyellow"
            />
        </mesh>

        {/* add a HTML dom component stick to object */}
        <Html>
          Test
        </Html>

        {/* woff format usually the lighter one */}
        <Float
          speed={5}
          floatIntensity={2}
        >
          {/* make text floating effect */}
          <Text
            font="/fonts/bangers-v20-latin-regular.woff"
            fontSize={0.5}
            color="salmon"
            position-y={1.5}
            maxWidth={1}
            textAlign="center"
            >
            I LOVE R3F
            {/* <meshNormalMaterial /> */}
          </Text>
        </Float>

    </>
}
