'use strict';

module.exports = function() {
  var objs  = Array.prototype.slice.call(arguments),
      value = {}

  for (var i = 0 ; i < objs.length ; i++) {
    var obj = objs[i] || {}
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        value[key] = obj[key]
      }
    }
  }

  return value
}
