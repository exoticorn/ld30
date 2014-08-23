'use strict';
/* global define */

define(['gl-matrix-min', 'sphere'], function(M, Sphere) {
  return function(gl) {
    var projection = M.mat4.create();
    var view = M.mat4.create();
    var viewProjection = M.mat4.create();
    
    var sphere = new Sphere(gl);
    
    this.update = function(timeStep, input) {
      
    };
    
    this.render = function() {
      var screenWidth = gl.drawingBufferWidth;
      var screenHeight = gl.drawingBufferHeight;
      M.mat4.perspective(projection, 40 / 128 * Math.PI, screenWidth / screenHeight, 0.1, 500);

      M.mat4.lookAt(view, [-8, 0, 3], [0, 0, 0], [0, 0, 1]);
      
      M.mat4.mul(viewProjection, projection, view);
      
      sphere.render(viewProjection);
    };
  };
});