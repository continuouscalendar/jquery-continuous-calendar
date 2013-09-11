requirejs.config({
  paths: {
    'jquery'              : '../lib/jquery-1.9.1.min',
    'jquery.tinyscrollbar': '../../src/main/jquery.tinyscrollbar-1.66/jquery.tinyscrollbar',
    'jasmine'             : '../lib/jasmine',
    'jasmine-html'        : '../lib/jasmine-html',
    'jasmine-jquery'      : '../lib/jasmine-jquery-1.2.0'
  },
  shim : {
    'jasmine'       : {exports: 'jasmine'},
    'jasmine-html'  : ['jasmine'],
    'jasmine-jquery': ['jasmine']
  }
})

require(['matchers', 'jasmine', 'jasmine-html', 'jasmine-jquery'], function(matchers, jasmine) {
  require([
    'jquery.continuousCalendar.spec',
    'DateRange.spec',
    'DateTime.spec',
    'locale.spec',
    'Template.spec'
  ], function() {
    var env = jasmine.getEnv()
    var trivialReporter = new jasmine.TrivialReporter()
    env.specFilter = function(spec) {
      return trivialReporter.specFilter(spec)
    }

    beforeEach(function() { this.addMatchers(matchers) })

    env.addReporter(trivialReporter)
    env.execute()
  })
})

