var $ = require('jquery')
var continuousCalendar = require('./continuousCalendar')

$.continuousCalendar = {
  "version" : "5.1.1"
}
$.fn.continuousCalendar = function(options) {
  return this.each(function() { continuousCalendar($(this).get(0), options) })
}
$.fn.calendarRange = function() { return this.get(0).calendarRange }
$.fn.exists = function() { return this.length > 0 }
$.fn.isEmpty = function() { return this.length === 0 }
