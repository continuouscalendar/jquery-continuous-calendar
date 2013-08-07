requirejs.config({
  paths: {
    'jquery'              : '../src/lib/jquery-1.8.0.min'
  }
})

define(function(require) {
  var $ = require('jquery')
  var DateTime = require('../src/main/DateTime')
  var DateRange = require('../src/main/DateRange')
  var DateLocale = require('../src/main/DateLocale')
  var CalendarBody = require('../src/main/CalendarBody')
  var container = $('<div class="continuousCalendar">')
  $('body').append($('<div class="continuousCalendarContainer"></div>').append(container))
  CalendarBody(container, new DateRange(DateTime.now(), DateTime.now().plusDays(50)), DateLocale.FI, false, false, '')
})
