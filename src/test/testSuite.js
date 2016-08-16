var $ = require('../continuousCalendar/jquery.continuousCalendar')
var mocha = require('mocha')
const chai = require('chai')
const chaiJquery = require('chai-jquery')
const matchers = require('./matchers')
//  var webConsoleReporter = require('./vendor/WebConsole')

if(window.mocha) mocha = window.mocha

mocha.setup({ui: 'bdd', reporter: 'html'})

chai.use(chaiJquery)
chai.use(matchers)
window.expect = chai.expect

require('./jquery.continuousCalendar.spec')

$.fx.off = true
$.ajaxSetup({async: false})
if(window.mochaPhantomJS) {
  window.mochaPhantomJS.run()
}
else {
  mocha.run()
}

