/*
* Script for generating test data
* Usage:  NODE_ENV=test node test-user-create.js
* */
var mongojs = require('mongojs'),
  crypto = require('crypto'),
  config = require('./../config/config');

var db = mongojs(config.db, ['users', 'widgets']);

var username = 'test',
  password = 'test',
  email = 'test@algo-rithm.com';

var run = function() {
  //see user.server.model
  var salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64').toString();
  var passwordHashed = crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  var user = {
    username:username,
    password:passwordHashed,
    salt:salt,
    email: email,
    provider: 'local',
    roles : [ "user" ],
    created: new Date()
  };
  db.users.remove({name:username});
  db.users.insert(user, function() {
    console.log('user created');
  });

  var testWidgetData = {
    "name" : "test-user-widget",
    "channels" : [
      "5567057ac380afbd2820b3b3",
      "5567057ac380afbd2820b3b5"
    ],
    "public" : {
      "texts" : {
        "dialog_validation_failure" : "Проверьте правильность введенного номера",
        "dialog_thank_you" : "Спасибо за обращение.<br> Мы перезвоним Вам в ближайшее время.",
        "dialog_phone_number_placeholder" : "Введите телефон в международном формате",
        "dialog_on_online" : "Укажите Ваш телефон, мы Вам перезвоним за 1 мин",
        "dialog_on_offline" : "К сожалению, мы не в офисе. <br>Укажите Ваш телефон, мы Вам перезвоним в ближайшее время",
        "dialog_error" : "Извините, что-то пошло не так, обращение не было принято.",
        "dialog_connection_failure" : "К сожалению, не удалось осуществить звонок. Мы перезвоним Вам <br> в ближайшее время.",
        "dialog_connection_check" : "Проверка соединения...",
        "dialog_button_on_connect" : "Соединение",
        "dialog_button" : "Жду звонка",
        "dialog_automatic" : "Хотите, мы перезвоним Вам за 1 минуту  <br> и ответим на все Ваши вопросы?"
      },
      "selectors" : "",
      "activate_page_limit_time" : 10,
      "activate_page_limit" : 3,
      "activate_time" : 90
    },
    "urls" : "http://local.callback.algo-rithm.com:3300",
  };
  db.users.findOne({
    username:username
  }, function(err, user) {
    testWidgetData.user = user._id;
    db.widgets.insert(testWidgetData, function() {
      console.log('widget created')
    });
  });
};
run();