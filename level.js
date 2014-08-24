'use strict';
/* global define */

define(['gl-matrix-min', 'mesh', 'shader', 'signalray'], function(M, Mesh, Shader, SignalRay) {
  var colors = {
    water: M.vec3.clone([0.2, 0.2, 0.7]),
    conductive: M.vec3.clone([1, 1, 1]),
    red: M.vec3.clone([1, 0.5, 0.5]),
    blue: M.vec3.clone([0.5, 0.5, 1.0])
  };
  
  return function(gl, levelData) {
    var Column = function(x, y, z, h) {
      this.center = M.vec3.clone([x, y, z]);
      this.size = M.vec3.clone([2, 2, h]);
      this.visited = false;
    };
    
    var columns = [];
    var x, y, c;
    for(y = 0; y < levelData.height; ++y) {
      for(x = 0; x < levelData.width; ++x) {
        c = levelData.at(x, y);
        var column = new Column(x * 4, y * 4, 0, c.height * 2);
        column.height = c.height;
        column.type = c.type;
        column.color = colors[c.type];
        columns.push(column);
      }
    }
    
    function Group() {
      this.columns = [];
      this.state = 'conductive';
      this.connections = [];
      this.setState = function(state) {
        this.state = state;
        var color = colors[state];
        for(var i = 0, l = this.columns.length; i < l; ++i) {
          this.columns[i].color = color;
        }
      };
    }
    
    function markGroup(x, y, group, height) {
      if(x < 0 || x >= levelData.width || y < 0 || y >= levelData.height) {
        return;
      }
      var c = columns[x + y * levelData.width];
      if(c.height !== height || c.type != 'conductive' || c.group !== undefined) {
        return;
      }
      c.group = group;
      group.columns.push(c);
      markGroup(x-1, y, group, height);
      markGroup(x+1, y, group, height);
      markGroup(x, y-1, group, height);
      markGroup(x, y+1, group, height);
    }
    var group;
    for(y = 0; y < levelData.height; ++y) {
      for(x = 0; x < levelData.width; ++x) {
        c = columns[x + y * levelData.width];
        if(c.type === 'conductive' && c.group === undefined) {
          group = new Group();
          markGroup(x, y, group, c.height);
        }
      }
    }
    
    var objects = [];
    for(y = 0; y < levelData.height; ++y) {
      for(x = 0; x < levelData.width; ++x) {
        c = levelData.at(x, y);
        var o = null;
        switch(c.obj) {
          case 'src-red':
            o = { type: 'src', color: 'red' };
            break;
          case 'src-blue':
            o = { type: 'src', color: 'blue' };
            break;
          case 'dst-red':
            o = { type: 'dst', color: 'red' };
            break;
        }
        if(o) {
          c = columns[x + y * levelData.width];
          o.pos = M.vec3.clone([c.center[0], c.center[1], c.center[2] + c.size[2]]);
          objects.push(o);
          if(o.type === 'src') {
            group = columns[x + y * levelData.width].group;
            group.src = o.color;
            group.setState(o.color);
          }
        }
      }
    }
    
    function columnAt(x, y) {
      x = (x + 2) / 4;
      y = (y + 2) / 4;
      if(x < 0 || x >= levelData.width || y < 0 || y >= levelData.height) {
        return null;
      }
      return columns[Math.floor(x) + Math.floor(y) * levelData.width];
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
    
    function clearConnections(group) {
      for(var i = 0, l = group.connections.length; i < l; ++i) {
        clearConnections(group.connections[i]);
      }
      group.connections = [];
      connections = connections.filter(function(c) { return c.to.group !== group; });
      group.setState('conductive');
    }
    
    this.visit = function(x, y) {
      var c = columnAt(x, y);
      if(c && c !== lastColumn) {
        if(lastColumn && c.group && lastColumn.group && lastColumn.group.state !== 'conductive' && c.group.state !== lastColumn.group.state && !c.group.src) {
          clearConnections(c.group);
          connections.push({from: lastColumn, to: c, color: colors[lastColumn.group.state]});
          lastColumn.group.connections.push(c.group);
          c.group.setState(lastColumn.group.state);
        }
        lastColumn = c;
      }
    };

    var stripesTime = 0;
    this.update = function(timeStep) {
      stripesTime = (stripesTime - timeStep * 10) % (2 * Math.PI);
    };
    
    var signalRay = new SignalRay(gl);
    
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
        'uniform vec3 color;',
        'void main() {',
        '  lowp float f = clamp(sin(stripes) + 0.5, 0.0, 1.0);',
        '  gl_FragColor = vec4(color, (1.0 - f) * 0.4);',
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
        gl.uniform3fv(shader.instanceColor, c.color);
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
        gl.uniform3fv(connectionShader.color, conn.color);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 24);
      }
      gl.disable(gl.BLEND);
      gl.enable(gl.CULL_FACE);
      connectionShader.end();
      
      for(i = 0; i < objects.length; ++i) {
        var o = objects[i];
        switch(o.type) {
          case 'src':
            signalRay.render(camera, o.pos, colors[o.color], -stripesTime);
            break;
          case 'dst':
            signalRay.render(camera, o.pos, colors[o.color], stripesTime);
            break;
        }
      }
    };
  };
});