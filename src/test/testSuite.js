requirejs.config({
  paths: {
    'chai':        '../../node_modules/chai/chai',
    'chai.jquery': '../../node_modules/chai-jquery/chai-jquery',
    'mocha':       '../../node_modules/mocha/mocha',
    'jquery'     : '../lib/jquery-1.9.1.min'
  },
  shim : {
    'mocha': { exports: 'mocha' }
  }
})

define(function(require) {
  var mocha = require('mocha')
  var chai = require('chai')
  var chaiJquery = require('chai.jquery')
  var matchers = require('./matchers')
//  var webConsoleReporter = require('./vendor/WebConsole')
  var $ = require('jquery')

  mocha.setup({ui: 'bdd', reporter: 'html'})
  chai.use(chaiJquery)
  chai.use(matchers)
  window.expect = chai.expect;



  require(['./allTests'], function() {
    $.fx.off = true
    $.ajaxSetup({ async: false })
    if(window.mochaPhantomJS) { window.mochaPhantomJS.run(); }
    else { mocha.run(); }
  })
})
