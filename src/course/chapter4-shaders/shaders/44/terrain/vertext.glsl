uniform float uTime;
uniform float uPositionFrequency;
uniform float uStrength;
uniform float uWarpFreqncy;
uniform float uWarpStrength;

varying vec3 vPosition;
varying float vUpDot;

#include ../../includes/simplexNoise2d.glsl

float getElevation(vec2 position)
{

  vec2 warpedPosition = position;
  warpedPosition += uTime * 0.2; // make the plane moving
  warpedPosition += simplexNoise2d(warpedPosition * uPositionFrequency * uWarpFreqncy) * uWarpStrength;

  float elevation = 0.0;
  elevation += simplexNoise2d(warpedPosition * uPositionFrequency) / 2.0;
  // create variations, apply more noise by two different frequencies
  elevation += simplexNoise2d(warpedPosition * uPositionFrequency * 2.0) / 4.0;
  elevation += simplexNoise2d(warpedPosition * uPositionFrequency * 4.0) / 8.0;
  // dividing by 2, 4, 8 make the noise to be in range of -1 to 1

  float elevationSign = sign(elevation); // get the sign of the elevation, -1, 0, 1
  elevation = pow(abs(elevation), 2.0) * elevationSign; // use power function to make value near like 0 and keep the sign
  elevation *= uStrength;

  return elevation;
}


void main()
{
  // Neightbours positions
  float shift = 0.01;
  vec3 positionA = position.xyz + vec3(shift, 0.0, 0.0); // shift on x axis
  vec3 positionB = position.xyz + vec3(0.0, 0.0, -shift); // shift on z axis, negative

  // Elevation
  float elevation = getElevation(csm_Position.xz);
  csm_Position.y += elevation; // change y vertically
  positionA.y = getElevation(positionA.xz);
  positionB.y = getElevation(positionB.xz);

  // Compute normal
  vec3 toA = normalize(positionA - csm_Position);
  vec3 toB = normalize(positionB - csm_Position);
  csm_Normal = cross(toA, toB); // the shades will be corrected

  // Varying
  vPosition = csm_Position; // send to fragment
  vPosition.xz += uTime * 0.2; // offsetting the position for avoid animation like effect
  vUpDot = dot(csm_Normal, vec3(0.0, 1.0, 0.0)); // dot product with up vector, and send to fragment
}
