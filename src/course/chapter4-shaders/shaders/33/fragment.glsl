varying vec3 vPosition;

uniform float uTime;

void main() {

  // Stripes (条纹)
  float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
  // think of modulo as you send a value as the first parameter and when that value reaches the second parameter it goes back to 0.0.
  // -minus uTime make the pattern going up, *0.02 slow it down
  stripes = pow(stripes, 3.0); // sharper stripes

  // Final color
  // gl_FragColor = vec4(stripes, stripes, stripes, 1.0);
  gl_FragColor = vec4(1.0, 1.0, 1.0, stripes); // make it transparent
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
