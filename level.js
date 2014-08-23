'use strict';
/* global define */

define(['gl-matrix-min', 'mesh', 'shader'], function(M, Mesh, Shader) {
  return function(gl) {
    var Column = function(x, y, z, h) {
      this.center = M.vec3.clone([x, y, z]);
      this.size = M.vec3.clone([2, 2, h]);
      this.visited = false;
    };
    
    var SIZE = 12;

    var columns = [];
    var x, y;
    for(y = 0; y < SIZE; ++y) {
      for(x = 0; x < SIZE; ++x) {
        var h1 = Math.floor(Math.random() * 10 + 2);
        var h2 = Math.floor(Math.random() * 10 + 2);
        columns.push(new Column(x * 4, y * 4, (h1 - h2) / 2, (h1 + h2) / 2));
      }
    }
    
    function columnAt(x, y) {
      x = (x + 2) / 4;
      y = (y + 2) / 4;
      if(x < 0 || x >= SIZE || y < 0 || y >= SIZE) {
        return null;
      }
      return columns[Math.floor(x) + Math.floor(y) * SIZE];
    }
    
    this.heightAt = function(x, y) {
      var c = columnAt(x, y);
      return c ? (c.center[2] + c.size[2]) : 0;
    };
    
    this.collide = function(collider) {
      for(var i = 0; i < columns.length; ++i) {
        var c = columns[i];
        collider.collideBox(c.center, c.size);
      }
    };
    
    var connections = [];
    var lastColumn = null;
    
    this.visit = function(x, y) {
      var c = columnAt(x, y);
      if(c) {
        c.visited = true;
        if(c !== lastColumn) {
          if(lastColumn) {
            connections.push({from: lastColumn, to: c});
          }
          lastColumn = c;
        }
      }
    };

    var stripesTime = 0;
    this.update = function(timeStep) {
      stripesTime = (stripesTime - timeStep * 10) % (2 * Math.PI);
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
        'varying lowp vec3 color;',
        'varying mediump vec4 edge;',
      ],
      vertex: [
        'attribute vec3 pos;',
        'attribute vec3 normal;',
        'attribute vec2 uv;',
        'uniform mat4 viewProjection;',
        'uniform vec3 instancePos;',
        'uniform vec3 instanceScale;',
        'uniform vec3 instanceColor;',
        'uniform vec3 lightDir;',
        'void main() {',
        '  vec3 p = pos * instanceScale + instancePos;',
        '  gl_Position = viewProjection * vec4(p, 1.0);',
        '  edge.xy = uv;',
        '  edge.zw = 1.0 - uv;',
        '  color = instanceColor * (0.3 - min(0.0, dot(normal, lightDir)));',
        '}'
      ],
      fragment: [
        'void main() {',
        '  mediump vec2 e = min(edge.xy, edge.zw);',
        '  lowp float f = clamp(min(e.x, e.y) * 20.0, 0.0, 1.0);',
        '  gl_FragColor = vec4(color * f, 1.0);',
        '}'
      ]
    });
    
    vertexData = new Float32Array(12*2*2);
    for(y = 0; y < 12; ++y) {
      for(x = 0; x < 2; ++x) {
        vertexData[y * 4 + x * 2 + 0] = (x * 2 - 1) * 0.2;
        vertexData[y * 4 + x * 2 + 1] = y / 11;
      }
    }
    var connectionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, connectionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
    
    var connectionShader = new Shader(gl, {
      shared: [
        'varying mediump float stripes;'
      ],
      vertex: [
        'attribute vec2 st;',
        'uniform mat4 viewProjection;',
        'uniform vec3 from;',
        'uniform vec3 to;',
        'uniform float time;',
        'void main() {',
        '  float t = st.y;',
        '  float t1 = 1.0 - t;',
        '  float h = from.z * t1 * t1 * t1 + (from.z + 3.0) * 3.0 * t1 * t1 * t +',
        '    to.z * t * t * t + (to.z + 3.0) * 3.0 * t1 * t * t;',
        '  vec3 right = normalize(cross(to - from, vec3(0, 0, 1)));',
        '  vec3 p = from + t * (to - from) + st.x * right;',
        '  p.z = h;',
        '  stripes = t * 32.0 + time;',
        '  gl_Position = viewProjection * vec4(p, 1.0);',
        '}'
      ],
      fragment: [
        'void main() {',
        '  lowp float f = clamp(sin(stripes) + 0.5, 0.0, 1.0);',
        '  gl_FragColor = vec4(0.3 * f + 0.2, 0.2 * f, 0.2 * f, (1.0 - f) * 0.4);',
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
      gl.vertexAttribPointer(shader.uv, 2, gl.FLOAT, false, 32, 24);
      for(var i = 0; i < columns.length; ++i) {
        var c = columns[i];
        gl.uniform3fv(shader.instancePos, c.center);
        gl.uniform3fv(shader.instanceScale, c.size);
        if(c.visited) {
          gl.uniform3f(shader.instanceColor, 0.8, 0.8, 0.3);
        } else {
          gl.uniform3f(shader.instanceColor, 1.0, 1.0, 1.0);
        }
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
      }
      shader.end();
      
      connectionShader.begin();
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.blendEquation(gl.FUNC_ADD);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniformMatrix4fv(connectionShader.viewProjection, false, camera.viewProjection);
      gl.uniform1f(connectionShader.time, stripesTime);
      gl.bindBuffer(gl.ARRAY_BUFFER, connectionBuffer);
      gl.vertexAttribPointer(connectionShader.st, 2, gl.FLOAT, false, 8, 0);
      for(i = 0; i < connections.length; ++i) {
        var conn = connections[i];
        gl.uniform3f(connectionShader.from, conn.from.center[0], conn.from.center[1], conn.from.center[2] + conn.from.size[2]);
        gl.uniform3f(connectionShader.to, conn.to.center[0], conn.to.center[1], conn.to.center[2] + conn.to.size[2]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 24);
      }
      gl.disable(gl.BLEND);
      gl.enable(gl.CULL_FACE);
      connectionShader.end();
    };
  };
});