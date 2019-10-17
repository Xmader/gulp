'use strict';

var util = require('util');
var Orchestrator = require('orchestrator');
var gutil = require('gulp-util');
var deprecated = require('deprecated');
var vfs = require('vinyl-fs');
var gaze = require('gaze');
var EventEmitter = require('events').EventEmitter;

function watch(glob, opt, fn) {
  var target = new EventEmitter();

  var watcher = gaze(glob, opt, function(err) {
    if (err) {
      throw err;
    }
  });

  watcher.on('all', function(event, filepath) {
    var ev = { type: event, path: filepath };
    target.emit('change', ev);
    if (fn) {
      fn(ev);
    }
  });

  target.end = function() {
    watcher.close();
  };

  return target;
}

function Gulp() {
  Orchestrator.call(this);
}
util.inherits(Gulp, Orchestrator);

Gulp.prototype.task = Gulp.prototype.add;
Gulp.prototype.run = function() {
  // `run()` is deprecated as of 3.5 and will be removed in 4.0
  // Use task dependencies instead

  // Impose our opinion of "default" tasks onto orchestrator
  var tasks = arguments.length ? arguments : ['default'];

  this.start.apply(this, tasks);
};

Gulp.prototype.src = vfs.src;
Gulp.prototype.dest = vfs.dest;
Gulp.prototype.watch = function(glob, opt, fn) {
  if (typeof opt === 'function' || Array.isArray(opt)) {
    fn = opt;
    opt = null;
  }

  // Array of tasks given
  if (Array.isArray(fn)) {
    return watch(glob, opt, function() {
      this.start.apply(this, fn);
    }.bind(this));
  }

  return watch(glob, opt, fn);
};

// Let people use this class from our instance
Gulp.prototype.Gulp = Gulp;

// Deprecations
deprecated.field('gulp.env has been deprecated. ' +
  'Use your own CLI parser instead. ' +
  'We recommend using yargs or minimist.',
  console.warn,
  Gulp.prototype,
  'env',
  gutil.env
);

Gulp.prototype.run = deprecated.method('gulp.run() has been deprecated. ' +
  'Use task dependencies or gulp.watch task triggering instead.',
  console.warn,
  Gulp.prototype.run
);

var inst = new Gulp();
module.exports = inst;
