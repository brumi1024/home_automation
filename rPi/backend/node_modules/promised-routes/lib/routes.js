'use strict';

var defaults = require('./defaultOptions'),
    merge    = require('./merge')


module.exports = Routes

function Routes(options) {
  var opts = merge(defaults, options)

  this.json = route(opts, function(res, value) {
    res.json(value)
  })

  this.jsonp = route(opts, function(res, value) {
    res.jsonp(value)
  })

  this.custom = function customRoute(mimeType, fn) {
    var mimeRoute = route(opts, function(res, value) {
      res.set('Content-Type', mimeType)
      res.send(value)
    })
    return mimeRoute(fn)
  }
}


function route(opts, sendFn) {
  return function makePromisedRoute(fn) {
    return function expressCallback(req, res) {
      try {
        var value = fn(req, res)
        _done(_catch(_then(value, handleValue), handleError))
      } catch (error) {
        handleError(error)
      }

      function handleValue(value) {
        sendFn(res, value)
      }

      function handleError(error) {
        opts.errorHandler(res, error)
      }
    }
  }

}

function _then(val, cb) {
  if (val && typeof val.then === 'function') {
    return val.then(cb)
  } else {
    cb(val)
  }
}

function _catch(val, cb) {
  if (val && typeof val.catch === 'function') {
    return val.catch(cb)
  }
}

function _done(val) {
  if (val && typeof val.done === 'function') {
    val.done()
  }
}
