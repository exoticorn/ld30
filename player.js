'use strict';
/* global define */

define(['gl-matrix-min'], function(M) {
  return function(level, collision) {
    var SIZE = 0.5;
    this.pos = M.vec3.clone([0, 0, level.heightAt(0, 0) + SIZE]);
    var movement = M.vec3.create();
    var collider = new collision.SphereCollider();
    
    var up = M.vec3.clone([0, 0, 1]);
    var inputRight = M.vec3.create();
    var inputUp = M.vec3.create();
    var localInput = M.vec3.create();
    this.update = function(timeStep, input, camera) {
      M.vec3.sub(inputUp, this.pos, camera.position);
      M.vec3.cross(inputRight, inputUp, up);
      M.vec3.normalize(inputRight, inputRight);
      M.vec3.cross(inputUp, up, inputRight);
      M.vec3.scale(localInput, inputRight, input.stickX);
      M.vec3.scaleAndAdd(localInput, localInput, inputUp, -input.stickY);
      M.vec2.scale(movement, movement, 1 - timeStep * 10);
      M.vec3.scaleAndAdd(movement, movement, localInput, timeStep * 70);
      movement[2] -= timeStep * 20;
      M.vec3.scaleAndAdd(this.pos, this.pos, movement, timeStep);
      var height = level.heightAt(this.pos[0], this.pos[1]) + SIZE;
      if(height > this.pos[2]) {
        movement[2] = Math.max(movement[2], input.jump ? 15 : 0);
        this.pos[2] = height;
      }
      
      collider.init(this.pos, SIZE);
      level.collide(collider);
      M.vec3.sub(inputUp, collider.position, this.pos);
      if(timeStep > 0) {
        M.vec3.scaleAndAdd(movement, movement, inputUp, 1 / timeStep);
      }
      M.vec3.copy(this.pos, collider.position);
    };
    
    var color = M.vec3.clone([0.3, 0.8, 0.3]);
    this.render = function(camera, sphere) {
      sphere.render(camera, this.pos, SIZE, color);
    };
  };
});