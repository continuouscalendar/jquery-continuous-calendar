requirejs.config({
  paths: {
    'jquery': '../lib/jquery-1.8.0.min',
    'jquery.tinyscrollbar': '../../src/main/jquery.tinyscrollbar-1.66/jquery.tinyscrollbar',
    'jasmine': '../lib/jasmine',
    'jasmine-html': '../lib/jasmine-html',
    'jasmine-jquery': '../lib/jasmine-jquery-1.2.0'
  },
  shim: {
    'jasmine': {exports: 'jasmine'},
    'jasmine-html': ['jasmine'],
    'jasmine-jquery': ['jasmine']
  }
})

require([ 'jasmine','jasmine-html','jasmine-jquery'], function(jasmine) {
  require([
    'jquery.continuousCalendar.spec',
    'DateRange.spec',
    'DateTime.spec'
  ], function() {
    var env = jasmine.getEnv()
    env.addReporter(new jasmine.TrivialReporter())
    env.execute()
  })
})