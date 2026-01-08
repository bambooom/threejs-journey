// #define PI 3.1415926535897932384626433832795; // already defined in Three.js

uniform float uSliceStart;
uniform float uSliceArc;

varying vec3 vPosition;

void main()
{
  // float uSliceStart = 1.0;
  // float uSliceArc = 1.5;

  float angle = atan(vPosition.y, vPosition.x);
  angle -= uSliceStart; // rotate base angle
  angle = mod(angle, PI2);

  if (angle > 0.0 && angle < uSliceArc) { // as it's rotated, need to check only 0~Arc
    discard; // not drawn at all
  }

  // if (!gl_FrontFacing) {
  //   csm_FragColor = vec4(0.75, 0.15, 0.3, 1.0); // backside color
      // this will override the whole material color, not a perfect solution
  // }

  float csm_Slice; // activate patchMap
}
