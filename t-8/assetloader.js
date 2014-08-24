'use strict';
/* global define */

define(function() {
  return function(gl) {
    this.assets = {};
    var numLoading = 0;
    this.loadTexture = function(url) {
      if(this.assets[url]) {
        return this.assets[url];
      }
      numLoading++;
      var texture = gl.createTexture();
      this.assets[url] = texture;
      var image = new Image();
      image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        numLoading--;
      };
      image.src = url;
      return texture;
    };
    this.isLoading = function() { return numLoading > 0; };
  };
});