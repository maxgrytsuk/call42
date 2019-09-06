var mongojs = require('mongojs'),
  config = require('../config/config');

var db = mongojs(config.db, ['channels']);

exports.up = function(next){
var dateFrom = {hours:'00', minutes:'00'};
var dateTo = {hours:'24', minutes:'00'};
  db.channels.update(
    {},
    {
      $set:{
        'workTime':[
          {idx:1,day:"mo",available:true, from:dateFrom, to:dateTo},
          {idx:2,day:"tu",available:true, from:dateFrom, to:dateTo},
          {idx:3,day:"we",available:true, from:dateFrom, to:dateTo},
          {idx:4,day:"th",available:true, from:dateFrom, to:dateTo},
          {idx:5,day:"fr",available:true, from:dateFrom, to:dateTo},
          {idx:6,day:"sa",available:true, from:dateFrom, to:dateTo},
          {idx:7,day:"su",available:true, from:dateFrom, to:dateTo}
        ]
      }
    },
    {
      multi: true
    }
    ,function() {
      next();
    })

};

exports.down = function(next){
//no migrate down
  next();
};
