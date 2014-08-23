'use strict';
/* global define */

define(['gl-matrix-min', 'sphere', 'camera'], function(M, Sphere, Camera) {
  return function(gl) {
    var camera = new Camera();

    var sphere = new Sphere(gl);
    
    this.update = function(timeStep, input) {
      camera.update(timeStep, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };
    
    this.render = function() {
      sphere.render(camera, [0, 0, 0], 1, [0.7, 0.4, 0.3]);
      sphere.render(camera, [2, 0, 0], 0.75, [0.2, 0.6, 0.3]);
      sphere.render(camera, [-2, 0, 0], 0.75, [0.3, 0.4, 0.8]);
    };
  };
});