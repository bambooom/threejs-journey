vec3 pointLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition, vec3 viewDirection, float specularPower, vec3 position, float lightDecay) {
    // directional of the light now is a point
    vec3 lightDelta = lightPosition - position;
    float lightDistance = length(lightDelta); // length of the vector is just the distance from surface to point light
    vec3 lightDirection = normalize(lightDelta);
    // calculate reflection
    vec3 lightReflection = reflect(-lightDirection, normal); // based on normal, opposite direction

    //We have the face orientation as normal and we have the light direction as lightDirection.
    // - If they are in opposite direction, we want 1
    // - If they are at a 90° angle, we want 0
    // - In between, we want the interpolated value
    // => dot product
    // shading
    float shading = dot(normal, lightDirection);
    // dot product can get negative values, need clamping
    shading = max(0.0, shading); // then the back can also see with ambientLight on together

    // Specular, reflection, dot on light reflection and view direction
    float specular = - dot(lightReflection, viewDirection);
    specular = max(0.0, specular); // also, cannot be negative
    // make it smaller as it's to big
    specular = pow(specular, specularPower);

    // Decay, point light should decay with the distance
    float decay = 1.0 - lightDistance * lightDecay;
    decay = max(0.0, decay);

    return lightColor * lightIntensity * (shading + specular) * decay;
}
