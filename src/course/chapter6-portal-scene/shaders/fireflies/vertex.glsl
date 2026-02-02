uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;

attribute float aScale;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // use sin to move up and down, add scale to make it more random
    modelPosition.y += sin(uTime + modelPosition.x * 100.0) * aScale * 0.2;
    // changing y only

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    gl_PointSize = uSize * uPixelRatio * aScale;
    gl_PointSize *= (1.0 / - viewPosition.z); // using the distance from the camera to the particle to scale the point size

}
