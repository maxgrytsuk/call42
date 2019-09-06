var mongojs = require('mongojs'),
  config = require('../config/config');

var db = mongojs(config.db, ['widgets']);

exports.up = function(next){
  db.widgets.update(
    {},
    {
      $set:{
        "public.texts": {
            dialog_peers_active:  'Укажите Ваш телефон, мы перезвоним Вам за 1 минуту.',
            dialog_peers_not_active: 'К сожалению, мы не в офисе. <br>Укажите Ваш телефон, мы Вам перезвоним в ближайшее время',
            dialog_automatic:'Хотите, мы перезвоним Вам за 1 минуту  <br> и ответим на все Ваши вопросы?',
            dialog_after:'Спасибо за обращение.<br> Мы перезвоним Вам в ближайшее время.',
            dialog_asterisk_error:'К сожалению, не удалось осуществить звонок. Мы перезвоним Вам <br> в ближайшее время.',
            dialog_total_error:'Извините, что-то пошло не так, обращение не было принято.',
            number_field:'Введите телефон в международном формате'
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
