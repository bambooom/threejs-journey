import { shaderMaterial, Sparkles, Center, useTexture, useGLTF, OrbitControls } from '@react-three/drei'
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragmentShader from './shaders/portal/fragment.glsl'
import * as THREE from 'three'
import { useFrame, extend } from '@react-three/fiber'
import { useRef } from 'react'

// shader material heler in drei
const PortalMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new THREE.Color('#ffffff'),
    uColorEnd: new THREE.Color('#000000')
  },
  portalVertexShader,
  portalFragmentShader
)

type PortalMaterialType = THREE.ShaderMaterial & { uTime: number }

// use extend to make it can use in JSX
extend({ PortalMaterial })

export default function Experience() {
  const { nodes } = useGLTF('/models/portal.glb')
  // console.log(nodes) // nodes.baked is the baked model

  const bakedTexture = useTexture('/textures/baked.jpg')
  // console.log(bakedTexture)
  bakedTexture.flipY = false // need this to fix

  const portalMaterial = useRef<PortalMaterialType | null>(null)
  // use this to animate, no need to specify uniforms and values
  useFrame((state, delta) => {
    portalMaterial.current!.uTime += delta
  })

  return <>
    <color args={ [ '#030202' ] } attach="background" />
    <OrbitControls makeDefault />

    <Center>
      <mesh geometry={ nodes.baked.geometry } >
        <meshBasicMaterial map={ bakedTexture } />
      </mesh>

      {/* pole light A & B */}
      <mesh geometry={ nodes.poleLightA.geometry } position={ nodes.poleLightA.position } >
        <meshBasicMaterial color="#ffffe5" />
      </mesh>
      <mesh geometry={ nodes.poleLightB.geometry } position={ nodes.poleLightB.position }>
        <meshBasicMaterial color="#ffffe5" />
      </mesh>

      {/* Portal */}
      <mesh
        geometry={ nodes.portalLight.geometry }
        position={ nodes.portalLight.position }
        rotation={ nodes.portalLight.rotation }
      >
        {/* <meshBasicMaterial color="#ffffff" /> */}

        {/* use this method can see the shader, but not animated */}
        {/* <shaderMaterial
          vertexShader={ portalVertexShader }
          fragmentShader={ portalFragmentShader }
          uniforms={{
            uTime: { value: 0 },
            uColorStart: { value: new THREE.Color('#ffffff') },
            uColorEnd: { value: new THREE.Color('#000000') }
          }}
        /> */}

        {/* better way to import to use shader material */}
        <portalMaterial ref={ portalMaterial } />
      </mesh>
    </Center>

    <Sparkles
      size={ 6 }
      scale={ [ 4, 2, 4 ] }
      position-y={ 1 }
      speed={ 0.2 }
      count={ 40 }
    />

  </>
}
