// it's the shader that will update the particles pixels by gpgpu technique
// it's here we apply to handle the flow field

// uniform sampler2D uParticles  // no need declare, it's already injected in the GPUComputationRenderer

uniform float uTime;
uniform float uDeltaTime;
uniform float uFlowFieldInfluence;
uniform float uFlowFieldStrength;
uniform float uFlowFieldFrequency;
uniform sampler2D uBase;

#include ../../includes/simplexNoise4d.glsl

void main()
{
    float time = uTime * 0.2;

    vec2 uv = gl_FragCoord.xy / resolution.xy; // need classic UV coordinates
    vec4 particle = texture(uParticles, uv); // coordinate
    vec4 base = texture(uBase, uv); // base texture coordinates

    // Dead
    if (particle.a >= 1.0) {
        // particle.a = 0.0; // reset the alpha if too high
        particle.a = mod(particle.a, 1.0); // use mod to make it loop even when it's too high
        particle.xyz = base.xyz; // reset the position to initial
    }
    // alive
    else {
        // Strength
        float strength = simplexNoise4d(vec4(base.xyz * 0.2, time + 1.0));
        float influence = (uFlowFieldInfluence - 0.5) * (-2.0);
        strength = smoothstep(influence, 1.0, strength); // -1 to 1 changes to 0 to 1

        // Flow field
        vec3 flowField = vec3(
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 0.0, time)),
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 1.0, time)),
            simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 2.0, time))
        ); // create each one of 3 axes
        flowField = normalize(flowField); // normalize the vector to make it length 1.0
        particle.xyz += flowField * uDeltaTime * strength * uFlowFieldStrength;

        // Decay, using alpha channel
        particle.a += uDeltaTime * 0.3;
    }

    // Apply the dynamic change with wrapping to keep values in reasonable range
    // particle.x += 0.01; // move all particles
    // Output the modified particle data

    gl_FragColor = particle;

}
