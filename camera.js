'use strict';
/* global define */

define(['gl-matrix-min'], function(M) {
  return function() {
    var projection = M.mat4.create();
    this.position = M.vec3.clone([1, 2, 3]);
    var view = M.mat4.create();
    this.viewProjection = M.mat4.create();
    this.lightDir = M.vec3.clone([0.5, 1, -1.5]);
    M.vec3.normalize(this.lightDir, this.lightDir);
    
    var fromPlayer = M.vec3.create();
    var up = M.vec3.clone([0, 0, 1]);
    this.update = function(timeStep, width, height, level, player) {
      M.vec3.sub(fromPlayer, this.position, player.pos);
      M.vec2.scaleAndAdd(fromPlayer, fromPlayer, player.direction, timeStep * -5);
      fromPlayer[2] = 2;
      M.vec2.scale(fromPlayer, fromPlayer, 5 / M.vec2.length(fromPlayer));
      M.vec3.add(this.position, player.pos, fromPlayer);

      M.mat4.perspective(projection, 40 / 128 * Math.PI, width / height, 0.1, 500);
      
      M.mat4.lookAt(view, this.position, player.pos, up);
      
      M.mat4.mul(this.viewProjection, projection, view);
    };
  };
});