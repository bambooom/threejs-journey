varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;

#include ../includes/random2D.glsl

void main() {
  // Position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // Glitch
  float glitchTime = uTime - modelPosition.y;
  // add multiple sin functions to make it various frequency, more randomness
  float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76);
  glitchStrength /= 3.0;
  // float glitchStrength = sin(uTime - modelPosition.y);
  // - modelPosition.y make it move from bottom to up
  glitchStrength = smoothstep(0.3, 1.0, glitchStrength);
  // add smoothstep for remapping, to make it not below 0.0, effetc appear less often
  // The effect is only applied when the value goes from 0.3 to 1.0 which is a lot less often
  glitchStrength *= 0.25;
  modelPosition.x += (random2D(modelPosition.xz + uTime) - 0.5) * glitchStrength;
  modelPosition.z += (random2D(modelPosition.zx + uTime) - 0.5) * glitchStrength;
  // minus 0.5 make the range changes to -0.5 to +0.5, if not, it will be 0 to 1, and makes all objects shift to the right

  // Final position
  gl_Position = projectionMatrix * viewMatrix * modelPosition;

  // Varying
  vPosition = modelPosition.xyz;
  // using model position not uv coordinate
  // if using position, the stripes will be static, moving together with the object
  // modelPosition is like the absolute positon, the pattern doesn't rotate with the object, like a static rays

  // Model normal
  vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
  // last arg 0.0, vector is not homogeneous, translation won't be applied, rotation/scale will be applied

  // vNormal = normal; // already have normal, send it to fragment
  vNormal = modelNormal.xyz; // only want xyz
}
