varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  // Position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

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
