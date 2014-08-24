'use strict';
/* global define */

define(['gl-matrix-min', 'sphere', 'camera', 'level', 'player', 'collision', 'assetloader', 'skybox', 'leveldata'],
    function(M, Sphere, Camera, Level, Player, collision, AssetLoader, Sky, LevelData) {
  return function(gl) {
    var camera = new Camera();
    var assetLoader = new AssetLoader(gl);

    var sphere = new Sphere(gl);
    var levelIndex = 0;
    var levelData = new LevelData(0);
    var level = new Level(gl, levelData);
    var player = new Player(level, collision, assetLoader, levelData.startPos);
    var sky = new Sky(gl);
    
    this.update = function(timeStep, input) {
      if(level.dead || level.finished) {
        if(level.finished) {
          player.win();
        } else {
          player.die();
        }
        if(player.isDone()) {
          if(level.finished) {
            levelIndex = (levelIndex + 1) % LevelData.numLevels;
          }
          levelData = new LevelData(levelIndex);
          level = new Level(gl, levelData);
          player = new Player(level, collision, assetLoader, levelData.startPos);
        }
      }
      player.update(timeStep, input, camera);
      level.update(timeStep);
      camera.update(timeStep, gl.drawingBufferWidth, gl.drawingBufferHeight, level, player);
    };
    
    this.render = function() {
      sky.render(camera);
      if(!assetLoader.isLoading()) {
        player.render(camera, sphere);
      }
      level.render(camera);
    };
  };
});