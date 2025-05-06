uniform sampler2D uTexture;
uniform vec3 uColor;

void main() {
  // vec4 textureColor = texture(uTexture, gl_PointCoord);
  float textureAlpha = texture(uTexture, gl_PointCoord).r; // use one channel only

  // gl_PointCoord is just the UV coordivates in the point
  // gl_FragColor = vec4(gl_PointCoord, 1.0, 1.0);

  // gl_FragColor = textureColor;
  gl_FragColor = vec4(uColor, textureAlpha);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
