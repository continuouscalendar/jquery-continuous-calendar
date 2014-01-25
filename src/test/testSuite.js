requirejs.config({
  paths: {
    'jquery'     : '../lib/jquery-1.9.1.min',
    'mocha'      : '../lib/mocha',
    'chai'       : '../lib/chai',
    'chai.jquery': '../lib/chai-jquery'
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
