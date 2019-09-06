exports.config = {
  keepAlive: true,
  directConnect: true,
  specs: ['public/modules/*/tests/e2e/*.js']
};

//// An example configuration file.
//exports.config = {
//seleniumAddress: 'http://localhost:4444/wd/hub',
//seleniumServerJar:'./node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',
//chromeDriver:'./node_modules/protractor/selenium/',
//  directConnect: true,
//
//  // Capabilities to be passed to the webdriver instance.
//  capabilities: {
//    'browserName': 'chrome'
//  },
//
//  // Spec patterns are relative to the current working directly when
//  // protractor is called.
//  specs: ['example_spec.js'],
//
//  // Options to be passed to Jasmine-node.
//  jasmineNodeOpts: {
//    showColors: true,
//    defaultTimeoutInterval: 30000
//  }
//};
