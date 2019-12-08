'use strict';

var Routes = require('./lib/routes')

module.exports = new Routes()

module.exports.configure = function configure(opts) {
  return new Routes(opts)
}
