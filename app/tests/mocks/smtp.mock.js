'use strict';

exports.SmtpMock = this;

/**
 * Initialize a new model.
 * @api public
 */
this.init = function() {
  this.sendMailSuccess = true;
};

this.setSendMailSuccess = function(result) {
  this.sendMailSuccess = result;
};

this.create = function() {
  var o = Object.create(this);
  this.init.apply(o, Array.prototype.slice.call(arguments));
  return o;
};

this.sendMail = function(options, callback) {
  if (this.sendMailSuccess) {
    callback(null, 'test');
  } else {
    callback({response:'error'}, 'test');
  }
};
