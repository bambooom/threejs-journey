uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;
uniform vec3 uColorA;
uniform vec3 uColorB;

attribute vec3 aPositionTarget;
attribute float aSize;

varying vec3 vColor;

#include ../includes/simplexNoise3d.glsl

void main()
{
    // Mixed position
    float noiseOrigin = simplexNoise3d(position); // using noise to add delay to some points to make the animation transition more interesting
    float noiseTarget = simplexNoise3d(aPositionTarget); // also noise based on target model
    float noise = mix(noiseOrigin, noiseTarget, uProgress); // mix the two noise on progress
    noise = smoothstep(-1.0, 1.0, noise); // remap it to 0.0 to 1.0, as noise range is -1 to 1

    float duration = 0.4; // how long the transition takes
    float delay = (1.0 - duration) * noise; // random delay, but max is 1.0 - duration
    float end = delay + duration; // the end of the transition
    float progress = smoothstep(delay, end, uProgress); // remap the progress with noise
    // float progress = uProgress;
    vec3 mixedPosition = mix(position, aPositionTarget, progress);


    // Final position
    vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    gl_PointSize = aSize * uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings
    vColor = mix(uColorA, uColorB, noise); // mix colors on noise

}
