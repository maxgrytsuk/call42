'use strict';

module.exports = {
  host: 'call42.com',
  port:80,
  portHttps:443,
  db: 'mongodb://callback-widget-db/mean',
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'combined',
    // Stream defaults to process.stdout
    // Uncomment to enable logging to a log on the file system
    options: {
      stream: 'logs/access.log'
    }
  },
  app: {
    title: 'Call42'
  },
  assets: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.min.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
        'public/lib/animate.css/animate.min.css',
        'public/lib/simple-line-icons/css/simple-line-icons.css',
        'public/lib/font-awesome/css/font-awesome.min.css'
      ],
      js: [
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/angular/angular.min.js',
        'public/lib/angular-resource/angular-resource.min.js',
        'public/lib/angular-dynamic-locale/tmhDynamicLocale.min.js',
        'public/lib/angular-animate/angular-animate.min.js',
        'public/lib/angular-cookies/angular-cookies.min.js',
        'public/lib/angular-sanitize/angular-sanitize.min.js',
        'public/lib/angular-translate/angular-translate.min.js',
        'public/lib/angular-translate-loader-url/angular-translate-loader-url.min.js',
        'public/lib/angular-translate-storage-cookie/angular-translate-storage-cookie.min.js',
        'public/lib/angular-translate-storage-local/angular-translate-storage-local.min.js',
        'public/lib/angular-file-saver/dist/angular-file-saver.min.js',
        'public/lib/angular-ui-router/release/angular-ui-router.min.js',
        'public/lib/angular-ui-utils/ui-utils.min.js',
        'public/lib/ng-lodash/build/ng-lodash.min.js',
        'public/lib/ng-csv/build/ng-csv.min.js',
        'public/lib/oclazyload/dist/ocLazyLoad.min.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js'
      ]
    },
    css: 'public/dist/application.min.css',
    js: 'public/dist/application.min.js'
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || '838743372827456',
    clientSecret: process.env.FACEBOOK_SECRET || 'e859f7bb4b1076f1fb27f928e9d5655c',
    callbackURL: '/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_KEY || 'f1mfikZH6cZHUm4brfUzfjXzP',
    clientSecret: process.env.TWITTER_SECRET || 'OZPNAFfoLC4CSP8AmNMIG4EbTNM5O61wyiuetHikjcLLnsHoTc',
    callbackURL: '/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || '970734070069-hb5o0kqqdgdhs6s5jtbodje33phoeb16.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_SECRET || '970A7rniAE86AWBGztGTGJtE',
    callbackURL: '/oauth2callback'
  },
  mailer: {
    from: process.env.MAILER_FROM || 'noreply@call42.com',
    to: process.env.MAILER_TO || 'contact@call42.com, webmaster@call42.com',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'amazonaws',
      host: process.env.MAILER_SERVICE_PROVIDER_HOST || 'email-smtp.us-east-1.amazonaws.com',
      port: process.env.MAILER_SERVICE_PROVIDER_PORT || '25',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'AKIAIYR54ISRQXYHJABQ',
        pass: process.env.MAILER_PASSWORD || 'Aql8DvzqbHu33jnZuP+cc/chmeeLLNDuUxhqSgUvETeo'
      }
    }
  },
  payment:{
    liqPay:{
      public_key:'i20944093946',
      private_key:'A71DoWEyatvZcBBqmcazciB8W9kpctyVVitmg6Rf',
      url: 'https://www.liqpay.com/api/checkout',
      sandbox:0
    }
  },
  sms:{
    smscentre:{
      url:'https://smscentre.com/sys/send.php',
      login:'call42',
      password:'smScenteR42call'
    }
  },
  testWidgetHost: 'http://call42.com:3300',
  call42WidgetHost: 'http://call42.com, http://callback.algo-rithm.com',
  pawnshopWidgetHost: 'http://lombard.algo-rithm.com',
  digestPeriod: 3 * 60 * 60//3 hours in sec
};
