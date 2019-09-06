'use strict';

module.exports = {
  port: 4000,
  portHttps:4433,
  host: 'call42.com',
  db: 'mongodb://callback-widget-db/staging',
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'combined',
    // Stream defaults to process.stdout
    // Uncomment to enable logging to a log on the file system
    options: {
      stream: 'access.log'
    }
  },
  log4js:{
    appenders: [
      {
        category: 'total',
        type: 'file',
        filename: 'logs/total.log',
        maxLogSize: 20480,
        backups: 10
      },
      { type: 'console' }
    ],
    replaceConsole: true
  },
  app: {
    title: 'Call42 Staging'
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
    clientID: process.env.FACEBOOK_ID || '791753847567380',
    clientSecret: process.env.FACEBOOK_SECRET || '84bc342be564a3974d926010cc97ff4e',
    callbackURL: '/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_KEY || 'mlD9CazxOFiW6ekUEuAq400SH',
    clientSecret: process.env.TWITTER_SECRET || '9W9bZkMqpNGZz1yACKV8jw8LLSyirw2IoILHggL8KUzG39giv5',
    callbackURL: '/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || '159471682168-crh0keo3l7fc0t5ek8qmeod143alcbga.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_SECRET || '4vqLL-5s7MOdn5NBLWFJHRYV',
    callbackURL: '/oauth2callback'
  },
  mailer: {
    from: process.env.MAILER_FROM || 'noreply@call42.com ',
    to: process.env.MAILER_TO || 'contact@call42.com ',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'mailtrap.io',
      host: process.env.MAILER_SERVICE_PROVIDER_HOST || 'mailtrap.io',
      port: process.env.MAILER_SERVICE_PROVIDER_PORT || '2525',
      auth: {
        user: process.env.MAILER_EMAIL_ID || '279615295eb2fe156',
        pass: process.env.MAILER_PASSWORD || 'c11de6eaa93c11'
      }
    }
  },
  payment:{
    liqPay:{
      public_key:'i20944093946',
      private_key:'A71DoWEyatvZcBBqmcazciB8W9kpctyVVitmg6Rf',
      url: 'https://www.liqpay.com/api/checkout',
      sandbox:1
    }
  },
  sms:{
    smscentre:{
      url:'https://smscentre.com/sys/send.php',
      login:'call42',
      password:'smScenteR42call'
    }
  },
  testWidgetHost: 'http://call42.com:4400',
  pawnshopWidgetHost: 'http://lombard.algo-rithm.com',
  digestPeriod: 3 * 60 * 60 //3 hours in sec
};
