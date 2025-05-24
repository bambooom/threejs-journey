
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun Orientation
    float sunOrientation = dot(uSunDirection, normal);

    // Fresnel


    // Atmosphere, more visible on the edges
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(
        uAtmosphereTwilightColor,
        uAtmosphereDayColor,
        atmosphereDayMix
    );
    // color = mix(color, atmosphereColor, atmosphereDayMix); // multiply the atmosphereDayMix to make it less visible on the dark side
    color += atmosphereColor;

    // Edge Alpha, make it fading on every edges
    float edgeAlpha = dot(viewDirection, normal);
    edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);
    // Day alpha, 0 on the night side
    float dayAlpha = smoothstep(-0.5, 1.0, sunOrientation);
    float alpha = edgeAlpha * dayAlpha;


    // Final color
    gl_FragColor = vec4(color, alpha); // alpha channel, make the color transparent and fading, like a glow effect
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
