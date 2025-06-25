// it's the shader that will update the particles pixels by gpgpu technique
// it's here we apply to handle the flow field

// uniform sampler2D uParticles  // no need declare, it's already injected in the GPUComputationRenderer

void main()
{
    vec2 uv = gl_FragCoord.xy / resolution.xy; // need classic UV coordinates
    vec4 particle = texture(uParticles, uv); // coordinate

    // Apply the dynamic change with wrapping to keep values in reasonable range
    particle.x += 0.01; // move all particles
    // Output the modified particle data
    gl_FragColor = particle;

}
