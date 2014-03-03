$("#timeCalendar").continuousCalendar({weeksBefore: 30, lastDate: "today", selectToday: true, theme: 'rounded', isRange: true})
$("#timeCalendar").bind('calendarChange', function() {
  var container = $(this)
  var startTime = container.find('select[name=tripStartTime]').val()
  var endTime = container.find('select[name=tripEndTime]').val()
  var range = container.calendarRange()
  range = range.withTimes(startTime, endTime)
  container.find('.totalTimeOfTrip').text(DateFormat.formatRange(range, DateLocale.EN)).toggleClass('invalid', !range.isValid())
});
$("#timeCalendar select").bind('change', function() {
  $("#timeCalendar").trigger('calendarChange');
});
$("#timeCalendar select").each(function() {
  for(i = 0; i < 24; i++) {
    $(this).append($("<option>").text(i + ":00")).append($("<option>").text(i + ":30"));
  }
});
$('#date-picker').continuousCalendar({isPopup: true, firstDate: 'today', customScroll: true});
