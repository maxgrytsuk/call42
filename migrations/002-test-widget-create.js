var mongojs = require('mongojs'),
  config = require('../config/config');

var db = mongojs(config.db, ['users', 'widgets']);

var username = 'algorithm',
  widgetName = 'test';

exports.up = function(next){
  var testWidgetData = {
    name: widgetName,
    url: config.testWidgetHost,
    channels:  {
      asterisk: {
        host: 'voip.algo-rithm.com',
        port: '5038',
        user: 'apiadmin',
        secret: 'Hg6Fbv',
        enabled: true
      },
      email: {
        emails: 'grytsuk@algo-rithm.com, max.grytsuk@gmail.com',
        enabled: true
      }
    },
    activate_time: 90,
    activate_page_count:3,
    selectors: '',
    texts: {
      dialog_subscriber_active:  'Укажите Ваш телефон, мы перезвоним Вам за 1 минуту.',
      dialog_subscriber_not_active:  'К сожалению, мы не в офисе. Укажите Ваш телефон и мы перезвоним Вам в рабочее время.',
      dialog_automatic:'Хотите, мы перезвоним Вам за 1 минуту и ответим на все Ваши вопросы?',
      dialog_after:'Спасибо за обращение, мы перезвоним Вам в ближайшее время.'
    }
  }
  db.users.findOne({
    username:username
  }, function(err, user) {
    testWidgetData.user = user._id;
    db.widgets.insert(testWidgetData, function() {
      next();
    });
  });
};

exports.down = function(next){
  db.widgets.remove({name:widgetName}, function(){
    next();
  });
};
