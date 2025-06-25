// it's the shader that will update the particles pixels by gpgpu technique
// it's here we apply to handle the flow field


void main()
{

    // vec2 uv = gl_FragCoord.xy / resolution.xy;
    // vec4 particle = texture(uParticles, uv); // coordinate
    // gl_FragColor = particle;

    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

}
