'use strict';
/* global define */

define(['gl-matrix-min', 'sphere', 'camera', 'level'], function(M, Sphere, Camera, Level) {
  return function(gl) {
    var camera = new Camera();

    var sphere = new Sphere(gl);
    var level = new Level(gl);
    
    this.update = function(timeStep, input) {
      camera.update(timeStep, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };
    
    this.render = function() {
      sphere.render(camera, [0, 0, level.heightAt(0, 0) + 1], 1, [0.7, 0.4, 0.3]);
      sphere.render(camera, [4, 0, level.heightAt(4, 0) + 0.75], 0.75, [0.2, 0.6, 0.3]);
      sphere.render(camera, [0, 4, level.heightAt(0, 4) + 0.75], 0.75, [0.3, 0.4, 0.8]);
      level.render(camera);
    };
  };
});