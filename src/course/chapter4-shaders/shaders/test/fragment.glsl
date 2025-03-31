// decide how precise can a float be
// highp: preformance hit and might not work on some devices
// mediump
// lowp: can create bugs by the lack of precision
precision mediump float;

void main()
{
    // vec4(r,g,b,a), each property goes from 0.0 to 1.0
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
