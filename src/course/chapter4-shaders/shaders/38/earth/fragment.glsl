uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(1.0);

    // Sun Orientation
    float sunOrientation = dot(uSunDirection, normal);

    // Day / night color
    float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
    vec3 dayColor = texture(uDayTexture, vUv).rgb;
    vec3 nightColor = texture(uNightTexture, vUv).rgb;
    // we want to mix the night and day color, based on the direction, 1.0 on the side facing the sun and 0.0 on the other side
    color = mix(nightColor, dayColor, dayMix); // mix day and night color

    // Specular Clouds color
    vec2 specularCloudsColor = texture(uSpecularCloudsTexture, vUv).rg;

    // Clouds
    float cloudsMix = smoothstep(0.3, 1.0, specularCloudsColor.g); // use green channel
    cloudsMix *= dayMix; // mix with dayMix, to make clouds less visible on the dark side
    color = mix(color, vec3(1.0), cloudsMix); // mix clouds color with white clouds

    // Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0; // high value on edges, will be apply on atmosphere
    fresnel = pow(fresnel, 2.0); // push the value more on the edges by using pow

    // Atmosphere, more visible on the edges
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(
        uAtmosphereTwilightColor,
        uAtmosphereDayColor,
        atmosphereDayMix
    );
    color = mix(color, atmosphereColor, fresnel * atmosphereDayMix); // multiply the atmosphereDayMix to make it less visible on the dark side
    // color = atmosphereColor;

    // Specular, light reflection
    vec3 refelection = reflect(-uSunDirection, normal);
    float specular = - dot(refelection, viewDirection);
    specular = max(0.0, specular);
    specular = pow(specular, 32.0);
    specular *= specularCloudsColor.r; // to make nly the water areas are now reflecting the sun, make the continents slightly reflective, but the contrast looks nice

    // We want the specular to have the color of atmosphereColor, but only when that specular is on the edges. You guessed it, we need the fresnel.
    vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);
    color += specular * specularColor;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
