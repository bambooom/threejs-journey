// varying vec2 vUv;

void main()
{
  // DiffuseColor has shading effect
  // csm_DiffuseColor.rgb = vec3(vUv, 1.0);

  // make it stripe like
  // csm_Metalness = step(0.0, sin(vUv.x * 100.0 + 0.5)); // add 0.5 to remove stair effect
  // csm_Roughness = 1.0 - csm_Metalness; // make it rough when it's metal
}
