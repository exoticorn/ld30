'use strict';
/* global require */

require(['game'], function(Game) {
  var ENABLE_MUSIC = true
  
  var screen = document.getElementById('screen');

  function resizeScreen() {
    screen.width = window.innerWidth;
    screen.height = window.innerHeight;
  }

  resizeScreen();
  window.addEventListener('resize', resizeScreen, false);

  var gl = screen.getContext('webgl', {alpha: false}) ||
    screen.getContext('webgl') || screen.getContext('experimental-webgl');
  if(!gl) {
    alert('Failed to create WebGL context.');
  }
  gl.clearColor(0.6, 0.6, 1, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  var game = new Game(gl);
  
  var isPaused = false;
  var isRequesting = false;
  
  if(ENABLE_MUSIC) {
    var musicPlayer = document.createElement('audio');
    musicPlayer.src = 'ld30.ogg';
    musicPlayer.volume = 0.5;
    musicPlayer.loop = true;
    musicPlayer.play();
  }
  
  function requestFrame() {
    if(!isRequesting && !isPaused) {
      isRequesting = true;
      window.requestAnimationFrame(mainLoop);
    }
  }
  
  var input = { left: false, right: false, up: false, down: false };
  
  function onKey(e) {
    var pressed = e.type === 'keydown';
    if(e.keyCode === 80 && pressed) {
      isPaused = !isPaused;
      if(musicPlayer) {
        if(isPaused) {
          musicPlayer.pause();
        } else {
          musicPlayer.play();
        }
      }
      requestFrame();
      e.preventDefault();
    }
    if(e.keyCode === 32) { input.jump = pressed; e.preventDefault(); }
    if(e.keyCode === 37) { input.left = pressed; e.preventDefault(); }
    if(e.keyCode === 39) { input.right = pressed; e.preventDefault(); }
    if(e.keyCode === 38) { input.up = pressed; e.preventDefault(); }
    if(e.keyCode === 40) { input.down = pressed; e.preventDefault(); }
  }
  
  document.addEventListener('keydown', onKey, false);
  document.addEventListener('keyup', onKey, false);

  var lastTime = Date.now();
  function mainLoop() {
    isRequesting = false;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var now = Date.now();
    var timeStep = Math.min(0.2, (now - lastTime) / 1000);
    lastTime = now;
    input.stickX = input.left ? -1 : (input.right ? 1 : 0);
    input.stickY = input.up ? -1 : (input.down ? 1 : 0);
    game.update(timeStep, input);
    game.render();
    requestFrame();
  }
  requestFrame();
});