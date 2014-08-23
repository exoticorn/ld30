'use strict';
/* global define */

define(['shader', 'mesh'], function(Shader, Mesh) {
  return function(gl) {
    var UCOUNT = 16;
    var VCOUNT = 12;
    var vertexData = new Float32Array(UCOUNT * VCOUNT * 3);
    var u, v;
    for(u = 0; u < UCOUNT; ++u) {
      for(v = 0; v < VCOUNT; ++v) {
        var o = (u + v * UCOUNT) * 3;
        var z = v / (VCOUNT - 1) * 2 - 1;
        var r = Math.sqrt(1 - z * z);
        var a = u / UCOUNT * 2 * Math.PI;
        vertexData[o+1] = Math.cos(a) * r;
        vertexData[o+2] = Math.sin(a) * r;
        vertexData[o+3] = z;
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
      ],
      vertex: [
        'attribute vec3 pos;',
        'uniform mat4 viewProjection;',
        'void main() {',
        '  gl_Position = viewProjection * vec4(pos, 1.0);',
        '}'
      ],
      fragment: [
        'void main() {',
        '  gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);',
        '}'
      ]
    });
    
    this.render = function(viewProjection) {
      shader.begin();
      gl.uniformMatrix4fv(shader.viewProjection, false, viewProjection);
      mesh.bind();
      gl.vertexAttribPointer(shader.pos, 3, gl.FLOAT, false, 12, 0);
      gl.drawElements(gl.TRIANGLES, UCOUNT * (VCOUNT-1) * 6, gl.UNSIGNED_SHORT, 0);
      shader.end();
    };
  };
});