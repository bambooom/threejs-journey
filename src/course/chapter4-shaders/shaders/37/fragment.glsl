uniform vec3 uColor;
uniform vec2 uResolution;
uniform float uShadowRepetitions;
uniform vec3 uShadowColor;
uniform float uLightRepetitions;
uniform vec3 uLightColor;

varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl
// #include ../includes/pointLight.glsl

vec3 halftone(
    vec3 color,
    float repetitions,
    vec3 direction,
    float low,
    float high,
    vec3 pointColor,
    vec3 normal
) {
    float intensity = dot(direction, normal); // -1 to +1
    intensity = smoothstep(low, high, intensity); // remap the value from low to high

    vec2 uv = gl_FragCoord.xy / uResolution.y; // need to be in range [0, 1], so need to divide by the reslution
    // only divide by y
    uv *= repetitions;
    uv = mod(uv, 1.0);
    // multiply bu a large number and then using mode, make the pattern lika a grid

    float point = distance(uv, vec2(0.5)); // 0.5 0.5 is the center, distance from the center of the UV cell
    point = 1.0 - step(0.5 * intensity, point); // make it point in the center, and use 1 - it to make it white in center, black in the edge
    // use intensity here to make the point smaller on top, bigger on the bottom

    return mix(color, pointColor, point); // mix the color on point
}


void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = uColor;

    // Lights
    vec3 light = vec3(0.0);
    // ambient light
    light += ambientLight(
        vec3(1.0), // light color
        1.0 // light intensity
    );
    // directional light
    light += directionalLight(
        vec3(1.0, 1.0, 1.0),
        1.0,
        normal,
        vec3(1.0, 1.0, 0.0),
        viewDirection,
        1.0
    );
    color *= light;

    // Halftone
    // float repetitions = 50.0; // 50 cells per col of the browser window
    // vec3 direction = vec3(0.0, -1.0, 0.0); // downward, pattern direction, upper is smaller size of the point, lower will be bigger size
    // float low = -0.8;
    // float high = 1.5;
    // vec3 pointColor = vec3(1.0, 0.0, 0.0);

    // one direction is downward from top to bottom
    color = halftone(color, uShadowRepetitions, vec3(0.0, -1.0, 0.0), -0.8, 1.5, uShadowColor, normal);
    // another direction is some where up right
    color = halftone(color, uLightRepetitions, vec3(1.0, 1.0, 0.0), 0.5, 1.5, uLightColor, normal);

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}

// gl_FragCoord: some kind of UV coordinate covering the whole render
// it's a vec4 where `xy` constitutes the "screen" coordinates and `zw` are used for the depth, we don't care the last two
// it's the coordinates of the pixel
