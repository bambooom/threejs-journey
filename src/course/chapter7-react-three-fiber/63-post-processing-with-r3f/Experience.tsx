import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import Drunk from './Drunk.jsx'
import { useRef, useEffect } from 'react'
import { useControls } from 'leva'

// use new library for post-processing
import { DepthOfField, Bloom, Noise, Glitch, Vignette, ToneMapping, EffectComposer } from '@react-three/postprocessing'
// Post Processing ensures the lowest number of passes possible and combines the effects into one shader.
import { GlitchMode, BlendFunction, ToneMappingMode } from 'postprocessing'

export default function Experience() {
  const drunkRef = useRef(null)
  useEffect(() => {
    console.log(drunkRef.current)
  }, [])

  const drunkProps = useControls('Drunk Effect', {
    frequency: { value: 2, min: 1, max: 20 },
    amplitude: { value: 0.1, min: 0, max: 1 }
  })

  return <>
    <Perf position="top-left" />
    <OrbitControls makeDefault />

    <directionalLight castShadow position={ [ 1, 2, 3 ] } intensity={ 4.5 } />
    <ambientLight intensity={ 1.5 } />

    {/* multi-sampling is used to prevent the aliasing effect (the little stairs on the edges of geometries).
      By default, its value is at 8 and we can lower it down to 0 in order to disable it completely.
    */}
    <EffectComposer multisampling={ 8 }>
      {/* Vignette will make the corners of the render a little darker. */}
      {/* <Vignette
        offset={ 0.3 }
        darkness={ 0.9 }
        // default is Normal
        blendFunction={ BlendFunction.NORMAL }
      /> */}

      {/* GlitchMode:
          CONSTANT_MILD: 2
          CONSTANT_WILD: 3
          DISABLED: 0
          SPORADIC: 1
      */}
      {/* <Glitch
        delay={ [ 0.5, 1 ] }
        duration={ [ 0.1, 0.3 ] }
        strength={ [ 0.2, 0.4 ] }
        mode={ GlitchMode.CONSTANT_MILD }
      /> */}

      {/* some choice:
        BlendFunction.OVERLAY
        BlendFunction.SCREEN
        BlendFunction.SOFT_LIGHT
        BlendFunction.AVERAGE
       */}
      {/* <Noise
        // premultiply will multiply the noise with the input color before applying the blending.
        // It usually results in a darker render but it blends better with the image.
        premultiply
        blendFunction={ BlendFunction.OVERLAY }
      /> */}

      {/* bloom effect: make our scene glow. better in darker background  */}
      {/* <Bloom
        luminanceThreshold={ 1.1 }
        mipmapBlur // set false can remove the outside glow
        intensity={ 0.5 } // control general intensity
        luminanceThreshold={ 0 } // define the threshold above which materials start to glow with. default 0.9
      /> */}

      {/* This effect will blur what’s closer or farther from a set distance. */}
      {/* <DepthOfField
        // focusDistance and focusRange are distances from the camera in world units, just like the positions and scales of our objects.
        focusDistance={ 5 } // At which distance should the image be sharp
        focusRange={ 5 }    // The distance to travel from the focusDistance before reaching the maximum blur
        bokehScale={ 6 }    // blur radius
      /> */}

      <Drunk
        ref={ drunkRef }
        // frequency={ 2 }
        // amplitude={ 0.1 }
        { ...drunkProps }
        blendFunction={ BlendFunction.DARKEN }
      />

      {/* tone mapping  deactivated by default in EffectComposer */}
      {/* need to keep tone mapping at the very end all the time */}
      <ToneMapping mode={ ToneMappingMode.ACES_FILMIC } />
      {/* ToneMappingMode:
            ACES_FILMIC: 6
            AGX: 7
            CINEON: 5
            LINEAR: 0
            NEUTRAL: 8
            OPTIMIZED_CINEON: 5
            REINHARD: 1
            REINHARD2: 2
            REINHARD2_ADAPTIVE: 3
            UNCHARTED2: 4
      */}
    </EffectComposer>

    {/* background color, add color so that vignette work on it */}
    <color args={ [ '#000000' ] } attach="background" />

    <mesh castShadow position-x={ - 2 }>
      <sphereGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>

    <mesh castShadow position-x={ 2 } scale={ 1.5 }>
      <boxGeometry />
      <meshStandardMaterial color="mediumpurple" />

      {/* emissiveIntensity can control how strong the glow */}
      {/* <meshStandardMaterial color="#ffffff" emissive="orange" emissiveIntensity={ 2 } /> */}
      {/* <meshStandardMaterial color={ [ 4, 1, 2 ] } /> */}
      {/* set value larger than 1 */}
    </mesh>

    <mesh receiveShadow position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
      <planeGeometry />
      <meshStandardMaterial color="greenyellow" />
    </mesh>

  </>
}
