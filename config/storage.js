
/*!
 * `Storage` component.
 */

/**
 * Expose `Storage`.
 */

module.exports = Storage;

/**
 * Initialize a new `Storage`.
 *
 * @param {Express} app express app.
 * @api public
 */

function Storage(app) {
  this.app = app;

  /**
   * Stored data.
   */
  var data = {};

  /**
   * Set storage `key` and `value`.
   *
   * @param {String} key storage key.
   * @param {Object} value stored value.
   * @param {Function} callback function(err, data) called when done.
   * @api public
   */

  this.set = function(key, value, callback) {
    data[key] = {value: value, timestamp: now()};
    return callback(null, true);
  };

  /**
   * Get stored value by `key`.
   *
   * @param {String} key store key.
   * @param {Function} callback function(err, data) to get the value.
   * @api public
   */

  this.get = function(key, callback) {
    this.exists(key, function(err, result){
      if (result === true) {
        return callback(null, data[key].value);
      } else {
        return callback(null, null);
      }
    });
  };

  /**
   * Check whether store contains value for given `key`.
   *
   * @param {String} key store key.
   * @return {Boolean} whether stored value exists.
   * @param {Function} callback function(err, data) to get the value.
   * @api public
   */

  this.exists = function(key, callback) {
    return callback(null, (key in data));
  };

  /**
   * Delete stored value by `key`.
   *
   * @param {String} key storage key.
   * @param {Function} callback function(err, data) called when done.
   * @api public
   */

  this.del = function(key, callback) {
    delete data[key];
    return callback(null, true);
  };

  /**
   * Set stored 'key' hash object `hkey` and `hvalue`.
   *
   * @param {String} key storage key.
   * @param {String} hkey hash object key.
   * @param {Object} hvalue hash object value.
   * @param {Function} callback function(err, data) called when done.
   * @api public
   */

  this.hset = function(key, hkey, hvalue, callback) {
    if (!(key in data)) {
      data[key] = {};
    }
    data[key][hkey] = {value: hvalue, timestamp: now()};
    if (callback) {
        return callback(null, true);                   
    }
  };

  /**
   * Get storage `key` hash object value by 'hkey'.
   *
   * @param {String} key storage key.
   * @param {String} hkey storage key.
   * @param {Function} callback function(err, data) to get the value.
   * @api public
   */

  this.hget = function(key, hkey, callback) {
    this.hexists(key, hkey, function(err, result){
      if (result === true) {
        return callback(null, data[key][hkey].value);
      } else {
        return callback(null, null);
      }
    });
  };

  /**
   * Check whether storage `key` hash object contains value for given `hkey`.
   *
   * @param {String} key storage key.
   * @param {String} hkey storage key.
   * @param {Function} callback function(err, data) to get the value.
   * @api public
   */

  this.hexists = function(key, hkey, callback) {
    return callback(null, (key in data) && (hkey in data[key]));
  };

  /**
   * Delete storage `key` hash object value by `hkey`.
   *
   * @param {String} key storage key.
   * @param {String} hkey hash object key.
   * @param {Function} callback function(err, data) called when done.
   * @api public
   */

  this.hdel = function(key, hkey, callback) {
    delete data[key][hkey];
    return callback(null, true);
  };

  /**
   * Reset storage.
   *
   * @api public
   */

  this.reset = function() {
    data = {};
  };

  /**
   * Return current timestamp.
   *
   * @api private
   */

  function now() {
    return new Date().getTime();
  }

}
