'use strict';
/* global define */

define(function() {
  var levels = [
    {
      map: [
        '76~5~4~~',
        '~~~~~4~~',
        '~~~~2222',
        '~~~~~4~~',
        '~~~11432',
        '~~~11~~~',
        '~1~1~~~~',
        '~1~~~~~~'
      ],
      objs: {
        '1,7': 'src-red',
        '0,0': 'dst-red'
      },
      start: [1, 7]
    }
  ];
  
  return function(index) {
    var data = levels[index];
    this.height = data.map.length;
    this.width = data.map[0].length;
    this.startPos = [data.start[0] * 4, data.start[1] * 4];
    this.at = function(x, y) {
      var c = data.map[y].charAt(x);
      var r = { height: 0 };
      if(c == '~') {
        r.type = 'water';
      } else if(c >= '1' && c <= '9') {
        r.type = 'conductive';
        r.height = parseInt(c);
      }
      r.obj = data.objs[x + ',' + y];
      return r;
    };
  };
});