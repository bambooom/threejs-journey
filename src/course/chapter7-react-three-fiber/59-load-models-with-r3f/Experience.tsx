import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import Model from './Model'
import { Suspense } from 'react'
import Placeholder from './Placeholder'
import Hamburger from './Hamburger'
import Fox from './Fox'

export default function Experience() {
  // for model not DRACO compressed
  // const model = useLoader(GLTFLoader, '/models/hamburger-orig.glb')

  // for model DRACO compressed, need to use DRACOLoader
  // const model = useLoader(
  //   GLTFLoader,
  //   '/models/hamburger-draco.glb',
  //   (loader) =>
  //   {
  //     const dracoLoader = new DRACOLoader()
  //     dracoLoader.setDecoderPath('/draco/')
  //     loader.setDRACOLoader(dracoLoader)
  //   }
  // )

  return <>

    <Perf position="top-left" />

    <OrbitControls makeDefault />

    {/* use shadow bias or normalBias to fix shadows for Hamburger auto generated component, shadow acne, due to model casting shadows on itself */}
    <directionalLight castShadow position={ [ 1, 2, 3 ] } intensity={ 4.5 } shadow-normalBias={ 0.04 } />
    <ambientLight intensity={ 1.5 } />

    {/* <mesh castShadow position-x={ - 2 }>
      <sphereGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>

    <mesh castShadow position-x={ 2 } scale={ 1.5 }>
      <boxGeometry />
      <meshStandardMaterial color="mediumpurple" />
    </mesh> */}

    <mesh receiveShadow position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
      <planeGeometry />
      <meshStandardMaterial color="greenyellow" />
    </mesh>

    {/* use <Suspense> to lazy loding, use fallback when not loading yet */}
    <Suspense
      fallback={ <Placeholder position-y={ 0.5 } scale={ [ 2, 3, 2 ] } /> }
    >
      {/* <Model /> */}
      <Hamburger scale={ 0.35 } />
    </Suspense>

    <Fox />

  </>
}
