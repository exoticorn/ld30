'use strict';
/* global define */

define(['shader', 'mesh'], function(Shader, Mesh) {
  return function(gl) {
    var STEPSX = 16;
    var STEPSY = 8;
    var vertexData = new Float32Array(STEPSX * STEPSY * 4);
    var x, y, o, a, b, c, d;
    for(y = 0; y < STEPSY; ++y) {
      for(x = 0; x < STEPSX; ++x) {
        o = (x + y * STEPSX) * 4;
        a = x / STEPSX * 2 * Math.PI;
        var r = 2.0 - y / STEPSY * 1.9;
        vertexData[o+0] = Math.cos(a) * r;
        vertexData[o+1] = Math.sin(a) * r;
        vertexData[o+2] = Math.pow(y / (STEPSY-1), 8) * 20;
        vertexData[o+3] = y / (STEPSY - 1);
      }
    }
    var indexData = new Uint16Array(STEPSX * (STEPSY - 1) * 6);
    for(y = 0; y < STEPSY - 1; ++y) {
      for(x = 0; x < STEPSX; ++x) {
        a = x + y * STEPSX;
        b = (x + 1) % STEPSX + y * STEPSX;
        c = a + STEPSX;
        d = b + STEPSX;
        o = (x + y * STEPSX) * 6;
        indexData[o+0] = a;
        indexData[o+1] = b;
        indexData[o+2] = c;
        indexData[o+3] = b;
        indexData[o+4] = d;
        indexData[o+5] = c;
      }
    }
    var mesh = new Mesh(gl, vertexData, indexData);
    
    var shader = new Shader(gl, {
      shared: [
        'varying vec2 vData;'
      ],
      vertex: [
        'attribute vec4 posAlpha;',
        'uniform mat4 viewProjection;',
        'uniform vec3 instancePos;',
        'uniform float time;',
        'void main() {',
        '  vData.x = time + posAlpha.z;',
        '  vData.y = posAlpha.w;',
        '  gl_Position = viewProjection * vec4(posAlpha.xyz + instancePos, 1.0);',
        '}'
      ],
      fragment: [
        'uniform vec3 color;',
        'void main() {',
        '  lowp float a = vData.y * sin(vData.x);',
        '  gl_FragColor = vec4(color, a);',
        '}'
      ]
    });
    
    this.render = function(camera, pos, color, time) {
      shader.begin();
      gl.enable(gl.BLEND);
      gl.depthMask(false);
      gl.blendEquation(gl.FUNC_ADD);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      mesh.bind();
      gl.uniformMatrix4fv(shader.viewProjection, false, camera.viewProjection);
      gl.uniform3fv(shader.instancePos, pos);
      gl.uniform3fv(shader.color, color);
      gl.uniform1f(shader.time, time);
      gl.vertexAttribPointer(shader.posAlpha, 4, gl.FLOAT, false, 16, 0);
      gl.drawElements(gl.TRIANGLES, STEPSX * (STEPSY - 1) * 6, gl.UNSIGNED_SHORT, 0);
      gl.disable(gl.BLEND);
      gl.depthMask(true);
      shader.end();
    };
  };
});