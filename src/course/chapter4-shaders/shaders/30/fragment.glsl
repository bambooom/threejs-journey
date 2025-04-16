varying vec3 vColor;

void main() {
  // gl_PointCoord is just the UV coordivates in the point
  // We cannot send the UV from the vertex shader to the fragment shader
  // Remember that the vertex shader controls each particle position and a square plane facing the camera appears in place of the vertex.

  // can use gl_PointCoord for point's coordinate

  // Disc, make it like circle
  // float strength = distance(gl_PointCoord, vec2(0.5)); // distance between gl_PointCoord and the center (vec2(0.5)).
  // strength = step(0.5, strength); // Apply a step function to get 0.0 if the distance is below 0.5, and 1.0 if the distance is above 0.5.
  // strength = 1.0 - strength; // invert the value
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // Diffuse point pattern, 边缘 blur 的point
  // float strength = distance(gl_PointCoord, vec2(0.5));
  // strength *= 2.0; //  it reaches 1.0 before touching the edge.
  // strength = 1.0 - strength; // invert
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // Light point pattern, make it small, huge concentrate on center, and fade very fast
  float strength = distance(gl_PointCoord, vec2(0.5));
  strength = 1.0 - strength;
  strength = pow(strength, 10.0);

  // gl_FragColor = vec4(vec3(strength), 1.0);

  // Final color, mix with black
  vec3 color = mix(vec3(0.0), vColor, strength);
  gl_FragColor = vec4(color, 1.0);

  // #include <colorspace_fragment>
}
