varying vec3 vPosition;

void main()
{
  vPosition = csm_Position.xyz;
  // we need position to tell whether in this area
  // and then use `discard` in fragment shader to not drawn at all
}
