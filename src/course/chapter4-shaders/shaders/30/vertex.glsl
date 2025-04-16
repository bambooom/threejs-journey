uniform float uSize;
uniform float uTime;

attribute vec3 aRandomness;
attribute float aScale;

varying vec3 vColor;

void main() {
  /**
  * Position
  */
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // Rotate, Spin
  float angle = atan(modelPosition.x, modelPosition.z);
  // atan stands for arc-tangent: https://thebookofshaders.com/glossary/?search=atan
  float distanceToCenter = length(modelPosition.xz);
  float angleOffset = (1.0 / distanceToCenter) * uTime * 0.3;
  angle += angleOffset;
  modelPosition.x = cos(angle) * distanceToCenter;
  modelPosition.z = sin(angle) * distanceToCenter;

  // fix Randomness
  modelPosition.xyz += aRandomness;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  /**
  * Size
  */
  // make size random change with aScale
  gl_PointSize = uSize * aScale; // the particle will have 2x2 size, you will see 2x2 regardless of distace of the camera

  gl_PointSize *= (1.0 / - viewPosition.z); // mvPosition in threejs is model-view position

  /**
  * Color
  */
  vColor = color; // color is attribute will be prepend, so no need to define it
}
