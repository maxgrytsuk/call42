'use strict';

module.exports = function(grunt) {
  // Unified Watch Object
  var watchFiles = {
    serverViews: ['app/views/**/*.*'],
    serverJS: ['gruntfile.js', 'server.js', 'config/**/*.js', 'app/**/*.js'],
    clientViews: ['public/modules/**/views/**/*.html'],
    clientJS: ['public/js/*.js', 'public/modules/**/*.js'],
    clientCSS: ['public/modules/**/*.css'],
    mochaTests: ['app/tests/**/*.js']
  };
  //db params for migrate module
  var init = require('./config/init')(),
    config = require('./config/config'),
    dbConnectionParams = config.db.split('/'),
    dbHost = dbConnectionParams[2].trim(),
    dbName = dbConnectionParams[3].trim();
  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    migrate: {
      path: 'migrations/',
      adapter: 'MongoDB',
      initializerPath: '',
      db: {
        host: dbHost,
        database: dbName,
        collection: 'schema_migrations'
      }
    },
    watch: {
      serverViews: {
        files: watchFiles.serverViews,
        options: {
          livereload: true
        }
      },
      serverJS: {
        files: watchFiles.serverJS,
        //tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      clientViews: {
        files: watchFiles.clientViews,
        options: {
          livereload: true
        }
      },
      clientJS: {
        files: watchFiles.clientJS,
        //tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      clientCSS: {
        files: watchFiles.clientCSS,
        tasks: ['csslint'],
        options: {
          livereload: true
        }
      }
    },
    jshint: {
      all: {
        src: watchFiles.clientJS.concat(watchFiles.serverJS),
        options: {
          jshintrc: true
        }
      }
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      all: {
        src: watchFiles.clientCSS
      }
    },
    uglify: {
      production: {
        options: {
          mangle: false
        },
        files: {
          'public/dist/application.min.js': 'public/dist/application.js'
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'public/dist/application.min.css': '<%= applicationCSSFiles %>'
        }
      }
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          nodeArgs: ['--debug'],
          ext: 'js,html',
          ignore: ['node_modules/**'],
          watch: watchFiles.serverViews.concat(watchFiles.serverJS)
        }
      }
    },
    'node-inspector': {
      custom: {
        options: {
          'web-port': 1337,
          'web-host': 'localhost',
          'debug-port': 5858,
          'save-live-edit': true,
          'no-preload': true,
          'stack-trace-limit': 50,
          'hidden': []
        }
      }
    },
    ngAnnotate: {
      production: {
        files: {
          'public/dist/application.js': '<%= applicationJavaScriptFiles %>'
        }
      }
    },
    concurrent: {
      default: ['nodemon', 'watch'],
      debug: ['nodemon', 'watch', 'node-inspector'],
      options: {
        logConcurrentOutput: true,
        limit: 10
      }
    },
    teamcity: {
      options: {
        suppressGruntLog: true,
        status: {
          warning: 'WARNING',
          failure: 'FAILURE',
          error: 'ERROR'
        }
      }
    },
    env: {
      test: {
        NODE_ENV: 'test'
      },
      secure: {
        NODE_ENV: 'secure'
      },
      long_traces: {
        Q_DEBUG: '1'
      },
      virtualDisplayNumber:{
        DISPLAY:':99'
      }
    },
    mochaTest: {
      src: watchFiles.mochaTests,
      options: {
        reporter: 'tap'
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    protractor: {
      options: {
        configFile: 'e2e.conf.js' // Target-specific config file
      },
      all:{}
    }
  });

  // Load NPM tasks
  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('migrate-database');

  grunt.loadNpmTasks('grunt-protractor-runner');

  grunt.loadNpmTasks('grunt-node-inspector');

  grunt.loadNpmTasks('grunt-teamcity');

  // Making grunt default to force in order not to break the project.
  grunt.option('force', true);

  // A Task for loading the configuration object
  grunt.task.registerTask('loadConfig', 'Task that loads the config into a grunt option.', function() {
    var init = require('./config/init')();
    var config = require('./config/config');

    grunt.config.set('applicationJavaScriptFiles', config.assets.js);
    grunt.config.set('applicationCSSFiles', config.assets.css);
  });

  grunt.registerTask('dropDb', 'Task that drops db.', function() {
    var mongojs = require('mongojs'),
      config = require('./config/config');

    var done = this.async();
    var db = mongojs(config.db);
    db.dropDatabase(function(err) {
      if (err) {
        grunt.log.writeln('Error:' + err);
      } else {
        grunt.log.writeln('Success');
      }
      done();
    });

  });

  grunt.registerTask('sendEmailDigest', 'Task that sends email digests.', function() {
    var config = require('./config/config'),
      path = require('path');
    // Globbing model files
    config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
      require(path.resolve(modelPath));
    });

    var mongoose = require('mongoose'),
      Q = require('q'),
      done = this.async(),
      digestService = require('./app/services/digest.server.service');

    Q.ninvoke(mongoose, 'connect', config.db)
      .then(function() {
        return digestService.process();
      })
      .then(function(){
        grunt.log.writeln('Success');
      })
      .fail(function(err) {
        grunt.log.writeln('Error:' + err);
      })
      .fin(function () {
        done();
      })
      .done();
  });

  grunt.registerTask('updateRates', 'Task that updates currency rates.', function() {
    var config = require('./config/config'),
      path = require('path');
    // Globbing model files
    config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
      require(path.resolve(modelPath));
    });

    var mongoose = require('mongoose'),
      Q = require('q'),
      done = this.async(),
      currencyService = require('./app/services/currency.server.service');

    Q.ninvoke(mongoose, 'connect', config.db)
      .then(function() {
        return currencyService.updateRates();
      })
      .then(function(){
        grunt.log.writeln('Success');
      })
      .fail(function(err) {
        grunt.log.writeln('Error:' + err);
      })
      .fin(function () {
        done();
      })
      .done();
  });

  grunt.registerTask('runNodeJS', 'Task that runs nodejs server', function() {
    require('./server');
  });

  grunt.registerTask('installWebDriver', 'Task that installs web driver for e2e tests', function() {
    runCmd('node', ['./node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager', 'update']);
  });

  grunt.registerTask('runVirtualDisplay', 'Task that runs virtual display for e2e tests', function() {
    runCmd('Xvfb', ['-ac', '-once', ':99']);
  });

  //we need to have fonts both in core module folder and in folder in one level with dist folder
  //for development and for production environment respectively
  grunt.registerTask('copyFonts', 'Task that copies font directory from core module', function() {
    runCmd('cp', ['-R', 'public/modules/core/fonts/', 'public/']);
  });

  // Default task(s).
  grunt.registerTask('default', ['concurrent:default']);
//  grunt.registerTask('default', ['lint', 'concurrent:default']);

  // Debug task.
  grunt.registerTask('debug', ['env:long_traces', 'concurrent:debug']);

  // Secure task(s).
  grunt.registerTask('secure', ['env:secure', 'lint', 'concurrent:default']);

  // Lint task(s).
  grunt.registerTask('lint', ['jshint', 'csslint']);

  // Build task(s).
  grunt.registerTask('build', ['lint', 'loadConfig', 'ngAnnotate', 'uglify', 'cssmin', 'copyFonts']);

  //run e2e tests
  grunt.registerTask('e2e', ['teamcity', 'migrate:up', 'installWebDriver', 'env:virtualDisplayNumber', 'runVirtualDisplay', 'runNodeJS', 'protractor']);

  // Test task.
  grunt.registerTask('test', ['teamcity', 'env:test', 'mochaTest', 'karma:unit', 'e2e']);
};

var runCmd = function(cmd, args) {
  var spawn = require('child-process-promise').spawn;
  spawn(cmd, args, { capture: [ 'stdout', 'stderr' ]})
    .then(function (result) {
      console.log('[spawn] stdout: ', result.stdout.toString());
    })
    .fail(function (err) {
      console.error('[spawn] stderr: ', err.stderr);
    })
    .done();
};
