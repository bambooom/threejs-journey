uniform vec3 uColor;

varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl
#include ../includes/pointLight.glsl



void main()
{
    vec3 color = uColor;
    vec3 normal = normalize(vNormal); // to make sure normal length 1
    // calculate the view direction, we need the vector from the cameraPosition to vPosition
    vec3 viewDirection = normalize(vPosition - cameraPosition);

    // Light
    vec3 light = vec3(0.0); // will apply to our scene
    light += ambientLight(
        vec3(1.0), // Light color
        0.03 // Light intensity
    );
    light += directionalLight(
        vec3(0.1, 0.1, 1.0),     // Light color
        1.0,                               // Light intensity
        normal,                           // Normal
        vec3(0.0, 0.0, 3.0),     // Light potision, (0.0, 0.0, 3.0) in front of the object
        viewDirection,                      // view Direction
        20.0                              // Specular power
    );
    // red point light
    light += pointLight(
        vec3(1.0, 0.1, 0.1),     // Light color
        1.0,                               // Light intensity
        normal,                           // Normal
        vec3(0.0, 2.5, 0.0),     // Light potision,
        viewDirection,                      // view Direction
        20.0,                              // Specular power
        vPosition,                       // Position
        0.25                                    // Light decay
    );
    // green point light
    light += pointLight(
        vec3(0.1, 1.0, 0.5),     // Light color
        1.0,                               // Light intensity
        normal,                           // Normal
        vec3(2.0, 2.0, 2.0),     // Light potision,
        viewDirection,                      // view Direction
        20.0,                              // Specular power
        vPosition,                       // Position
        0.25                                    // Light decay
    );

    color *= light; // apply light on color, multiply it

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
