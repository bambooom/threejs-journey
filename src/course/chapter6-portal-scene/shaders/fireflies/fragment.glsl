void main()
{

    // gl_PointCoord is the UV coordinates of the point
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    // make it bright in the center, and fading soon out
    float strength = 0.05 / distanceToCenter - 0.1;
    // adjust the distanceToCenter, so that the value is 1.0 at the center, and drops down quickly and smoothly to 0.0 at the edge

    // gl_FragColor = vec4(1.0, 1.0, 1.0, distanceToCenter); // set the distance as alpha for transparency
    gl_FragColor = vec4(1.0, 1.0, 1.0, strength);
}
