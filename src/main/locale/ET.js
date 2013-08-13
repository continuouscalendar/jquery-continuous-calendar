define(function(require) {
  var DateTime = require('../DateTime')
  var DateFormat = require('../DateFormat')
  return {
    id             : 'ET',
    monthNames     : [ 'Jaanuar', 'Veebruar', 'Märts', 'Aprill', 'Mai', 'Juuni', 'Juuli', 'August', 'September', 'Oktoober', 'November', 'Detsember'],
    dayNames       : ['Pühapäev', 'Esmaspäev', 'Teisipäev', 'Kolmapäev', 'Neljapäev', 'Reede', 'Laupäev'],
    shortDayNames  : ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
    yearsLabel     : function(years) { return years + ' ' + (years === 1 ? 'Aasta' : 'Aastat') },
    monthsLabel    : function(months) { return months + ' ' + (months === 1 ? 'Kuu' : 'Kuud') },
    daysLabel      : function(days) { return days + ' ' + (days === 1 ? 'Päev' : 'Päeva') },
    hoursLabel     : function(hours, minutes) {
      var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
      return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? 'Tund' : 'Tundi')
    },
    clearRangeLabel: 'TODO',
    clearDateLabel : 'TODO',
    shortDateFormat: 'j.n.Y',
    weekDateFormat : 'D j.n.Y',
    dateTimeFormat : 'D j.n.Y k\\l G:i',
    firstWeekday   : DateTime.MONDAY
  }
})
