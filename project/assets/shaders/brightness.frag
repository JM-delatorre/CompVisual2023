#ifdef GL_ES
  precision highp float;
#endif

  varying vec2 vTexCoord;

  uniform sampler2D uTexture;
  uniform float uBrightness;
  
  void main() {
    vec2 uv = vTexCoord;

    vec4 color = texture2D(uTexture, vTexCoord);
    gl_FragColor = vec4(color.rgb * uBrightness, 1);
  }