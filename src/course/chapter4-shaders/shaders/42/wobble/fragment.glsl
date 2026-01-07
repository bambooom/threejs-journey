// varying vec2 vUv;

uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vWobble;

void main()
{
  // DiffuseColor has shading effect
  // csm_DiffuseColor.rgb = vec3(vUv, 1.0);

  // make it stripe like
  // csm_Metalness = step(0.0, sin(vUv.x * 100.0 + 0.5)); // add 0.5 to remove stair effect
  // csm_Roughness = 1.0 - csm_Metalness; // make it rough when it's metal



  // csm_FragColor.rgb = vec3(vWobble);
  // csm_DiffuseColor.rgb = vec3(vWobble);


  // mix colors on wobble
  float colorMix =smoothstep(-1.0, 1.0, vWobble);
  csm_DiffuseColor.rgb = mix(uColorA, uColorB, colorMix);

  // Mirror step
  // csm_Metalness = step(0.25, vWobble);
  // csm_Roughness = 1.0 - csm_Metalness;
  // the above make it like mirror when up, and rough when down

  // Shinny tip
  csm_Roughness = 1.0 - colorMix;
}
