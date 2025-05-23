uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl
#include ../includes/pointLight.glsl

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition); // by minus, we get the direction from the camera to the fragment
    vec3 normal = normalize(vNormal);


    //  Base color
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    mixStrength = smoothstep(0.0, 1.0, mixStrength);
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    // Light
    vec3 light = vec3(0.0);

    // Point light
    light += pointLight(
        vec3(1.0),     // white color
        20.0,                               // Light intensity
        normal,                           // Normal
        vec3(0.0, 0.25, 0.0),     // Light potision, slightly up
        viewDirection,                      // view Direction
        30.0,                              // Specular power, 30 small reflection
        vPosition,                       // Position
        0.95                                    // Light decay
    );


    // Directional light
    // light += directionalLight(
    //     vec3(1.0, 1.0, 1.0),     // white color
    //     1.0,                               // Light intensity
    //     normal,                           // Normal
    //     vec3(-1.0, 0.5, 0.0),     // Light potision, slightly up
    //     viewDirection,                      // view Direction
    //     30.0                              // Specular power, 30 small reflection
    // );

    color *= light; // add light

    // FInal color
    gl_FragColor = vec4(color, 1.0);
    // #include <tonemapping_fragment>
    // #include <colorspace_fragment>
}
