varying vec2 vUv;

void main()
{
    // default purple color plane
    // gl_FragColor = vec4(0.5, 0.0, 1.0, 1.0);

    // pattern 1: gradient color, blue, purple
    // gl_FragColor = vec4(vUv, 1.0, 1.0);

    // patern 2: gradient color but another value 0.0, red, green
    // gl_FragColor = vec4(vUv, 0.0, 1.0);

    // petern 3: monochrome grayscale gradient
    // float strength = vUv.x;
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // pattern 4: monochrome grayscale gradient in y axis
    // float strength = vUv.y;
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // pattern 5: monochrome grayscale gradient in y axis but inverted
    // float strength = 1.0 - vUv.y;
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // pattern 6: monochrome grayscale gradient in y axis but more bright
    // float strength = vUv.y * 10.0; // should be 10.0 not 10
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // pattern 7: 百叶窗，use modulo operation
    // float strength = mod(vUv.y * 10.0, 1.0); // The modulo operation finds the remainder after a division of the first number by the second one.
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // pattern 8: 百叶窗，but no gradient, like 斑马线
    // float strength = mod(vUv.y * 10.0, 1.0);
    // conditions work in GLSL, but not good for performance, avoid using it
    // strength = step(0.5, strength); // step function, If the number value is lower than the edge, we get 0.0. If it's higher than the edge, we get 1.0:
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // pattern 9: 斑马线，但是线条更细
    // float strength = mod(vUv.y * 10.0, 1.0);
    // strength = step(0.8, strength);  // make edge bigger
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // // pattern 10: 竖条纹
    // float strength = mod(vUv.x * 10.0, 1.0);
    // strength = step(0.8, strength);
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // pattern 11: 格子，将前两项叠加
    // float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
    // strength += step(0.8, mod(vUv.y * 10.0, 1.0));
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // pattern 12: 点阵，使用乘法，只能看到相交的部分
    float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
    strength *= step(0.8, mod(vUv.y * 10.0, 1.0));
    gl_FragColor = vec4(vec3(strength), 1.0);
}
