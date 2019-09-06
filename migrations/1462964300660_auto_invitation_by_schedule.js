var mongojs = require('mongojs'),
  Q = require('q'),
  _ = require('lodash'),
  WidgetService = require('../app/services/widgets.server.service'),
  config = require('../config/config');

var db = mongojs(config.db, ['widgets']);
var dateFrom = {hours:'00', minutes:'00'};
var dateTo = {hours:'24', minutes:'00'};

exports.up = function(next){

  Q.nbind(db.widgets.update, db.widgets)(
    {},
    {
      $set:{
        'public.auto_invitation.mode':WidgetService.autoInvitationMode.bySchedule,
        'public.auto_invitation.workTime': [
          {idx:1,day:'mo',available:true, from:dateFrom, to:dateTo},
          {idx:2,day:'tu',available:true, from:dateFrom, to:dateTo},
          {idx:3,day:'we',available:true, from:dateFrom, to:dateTo},
          {idx:4,day:'th',available:true, from:dateFrom, to:dateTo},
          {idx:5,day:'fr',available:true, from:dateFrom, to:dateTo},
          {idx:6,day:'sa',available:true, from:dateFrom, to:dateTo},
          {idx:7,day:'su',available:true, from:dateFrom, to:dateTo}
        ]
      }
    }, {multi: true}
  )
    .then(function() {
      next();
    });
};

exports.down = function(next){
  Q.nbind(db.widgets.update, db.widgets)(
    {},
    {
      $unset:{
        'public.auto_invitation.mode':'',
        'public.auto_invitation.workTime': ''
      }
    }, {multi: true}
  )
    .then(function() {
      next();
    });
};
