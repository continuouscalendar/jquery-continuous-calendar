;
(function(root, factory) {
  if(typeof define === "function" && define.amd) {
    define(["./DateTime", "./DateFormat"], factory)
  } else {
    root.DateLocale = factory(root.DateTime, root.DateFormat)
  }
})(this, function(DateTime, DateFormat) {
  var DateLocale = {
    FI: {
      id             : 'FI',
      monthNames     : ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'],
      dayNames       : ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'],
      shortDayNames  : ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
      yearsLabel     : function(years) { return years + ' ' + (years == '1' ? 'vuosi' : 'vuotta') },
      monthsLabel    : function(months) { return months + ' ' + (months == '1' ? 'kuukausi' : 'kuukautta') },
      daysLabel      : function(days) { return days + ' ' + (days == '1' ? 'päivä' : 'päivää') },
      hoursLabel     : function(hours, minutes) {
        var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
        return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'tunti' : 'tuntia')
      },
      shortDateFormat: 'j.n.Y',
      weekDateFormat : 'D j.n.Y',
      dateTimeFormat : 'D j.n.Y k\\lo G:i',
      firstWeekday   : DateTime.MONDAY
    },
    EN: {
      id             : 'EN',
      monthNames     : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      dayNames       : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      shortDayNames  : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      yearsLabel     : function(years) { return years + ' ' + (years == '1' ? 'Year' : 'Years'); },
      monthsLabel    : function(months) { return months + ' ' + (months == '1' ? 'Months' : 'Months') },
      daysLabel      : function(days) { return days + ' ' + (days == '1' ? 'Day' : 'Days') },
      hoursLabel     : function(hours, minutes) {
        var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes)
        return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Hour' : 'Hours')
      },
      shortDateFormat: 'n/j/Y',
      weekDateFormat : 'D n/j/Y',
      dateTimeFormat : 'D n/j/Y G:i',
      firstWeekday   : DateTime.SUNDAY
    },
    AU: {
      id             : 'AU',
      monthNames     : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      dayNames       : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      shortDayNames  : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      yearsLabel     : function(years) { return years + ' ' + (years == '1' ? 'Year' : 'Years'); },
      monthsLabel    : function(months) { return months + ' ' + (months == '1' ? 'Months' : 'Months') },
      daysLabel      : function(days) { return days + ' ' + (days == '1' ? 'Day' : 'Days') },
      hoursLabel     : function(hours, minutes) {
        var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes)
        return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Hour' : 'Hours')
      },
      shortDateFormat: 'j/n/Y',
      weekDateFormat : 'D j/n/Y',
      dateTimeFormat : 'D j/n/Y G:i',
      firstWeekday   : DateTime.SUNDAY
    },
    ET: {
      id             : 'ET',
      monthNames     : [ 'Jaanuar', 'Veebruar', 'Märts', 'Aprill', 'Mai', 'Juuni', 'Juuli', 'August', 'September', 'Oktoober', 'November', 'Detsember'],
      dayNames       : ['Pühapäev', 'Esmaspäev', 'Teisipäev', 'Kolmapäev', 'Neljapäev', 'Reede', 'Laupäev'],
      shortDayNames  : ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
      yearsLabel     : function(years) { return years + ' ' + (years == '1' ? 'Aasta' : 'Aastat') },
      monthsLabel    : function(months) { return months + ' ' + (months == '1' ? 'Kuu' : 'Kuud') },
      daysLabel      : function(days) { return days + ' ' + (days == '1' ? 'Päev' : 'Päeva') },
      hoursLabel     : function(hours, minutes) {
        var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
        return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Tund' : 'Tundi')
      },
      shortDateFormat: 'j.n.Y',
      weekDateFormat : 'D j.n.Y',
      dateTimeFormat : 'D j.n.Y k\\l G:i',
      firstWeekday   : DateTime.MONDAY
    },
    RU: {
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
    },
    SV: {
      id             : 'SV',
      monthNames     : ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
      dayNames       : ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'],
      shortDayNames  : ['Sö', 'Må', 'Ti', 'On', 'To', 'Fr', 'Lö'],
      yearsLabel     : function(years) { return years + ' ' + (years == '1' ? 'År' : 'År') },
      monthsLabel    : function(months) { return months + ' ' + (months == '1' ? 'Månad' : 'Månader') },
      daysLabel      : function(days) { return days + ' ' + (days == '1' ? 'Dag' : 'Dagar') },
      hoursLabel     : function(hours, minutes) {
        var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
        return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Minut' : 'Minuter')
      },
      shortDateFormat: 'j.n.Y',
      weekDateFormat : 'D j.n.Y',
      dateTimeFormat : 'D j.n.Y k\\lo G:i',
      firstWeekday   : DateTime.MONDAY
    }
  }

  DateLocale.fromArgument = function(stringOrObject) {
    if(typeof stringOrObject == 'string')
      return DateLocale[stringOrObject.toUpperCase()]
    else return stringOrObject
  }

  return DateLocale
})
