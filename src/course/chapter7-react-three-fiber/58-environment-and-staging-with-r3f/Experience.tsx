import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { Stage, Lightformer, Environment, Sky, ContactShadows, RandomizedLight, AccumulativeShadows, SoftShadows, BakeShadows, useHelper, OrbitControls } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import { useRef, useEffect } from 'react';
import { useControls } from 'leva'

export default function Experience() {

  const cube = useRef<THREE.Mesh>(null)
  const directionalLight = useRef<THREE.DirectionalLight>(null!)
  // The first parameter of useHelper is the reference to the light source and the second parameter is the helper class we want to use from Three.js
  // useHelper(directionalLight, THREE.DirectionalLightHelper, 1) // 3rd parameter the size

  useFrame((state, delta) => {
    if (cube.current) {
      cube.current.rotation.y += delta * 0.2
    }
  })

  const { color, opacity, blur } = useControls('contact shadows', {
    color: '#000000',
    opacity: { value: 0.5, min: 0, max: 1 },
    blur: { value: 1, min: 0, max: 10 },
  })

  const { sunPosition } = useControls('sky', {
    sunPosition: { value: [ 1, 2, 3 ] }
  })

  // apply env map
  // const { envMapIntensity } = useControls('environment map', {
  //   envMapIntensity: { value: 3.5, min: 0, max: 12 }
  // })

  const { envMapIntensity, envMapHeight, envMapRadius, envMapScale } = useControls('environment map', {
    envMapIntensity: { value: 7, min: 0, max: 12 },
    envMapHeight: { value: 7, min: 0, max: 100 },
    envMapRadius: { value: 28, min: 10, max: 1000 },
    envMapScale: { value: 100, min: 10, max: 1000 }
})

  const scene = useThree(state => state.scene)
  useEffect(() => {
    // update the intensity
    scene.environmentIntensity = envMapIntensity
  }, [ envMapIntensity ])


  // add castShadow & receiveShadow to show shadows
  return <>
    {/* if scene is static, can bake the shadows to improve performance */}
    {/* <BakeShadows /> */}

    {/* use soft shadow instead of default shadow, more soft, real */}
    {/*
      size: radius of the softness
      samples: quality (more samples = less visual noise but worse performance)
      focus: distance where the shadow is the sharpest
     */}
     {/* this helper will modify Three.js shaders directly and each change applied on its attributes will re-compile all the shaders supporting shadows. This will result in performance issues and a drastic frame rate drop. */}
    {/* <SoftShadows size={ 25 } samples={ 10 } focus={ 0 } /> */}

    <Perf position='top-left' />
    <OrbitControls makeDefault />

    {/* <directionalLight
      ref={ directionalLight }
      castShadow
      position={ sunPosition } // set to sun position
      intensity={ 4.5 }
      shadow-mapSize={[1024, 1024]}  // change shadow map size and other config
      shadow-camera-near={ 1 }
      shadow-camera-far={ 10 }
      shadow-camera-top={ 5 }
      shadow-camera-right={ 5 }
      shadow-camera-bottom={ - 5 }
      shadow-camera-left={ - 5 }
    /> */}
    {/* each light casting shadows will render the scene in a specific way and output that we call “shadow map”. This shadow map is then used to know if a surface is in the shade or not.
    By default, that shadow map resolution is rather low in order to maintain solid performance. */}

    {/* AccumulativeShadows will accumulate multiple shadow renders, and we are going to move the light randomly before each render. This way the shadow will be composed of a bunch of renders from various angles, making it look soft and very realistic. */}
    {/* Since the AccumulativeShadows will be a shadow on its own, we should deactivate the shadows on the <mesh> corresponding to the floor to prevent having two shadows. */}
    {/* <AccumulativeShadows
      position={ [ 0, - 0.99, 0 ] }    // put right above the floor
      scale={ 10 } // default scale 10
      color="#316d39"    // make the shadow a dark green/blue-ish color
      opacity={ 0.8 }    // reduce opacity
      frames={ Infinity }    // How many shadow renders to do, 1000 is a lot, will freeze, use temporal to prevent freeze
                            // use Infinity to keep rendering the shadows
                            // infinite frames, the AccumulativeShadows is only blending the last 20 shadow renders.
      temporal           // spread the renders across multiple frames
      blend={ 100 }    // the higher the blend, the less chance you have to see shadows on fast moving objects
    > */}
      {/* Since the AccumulativeShadows will render shadow maps, we need to provide it actual lights. Note that it won’t use the lights already available in the scene which means we have to duplicate the directional light.  */}
      {/* <directionalLight
        position={ [ 1, 2, 3 ] }
        castShadow
      /> */}

      {/* <RandomizedLight
        amount={ 8 }              // how many lights (by default there is multiple lights)
        radius={ 1 }              // the amplitude of the jiggle
        ambient={ 0.5 }           // act like if a global light was illuminating the whole scene, making only tight spaces and crevices receiving shadows
        intensity={ 3 }           // the intensity of the lights
        position={ [ 1, 2, 3 ] }
        bias={ 0.001 }            // the bias offset to fix the issue where the objects are casting shadows on themselves or not casting shadow on objects very close to their surface
      />
    </AccumulativeShadows> */}

    {/* ContactShadows works without a light being involved.
    Like for the AccumulativeShadows, it works on a plane which limits its usage but looks very good on a floor.
    The ContactShadows will render the whole scene a bit like how the directional light does, but with the camera taking place of the floor instead of the light.

    <ContactShadows> looks very good, but has limitations:
        - The shadows always comes from the front of the plane (positive y in our case).
        - It’s not physically accurate.
        - It blurs the shadow regardless of the distance from the objects.
        - It pulls quite a lot on the performance.

      For simple object display, it’s great, but for more complex or realistic rendering, you might better use other shadow solutions.
    */}
    {/* <ContactShadows
      position={ [ 0, 0, 0 ] }
      scale={ 10 }
      resolution={ 512 }
      far={ 5 }
      color={ color }
      opacity={ opacity }
      blur={ blur }
      // frames={ 1 }  // bake the shadow by setting to 1
    /> */}

    {/* <ambientLight intensity={ 1.5 } /> */}

    {/* natural back */}
    {/* <Sky sunPosition={ sunPosition } /> */}


    {/* environment map texture cube */}
    {/* <Environment
      background // set the map to background
      // instead of using 6 images, we can use one hdr image
      // files="/environmentMaps/the_sky_is_on_fire_2k.hdr"
      // files={ [
      //   '/environmentMaps/0/px.png',
      //   '/environmentMaps/0/nx.png',
      //   '/environmentMaps/0/py.png',
      //   '/environmentMaps/0/ny.png',
      //   '/environmentMaps/0/pz.png',
      //   '/environmentMaps/0/nz.png',
      // ]}
      preset="sunset" // use preset when no other files, smaller the resolution, the better for frame rate.
      // resolution={ 32 } // smaller the resolution, the better for frame rate
      // ground={ {
      //   height: 7,
      //   radius: 28,
      //   scale: 100
      // }}
      // ground={ {
      //   height: envMapHeight,
      //   radius: envMapRadius,
      //   scale: envMapScale
      // }}
    > */}
      {/* <color args={ [ '#000000' ] } attach="background" />
      <Lightformer
        position-z={ - 5 }
        scale={ 5 }
        color="red"
        intensity={ 10 }
        form="ring"
      />   */}
      {/* adding lights to environment */}
      {/* <mesh position-z={ - 5 } scale={ 10 }>
        <planeGeometry />
        <meshBasicMaterial color={ [ 10, 0, 0 ] } toneMapped={ false } />
      </mesh> */}
    {/* </Environment> */}

    {/* add a meth outside Environment first */}
    {/* <mesh position-z={ - 5 } scale={ 10 }>
      <planeGeometry />
      <meshBasicMaterial color="red" />
    </mesh> */}

    {/* <mesh position-y={ 1 } position-x={ - 2 } castShadow>
      <sphereGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>

    <mesh ref={ cube } castShadow position-y={ 1 } position-x={ 2 } scale={ 1.5 }>
      <boxGeometry />
      <meshStandardMaterial color="mediumpurple" />
    </mesh> */}

    {/* <mesh
      // receiveShadow
      position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
      <planeGeometry />
      <meshStandardMaterial color="greenyellow" />
    </mesh> */}

    {/* Stage will set an environment map, shadows and two directional lights for us. It’ll also center the scene. If you want a quick and easy setup, it’s a good solution. */}
    <Stage
      shadows={ { type: 'contact', opacity: 0.5, blur: 2 } } // choose between the accumulative shadow and the contact shadow
      environment="sunset"
      preset="portrait"
      intensity={ envMapIntensity }
    >
      <mesh position-y={ 1 } position-x={ - 2 }>
        <sphereGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>

      <mesh ref={ cube } position-y={ 1 } position-x={ 2 } scale={ 1.5 }>
        <boxGeometry />
        <meshStandardMaterial color="mediumpurple" />
      </mesh>
    </Stage>

  </>
}
