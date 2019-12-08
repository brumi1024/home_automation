'use strict';

module.exports = {

  // error handler for failure promises
  errorHandler: function errorHandler(response, error) {
    response
      .status(500)
      .send(error !== undefined && error !== null ? error.toString() : '')
  }

}
