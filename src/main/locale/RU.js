define(function(require) {
  var DateTime = require('../DateTime')
  var DateFormat = require('../DateFormat')
  return {
    id             : 'RU',
    monthNames     : [ 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    dayNames       : ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    shortDayNames  : ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    yearsLabel     : function(years) { return years + ' ' + (years == '1' ? 'Год' : 'Года') },
    monthsLabel    : function(months) { return months + ' ' + (months == '1' ? 'Месяц' : 'Месяца') },
    daysLabel      : function(days) { return days + ' ' + (days == '1' ? 'День' : 'Дня') },
    hoursLabel     : function(hours, minutes) {
      var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
      return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Минута' : 'Минуты')
    },
    shortDateFormat: 'j.n.Y',
    weekDateFormat : 'D j.n.Y',
    dateTimeFormat : 'D j.n.Y k\\lo G:i',
    firstWeekday   : DateTime.MONDAY
  }
})