'use strict';

module.exports = {
  port:3000,
  portHttps:3433,
  host: 'local.call42.com',
  //db: 'mongodb://localhost/staging',
  db: 'mongodb://localhost/production',
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    // Stream defaults to process.stdout
    // Uncomment to enable logging to a log on the file system
    options: {
      stream: 'logs/access.log'
    }
  },
  app: {
    title: 'Call42 Development'
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || '1546280745636119',
    clientSecret: process.env.FACEBOOK_SECRET || '787722a05e028234ffd5e2a527a7df68',
    callbackURL: '/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_KEY || 'kQBkyy3cEeMybR2q6zt3dcp0Z',
    clientSecret: process.env.TWITTER_SECRET || 'HmOBHFApogEbjr75Jb3447VQoWv105dFXm1zjLaO6YlqH0mHiX',
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
      login:'call42test',
      password:'smScenteR42call'
    }
  },
  testWidgetHost: 'http://local.call42.com:3300',
  call42WidgetHost: 'http://local.call42.com:3000',
  pawnshopWidgetHost: 'http://local.lombard.algo-rithm.com'
};
