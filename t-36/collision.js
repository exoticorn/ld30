'use strict';
/* global define */

define(['gl-matrix-min'], function(M) {
  var sphereCollider = function() {
    this.position = M.vec3.create();
    this.radius = 1;
  };
  sphereCollider.prototype.init = function(position, radius) {
    M.vec3.copy(this.position, position);
    this.radius = radius;
  };
  var tClosestPoint = M.vec3.create();
  var tToCenter = M.vec3.create();
  sphereCollider.prototype.collideBox = function(center, size) {
    M.vec3.sub(tClosestPoint, this.position, center);
    tClosestPoint[0] = Math.max(-size[0], Math.min(size[0], tClosestPoint[0]));
    tClosestPoint[1] = Math.max(-size[1], Math.min(size[1], tClosestPoint[1]));
    tClosestPoint[2] = Math.max(-size[2], Math.min(size[2], tClosestPoint[2]));
    M.vec3.scaleAndAdd(tClosestPoint, center, tClosestPoint, 0.9999);
    M.vec3.sub(tToCenter, this.position, tClosestPoint);
    var d = M.vec3.length(tToCenter);
    var m = (this.radius - d) * 0.5;
    if(m > 0) {
      M.vec3.scaleAndAdd(this.position, this.position, tToCenter, m / d);
      this.radius -= m;
    }
  };
  return {
    sphereCollider: sphereCollider
  };
});