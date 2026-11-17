import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { Clone, useGLTF } from '@react-three/drei'

export default function Model() {
  const model = useLoader(
    GLTFLoader,
    // '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    '/models/hamburger-draco.glb',
    (loader) =>
    {
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/draco/')
      loader.setDRACOLoader(dracoLoader)
    }
  )

  {/* <primitive> is some kind of holder for whatever we want to put in it.
      It’s not a real object that we will be able to see in the scene, but it’s a container supported by R3F that will handle and display whatever we put in its object attribute.
    */}
  return (
    <>
      {/* use Clone to display multiple instances */}
      <Clone object={ model.scene } scale={ 0.35 } position-x={ - 4 } />
      <Clone object={ model.scene } scale={ 0.35 } position-x={ 0 } />
      <Clone object={ model.scene } scale={ 0.35 } position-x={ 4 } />
    </>
  )
}

// do preloading the model
useGLTF.preload('/models/hamburger-draco.glb')


// GLTF -> React Three Fiber
// have our hamburger available as a component with everything inside a simple JSX that we can manipulate,
// cli: https://github.com/pmndrs/gltfjsx
// online: https://gltf.pmnd.rs/
