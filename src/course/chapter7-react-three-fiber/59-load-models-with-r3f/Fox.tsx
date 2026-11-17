import { useAnimations, useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import { useControls } from 'leva'

export default function Fox() {
  const fox = useGLTF('/models/Fox/glTF/Fox.gltf')
  const animations = useAnimations(fox.animations, fox.scene)
  // console.log(animations)

  const { animationName } = useControls({
    animationName: { options: animations.names }
  })

  useEffect(() => {
    // animations.actions.Run!.play()

    // window.setTimeout(() =>
    // {
    //   animations.actions.Walk!.play()
    //   animations.actions.Walk!.crossFadeFrom(animations.actions.Run!, 1)
    // }, 2000)
    const action = animations.actions[animationName]
    action!.reset().fadeIn(0.5).play()
    // The function is being called when we change the animationName, but the animation of the fox looks weird after we change it to the second animation and weirder if we change it to third animation.
    // The reason is that all animations are playing together and Three.js will mix them. First, you are seeing the Survey animation; then a mix of the Survey and the Walk animations; and finally a mix of the Survey, the Walk and the Run animations.
    // so need the return function to dispose previous animation
    return () => {
      action!.fadeOut(0.5) // dispose
    }
  }, [animationName])

  return <primitive
    object={ fox.scene }
    scale={ 0.02 }
    position={ [ - 2.5, 0, 2.5 ] }
    rotation-y={ 0.3 }
  />
}
