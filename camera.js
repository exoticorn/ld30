'use strict';
/* global define */

define(['gl-matrix-min'], function(M) {
  return function() {
    var projection = M.mat4.create();
    this.position = M.vec3.create();
    var view = M.mat4.create();
    this.viewProjection = M.mat4.create();
    this.lightDir = M.vec3.clone([0.5, 1, -1.5]);
    M.vec3.normalize(this.lightDir, this.lightDir);
    
    var t = 0;
    
    this.update = function(timeStep, width, height) {
      t += timeStep;
      this.position[0] = Math.sin(t) * 16;
      this.position[1] = Math.cos(t) * 16;
      this.position[2] = 16;
      
      M.mat4.perspective(projection, 40 / 128 * Math.PI, width / height, 0.1, 500);
      
      M.mat4.lookAt(view, this.position, [0, 0, 7], [0, 0, 1]);
      
      M.mat4.mul(this.viewProjection, projection, view);
    };
  };
});