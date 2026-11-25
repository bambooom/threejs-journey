import { BlendFunction, Effect } from 'postprocessing'
import { Uniform, type WebGLRenderTarget, type WebGLRenderer } from 'three'

interface DrunkEffectOptions {
  frequency: number
  amplitude: number
  blendFunction?: BlendFunction
}

// custom effect: https://github.com/pmndrs/postprocessing/wiki/Custom-Effects
// https://github.com/pmndrs/react-postprocessing/blob/90d10d59fe5a1a86e027c1bedd36dcf3b87ddd1c/docs/effects/custom-effects.mdx

/**
 * const means that the parameter is not writable.
    in means that it’s a copy of the actual variable and changing it won’t affect the initial variable sent when calling the function.
    out means that changing this value will change the variable sent when calling the function.

It prevents us from making mistakes but also gives us a hint about what variables we need to change:

    inputColor contains the current color for that pixel which is defined by the previous effects.
    uv contains the render coordinates (from 0,0 at the bottom left corner to 1,1 in the top right corner).
    outputColor is what we need to change in order to apply the effect.

 */
// make the image wiggle via mainUv
const fragmentShader = /* glsl */`
    uniform float frequency;
    uniform float amplitude;
    uniform float time;

    void mainUv(inout vec2 uv)
    {
      uv.y += sin(uv.x * frequency + time) * amplitude;
    }

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor)
    {
      // testing
      // outputColor = vec4(uv, 1.0, 1.0);
      outputColor = vec4(0.8, 1.0, 0.5, inputColor.a); // make green

      // vec4 color = inputColor;
      // color.rgb *= vec3(0.8, 1.0, 0.5);
      // outputColor = color;
    }
`

export default class DrunkEffect extends Effect {
  constructor({ frequency, amplitude, blendFunction  = BlendFunction.DARKEN }: DrunkEffectOptions) {
    super('DrunkEffect', fragmentShader, {
      blendFunction,
      uniforms: new Map([
        [ 'frequency', new Uniform(frequency) ],
        [ 'amplitude', new Uniform(amplitude)  ],
        [ 'time', new Uniform(0) ] // use for animating
      ]) // use uniform in shader
    })

    // console.log(props)
  }

  // this function is being called on each frame automatically
  update(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, deltaTime: number): void {
    this.uniforms.get('time')!.value += deltaTime
  }


}
