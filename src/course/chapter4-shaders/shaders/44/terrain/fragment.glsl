uniform vec3 uColorWaterDeep;
uniform vec3 uColorWaterSurface;
uniform vec3 uColorSand;
uniform vec3 uColorGrass;
uniform vec3 uColorSnow;
uniform vec3 uColorRock;

varying vec3 vPosition;
varying float vUpDot;

#include ../../includes/simplexNoise2d.glsl

void main()
{
  // Color
  vec3 color = vec3(1.0);

  // water deep: #002b3d
  // water surface: #66a8ff
  // sand: #ffe894
  // grass: #85d534
  // snow: #ffffff
  // rock: #bfbd8d

  // add color layer by layer

  // Water
  float surfaceWaterMix = smoothstep(-1.0, -0.1, vPosition.y); // -1.0 to -0.1
  color = mix(uColorWaterDeep, uColorWaterSurface, surfaceWaterMix);

  // Sand
  float sandMix = step(-0.1, vPosition.y); // -0.1 to 0.0
  color = mix(color, uColorSand, sandMix);

  // Grass
  float grassMix = step(-0.06, vPosition.y); // 0.0 to 0.1
  color = mix(color, uColorGrass, grassMix);

  // Rock
  float rockMix = vUpDot;
  rockMix = 1.0 - step(0.8, rockMix); // make rock only appear on the steep part
  rockMix *= step(-0.06, vPosition.y); // remove the rock below the grass
  color = mix(color, uColorRock, rockMix);

  // Snow
  float snowThreshold = 0.45;
  snowThreshold += simplexNoise2d(vPosition.xz * 15.0) * 0.1; // add slight variation
  float snowMix = step(snowThreshold, vPosition.y); // above 0.45
  color = mix(color, uColorSnow, snowMix);

  // Final color
  csm_DiffuseColor = vec4(color, 1.0);
}
