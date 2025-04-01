// decide how precise can a float be
// highp: preformance hit and might not work on some devices
// mediump
// lowp: can create bugs by the lack of precision
precision mediump float;

// we cannot use attribute inside fragment like: attribute float aRandom
// we can only send data from vertext to fragment

// varying float vRandom; // get data from vertext

uniform vec3 uColor; // THREE.Color is vec3
uniform sampler2D uTexture; // get flagTexture

varying vec2 vUv;
varying float vElevation;

void main()
{
    // vec4(r,g,b,a), each property goes from 0.0 to 1.0
    // gl_FragColor = vec4(0.5, vRandom, 0.0, 1.0);

    // gl_FragColor = vec4(uColor, 1.0);

    // map the uv coordinates
    vec4 textureColor = texture2D(uTexture, vUv);
    textureColor.rgb *= vElevation * 2.0 + 0.5; // simulate shadows with color variation
    gl_FragColor = textureColor; // use the texture color
}
