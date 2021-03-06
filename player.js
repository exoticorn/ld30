'use strict';
/* global define */

define(['gl-matrix-min'], function(M) {
  return function(level, collision, assetLoader, startPos) {
    var SIZE = 0.5;
    this.pos = M.vec3.clone([startPos[0], startPos[1], level.heightAt(startPos[0], startPos[1]) + SIZE]);
    var movement = M.vec3.create();
    this.direction = M.vec2.clone([1, 0]);
    var jumpTimer = 0;
    var collider = new collision.SphereCollider();
    
    var texture = assetLoader.loadTexture('player.png');
    var color = [0.5, 0.5, 0.5];
    
    var doneTimer = 0;
    var isDying = false;
    var isWinning = false;
    this.isDone = function() { return doneTimer > 2.0; };
    this.die = function() { isDying = true; };
    this.win = function() { isWinning = true; };
    
    var up = M.vec3.clone([0, 0, 1]);
    var inputRight = M.vec3.create();
    var inputUp = M.vec3.create();
    var localInput = M.vec3.create();
    this.update = function(timeStep, input, camera) {
      var height;
      if(isWinning || isDying) {
        doneTimer += timeStep;
        height = level.heightAt(this.pos[0], this.pos[1]) + SIZE;
        if(isWinning) {
          var t = (doneTimer % 1);
          this.pos[2] = height + (t - t * t) * 5;
        }
      } else {
        M.vec3.sub(inputUp, this.pos, camera.position);
        M.vec3.cross(inputRight, inputUp, up);
        M.vec3.normalize(inputRight, inputRight);
        M.vec3.cross(inputUp, up, inputRight);
        M.vec3.scale(localInput, inputRight, input.stickX);
        M.vec3.scaleAndAdd(localInput, localInput, inputUp, -input.stickY);
        M.vec2.scale(movement, movement, 1 - timeStep * 4);
        M.vec2.scaleAndAdd(this.direction, this.direction, localInput, timeStep * 10);
        M.vec2.normalize(this.direction, this.direction);
        M.vec3.scaleAndAdd(movement, movement, localInput, timeStep * 30);
        movement[2] -= timeStep * 40;
        M.vec3.scaleAndAdd(this.pos, this.pos, movement, timeStep);
        height = level.heightAt(this.pos[0], this.pos[1]) + SIZE;
        if(height > this.pos[2]) {
          movement[2] = 0;
          var col = level.visit(this.pos[0], this.pos[1]);
          if(col) {
            color = col;
          }
          if(input.jump) {
            movement[2] += 10;
            jumpTimer = 0.3;
          }
          this.pos[2] = height;
        } else if(input.jump && jumpTimer > 0) {
          jumpTimer -= timeStep;
          movement[2] += timeStep * 35;
        } else {
          jumpTimer = 0;
        }
        
        collider.init(this.pos, SIZE);
        level.collide(collider);
        M.vec3.sub(inputUp, collider.position, this.pos);
        if(timeStep > 0) {
          M.vec3.scaleAndAdd(movement, movement, inputUp, 1 / timeStep);
        }
        M.vec3.copy(this.pos, collider.position);
      }
    };
    
    this.render = function(camera, sphere) {
      var scale = isDying ? 1.0 - doneTimer * 0.5 : 1.0;
      sphere.render(camera, this.pos, SIZE * scale, texture, color, this.direction);
    };
  };
});