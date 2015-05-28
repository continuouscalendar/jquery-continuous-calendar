var DateTime = require('../DateTime')
var DateFormat = require('../DateFormat')
module.exports = {
  id: 'AU',
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  shortDayNames: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  yearsLabel: function (years) { return years + ' ' + (years === 1 ? 'Year' : 'Years'); },
  monthsLabel: function (months) { return months + ' ' + (months === 1 ? 'Months' : 'Months') },
  daysLabel: function (days) { return days + ' ' + (days === 1 ? 'Day' : 'Days') },
  hoursLabel: function (hours, minutes) {
    var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes)
    return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? 'Hour' : 'Hours')
  },
  clearRangeLabel: 'Clear Range',
  clearDateLabel: 'Clear Date',
  shortDateFormat: 'j/n/Y',
  weekDateFormat: 'D j/n/Y',
  dateTimeFormat: 'D j/n/Y G:i',
  firstWeekday: DateTime.SUNDAY,
  holidays: {}
}
