#define PI 3.1415926535897932384626433832795 // for value never change, no semicolon

varying vec2 vUv;

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
//	Classic Perlin 2D Noise
//	by Stefan Gustavson
vec4 permute(vec4 x)
{
    return mod(((x*34.0)+1.0)*x, 289.0);
}
vec2 fade(vec2 t)
{
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec2 P)
{
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
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
    // intersection will be too bright it's because the strength is higher than 1.0 and the output gets extrapolated
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
    // vec2 lightUv = vec2(
    //     vUv.x * 0.1 + 0.45, // stretch the x axis
    //     vUv.y * 0.5 + 0.25
    // );
    // float strength = 0.015 / distance(lightUv, vec2(0.5));

    // pattern 31: ✦
    // vec2 lightUvX = vec2(vUv.x * 0.1 + 0.45, vUv.y * 0.5 + 0.25);
    // float lightX = 0.015 / distance(lightUvX, vec2(0.5));
    // vec2 lightUvY = vec2(vUv.y * 0.1 + 0.45, vUv.x * 0.5 + 0.25);
    // float lightY = 0.015 / distance(lightUvY, vec2(0.5));
    // float strength = lightX * lightY;

    // pattern 32: rotated ✦
    // float pi = 3.1415926;
    // vec2 rotatedUv = rotate(vUv, PI * 0.25, vec2(0.5));//2nd arg rotate angle, 3rd arg origin point, pivot point
    // // exact angle, 45 degree
    // vec2 lightUvX = vec2(rotatedUv.x * 0.1 + 0.45, rotatedUv.y * 0.5 + 0.25);
    // float lightX = 0.015 / distance(lightUvX, vec2(0.5));
    // vec2 lightUvY = vec2(rotatedUv.y * 0.1 + 0.45, rotatedUv.x * 0.5 + 0.25);
    // float lightY = 0.015 / distance(lightUvY, vec2(0.5));
    // float strength = lightX * lightY;

    // pattern 33: square with circle center
    // float strength = step(0.25, distance(vUv, vec2(0.5))); // first arg bigger, circle bigger

    // pattern 34: square with dark blur donut, brighter in the certer point
    // float strength = abs(distance(vUv, vec2(0.5)) - 0.25);

    // pattern 35: squre with circle line in middle, combine prev
    // float strength = step(0.01, abs(distance(vUv, vec2(0.5)) - 0.25));
    // first arg larger, the circle line stroke will be wider, 0.01 makes it like a line

    // pattern 36: opposite of 35 ◉
    // float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - 0.25));

    // pattern 37: circle like 36 but melting variation
    // vec2 wavedUv = vec2(
    //     vUv.x,
    //     vUv.y + sin(vUv.x * 30.0) * 0.1 // high freq, so 30
    // );
    // float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));

    // pattern 38: like random drawing, variation on both x and y
    // vec2 wavedUv = vec2(
    //     vUv.x + sin(vUv.y * 30.0) * 0.1,
    //     vUv.y + sin(vUv.x * 30.0) * 0.1 // high freq, so 30
    // );
    // float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));

    // pattern 39: A circular, symmetrical pattern of white wavy lines radiates outward from a dark center, resembling sound waves or ripples.
    // vec2 wavedUv = vec2(
    //     vUv.x + sin(vUv.y * 100.0) * 0.1,
    //     vUv.y + sin(vUv.x * 100.0) * 0.1 // high freq, so 30
    // );
    // float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));

    // pattern 40: angle light from one square angle, x axis with angle
    // float angle = atan(vUv.x, vUv.y);
    // float strength = angle;

    // pattern 41: angle light add offset
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // float strength = angle;

    // pattern 42: angle light add offset and with angle from 0.0 to 1.0
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5); // return value -PI to +PI
    // angle /= PI * 2.0; // divide it by 2PI, we get -0.5 to 0.5
    // angle += 0.5; // adjust by 0.5, so we get 0.0 to 1.0
    // float strength = angle;

    // pattern 43: 百叶窗效果，但从中间发散， gradient on angle value
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5); // return value -PI to +PI
    // angle /= PI * 2.0; // divide it by 2PI, we get -0.5 to 0.5
    // angle += 0.5; // adjust by 0.5, so we get 0.0 to 1.0
    // angle = mod(angle * 100.0, 1.0); // 倍数越高，栅栏越多
    // float strength = angle;

    // pattern 44: 类似 ❊
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5); // return value -PI to +PI
    // angle /= PI * 2.0; // divide it by 2PI, we get -0.5 to 0.5
    // angle += 0.5; // adjust by 0.5, so we get 0.0 to 1.0

    // float strength = sin(angle * 100.0); // 倍数越高，栅栏越多

    // pattern 45: ✹ start from circle, altering the radius
    // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // float sinusoid = sin(angle * 100.0);

    // float radius = 0.25 + sinusoid * 0.02;
    // float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - radius));

    // patten 46: 像是水波纹的阴影, called perlin noise
    // The perlin noise is instrumental in recreating nature shapes like clouds, water, fire, terrain elevation but it can also be used to animate the grass or snow moving in the wind.
    // it can also be used to animate the grass or snow moving in the wind
    // many perlin noise algorithm
    // float strength = cnoise(vUv * 10.0);

    // pattern 47: perlin noise with step, more sharp and clear
    // float strength = step(0.0, cnoise(vUv * 10.0));

    // pattern 48: perlin noise with abs opposite, make the light bright
    // float strength = 1.0 - abs(cnoise(vUv * 10.0));

    // pattern 49: perlin noise with sin, make it like biological cell or chips?
    // float strength = sin(cnoise(vUv * 10.0) * 20.0);

    // pattern 50: sharper 49, use step
    float strength = step(0.9, sin(cnoise(vUv * 10.0) * 20.0));

    // gl_FragColor = vec4(vec3(strength), 1.0);

    // clamp the strength, limit it to 0.0 to 1.0
    strength = clamp(strength, 0.0, 1.0); // needed for #11,#14,#15

    /** MIX colors */
    vec3 blackColor = vec3(0.0);
    vec3 uvColor = vec3(vUv, 1.0);
    vec3 mixedolor = mix(blackColor, uvColor, strength); // mix color on strength, so all previous pattern will be colored
    gl_FragColor = vec4(mixedolor, 1.0);

}
