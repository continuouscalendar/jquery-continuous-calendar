requirejs.config({
  paths: {
    'jquery'              : '../src/lib/jquery.min'
  }
})

define(function(require) {
  var $ = require('jquery')
  var DateTime = require('../src/main/dateutils/DateTime')
  var DateRange = require('../src/main/dateutils/DateRange')
  var DateLocale = require('../src/main/dateutils/DateLocale')
  var CalendarBody = require('../src/main/CalendarBody')
  var container = $('<div class="continuousCalendar">')
  $('body').append($('<div class="continuousCalendarContainer"></div>').append(container))
  CalendarBody(container.get(0), new DateRange(DateTime.now(), DateTime.now().plusDays(50)), DateLocale.FI, false, false, '')
})
