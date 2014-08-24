'use strict';
/* global define */

define(function() {
  var levels = [
    {
      map: [
        '~~~~~~~',
        '~~~1~2~',
        '~~~~~~~',
        '~AA1~3~',
        '~~~~~~~',
      ],
      objs: {
        '3,1': 'src-red',
        '5,1': 'dst-red',
      },
      start: [1,1]
    },
    {
      map: [
        '~~~~~~~~~',
        '~~~~~4~~~',
        '~~~~~3~~~',
        '~~~111~2~',
        '~~~~~3~~~',
        '~A11~CB2~',
        '~~~~~~~~~',
      ],
      objs: {
        '2,1': 'src-red',
        '7,1': 'dst-red',
        '5,2': 'src-blue',
        '5,5': 'dst-blue'
      },
      start: [1,1]
    },
    {
      map: [
        '~~~~~~~~',
        '~~~3~3~~',
        '~~~3B3~~',
        '~~~~B~~~',
        '~A11B11~',
        '~~~~~~~~',
      ],
      objs: {
        '2,1': 'src-red',
        '3,4': 'dst-red',
        '6,1': 'src-blue',
        '5,4': 'dst-blue'
      },
      start: [1,1]
    },
    {
      map: [
        '~~~~~~~~~',
        '~5D5~~~~~',
        '~54~3CC~~',
        '~~3~2~4~~',
        '~A1~1~~~~',
        '~~~~~~~~~',
      ],
      objs: {
        '2,1': 'src-red',
        '4,3': 'dst-red',
        '6,2': 'src-blue',
        '2,3': 'dst-blue'
      },
      start: [1,1]
    },
    {
      map: [
        '76~5~4~~',
        '~~~~~4~~',
        '~55~2222',
        '~~~~~4~~',
        '~2~11432',
        '~2211~~~',
        '~1~1~~~~',
        '~122~223'
      ],
      objs: {
        '1,0': 'src-red',
        '1,5': 'src-blue',
        '0,7': 'dst-red',
        '7,0': 'dst-blue'
      },
      start: [1, 0]
    },
    {
      map: [
        '~~~~~~~~~~~',
        '~~~~~123~~~',
        '~~6~4~3~33~',
        '~~~~11~~~~~',
        '~~6D1~3~2~~',
        '~3~5~~3~3~~',
        '~~~~~~~~~~~',
        '~C33~33~3~~',
        '~~~~~~~~~~~',
      ],
      objs: {
        '2,1': 'src-red',
        '9,6': 'dst-red',
        '8,1': 'dst-blue',
        '4,6': 'src-blue',
        '1,3': 'src-green',
        '2,6': 'dst-green'
      },
      start: [1,1]
    },
  ];
  
  var f = function(index) {
    var data = levels[index];
    this.height = data.map.length;
    this.width = data.map[0].length;
    this.startPos = [data.start[0] * 4, data.start[1] * 4];
    this.at = function(x, y) {
      var c = data.map[this.height - y - 1].charAt(x);
      var r = { height: 0 };
      if(c == '~') {
        r.type = 'water';
      } else if(c >= '1' && c <= '9') {
        r.type = 'conductive';
        r.height = parseInt(c);
      } else if(c >= 'A' && c <= 'Z') {
        r.type = 'neutral';
        r.height = c.charCodeAt(0) - 64;
      }
      r.obj = data.objs[x + ',' + y];
      return r;
    };
  };
  f.numLevels = levels.length;
  return f;
});