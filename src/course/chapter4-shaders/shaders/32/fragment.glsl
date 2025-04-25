uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

void main()
{
    // Scale and animate
    vec2 smokeUv= vUv; // can modify, vUv cannot modify
    smokeUv.x *= 0.5;
    smokeUv.y *= 0.3;
    smokeUv.y -= uTime * 0.03; // use minus to make it move up

    // Smoke
    float smoke = texture(uPerlinTexture, smokeUv).r; // only using r channel

    // need to remap the value using smoothstep, to make the value changes more naturally
    // Remap
    smoke = smoothstep(0.4, 1.0, smoke); // smoothstep start 0.4 to 1.
    // smoothstep returns 0 to 1 clamped value

    // Fade edges
    smoke *= smoothstep(0.0, 0.1, vUv.x); // fade the left edges
    smoke *= smoothstep(1.0, 0.9, vUv.x); // fade the right edges
    smoke *= smoothstep(0.0, 0.1, vUv.y); // fade the bottom edges
    smoke *= smoothstep(1.0, 0.4, vUv.y); // fade the top edges, fading area bigger

  // in fragment shader, we need 2D coordinates to display the texture UV coordinates, we need UV
  // we send UV from vertext to fragment

  // Final color, brown
  gl_FragColor = vec4(0.6, 0.3, 0.2, smoke); // set alpha to smoke, need to set transparent

  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

  #include <tonemapping_fragment> // add toneMapping for renderer
  #include <colorspace_fragment>
}
