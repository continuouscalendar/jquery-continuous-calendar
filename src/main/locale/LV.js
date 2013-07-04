define(function(require) {
  var DateTime = require('../DateTime')
  var DateFormat = require('../DateFormat')
  return {
    id             : 'LV',
    monthNames     : ['Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs', ' Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'],
    dayNames       : ['Svētdiena', ' Pirmdiena', 'Otrdiena', 'Trešdiena', 'Ceturtdiena', 'Piektdiena', 'Sestdiena'],
    shortDayNames  : ['Sv', 'P', 'O', 'T', 'C', 'Pk', 'S'],
    yearsLabel     : function(years) { return years + ' ' + (years == '1' ? 'G' : 'G'); },
    monthsLabel    : function(months) { return months + ' ' + (months == '1' ? 'Mēnesī' : 'Mēnešiem') },
    daysLabel      : function(days) { return days + ' ' + (days == '1' ? 'Diena' : 'Dienas') },
    hoursLabel     : function(hours, minutes) {
      var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes)
      return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Stundas' : 'Minūtes')
    },
    shortDateFormat: 'j.n.Y',
    weekDateFormat : 'D j.n.Y',
    dateTimeFormat : 'D j.n.Y k\\lo G:i',
    firstWeekday   : DateTime.MONDAY
  }
})
