uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform sampler2D uDisplacementTexture;

attribute float aIntensity;
attribute float aAngle;

varying vec3 vColor;

void main()
{
    // Displacement
    vec3 newPosition = position;
    float displacementIntensity = texture(uDisplacementTexture, uv).r;
    displacementIntensity = smoothstep(0.1, 0.3, displacementIntensity);
    // make value below 0.1 just to be 0, that value too small problems is canvas precision problem

    vec3 displacement = vec3(
        cos(aAngle),
        sin(aAngle),
        1.0
    ); // direction as displacement, toward camera, multiple the intensity and add to the position
    displacement = normalize(displacement);
    displacement *= displacementIntensity;
    // displacement *= 3.0;
    displacement *= aIntensity;

    newPosition += displacement;


    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Picure
    float pictureIndensity = texture(uPictureTexture, uv).r;

    // Point size
    gl_PointSize = 0.15 * pictureIndensity * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings
    vColor = vec3(pow(pictureIndensity, 2.0)); // send to fragment
}
