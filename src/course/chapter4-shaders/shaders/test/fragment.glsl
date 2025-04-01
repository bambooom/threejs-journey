// decide how precise can a float be
// highp: preformance hit and might not work on some devices
// mediump
// lowp: can create bugs by the lack of precision
precision mediump float;

// we cannot use attribute inside fragment like: attribute float aRandom
// we can only send data from vertext to fragment

varying float vRandom; // get data from vertext

void main()
{
    // vec4(r,g,b,a), each property goes from 0.0 to 1.0
    gl_FragColor = vec4(0.5, vRandom, 0.0, 1.0);
}
