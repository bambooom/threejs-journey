varying vec3 vPosition;

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

}
