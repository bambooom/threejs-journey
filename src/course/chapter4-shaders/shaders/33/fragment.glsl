varying vec3 vPosition; // 3D position of the fragment, and we have cameraPosition
varying vec3 vNormal;

uniform float uTime;
uniform vec3 uColor;

void main() {

  // Normal
  vec3 normal = normalize(vNormal); // normalize it again to make sure length 1
  // we have builtin gl_FrontFacing boolean variable to know whether it's front
  if (!gl_FrontFacing) {
    normal *= - 1.0; // only invert it for backside
  }

  // Stripes (条纹)
  float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
  // think of modulo as you send a value as the first parameter and when that value reaches the second parameter it goes back to 0.0.
  // -minus uTime make the pattern going up, *0.02 slow it down
  stripes = pow(stripes, 3.0); // sharper stripes

  // Fresnel
  vec3 viewDirection = normalize(vPosition - cameraPosition); // by minus, we get the direction from the camera to the fragment
  //normalize the vector, make it length 1.0
  float fresnel = dot(viewDirection, normal) + 1.0; // dot product, get the angle between two vectors
  // +1 make it range from 0 to 1
  fresnel = pow(fresnel, 2.0); // sharper fresnel, only outside brighter

  // Falloff, fade out the alpha on the edges
  // use same fresnel, but remap it using smoothstep, so that the value is 1.0 near the edge, and drops down smoothly to 0.0 at the very edge
  float falloff = smoothstep(0.8, 0.0, fresnel);

  // Holographic
  float holographic = stripes * fresnel;
  holographic += fresnel * 1.25; // add fresnel on top of it and make it even stronger
  holographic *= falloff; // make edge blur and fading out

  // Final color
  // gl_FragColor = vec4(stripes, stripes, stripes, 1.0);
  // gl_FragColor = vec4(1.0, 1.0, 1.0, stripes); // make it transparent
  gl_FragColor = vec4(uColor, holographic);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
