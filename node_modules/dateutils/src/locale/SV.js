var DateTime = require('../DateTime')
var DateFormat = require('../DateFormat')
module.exports = {
  id: 'SV',
  monthNames: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
  dayNames: ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'],
  shortDayNames: ['Sö', 'Må', 'Ti', 'On', 'To', 'Fr', 'Lö'],
  yearsLabel: function (years) { return years + ' ' + (years === 1 ? 'År' : 'År') },
  monthsLabel: function (months) { return months + ' ' + (months === 1 ? 'Månad' : 'Månader') },
  daysLabel: function (days) { return days + ' ' + (days === 1 ? 'Dag' : 'Dagar') },
  hoursLabel: function (hours, minutes) {
    var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
    return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? 'Minut' : 'Minuter')
  },
  clearRangeLabel: 'TODO',
  clearDateLabel: 'TODO',
  shortDateFormat: 'j.n.Y',
  weekDateFormat: 'D j.n.Y',
  dateTimeFormat: 'D j.n.Y G:i',
  firstWeekday: DateTime.MONDAY,
  holidays: {}
}
