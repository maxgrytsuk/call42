var express = require('express');
var router = express.Router();
var config = require('../../config/config');
var mongojs = require('mongojs');
var db = mongojs(config.db, ['widgets']);

var widgetName = process.env.CALLBACK_WIDGET || 'test';

/* GET home page. */
router.get('/', function(req, res) {
  render({title:'MAIN', res:res});
});

router.get('/test', function(req, res) {
  render({title:'TEST', res: res});
});

function render(spec) {
  db.widgets.findOne({name:widgetName}, function(err, widget) {
    if (widget) {
      var widgetServerHost = 'http://' + config.host;
      if (process.env.NODE_ENV !== 'production'){
        widgetServerHost += ':' + config.port;
      }
      spec.res.render('index', {
        title: spec.title,
        widget_server_host: widgetServerHost ,
        widget_id: widget._id
      });
    }
  });
}

module.exports = router;
