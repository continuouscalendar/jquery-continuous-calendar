ContinuousCalendar(document.getElementById('timeCalendar'),  {weeksBefore: 30, lastDate: "today", selectToday: true, theme: 'rounded', isRange: true, executeCallback: executeCallback})

function executeCallback(container, selection, params) {
  var startTime = container.querySelector('select[name=tripStartTime]').value
  var endTime = container.querySelector('select[name=tripEndTime]').value
  var range = container.calendarRange
  range = range.withTimes(startTime, endTime)
  container.querySelector('.totalTimeOfTrip').innerText = DateFormat.formatRange(range, DateLocale.EN)
  container.querySelector('.totalTimeOfTrip').classList.toggle('invalid', !range.isValid())
}

Array.prototype.slice.call(document.querySelectorAll("#timeCalendar select")).forEach(function(el) {
  el.addEventListener('change', function() {
    executeCallback(document.getElementById('timeCalendar'))
  })
});

Array.prototype.slice.call(document.querySelectorAll("#timeCalendar select")).forEach(function(elem) {
  for(i = 0; i < 24; i++) {
    var option = document.createElement('option')
    option.innerText = i + ":00"
    var option2 = document.createElement('option')
    option2.innerText = i + ":30"
    elem.appendChild(option);
    elem.appendChild(option2);
  }
});
ContinuousCalendar(document.getElementById('date-picker'), {isPopup: true, firstDate: 'today', customScroll: false});
