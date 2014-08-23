'use strict';
/* global define */

define(['shader', 'mesh'], function(Shader, Mesh) {
  return function(gl) {
    var UCOUNT = 24;
    var VCOUNT = 12;
    var vertexData = new Float32Array(UCOUNT * VCOUNT * 3);
    var u, v;
    for(u = 0; u < UCOUNT; ++u) {
      for(v = 0; v < VCOUNT; ++v) {
        var o = (u + v * UCOUNT) * 3;
        var z = -Math.cos(v / (VCOUNT - 1) * Math.PI);
        var r = Math.sqrt(1 - z * z);
        var a = u / UCOUNT * 2 * Math.PI;
        vertexData[o+0] = Math.cos(a) * r;
        vertexData[o+1] = Math.sin(a) * r;
        vertexData[o+2] = z;
      }
    }
    var indexData = new Uint16Array(UCOUNT * (VCOUNT - 1) * 6);
    var i = 0;
    for(u = 0; u < UCOUNT; ++u) {
      for(v = 0; v < VCOUNT - 1; ++v) {
        var i1 = u + v * UCOUNT;
        var i2 = (u + 1) % UCOUNT + v * UCOUNT;
        indexData[i++] = i1;
        indexData[i++] = i2;
        indexData[i++] = i1 + UCOUNT;
        indexData[i++] = i2;
        indexData[i++] = i2 + UCOUNT;
        indexData[i++] = i1 + UCOUNT;
      }
    }
    var mesh = new Mesh(gl, vertexData, indexData);
    
    var shader = new Shader(gl, {
      shared: [
        'varying mediump vec3 normal;',
        'varying mediump vec3 toCam;',
      ],
      vertex: [
        'attribute vec3 pos;',
        'uniform mat4 viewProjection;',
        'uniform vec3 camPos;',
        'uniform vec4 posScale;',
        'void main() {',
        '  normal = pos;',
        '  vec3 p = pos * posScale.w + posScale.xzy;',
        '  toCam = normalize(camPos - p);',
        '  gl_Position = viewProjection * vec4(p, 1.0);',
        '}'
      ],
      fragment: [
        'precision mediump float;',
        'uniform vec3 lightDir;',
        'uniform vec3 color;',
        'void main() {',
        '  vec3 n = normalize(normal);',
        '  lowp vec3 c = max(0.0, dot(n, -lightDir)) * color;',
        '  lowp float p = max(0.0, dot(reflect(normalize(toCam), n), lightDir));',
        '  c += pow(p, 4.0) * vec3(0.5, 0.5, 0.3);',
        '  c += color * 0.3;',
        '  gl_FragColor = vec4(c, 1.0);',
        '}'
      ]
    });
    
    this.render = function(camera, pos, scale, color) {
      shader.begin();
      gl.uniformMatrix4fv(shader.viewProjection, false, camera.viewProjection);
      gl.uniform3fv(shader.camPos, camera.position);
      gl.uniform3f(shader.lightDir, 0.577, 0.577, -0.577);
      gl.uniform4f(shader.posScale, pos[0], pos[1], pos[2], scale);
      gl.uniform3fv(shader.color, color);
      mesh.bind();
      gl.vertexAttribPointer(shader.pos, 3, gl.FLOAT, false, 12, 0);
      gl.drawElements(gl.TRIANGLES, UCOUNT * (VCOUNT-1) * 6, gl.UNSIGNED_SHORT, 0);
      shader.end();
    };
  };
});