varying vec2 vUv;

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

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
    // float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
    // strength *= step(0.8, mod(vUv.y * 10.0, 1.0));
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // pattern 13: - - - - - - - like Morse code，prev changed the x axis width
    // float strength = step(0.4, mod(vUv.x * 10.0, 1.0));
    // strength *= step(0.8, mod(vUv.y * 10.0, 1.0));
    // gl_FragColor = vec4(vec3(strength), 1.0);

    // pattern 14: ┓ ┓ ┓ ┓ ┓ ┓ (combine barX and barY)
    // float barX = step(0.4, mod(vUv.x * 10.0, 1.0));
    // barX *= step(0.8, mod(vUv.y * 10.0, 1.0));
    // float barY = step(0.8, mod(vUv.x * 10.0, 1.0));
    // barY *= step(0.4, mod(vUv.y * 10.0, 1.0));
    // float strength = barX + barY;

    // pattern 15: ╋ ╋ ╋ ╋ ╋ ╋ ┫?
    // float barX = step(0.4, mod(vUv.x * 10.0, 1.0));
    // barX *= step(0.8, mod(vUv.y * 10.0 + 0.2, 1.0));
    // float barY = step(0.8, mod(vUv.x * 10.0 + 0.2, 1.0));
    // barY *= step(0.4, mod(vUv.y * 10.0, 1.0));
    // float strength = barX + barY;

    // pattern 16: gradient, but both bright on the left and right, dark in the middle, use absolute value
    // float strength = abs(vUv.x - 0.5);

    // pattern 17: gradient, 4 angles bright, + dark
    // float strength = min(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

    // pattern 18: perspective gradient, edges of the square are brighter, rendered in light gray.
    // float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

    // pattern 19: “回” 字形 frame, use step on previous pattern
    // float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));

    // pattern 20: “回” 字形 frame, but slim edge
    // float square1 = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
    // float square2 = 1.0 - step(0.25, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5))); // 1- xxx make it opposite square
    // float strength = square1 * square2; // multiply two squares to get the frame

    // pattern 21: grayscale palette like a color palette bars
    // float strength = floor(vUv.x * 10.0) / 10.0; // to 0.0, 0.1, 0.2, ..., 1.0, 10 bars with stepped color variation

    // pattern 22: like prev but combine with y axis, grid
    // float strength = floor(vUv.x * 10.0) / 10.0;
    // strength *= floor(vUv.y * 10.0) / 10.0;

    // pattern 23: like old TV dizzy screen
    // float strength = random(vUv); // random function, but not good for performance

    // pattern 24: random big pixels, like minecraft
    // vec2 gridUv = vec2(
    //     floor(vUv.x * 10.0) / 10.0,
    //     floor(vUv.y * 10.0) / 10.0
    // );
    // float strength = random(gridUv); // not true random, but pseudo random

    // pattern 25: previous pattern but with some offset skew like
    // vec2 gridUv = vec2(
    //     floor(vUv.x * 10.0) / 10.0,
    //     floor(vUv.y * 10.0 + vUv.x * 5.0) / 10.0
    // );
    // float strength = random(gridUv);

    // pattern 26: gradient, but dark on only one angle, left bottom
    // float strength = length(vUv);

    // pattern 27: dark circle on the center
    // one way to use offset
    // float strength = length(vUv - 0.5);

    // another way to use distance
    // float strength = distance(vUv, vec2(0.2, 0.5)); // distance function, distance between two points, later point's position is just (0.2,0.5) which will be the dark circle position

    // pattern 28: bright circle on the center
    // float strength = 1.0 - distance(vUv, vec2(0.5));

    // pattern 29: very bright and dence spot light on the center
    // start from very small value
    // float strength = 0.02 / distance(vUv, vec2(0.5));

    // pattern 30: similar to previous one, but the light is like a galaxy ellipse
    vec2 lightUv = vec2(
        vUv.x * 0.1 + 0.45, // stretch the x axis
        vUv.y * 0.5 + 0.25
    );
    float strength = 0.015 / distance(lightUv, vec2(0.5));


    gl_FragColor = vec4(vec3(strength), 1.0);


}
