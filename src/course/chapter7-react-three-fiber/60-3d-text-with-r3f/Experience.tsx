import { useMatcapTexture, Center, Text3D, OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// use original native threejs instead state
const torusGeometry = new THREE.TorusGeometry(1, 0.6, 16, 32)
const material = new THREE.MeshMatcapMaterial()

export default function Experience() {
  // load matcaps automatically from https://github.com/emmelleppi/matcaps
  const [matcapTexture] = useMatcapTexture('7B5254_E9DCC7_B19986_C8AC91', 256) // second parameter is the desired width. We can choose between 64, 128, 256, 512, 1024
  // console.log(matcapTexture) // log twice since Text3D trigger a. re-render on component

  // const [ torusGeometry, setTorusGeometry ] = useState()
  // const [ material, setMaterial ] = useState()

  const donutsGroup = useRef<THREE.Group>(null)
  const donuts = useRef<(THREE.Mesh | null)[]>([])

  useEffect(() => {
    // to apply matcap texture
    matcapTexture.colorSpace = THREE.SRGBColorSpace
    matcapTexture.needsUpdate = true

    material.matcap = matcapTexture
    material.needsUpdate = true
  }, [])

  useFrame((state, delta) => {
    for(const donut of donuts.current) {
        donut!.rotation.y += delta * 0.2
    }
  })

  return <>
    <Perf position="top-left" />

    <OrbitControls makeDefault />

    {/* <mesh scale={ 1.5 }>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh> */}

    {/* move material outside, and ust ref to use it in mesh for optimization */}
    {/* <meshMatcapMaterial ref={ setMaterial } matcap={ matcapTexture } /> */}

    {/* Center the geometry */}
    <Center>
      <Text3D
        material={ material }
        font="/fonts/helvetiker_regular.typeface.json"
        size={ 0.75 }
        height={ 0.2 }
        curveSegments={ 12 }
        bevelEnabled
        bevelThickness={ 0.02 }
        bevelSize={ 0.02 }
        bevelOffset={ 0 }
        bevelSegments={ 5 }
      >
        HELLO R3F
        {/* <meshNormalMaterial /> */}
        {/* <meshMatcapMaterial matcap={ matcapTexture } /> */}
      </Text3D>
    </Center>

    {/* multiple donuts */}
    {/* move geometry outside for optimization */}
    {/* <torusGeometry ref={ setTorusGeometry } args={ [ 1, 0.6, 16, 32 ] } /> */}

    <group ref={ donutsGroup }>
      {[...Array(100)].map((val, index) =>
        <mesh
          key={ index }
          ref={ (element) => donuts.current[index] = element }
          geometry={ torusGeometry }
          material={ material }
          position={ [
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ]}
          scale={ 0.2 + Math.random() * 0.2 }
          rotation={ [
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            0
          ]}
        >
          {/* <torusGeometry /> */}
          {/* <meshMatcapMaterial matcap={ matcapTexture } /> */}
        </mesh>
      )}
    </group>

  </>
}
