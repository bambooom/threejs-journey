uniform float uTime;
uniform vec3 uColorStart;
uniform vec3 uColorEnd;

varying vec2 vUv;

#include ../includes/perlinClassic3D.glsl

void main()
{
    // Displace the UV
    vec2 displacedUv = vUv + perlinClassic3D(vec3(vUv *5.0, uTime* 0.1));

    // perllin noise
    float strength = perlinClassic3D(vec3(displacedUv * 5.0, uTime * 0.2));

    // outer glow
    float outerGlow = distance(vUv, vec2(0.5)) * 5.0 - 1.4;
    strength += outerGlow;

    // Apply cool step
    strength += step(-0.2, strength) * 0.7; // mix sharp version

    // Mix colors to final color
    vec3 color = mix(uColorStart, uColorEnd, strength);

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
}
