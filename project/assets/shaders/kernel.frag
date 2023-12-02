#ifdef GL_ES
  precision mediump float;
#endif

varying vec2 vTexCoord;
varying vec3 vNormal;

uniform sampler2D uTexture;
uniform float uKernel[25];
uniform vec2 uStepSize;
uniform float uDistance;

void main() {
  vec2 offset[25];
  vec2 uv = vTexCoord;

  vec4 color = texture2D(uTexture, vTexCoord);

  // Setting the offset for the kernel
  // A B C D E
  // F G H I J
  // K L M N O
  // P Q R S T
  // U V W X Y
  offset[0] = vec2(-2.0 * uStepSize.x, 2.0 * uStepSize.y); // A
  offset[1] = vec2(-1.0 * uStepSize.x, 2.0 * uStepSize.y); // B
  offset[2] = vec2(0.0 * uStepSize.x, 2.0 * uStepSize.y); // C
  offset[3] = vec2(1.0 * uStepSize.x, 2.0 * uStepSize.y); // D
  offset[4] = vec2(2.0 * uStepSize.x, 2.0 * uStepSize.y); // E
  offset[5] = vec2(-2.0 * uStepSize.x, 1.0 * uStepSize.y); // F
  offset[6] = vec2(-1.0 * uStepSize.x, 1.0 * uStepSize.y); // G
  offset[7] = vec2(0.0 * uStepSize.x, 1.0 * uStepSize.y); // H
  offset[8] = vec2(1.0 * uStepSize.x, 1.0 * uStepSize.y); // I
  offset[9] = vec2(2.0 * uStepSize.x, 1.0 * uStepSize.y); // J
  offset[10] = vec2(-2.0 * uStepSize.x, 0.0 * uStepSize.y); // K
  offset[11] = vec2(-1.0 * uStepSize.x, 0.0 * uStepSize.y); // L
  offset[12] = vec2(0.0 * uStepSize.x, 0.0 * uStepSize.y); // M
  offset[13] = vec2(1.0 * uStepSize.x, 0.0 * uStepSize.y); // N
  offset[14] = vec2(2.0 * uStepSize.x, 0.0 * uStepSize.y); // O
  offset[15] = vec2(-2.0 * uStepSize.x, -1.0 * uStepSize.y); // P
  offset[16] = vec2(-1.0 * uStepSize.x, -1.0 * uStepSize.y); // Q
  offset[17] = vec2(0.0 * uStepSize.x, -1.0 * uStepSize.y); // R
  offset[18] = vec2(1.0 * uStepSize.x, -1.0 * uStepSize.y); // S
  offset[19] = vec2(2.0 * uStepSize.x, -1.0 * uStepSize.y); // T
  offset[20] = vec2(-2.0 * uStepSize.x, -2.0 * uStepSize.y); // U
  offset[21] = vec2(-1.0 * uStepSize.x, -2.0 * uStepSize.y); // V
  offset[22] = vec2(0.0 * uStepSize.x, -2.0 * uStepSize.y); // W
  offset[23] = vec2(1.0 * uStepSize.x, -2.0 * uStepSize.y); // X
  offset[24] = vec2(2.0 * uStepSize.x, -2.0 * uStepSize.y); // Y

  vec3 edgeColor = vec3(0.0);
  for (int i = 0; i < 25; i++) {
      edgeColor += texture2D(uTexture, uv + offset[i] * uDistance).rgb * uKernel[i];
  }

  gl_FragColor = vec4(edgeColor.rgb, 1.0);
}