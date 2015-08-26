var DateTime = require('../DateTime')
var DateFormat = require('../DateFormat')
module.exports = {
  id: 'FR',
  monthNames: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  shortDayNames: ['D','L','M','M','J','V','S'],
  yearsLabel: function (years) { return years + ' ' + (years === 1 ? 'Année' : 'Années'); },
  monthsLabel: function (months) { return months + ' ' + (months === 1 ? 'Mois' : 'Moiss') },
  daysLabel: function (days) { return days + ' ' + (days === 1 ? 'Jour' : 'Jours') },
  hoursLabel: function (hours, minutes) {
    var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes)
    return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? 'Heure' : 'Heures')
  },
  clearRangeLabel: 'Effacer la sélection',
  clearDateLabel: 'Effacer la date',
  shortDateFormat: 'j/n/Y',
  weekDateFormat: 'D j/n/Y',
  dateTimeFormat: 'D j/n/Y G:i',
  firstWeekday: DateTime.MONDAY,
  holidays: {}
}
