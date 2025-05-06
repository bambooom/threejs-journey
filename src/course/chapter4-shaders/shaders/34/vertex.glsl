uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

attribute float aSize;
attribute float aTimeMultiplier;

// previous using smoothstep function for many cases
// but here we only want the remap part and not the smoothing part
// so create a remap function
// value: you want to remap
// originMin and originMax: the start and end of the original range
// destinationMin and destinationMax: the start and end of the destination range
float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax)
{
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}

/**
 * the animation is composed of 5 different phases:
 * - The particles start to expand fast in every direction
 * - They scale up even faster
 * - They start to fall down slowly
 * - They scale down
 * - They twinkle as they disappear
 */

void main() {
  float progress = uProgress * aTimeMultiplier; // multiply the random value from 1 to 2, to make particles have different lifespan
  vec3 newPosition = position; // posiiton is the attribute, we can't change it

  // Exaploding
  float explodingProgress = remap(progress, 0.0, 0.1, 0.0, 1.0);
  explodingProgress = clamp(explodingProgress, 0.0, 1.0); // limit the value to 0.0 to 1.0
  explodingProgress = 1.0 - pow(1.0 - explodingProgress, 3.0);
  // using power function to the make the animation fast at the beginning and slow down before reching the end of the transition
  // invert the base 1 -, and outside with 1 - with inverted back
  newPosition *= explodingProgress;

  // Falling
  float fallingProgress = remap(progress, 0.1, 1.0, 0.0, 1.0);
  fallingProgress = clamp(fallingProgress, 0.0, 1.0);
  fallingProgress = 1.0 - pow(1.0 - fallingProgress, 3.0);
  newPosition.y -= fallingProgress * 0.2; // apply on y to fall

  // Scaling
  float sizeOpeningPogress = remap(progress, 0.0, 0.125, 0.0, 1.0); // scale up first
  float sizeClosingProgress = remap(progress, 0.125, 1.0, 1.0, 0.0); // then scale down
  float sizeProgress = min(sizeOpeningPogress, sizeClosingProgress);
  sizeProgress = clamp(sizeProgress, 0.0, 1.0);

  // Twinkling
  // : scale up and down quite fast af the fire burning them was fading out uncontrollably
  // want to start twinkle a little after particles start to scale down,
  // but have the effect built up fast enough so that we can see it before the particles is gone
  float twiklingProgress = remap(progress, 0.2, 0.8, 0.0, 1.0);
  twiklingProgress = clamp(twiklingProgress, 0.0, 1.0);
  float sizeTwinkling = sin(progress * 30.0) * 0.5 + 0.5; // make it between 0->1->0->1 and go on
  sizeTwinkling = 1.0 - sizeTwinkling * twiklingProgress;


  // Final position
  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  // Final size
  gl_PointSize = uSize * uResolution.y * aSize * sizeProgress * sizeTwinkling;
  // use the resolution to make sure the size is changing accordingly when viewport height changes
  // use aSize to make it random different size
  gl_PointSize *= 1.0 / -viewPosition.z; // add perspective to the particles


  // FIX issues if the point size is smaller than 1 pixel, mostly on Windows
  // the solution here is if the point is too small, we move it far away, aka hide it from viewport
  if (gl_PointSize < 1.0) {
    gl_Position = vec4(9999.9);
  }

}
