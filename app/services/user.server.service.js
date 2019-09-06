'use strict';
var config = require('../../config/config'), path = require('path');
config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
  require(path.resolve(modelPath));
});
var Q = require('q'),
  _ = require('lodash'),
  mongoose = require('mongoose'),
  DateHelper = require('../../app/services/dateHelper.server.service'),
  Detector = require('../../app/services/detector.server.service'),
  Widget = mongoose.model('Widget'),
  ChannelSettings = mongoose.model('ChannelSettings'),
  Balance = mongoose.model('Balance'),
  CallbackRequest = mongoose.model('CallbackRequest'),
  Currency = mongoose.model('Currency'),
  User = mongoose.model('User');

var UserService = this;
module.exports = UserService;

UserService.hiddenFields = '-__v -salt -password -providerData.accessToken -providerData.token -providerData.tokenSecret';

UserService.create = function() {
  return Object.create(this);
};

UserService.setUser = function(user) {
  this.user = user;
};

UserService.createUser = function(spec) {
  var self = this, def = Q.defer();
  var user = new User(spec.data);
  self.setCurrency(user, spec.ip)
    .then(function() {
      user.lang = Detector.detectLanguage(spec.ip);
      user.provider = spec.provider;
      user.displayName = user.firstName + ' ' + user.lastName;
      return self.saveUser(user);
    })
    .then(function() {
      return self.populateWith(user, ['currency']);
    })
    .then(function() {
      def.resolve(user);
    })
    .fail(function(err) {
      def.reject(err);
    })
  ;
  return def.promise;
};

UserService.saveUser = function(user) {
  var def = Q.defer();
  user.save(function(err) {
    if (err) {
      def.reject(err);
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;
      def.resolve(user);
    }
  });
  return def.promise;
};

UserService.findUniqueUsername = function(possibleUsername) {
  var def = Q.defer();
  User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
    def.resolve(availableUsername);
  });
  return def.promise;
};

UserService.initUser = function(params) {
  return new User(params);
};

UserService.populateWith = function(user, populateWith) {
  var def = Q.defer();
  user.populate(populateWith, function(err, user) {
    if (err) {
      def.reject(err);
    } else {
      def.resolve(user);
    }
  });
  return def.promise;
};

UserService.updateUser = function(userId, data) {
  var def = Q.defer(),
    userUpdate = Q.nbind(User.update, User),
    userFind = Q.nbind(User.findOne, User);

  userUpdate({_id:userId}, {$set: data})
    .then(function(){
      return userFind({_id:userId});
    })
    .then(function(user) {
      def.resolve(user);
    })
    .fail(function(err) {
      def.reject(err);
    });
  return def.promise;
};

UserService.findOne = function(query) {
  var def = Q.defer();
  User.findOne(query)
    .select(this.hiddenFields)
    .populate('currency')
    .exec(function(err, user){
    if (err) {
      def.reject(err);
    } else {
      def.resolve(user);
    }
  });
  return def.promise;
};

UserService.findUsers = function(admin) {
  var def = Q.defer();
  User.find()
    .select(this.hiddenFields)
    .populate('currency').sort('-created')
    .exec(function(err, users) {
      if (err) {
        def.reject(err);
      } else {
        users = DateHelper.setDatesByTimezone(users, admin.timezone);
        def.resolve(users);
      }
    });
  return def.promise;
};

UserService.deleteUser = function(user) {
  var
    findWidgets = Q.nbind(Widget.find, Widget),
    findBalance = Q.nbind(Balance.find, Balance),
    removeChannelSettings = Q.nbind(ChannelSettings.remove, ChannelSettings),
    removeCallbackRequests = Q.nbind(CallbackRequest.remove, CallbackRequest),
    removeBalance = Q.nbind(Balance.remove, Balance),
    removeUser = Q.nbind(user.remove, user),
    promises = [];

  return findBalance({user:user._id})
    .then(function(data){
      if (!data.length && user.username !== 'admin') {
        return findWidgets({user:user._id})
          .then(function(widgets) {
            _.forEach(widgets, function(widget) {
              promises.push(removeChannelSettings({idWidget:widget._id}));
              promises.push(widget.remove());
            });
            promises.push(removeCallbackRequests({user:user._id}));
            promises.push(removeBalance({user:user._id}));
            promises.push(removeUser());
            return Q.all(promises);
          });
      } else {
        return Q(false);
      }
    });


};

UserService.setCurrency = function(user, ip) {
  var def = Q.defer();
  if (user.currency) {
    def.resolve();
  } else {
    Currency.find().exec(function(err, currencies) {
      if (err) {
        def.reject(err);
      } else {
        var country = Detector.detectCountry(ip);
        var currency = _.find(currencies, function(item) {
          return item.toObject().country === country;
        });
        user.currency = currency && currency._id;
        def.resolve();
      }
    });
  }
  return def.promise;
};