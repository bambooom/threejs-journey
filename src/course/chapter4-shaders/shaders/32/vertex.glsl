varying vec2 vUv;

void main()
{

  // Final position
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

  // varying
  vUv = uv;
}
