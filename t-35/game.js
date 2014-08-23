'use strict';
/* global define */

define(['gl-matrix-min', 'sphere', 'camera', 'level', 'player', 'collision'], function(M, Sphere, Camera, Level, Player, collision) {
  return function(gl) {
    var camera = new Camera();

    var sphere = new Sphere(gl);
    var level = new Level(gl);
    var player = new Player(level, collision);
    
    this.update = function(timeStep, input) {
      player.update(timeStep, input, camera);
      camera.update(timeStep, gl.drawingBufferWidth, gl.drawingBufferHeight, level, player);
    };
    
    this.render = function() {
      player.render(camera, sphere);
      level.render(camera);
    };
  };
});