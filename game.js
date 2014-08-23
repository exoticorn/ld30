'use strict';
/* global define */

define(['gl-matrix-min', 'sphere', 'camera', 'level', 'player', 'collision', 'assetloader'],
    function(M, Sphere, Camera, Level, Player, collision, AssetLoader) {
  return function(gl) {
    var camera = new Camera();
    var assetLoader = new AssetLoader(gl);

    var sphere = new Sphere(gl);
    var level = new Level(gl);
    var player = new Player(level, collision, assetLoader);
    
    this.update = function(timeStep, input) {
      player.update(timeStep, input, camera);
      camera.update(timeStep, gl.drawingBufferWidth, gl.drawingBufferHeight, level, player);
    };
    
    this.render = function() {
      if(!assetLoader.isLoading()) {
        player.render(camera, sphere);
      }
      level.render(camera);
    };
  };
});