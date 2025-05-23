uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

// make the smoke twist but also move with the wind
// We want the vertices to rotate around the center of the plane and to have that rotation changing according to the elevation
// This means the vertices are going to rotate on an xz plane along the y axis
// add a simple 2D rotation function

// vec2 rotate2D(vec2 value, float angle) {
//   float s = sin(angle);
//   float c = cos(angle);
//   mat2 m = mat2(c, s, -s, c);
//   return m * value;
// }
#include ../includes/rotate2D.glsl // split the shaders into chunks and include it when using

void main()
{
  vec3 newPosition = position;

  // Twist
  float twistPerlin = texture(uPerlinTexture, vec2(0.5, uv.y * 0.2 - uTime * 0.005)).r;
  // pick value from perlin texture at vec2(0.5, uv.y), randomness, at center along y axis
  // uv.y * 0.2, lower the frequency
  // - uTime * 0.005 makes it animate, slowly
  // .r pick only red channel
  float angle = twistPerlin * 10.0;
  newPosition.xz = rotate2D(newPosition.xz, angle);

  // Wind
  // To calculate the strength of the wind, we are going to use the same technique as for the twist by picking a color from the Perlin texture and move the vertices on the x and z axes.
  vec2 windOffset = vec2(
    texture(uPerlinTexture, vec2(0.25, uTime * 0.01)).r - 0.5, // x axis
    texture(uPerlinTexture, vec2(0.75, uTime * 0.01)).r - 0.5 // z axis, 0.75 pick anothe line
  );
  // add -0.5 make the range changes to -0.5 to +0.5
  windOffset *= pow(uv.y, 2.0) * 10.0;
  // increse the wind strength, but using y value makes it 0 at the bottom, 1 at the top
  // using power function to make the strength low at the bottom, and increase slowly at first and then faster when reaching the top of the smoke, smoothing
  newPosition.xz += windOffset;

  // Final position
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(newPosition, 1.0);

  // varying
  vUv = uv;
}

// NOTE: using perlin texture is better performant than using Perlin noise function
