var DateTime = require('../DateTime')
var DateFormat = require('../DateFormat')
module.exports = {
  id: 'DE',
  monthNames: ['Januar','Februar','März','April','Mai','Juni', 'Juli','August','September','Oktober','November','Dezember'],
  dayNames: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
  shortDayNames: ['So','Mo','Di','Mi','Do','Fr','Sa'],
  yearsLabel: function (years) { return years + ' ' + 'Jahr'; },
  monthsLabel: function (months) { return months + ' ' + (months === 1 ? 'Monat' : 'Months') },
  daysLabel: function (days) { return days + ' ' + (days === 1 ? 'Tag' : 'Tage') },
  hoursLabel: function (hours, minutes) {
    var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes)
    return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? 'Stunde' : 'Stunden')
  },
  clearRangeLabel: 'Auswahl löschen',
  clearDateLabel: 'Auswahl löschen',
  shortDateFormat: 'j.n.Y',
  weekDateFormat: 'D j.n.Y',
  dateTimeFormat: 'D j.n.Y G:i',
  firstWeekday: DateTime.MONDAY,
  holidays: {}
}
