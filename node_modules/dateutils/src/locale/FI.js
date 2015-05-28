var DateTime = require('../DateTime')
var DateFormat = require('../DateFormat')
var holidays = require('./FI-holidays')
module.exports = {
  id: 'FI',
  monthNames: ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'],
  dayNames: ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'],
  shortDayNames: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
  yearsLabel: function (years) { return years + ' ' + (years === 1 ? 'vuosi' : 'vuotta') },
  monthsLabel: function (months) { return months + ' ' + (months === 1 ? 'kuukausi' : 'kuukautta') },
  daysLabel: function (days) { return days + ' ' + (days === 1 ? 'päivä' : 'päivää') },
  hoursLabel: function (hours, minutes) {
    var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
    return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? 'tunti' : 'tuntia')
  },
  clearRangeLabel: 'Poista valinta',
  clearDateLabel: 'Poista valinta',
  shortDateFormat: 'j.n.Y',
  weekDateFormat: 'D j.n.Y',
  dateTimeFormat: 'D j.n.Y k\\lo G:i',
  firstWeekday: DateTime.MONDAY,
  holidays: holidays
}
