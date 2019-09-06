var mongojs = require('mongojs'),
  config = require('../config/config');

var db = mongojs(config.db, ['widgets']);

exports.up = function(next){
  db.widgets.update(
    {},
    {
      $unset:{
        activate_time: '',
        activate_page_count:'',
        selectors: '',
        texts: ''
      },
      $set:{
        "public": {
          activate_time: 90,
          activate_page_limit:3,
          activate_page_limit_time: 10,//sec before show auto dialog on visited pages limit reach
          selectors: '',
          texts: {
            dialog_subscriber_active:  'Укажите Ваш телефон, мы перезвоним Вам за 1 минуту.',
            dialog_subscriber_not_active:  'К сожалению, мы не в офисе. Укажите Ваш телефон и мы перезвоним Вам в рабочее время.',
            dialog_automatic:'Хотите, мы перезвоним Вам за 1 минуту и ответим на все Ваши вопросы?',
            dialog_after:'Спасибо за обращение, мы перезвоним Вам в ближайшее время.'
          }
        }
      }
    },
    {
      multi: true
    },
    function() {
      next();
    }
  )
};

exports.down = function(next){
//no migrate down
  next();
};
