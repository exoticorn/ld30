'use strict';
/* global define */

define(['gl-matrix-min'], function(M) {
  return function() {
    var projection = M.mat4.create();
    this.position = M.vec3.create();
    var view = M.mat4.create();
    this.viewProjection = M.mat4.create();
    
    var t = 0;
    
    this.update = function(timeStep, width, height) {
      t += timeStep;
      this.position[0] = Math.sin(t) * 8;
      this.position[1] = Math.cos(t) * 8;
      this.position[2] = 3;
      
      M.mat4.perspective(projection, 40 / 128 * Math.PI, width / height, 0.1, 500);
      
      M.mat4.lookAt(view, this.position, [0, 0, 0], [0, 0, 1]);
      
      M.mat4.mul(this.viewProjection, projection, view);
    };
  };
});