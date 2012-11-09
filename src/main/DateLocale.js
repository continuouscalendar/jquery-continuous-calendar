/* ==============================================================================
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

;(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory)
  } else {
    root.DateLocale = factory()
  }
})(this, function() {
  var DateLocale = {}
  DateLocale.MONDAY = 1
  DateLocale.FRIDAY = 5
  DateLocale.SUNDAY = 0
  DateLocale.hoursAndMinutes = function(hours, minutes) { return (Math.round((hours + minutes / 60) * 100) / 100).toString() }

  DateLocale.FI = {
    id: 'FI',
    monthNames: ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'],
    dayNames: ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'],
    shortDayNames: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
    yearsLabel: function(years) { return years + ' ' + (years == '1' ? 'vuosi' : 'vuotta') },
    monthsLabel: function(months) { return months + ' ' + (months == '1' ? 'kuukausi' : 'kuukautta') },
    daysLabel: function(days) { return days + ' ' + (days == '1' ? 'päivä' : 'päivää') },
    hoursLabel: function(hours, minutes) {
      var hoursAndMinutes = DateLocale.hoursAndMinutes(hours, minutes).replace('.', ',')
      return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'tunti' : 'tuntia')
    },
    shortDateFormat: 'j.n.Y',
    weekDateFormat: 'D j.n.Y',
    dateTimeFormat: 'D j.n.Y k\\lo G:i',
    firstWeekday: DateLocale.MONDAY,
    getFirstDateOfWeek: function(dateTime) {
      return DateLocale.getFirstDateOfWeek(dateTime, DateLocale.MONDAY)
    }
  }

  DateLocale.EN = {
    id: 'EN',
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortDayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    yearsLabel: function(years) { return years + ' ' + (years == '1' ? 'Year' : 'Years'); },
    monthsLabel: function(months) { return months + ' ' + (months == '1' ? 'Months' : 'Months') },
    daysLabel: function(days) { return days + ' ' + (days == '1' ? 'Day' : 'Days') },
    hoursLabel: function(hours, minutes) {
      var hoursAndMinutes = DateLocale.hoursAndMinutes(hours, minutes)
      return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Hour' : 'Hours')
    },
    shortDateFormat: 'n/j/Y',
    weekDateFormat: 'D n/j/Y',
    dateTimeFormat: 'D n/j/Y G:i',
    firstWeekday: DateLocale.SUNDAY,
    getFirstDateOfWeek: function(dateTime) {
      return DateLocale.getFirstDateOfWeek(dateTime, DateLocale.SUNDAY)
    }
  }

  DateLocale.AU = {
    id: 'AU',
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortDayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    yearsLabel: function(years) { return years + ' ' + (years == '1' ? 'Year' : 'Years'); },
    monthsLabel: function(months) { return months + ' ' + (months == '1' ? 'Months' : 'Months') },
    daysLabel: function(days) { return days + ' ' + (days == '1' ? 'Day' : 'Days') },
    hoursLabel: function(hours, minutes) {
      var hoursAndMinutes = DateLocale.hoursAndMinutes(hours, minutes)
      return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Hour' : 'Hours')
    },
    shortDateFormat: 'j/n/Y',
    weekDateFormat: 'D j/n/Y',
    dateTimeFormat: 'D j/n/Y G:i',
    firstWeekday: DateLocale.SUNDAY,
    getFirstDateOfWeek: function(dateTime) {
      return DateLocale.getFirstDateOfWeek(dateTime, DateLocale.SUNDAY)
    }
  }

  DateLocale.ET = {
    id: 'ET',
    monthNames: [ 'Jaanuar', 'Veebruar', 'Märts', 'Aprill', 'Mai', 'Juuni', 'Juuli', 'August', 'September', 'Oktoober', 'November', 'Detsember'],
    dayNames: ['Pühapäev', 'Esmaspäev', 'Teisipäev', 'Kolmapäev', 'Neljapäev', 'Reede', 'Laupäev'],
    shortDayNames: ['Pü', 'Es', 'Te', 'Ko', 'Ne', 'Re', 'La'],
    yearsLabel: function(years) { return years + ' ' + (years == '1' ? 'Aasta' : 'Aastat') },
    monthsLabel: function(months) { return months + ' ' + (months == '1' ? 'Kuu' : 'Kuud') },
    daysLabel: function(days) { return days + ' ' + (days == '1' ? 'Päev' : 'Päeva') },
    hoursLabel: function(hours, minutes) {
      var hoursAndMinutes = DateLocale.hoursAndMinutes(hours, minutes).replace('.', ',')
      return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Tund' : 'Tundi')
    },
    shortDateFormat: 'j.n.Y',
    weekDateFormat: 'D j.n.Y',
    dateTimeFormat: 'D j.n.Y k\\lo G:i',
    firstWeekday: DateLocale.MONDAY,
    getFirstDateOfWeek: function(dateTime) {
      return DateLocale.getFirstDateOfWeek(dateTime, DateLocale.MONDAY)
    }
  }

  DateLocale.RU = {
    id: 'RU',
    monthNames: [ 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    shortDayNames: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    yearsLabel: function(years) { return years + ' ' + (years == '1' ? 'Год' : 'Года') },
    monthsLabel: function(months) { return months + ' ' + (months == '1' ? 'Месяц' : 'Месяца') },
    daysLabel: function(days) { return days + ' ' + (days == '1' ? 'День' : 'Дня') },
    hoursLabel: function(hours, minutes) {
      var hoursAndMinutes = DateLocale.hoursAndMinutes(hours, minutes).replace('.', ',')
      return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Минута' : 'Минуты')
    },
    shortDateFormat: 'j.n.Y',
    weekDateFormat: 'D j.n.Y',
    dateTimeFormat: 'D j.n.Y k\\lo G:i',
    firstWeekday: DateLocale.MONDAY,
    getFirstDateOfWeek: function(dateTime) {
      return DateLocale.getFirstDateOfWeek(dateTime, DateLocale.MONDAY)
    }
  }
  DateLocale.DEFAULT = DateLocale.EN

  DateLocale.getFirstDateOfWeek = function(dateTime, firstWeekday) {
    if(firstWeekday < dateTime.getDay()) {
      return dateTime.plusDays(firstWeekday - dateTime.getDay())
    } else {
      if(firstWeekday > dateTime.getDay()) {
        return dateTime.plusDays(firstWeekday - dateTime.getDay() - 7)
      } else {
        return dateTime.clone()
      }
    }
  }

  DateLocale.fromArgument = function(stringOrObject) {
    if(typeof stringOrObject == 'string')
      return DateLocale[stringOrObject.toUpperCase()]
    else return stringOrObject || DateLocale.DEFAULT
  }

  return DateLocale
})
