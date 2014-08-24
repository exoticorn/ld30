'use strict';
/* global define */

define(['shader'], function(Shader) {
  return function(gl) {
    var heights = new Float32Array(256);
    function addPoint(index, step, scale) {
      var a = heights[(index - step * 3) & 255];
      var b = heights[(index - step) & 255];
      var c = heights[(index + step) & 255];
      var d = heights[(index + step * 3) & 255];
      heights[index] = (9 * (b + c) - a - d) / 16 + (Math.random() * 2 - 1) * scale;
    }
    var i;
    for(i = 0; i < 256; i += 32) {
      heights[i] = Math.random() * 10;
    }
    for(var step = 16; step > 0; step >>= 1) {
      var scale = Math.pow(step / 16, 1.3) * 5;
      for(var index = step; index < 256; index += step * 2) {
        addPoint(index, step, scale);
      }
    }
    var avg = 0;
    for(i = 0; i < 256; ++i) {
      avg += heights[i];
    }
    avg /= 256;
    for(i = 0; i < 256; ++i) {
      heights[i] -= avg;
    }
    
    var vertexData = new Float32Array(258 * 6 * 2);
    vertexData[2] = 50;
    vertexData[3] = 0.4;
    vertexData[4] = 0.4;
    vertexData[5] = 1.0;
    var m = 258 * 6;
    vertexData[m+2] = -50;
    vertexData[m+3] = 0.0;
    vertexData[m+4] = 0.0;
    vertexData[m+5] = 0.0;
    for(i = 0; i < 257; ++i) {
      var h = heights[i & 255];
      var x = Math.sin(i / 128 * Math.PI) * 50;
      var y = Math.cos(i / 128 * Math.PI) * 50;
      var o = (i + 1) * 6;
      vertexData[o+0] = x;
      vertexData[o+1] = y;
      vertexData[o+2] = h;
      vertexData[o+3] = 0.7;
      vertexData[o+4] = 0.7;
      vertexData[o+5] = 1.0;
      o += m;
      vertexData[o+0] = x;
      vertexData[o+1] = y;
      vertexData[o+2] = h;
      vertexData[o+3] = 0.6;
      vertexData[o+4] = 0.5;
      vertexData[o+5] = 0.4;
    }
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
    
    var shader = new Shader(gl, {
      shared: [
        'varying lowp vec3 vColor;'
      ],
      vertex: [
        'attribute vec3 pos;',
        'attribute vec3 color;',
        'uniform mat4 viewProjection;',
        'uniform vec3 camPos;',
        'void main() {',
        '  gl_Position = viewProjection * vec4(camPos + pos, 1.0);',
        '  vColor = color;',
        '}'
      ],
      fragment: [
        'void main() {',
        '  gl_FragColor = vec4(vColor, 1.0);',
        '}'
      ]
    });
    
    this.render = function(camera) {
      shader.begin();
      gl.depthMask(false);
      gl.disable(gl.CULL_FACE);
      gl.uniformMatrix4fv(shader.viewProjection, false, camera.viewProjection);
      gl.uniform3fv(shader.camPos, camera.position);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.vertexAttribPointer(shader.pos, 3, gl.FLOAT, false, 24, 0);
      gl.vertexAttribPointer(shader.color, 3, gl.FLOAT, false, 24, 12);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 258);
      gl.drawArrays(gl.TRIANGLE_FAN, 258, 258);
      gl.depthMask(true);
      gl.enable(gl.CULL_FACE);
      shader.end();
    };
  };
});