#ifdef GL_ES
  precision mediump float;
#endif

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec3 aNormal;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  vTexCoord = aTexCoord;
  vNormal = aNormal;
}