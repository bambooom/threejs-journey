// GLSL: OpenGL Shading Language, close to C language
// tyoed language

// transform the coordinates into the final clip space coordinates
uniform mat4 projectionMatrix;
// apply transformations relative to the camera(position, rotation, field of view, near, far)
uniform mat4 viewMatrix
// apply transformations relative to the Mesh(position, rotation, scale
uniform mat4 modelMatrix;

attribute vec3 position;
attribute vec2 uv; // it's already defined in the attributes of the geometry

varying vec2 vUv;
varying float vElevation;

// attribute float aRandom; // read the attribute we create
// varying float vRandom;

attribute vec2 uFrequency; // read the attribute we set in uniforms
attribute float uTime;

// functions
float loremIpsum() {
    float a = 1.0;
    float b = 2.0;

    return a + b;
}

// main is called automatically
void main()
{
    float a = 1.0;
    float b = 2.0;
    float c = a * b;

    vec2 foo = vec2(1.0, 2.0); // store 2 coordinates x, y
    // foo.x = 1.5;
    // foo.y = 3.0;
    foo *= 2.0; // will get (2.0, 4.0)

    vec3 purpleColor = vec3(0.0);
    purpleColor.r = 0.5; // can use r, g, b (alias)
    purpleColor.b = 1.0;

    // create vec3 from vec2
    vec2 foo2 = vec2(1.0, 2.0);
    vec3 bar = vec3(foo2, 3.0);

    // create vec2 from vec3
    vec3 foo3 = vec3(1.0, 2.0, 3.0);
    vec2 bar2 = foo.xy; // bar2 will be (x,y), order matters

    // vec3, xyzw, rgba
    vec4 foo4 = vec3(1.0, 2.0, 3.0, 4.0);
    float bar = foo4.w; // 4th value. same as foo4.a

    // use function
    float result = loremIpsum();

    // return vec4, in clip space, like a theoretical box with camera
    // each matrix transform the position until we get the final clip space coordinates

    // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    // separate the above one line:
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // modelPosition.z += sin(modelPosition.x * 10.0) * 0.1; // change z accordint to x, we can see a wave
    // modelPosition.z += aRandom * 0.1;

    // vRandom = aRandom; // just assign it to vRandom, and use vRandom in fragment

    // // now we can change uFrequency value in javascript to see changes in the shaders
    // modelPosition.z += sin(modelPosition.x * uFrequency.x + uTime) * 0.1;
    // modelPosition.z += sin(modelPosition.y * uFrequency.y + uTime) * 0.1;
    // // add uTime like offset to make the plane wave like there is wind

    // store the wind elevation
    float elevation = sin(modelPosition.x * uFrequency.x + uTime) * 0.1;
    elevation += sin(modelPosition.y * uFrequency.y + uTime) * 0.1;

    modelPosition.z += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vUv = uv; // assign to varying, send to fragment
    // send the wind elevation to fragment
    vElevation = elevation;
}
