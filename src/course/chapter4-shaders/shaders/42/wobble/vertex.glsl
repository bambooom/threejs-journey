// varying vec2 vUv;


attribute vec4 tangent; // calculated
#include ../../includes/simplexNoise4d.glsl

float getWobble(vec3 position)
{
  return simplexNoise4d(vec4(
    position, // XYZ
    0.0 // W
  ));
}

void main()
{
  // csm_Position.y += sin(csm_Position.x * 3.0) * 0.5;

  // Varyings
  // vUv = uv;



  vec3 biTangent = cross(normal, tangent.xyz); // cross product, get the biTangent

  // Neighbours positions
  float shift = 0.01;
  vec3 positionA = csm_Position + tangent.xyz * shift; // shift on tangent direction
  vec3 positionB = csm_Position + biTangent * shift; // shift on biTangent direction

  // Wobble
  // float wobble = simplexNoise4d(vec4(
  //   csm_Position, // XYZ
  //   0.0
  // ));
  float wobble = getWobble(csm_Position);
  csm_Position += wobble * normal; // make it like 💥 but in 3D
  positionA += getWobble(positionA) * normal;
  positionB += getWobble(positionB) * normal;

  // Compute normal
  vec3 toA = normalize(positionA - csm_Position);
  vec3 toB = normalize(positionB - csm_Position);
  csm_Normal = cross(toA, toB); // the shades will be corrected
}
