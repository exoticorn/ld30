'use strict';
/* global define */

define(['shader', 'mesh'], function(Shader, Mesh) {
  return function(gl) {
    var UCOUNT = 24;
    var VCOUNT = 12;
    var vertexData = new Float32Array((UCOUNT + 1) * VCOUNT * 5);
    var u, v;
    for(u = 0; u < UCOUNT + 1; ++u) {
      for(v = 0; v < VCOUNT; ++v) {
        var o = (u + v * (UCOUNT + 1)) * 5;
        var z = -Math.cos(v / (VCOUNT - 1) * Math.PI);
        var r = Math.sqrt(1 - z * z);
        var a = u / UCOUNT * 2 * Math.PI;
        vertexData[o+0] = Math.cos(a) * r;
        vertexData[o+1] = Math.sin(a) * r;
        vertexData[o+2] = z;
        vertexData[o+3] = u / UCOUNT;
        vertexData[o+4] = 1 - v / (VCOUNT - 1);
      }
    }
    var indexData = new Uint16Array(UCOUNT * (VCOUNT - 1) * 6);
    var i = 0;
    for(u = 0; u < UCOUNT; ++u) {
      for(v = 0; v < VCOUNT - 1; ++v) {
        var i1 = u + v * (UCOUNT + 1);
        var i2 = u + 1 + v * (UCOUNT + 1);
        indexData[i++] = i1;
        indexData[i++] = i2;
        indexData[i++] = i1 + UCOUNT + 1;
        indexData[i++] = i2;
        indexData[i++] = i2 + UCOUNT + 1;
        indexData[i++] = i1 + UCOUNT + 1;
      }
    }
    var mesh = new Mesh(gl, vertexData, indexData);
    
    var shader = new Shader(gl, {
      shared: [
        'varying mediump vec3 normal;',
        'varying mediump vec3 toCam;',
        'varying mediump vec2 vUv;',
      ],
      vertex: [
        'attribute vec3 pos;',
        'attribute vec2 uv;',
        'uniform mat4 viewProjection;',
        'uniform vec3 camPos;',
        'uniform vec4 posScale;',
        'uniform vec2 direction;',
        'void main() {',
        '  vec3 tpos = vec3(direction * -pos.x + vec2(direction.y, -direction.x) * pos.y, pos.z);',
        '  normal = tpos;',
        '  vec3 p = tpos * posScale.w + posScale.xyz;',
        '  toCam = normalize(camPos - p);',
        '  vUv = uv;',
        '  gl_Position = viewProjection * vec4(p, 1.0);',
        '}'
      ],
      fragment: [
        'precision mediump float;',
        'uniform vec3 lightDir;',
        'uniform sampler2D tex;',
        'void main() {',
        '  lowp vec3 color = texture2D(tex, vUv).xyz;',
        '  vec3 n = normalize(normal);',
        '  lowp vec3 c = max(0.0, dot(n, -lightDir)) * color;',
        '  lowp float p = max(0.0, dot(reflect(normalize(toCam), n), lightDir));',
        '  c += pow(p, 4.0) * vec3(0.5, 0.5, 0.3);',
        '  c += color * 0.3;',
        '  gl_FragColor = vec4(c, 1.0);',
        '}'
      ]
    });
    
    this.render = function(camera, pos, scale, texture, direction) {
      shader.begin();
      gl.uniformMatrix4fv(shader.viewProjection, false, camera.viewProjection);
      gl.uniform3fv(shader.camPos, camera.position);
      gl.uniform3fv(shader.lightDir, camera.lightDir);
      gl.uniform4f(shader.posScale, pos[0], pos[1], pos[2], scale);
      gl.uniform2fv(shader.direction, direction);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(shader.tex, 0);
      mesh.bind();
      gl.vertexAttribPointer(shader.pos, 3, gl.FLOAT, false, 20, 0);
      gl.vertexAttribPointer(shader.uv, 2, gl.FLOAT, false, 20, 12);
      gl.drawElements(gl.TRIANGLES, UCOUNT * (VCOUNT-1) * 6, gl.UNSIGNED_SHORT, 0);
      shader.end();
    };
  };
});