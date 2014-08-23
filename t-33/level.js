'use strict';
/* global define */

define(['gl-matrix-min', 'mesh', 'shader'], function(M, Mesh, Shader) {
  return function(gl) {
    var Column = function(x, y, z, h) {
      this.center = M.vec3.clone([x, y, z]);
      this.size = M.vec3.clone([2, 2, h]);
    };
    
    var SIZE = 8;

    var columns = [];
    for(var y = 0; y < SIZE; ++y) {
      for(var x = 0; x < SIZE; ++x) {
        var h1 = Math.floor(Math.random() * 10 + 2);
        var h2 = Math.floor(Math.random() * 10 + 2);
        columns.push(new Column(x * 4, y * 4, (h1 - h2) / 2, (h1 + h2) / 2));
      }
    }
    
    this.heightAt = function(x, y) {
      x = (x + 2) / 4;
      y = (y + 2) / 4;
      if(x < 0 || x >= SIZE || y < 0 || y >= SIZE) {
        return 0;
      }
      var c = columns[Math.floor(x) + Math.floor(y) * SIZE];
      return c.center[2] + c.size[2];
    };
    
    this.collide = function(collider) {
      for(var i = 0; i < columns.length; ++i) {
        var c = columns[i];
        collider.collideBox(c.center, c.size);
      }
    };
    
    var vertexData = new Float32Array(6 * 4 * (3+3+2));
    function makeFace(index, normal, u0, v0) {
      var right = M.vec3.create();
      M.vec3.cross(right, (normal[0] + normal[1] === 0) ? [1, 0, 0] : [0, 0, 1], normal);
      M.vec3.normalize(right, right);
      var up = M.vec3.create();
      M.vec3.cross(up, normal, right);
      for(var y = 0; y < 2; ++y) {
        for(var x = 0; x < 2; ++x) {
          var o = (index * 4 + x + y * 2) * (3+3+2);
          var xf = x * 2 - 1;
          var yf = 1 - y * 2;
          for(var i = 0; i < 3; ++i) {
            vertexData[o+i] = normal[i] + right[i] * xf + up[i] * yf;
            vertexData[o+3+i] = normal[i];
          }
          vertexData[o+6] = u0 + x;
          vertexData[o+7] = v0 + y;
        }
      }
    }
    makeFace(0, [1, 0, 0], 0, 0);
    makeFace(1, [0, 1, 0], 0, 0);
    makeFace(2, [-1, 0, 0], 0, 0);
    makeFace(3, [0, -1, 0], 0, 0);
    makeFace(4, [0, 0, 1], 0, 0);
    makeFace(5, [0, 0, -1], 0, 0);
    
    var indexData = new Uint8Array(6 * 6);
    for(var i = 0; i < 6; ++i) {
      indexData[i*6+0] = i*4+0;
      indexData[i*6+1] = i*4+2;
      indexData[i*6+2] = i*4+1;
      indexData[i*6+3] = i*4+1;
      indexData[i*6+4] = i*4+2;
      indexData[i*6+5] = i*4+3;
    }
    
    var mesh = new Mesh(gl, vertexData, indexData);
    
    var shader = new Shader(gl, {
      shared: [
        'varying lowp vec3 color;'
      ],
      vertex: [
        'attribute vec3 pos;',
        'attribute vec3 normal;',
        'attribute vec2 uv;',
        'uniform mat4 viewProjection;',
        'uniform vec3 instancePos;',
        'uniform vec3 instanceScale;',
        'uniform vec3 lightDir;',
        'void main() {',
        '  vec3 p = pos * instanceScale + instancePos;',
        '  gl_Position = viewProjection * vec4(p, 1.0);',
        '  color = vec3(0.3) - min(0.0, dot(normal, lightDir));',
        '}'
      ],
      fragment: [
        'void main() {',
        '  gl_FragColor = vec4(color, 1.0);',
        '}'
      ]
    });
    
    this.render = function(camera) {
      shader.begin();
      gl.uniformMatrix4fv(shader.viewProjection, false, camera.viewProjection);
      gl.uniform3fv(shader.lightDir, camera.lightDir);
      mesh.bind();
      gl.vertexAttribPointer(shader.pos, 3, gl.FLOAT, false, 32, 0);
      gl.vertexAttribPointer(shader.normal, 3, gl.FLOAT, false, 32, 12);
//      gl.vertexAttribPointer(shader.uv, 2, gl.FLOAT, false, 32, 24);
      for(var i = 0; i < columns.length; ++i) {
        var c = columns[i];
        gl.uniform3fv(shader.instancePos, c.center);
        gl.uniform3fv(shader.instanceScale, c.size);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
      }
      shader.end();
    };
  };
});