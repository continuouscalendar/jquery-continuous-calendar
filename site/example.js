requirejs.config({
  paths: {
    'jquery'              : '../src/lib/jquery-1.8.0.min',
    'jquery.tinyscrollbar': '../src/main/jquery.tinyscrollbar-1.66/jquery.tinyscrollbar'
  }
})
require(['jquery', '../src/main/jquery.continuousCalendar', '../src/main/DateFormat', '../src/main/DateLocale'], function($, _calendar, DateFormat, DateLocale) {
  jQuery = $
  $("#singleDate2, #singleDate3").continuousCalendar({weeksBefore: 60, weeksAfter: 1, isPopup: true, locale: 'EN', customScroll: true})
  $("#range1").continuousCalendar({firstDate: "2/15/2007", lastDate: "9/10/2009", isPopup: true, locale: 'EN', customScroll: false})
  $("#range2").continuousCalendar({weeksBefore: 30, weeksAfter: 30, locale: 'EN', customScroll: false})
  $("#timeCalendar")
    .continuousCalendar({weeksBefore: 30, lastDate: "today", selectToday: true, customScroll: true})
    .on('calendarChange', function() {
      var container = $(this)
      var startTime = $('select[name=tripStartTime]', container).val()
      var endTime = $('select[name=tripEndTime]', container).val()
      var range = container.calendarRange()
      range = range.withTimes(startTime, endTime)
      container.find('.totalTimeOfTrip').text(DateFormat.formatRange(range, DateLocale.EN)).toggleClass('invalid', !range.isValid())
    })
    .find("select")
    .on('change', function() { $("#timeCalendar").trigger('calendarChange') })
    .each(function() {
      for(var i = 0; i < 24; i++) {
        $(this).append($("<option>").text(i + ":00")).append($("<option>").text(i + ":30"))
      }
    })

  var templates = {
    th: function() {return '<th style="background: #333;color: #eee; font-weight: bold;" />'},
    header: function() {return '<table class="calendarHeader" style="width: 400px; font-size: 14px;" />'},
    body: function() {return '<table class="calendarBody" style="width: 400px; font-size: 14px;" />'},
    scrollContent: function() {return '<div class="calendarScrollContent" style="width: 416px; height: 200px;" />'},
    weekCell: function() {return ''}
  }
  $("#redefinedTemplates").continuousCalendar({templates: templates})
})

