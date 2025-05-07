varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // Model normal: we need to apply the model transformation to the normals
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0); // non-homogenous

    // Varying
    vNormal = modelNormal.xyz;
    // need normal for directional light, it's in attributes
    // so need to assign to varying and send to fragment

    vPosition = modelPosition.xyz; // fragment position, send to fragment
}
