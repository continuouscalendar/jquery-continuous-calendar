$.continuousCalendar = {};$.continuousCalendar.version = '2.2.0';$.continuousCalendar.released = '2012-10-24'
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
    define(["jquery"], factory)
  } else {
    root.DateTime = factory(root.jQuery)
  }
})(this, function($) {
  var DateTime = function(date) {
    if(typeof date == 'string') this.date = new Date(date)
    else this.date = date || new Date()
  }

  $.each([
    'getTime',
    'getFullYear',
    'getMonth',
    'getDate',
    'getDay',
    'getHours',
    'getMinutes',
    'getSeconds',
    'getMilliseconds'
  ], function(_index, func) {
    DateTime.prototype[func] = function() { return this.date[func]() }
  })

  DateTime.prototype.withTime = function(h, m) {
    var dateWithTime = this.clone()
    dateWithTime.date.setHours(h)
    dateWithTime.date.setMinutes(m)
    dateWithTime.date.setMilliseconds(0)
    return dateWithTime
  }

  DateTime.DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  DateTime.SECOND = 1000
  DateTime.MINUTE = 60 * DateTime.SECOND
  DateTime.HOUR = 60 * DateTime.MINUTE
  DateTime.DAY = 24 * DateTime.HOUR
  DateTime.WEEK = 7 * DateTime.DAY

  DateTime.now = function() {
    if(typeof DateTime._now == 'undefined') {
      DateTime._now = new DateTime()
    }
    return DateTime._now
  }

  DateTime.getDaysInMonth = function(year, month) {
    if(((0 == (year % 4)) && ( (0 != (year % 100)) || (0 == (year % 400)))) && month == 1) {
      return 29
    } else {
      return DateTime.DAYS_IN_MONTH[month]
    }
  }

  DateTime.getDayInYear = function(year, month, day) {
    var days = 0
    for(var i = 0; i < month; i++) {
      days += DateTime.getDaysInMonth(year, i)
    }
    days += day
    return days
  }

  DateTime.prototype.getDaysInMonth = function() { return DateTime.getDaysInMonth(this.getFullYear(), this.getMonth()) }

  DateTime.prototype.getDayInYear = function() { return DateTime.getDayInYear(this.getFullYear(), this.getMonth(), this.getDate()) }

  DateTime.prototype.plusDays = function(days) {
    var newDateTime = this.clone()
    var hours = this.getHours()
    newDateTime.date.setTime(this.getTime() + days * DateTime.DAY)

    // Fix the DateTime offset caused by daylight saving time
    var delta = hours - newDateTime.getHours()
    if(delta != 0) {
      // Correct the delta to be between [-12, 12]
      if(delta > 12) {
        delta -= 24
      }
      if(delta < -12) {
        delta += 24
      }
      newDateTime.date.setTime(newDateTime.getTime() + (delta * DateTime.HOUR))
    }
    return newDateTime
  }

  DateTime.prototype.stripped = function() { return new Date(parseInt(this.getTime() / DateTime.DAY, 10)) }

  DateTime.prototype.compareTo = function(date) {
    if(!date) {
      return 1
    }
    var lhs = this.getTime()
    var rhs = date.getTime()
    if(lhs < rhs) {
      return -1
    } else {
      if(lhs > rhs) {
        return 1
      } else {
        return 0
      }
    }
  }

  DateTime.prototype.isToday = function() { return this.equalsOnlyDate(DateTime.now()) }

  DateTime.prototype.getWeekInYear = function(weekNumberingSystem) {
    if(weekNumberingSystem != "US" && weekNumberingSystem != "ISO") {
      throw("Week numbering system must be either US or ISO, was " + weekNumberingSystem)
    }

    var firstDay = new Date(this.getFullYear(), 0, 1).getDay()
    if(weekNumberingSystem == "US") {
      return Math.ceil((this.getDayInYear() + firstDay) / 7)
    }

    var THU = 4
    var weekday = this.getDay()
    if(weekday == 0) {
      weekday = 7
    }
    if(firstDay == 0) {
      firstDay = 7
    }

    // If Dec 29 falls on Mon, Dec 30 on Mon or Tue, Dec 31 on Mon - Wed, it's on the first week of next year
    if(this.getMonth() == 11 && this.getDate() >= 29 && (this.getDate() - weekday) > 27) {
      return 1
    }
    // If Jan 1-3 falls on Fri, Sat or Sun, it's on the last week of the previous year
    if(this.getMonth() == 0 && this.getDate() < 4 && weekday > THU) {
      return new DateTime(new Date(this.getFullYear() - 1, 11, 31)).getWeekInYear('ISO')
    }

    var week = Math.ceil((this.getDayInYear() + firstDay - 1) / 7)

    // If first days of this year are on last year's last week, the above gives one week too much
    if(firstDay > THU) {
      week--
    }
    return week
  }

  //TODO refactor
  DateTime.prototype.clone = function() { return new DateTime(new Date(this.getTime())) }

  DateTime.prototype.isOddMonth = function() { return this.getMonth() % 2 != 0 }

  DateTime.prototype.equalsOnlyDate = function(date) {
    if(!date) {
      return false
    }
    return this.getMonth() == date.getMonth() && this.getDate() == date.getDate() && this.getFullYear() == date.getFullYear()
  }

  DateTime.prototype.isBetweenDates = function(start, end) { return this.compareTo(start) >= 0 && this.compareTo(end) <= 0 }

  DateTime.prototype.firstDateOfMonth = function() { return new DateTime((this.getMonth() + 1) + "/1/" + this.getFullYear()) }

  DateTime.prototype.lastDateOfMonth = function() { return new DateTime((this.getMonth() + 1) + "/" + this.getDaysInMonth() + "/" + this.getFullYear()) }

  DateTime.prototype.distanceInDays = function(date) {
    var first = parseInt(this.getTime() / DateTime.DAY, 10)
    var last = parseInt(date.getTime() / DateTime.DAY, 10)
    return (last - first)
  }

  DateTime.prototype.withWeekday = function(weekday) { return this.plusDays(weekday - this.getDay()) }

  DateTime.prototype.getOnlyDate = function() { return new DateTime(new Date(this.getFullYear(), this.getMonth(), this.getDate())) }

  DateTime.prototype.getTimezone = function() {
    return this.date.toString().replace(/^.*? ([A-Z]{3}) [0-9]{4}.*$/, "$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, "$1$2$3")
  }

  DateTime.prototype.getDayOfYear = function() {
    var num = 0
    DateTime.daysInMonth[1] = this.isLeapYear() ? 29 : 28
    for(var i = 0; i < this.getMonth(); ++i) {
      num += DateTime.daysInMonth[i]
    }
    return num + this.getDate() - 1
  }

  DateTime.prototype.isLeapYear = function() {
    var year = this.getFullYear()
    return ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)))
  }

  DateTime.prototype.getDaysInMonth = function() {
    DateTime.daysInMonth[1] = this.isLeapYear() ? 29 : 28
    return DateTime.daysInMonth[this.getMonth()]
  }

  DateTime.prototype.getSuffix = function() {
    switch(this.getDate()) {
      case 1:
      case 21:
      case 31:
        return "st"
      case 2:
      case 22:
        return "nd"
      case 3:
      case 23:
        return "rd"
      default:
        return "th"
    }
  }

  DateTime.prototype.isWeekend = function() { return this.getDay() == 6 || this.getDay() == 0 }

  DateTime.prototype.toString = function() { return this.date.toISOString() }

  DateTime.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  DateTime.y2kYear = 50
  DateTime.monthNumbers = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }

  return DateTime
})
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
    shortDayNames: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
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
/*
 * Copyright (C) 2004 Baron Schwartz <baron at sequent dot org>
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, version 2.1.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
 * details.
 */

;(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["./DateTime"], factory)
  } else {
    root.DateFormat = factory(root.DateTime)
  }
})(this, function(DateTime) {
  var DateFormat = {}

  DateFormat.parseFunctions = {count: 0}
  DateFormat.parseRegexes = []
  DateFormat.formatFunctions = {count: 0}

  DateFormat.format = function(dateTime, format, locale) {
    if(DateFormat.formatFunctions[format] == null) {
      DateFormat.createNewFormat(dateTime, format, locale)
    }
    var func = DateFormat.formatFunctions[format]
    return dateTime[func]()
  }

  DateFormat.shortDateFormat = function(dateTime, locale) {
    return DateFormat.format(dateTime, locale ? locale.shortDateFormat : 'n/j/Y', locale)
  }

  DateFormat.formatRange = function(dateRange, locale) {
    if(dateRange._hasTimes) {
      return  locale.daysLabel(dateRange.days()) + ' ' + locale.hoursLabel(dateRange.hours(), dateRange.minutes())
    } else {
      return DateFormat.shortDateFormat(dateRange.start, locale) + ' - ' + DateFormat.shortDateFormat(dateRange.end, locale)
    }
  }

  DateFormat.formatDefiningRangeDuration = function(dateRange, locale) {
    var years = parseInt(dateRange.days() / 360, 10)
    if(years > 0) return locale.yearsLabel(years)

    var months = parseInt(dateRange.days() / 30, 10)
    if(months > 0) return locale.monthsLabel(months)

    return locale.daysLabel(dateRange.days())
  }

  DateFormat.getWeekOfYear = function(dateTime) {
    // Skip to Thursday of this week
    var now = dateTime.getDayOfYear() + (4 - dateTime.getDay())
    // Find the first Thursday of the year
    var jan1 = new Date(dateTime.getFullYear(), 0, 1)
    var then = (7 - jan1.getDay() + 4)
    document.write(then)
    return DateFormat.leftPad(((now - then) / 7) + 1, 2, "0")
  }

  DateFormat.getGMTOffset = function(dateTime) {
    return (dateTime.date.getTimezoneOffset() > 0 ? "-" : "+") +
      DateFormat.leftPad(Math.floor(dateTime.getTimezoneOffset() / 60), 2, "0") +
      DateFormat.leftPad(dateTime.getTimezoneOffset() % 60, 2, "0")
  }

  DateFormat.leftPad = function(val, size, ch) {
    var result = new String(val)
    if(ch == null) {
      ch = " "
    }
    while(result.length < size) {
      result = ch + result
    }
    return result
  }

  DateFormat.escape = function(string) { return string.replace(/('|\\)/g, "\\$1") }

  DateFormat.parse = function(input, locale) {
    if(input == 'today') {
      return DateTime.now()
    }
    var date = new Date(input)
    if(isNaN(date.getTime())) {
      throw Error('Could not parse date from "' + input + '"')
    }
    return new DateTime(date, locale)
  }

  DateFormat.patterns = {
    ISO8601LongPattern: "Y-m-d H:i:s",
    ISO8601ShortPattern: "Y-m-d",
    ShortDatePattern: "n/j/Y",
    FiShortDatePattern: "j.n.Y",
    FiWeekdayDatePattern: "D j.n.Y",
    FiWeekdayDateTimePattern: "D j.n.Y k\\lo G:i",
    LongDatePattern: "l, F d, Y",
    FullDateTimePattern: "l, F d, Y g:i:s A",
    MonthDayPattern: "F d",
    ShortTimePattern: "g:i A",
    LongTimePattern: "g:i:s A",
    SortableDateTimePattern: "Y-m-d\\TH:i:s",
    UniversalSortableDateTimePattern: "Y-m-d H:i:sO",
    YearMonthPattern: "F, Y"
  }

  DateFormat.parseTime = function(timeStr) {
    var splittedTime = splitTime(timeStr.replace(/:|,/i, '.'))
    var time = [parseInt(splittedTime[0], 10), parseInt(splittedTime[1], 10)]
    return (isHour(time[0]) && isMinute(time[1])) ? time : null

    function splitTime(timeStr) {
      if(timeStr.indexOf('.') != -1) {
        return  timeStr.split('.')
      }
      switch(timeStr.length) {
        case 4:
          return [timeStr.slice(0, 2) , timeStr.slice(2, 4)]
        case 3:
          return [timeStr.slice(0, 1) , timeStr.slice(1, 3)]
        case 2:
          return [timeStr, 0]
        default:
          return [-1, -1]
      }
    }

    function isMinute(minutes) { return !isNaN(minutes) && minutes >= 0 && minutes <= 59 }

    function isHour(hours) { return !isNaN(hours) && hours >= 0 && hours <= 23 }
  }

  DateFormat.createNewFormat = function(dateTime, format, locale) {
    var funcName = "format" + DateFormat.formatFunctions.count++
    DateFormat.formatFunctions[format] = funcName
    var code = "DateTime.prototype." + funcName + " = function(){return "
    var special = false
    var ch = ''
    for(var i = 0; i < format.length; ++i) {
      ch = format.charAt(i)
      if(!special && ch == "\\") {
        special = true
      } else {
        if(special) {
          special = false
          code += "'" + DateFormat.escape(ch) + "' + "
        } else {
          code += DateFormat.getFormatCode(ch, locale)
        }
      }
    }
    eval(code.substring(0, code.length - 3) + ";}")
  }

  DateFormat.getFormatCode = function(character) {
    switch(character) {
      case "d":
        return "DateFormat.leftPad(this.getDate(), 2, '0') + "
      case "D":
        return "locale.shortDayNames[this.getDay()] + "
      case "j":
        return "this.getDate() + "
      case "l":
        return "locale.dayNames[this.getDay()] + "
      case "S":
        return "this.getSuffix() + "
      case "w":
        return "this.getDay() + "
      case "z":
        return "this.getDayOfYear() + "
      case "W":
        return "DateFormat.getWeekOfYear(this) + "
      case "F":
        return "locale.monthNames[this.getMonth()] + "
      case "m":
        return "DateFormat.leftPad(this.getMonth() + 1, 2, '0') + "
      case "M":
        return "locale.monthNames[this.getMonth()].substring(0, 3) + "
      case "n":
        return "(this.getMonth() + 1) + "
      case "t":
        return "this.getDaysInMonth() + "
      case "L":
        return "(this.isLeapYear() ? 1 : 0) + "
      case "Y":
        return "this.getFullYear() + "
      case "y":
        return "('' + this.getFullYear()).substring(2, 4) + "
      case "a":
        return "(this.getHours() < 12 ? 'am' : 'pm') + "
      case "A":
        return "(this.getHours() < 12 ? 'AM' : 'PM') + "
      case "g":
        return "((this.getHours() %12) ? this.getHours() % 12 : 12) + "
      case "G":
        return "this.getHours() + "
      case "h":
        return "DateFormat.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + "
      case "H":
        return "DateFormat.leftPad(this.getHours(), 2, '0') + "
      case "i":
        return "DateFormat.leftPad(this.getMinutes(), 2, '0') + "
      case "s":
        return "DateFormat.leftPad(this.getSeconds(), 2, '0') + "
      case "O":
        return "DateFormat.getGMTOffset(this) + "
      case "T":
        return "this.getTimezone() + "
      case "Z":
        return "(this.getTimezoneOffset() * -60) + "
      default:
        return "'" + DateFormat.escape(character) + "' + "
    }
  }

  return DateFormat
})
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
    define(["jquery", "./DateTime", "./DateFormat"], factory)
  } else {
    root.DateRange = factory(root.jQuery, root.DateTime, root.DateFormat)
  }
})(this, function($, DateTime, DateFormat) {
  function DateRange(date1, date2) {
    if(!date1 || !date2) {
      throw('two dates must be specified, date1=' + date1 + ', date2=' + date2)
    }
    this.start = (date1.compareTo(date2) > 0 ? date2 : date1)
    this.end = (date1.compareTo(date2) > 0 ? date1 : date2)
    this._days = 0
    this._hours = 0
    this._minutes = 0
    this._valid = true
  }

  DateRange.prototype = {
    _setDaysHoursAndMinutes: function() {
      if(this._hasTimes) {
        var ms = parseInt((this.end.getTime() - this.start.getTime()))
        this._days = parseInt(ms / DateTime.DAY)
        ms = ms - (this._days * DateTime.DAY)
        this._hours = parseInt(ms / DateTime.HOUR)
        ms = ms - (this._hours * DateTime.HOUR)
        this._minutes = parseInt(ms / DateTime.MINUTE)
      }
    },

    _dateWithTime: function(dateWithoutTime, parsedTime) {
      return dateWithoutTime.withTime(parsedTime[0], parsedTime[1])
    },

    hours: function() { return this._hours },

    minutes: function() { return this._minutes },

    hasDate: function(date) { return date.isBetweenDates(this.start, this.end) },

    isValid: function() { return this._valid && this.end.getTime() - this.start.getTime() >= 0 },

    days: function() {
      if(this._hasTimes) {
        return this._days
      } else {
        return Math.round(this.start.distanceInDays(this.end) + 1)
      }
    },

    shiftDays: function(days) { return new DateRange(this.start.plusDays(days), this.end.plusDays(days)) },

    expandTo: function(date) {
      var newStart = this.start.clone()
      var newEnd = this.end.clone()
      if(date.compareTo(this.start) < 0) {
        newStart = date
      } else {
        if(date.compareTo(this.end) > 0) {
          newEnd = date
        }
      }
      return new DateRange(newStart, newEnd)
    },

    expandDaysTo: function(days) { return new DateRange(this.start, this.start.plusDays(days - 1)) },

    hasValidSize: function(minimumDays) { return minimumDays < 0 || this.days() >= minimumDays },

    hasValidSizeAndEndsOnWorkWeek: function(minimumDays) { return this.hasValidSize(minimumDays) && this.hasEndsOnWeekend() },

    and: function(that) {
      var latestStart = this.start.compareTo(that.start) > 0 ? this.start : that.start
      var earliestEnd = this.end.compareTo(that.end) > 0 ? that.end : this.end
      if(latestStart.compareTo(earliestEnd) < 0) {
        return new DateRange(latestStart, earliestEnd)
      } else {
        return DateRange.emptyRange()
      }
    },

    isInside: function(outer) { return this.start.compareTo(outer.start) >= 0 && this.end.compareTo(outer.end) <= 0 },

    hasEndsOnWeekend: function() { return this.start.isWeekend() || this.end.isWeekend() },

    withTimes: function(startTimeStr, endTimeStr) {
      var parsedStartTime = DateFormat.parseTime(startTimeStr)
      var parsedEndTime = DateFormat.parseTime(endTimeStr)
      var rangeWithTimes = this.clone()
      if(parsedStartTime && parsedEndTime) {
        rangeWithTimes._valid = true
        rangeWithTimes._hasTimes = true
        rangeWithTimes.start = this._dateWithTime(this.start, parsedStartTime)
        rangeWithTimes.end = this._dateWithTime(this.end, parsedEndTime)
        rangeWithTimes._setDaysHoursAndMinutes()
      } else {
        rangeWithTimes._valid = false
      }
      return rangeWithTimes
    },

    clone: function() { return new DateRange(this.start, this.end) },

    toString: function() {
      return [
        'DateRange:',
        this.start.toString(),
        '-',
        this.end.toString(),
        this._days,
        'days',
        this._hours,
        'hours',
        this._minutes,
        'minutes',
        this._valid ? 'valid' : 'invalid'
      ].join(' ')
    },

    isPermittedRange: function(minimumSize, disableWeekends, outerRange) { return this.hasValidSize(minimumSize) && (!(disableWeekends && this.hasEndsOnWeekend())) && this.isInside(outerRange) },

    shiftInside: function(outerRange) {
      if(this.days() > outerRange.days()) {
        return DateRange.emptyRange()
      }
      var distanceToOuterRangeStart = this.start.distanceInDays(outerRange.start)
      var distanceToOuterRangeEnd = this.end.distanceInDays(outerRange.end)
      if(distanceToOuterRangeStart > 0) {
        return this.shiftDays(distanceToOuterRangeStart)
      }
      if(distanceToOuterRangeEnd < 0) {
        return this.shiftDays(distanceToOuterRangeEnd)
      }
      return this
    }
  }

  DateRange = $.extend(DateRange, {
    emptyRange: function() {
      function NullDateRange() {
        this.start = null
        this.end = null
        this.days = function() {
          return 0
        }
        this.shiftDays = $.noop
        this.hasDate = function() { return false }
        this.clone = function() { return DateRange.emptyRange() }
      }

      return new NullDateRange()
    },

    rangeWithMinimumSize: function(oldRange, minimumSize, disableWeekends, outerRange) {
      if(isTooSmallSelection()) {
        var newRange = oldRange.expandDaysTo(minimumSize)
        if(disableWeekends && newRange.hasEndsOnWeekend()) {
          var shiftedDays = newRange.shiftDays(delta(newRange.end.getDay())).shiftInside(outerRange)
          while(!shiftedDays.isPermittedRange(minimumSize, disableWeekends, outerRange) || shiftedDays.end.compareTo(outerRange.end) > 0) {
            if(!shiftedDays.isPermittedRange(minimumSize, false, outerRange)) {
              return DateRange.emptyRange()
            }
            shiftedDays = shiftedDays.shiftDays(1)
          }
          newRange = shiftedDays
        }
        if(!newRange.isPermittedRange(minimumSize, false, outerRange)) {
          return DateRange.emptyRange()
        }
        return newRange
      }
      return oldRange

      function isTooSmallSelection() { return minimumSize && oldRange.days() <= minimumSize }

      function delta(x) { return -((x + 1) % 7 + 1) }
    }
  })

  return DateRange
})
/*!
 * Tiny Scrollbar 1.66
 * http://www.baijs.nl/tinyscrollbar/
 *
 * Copyright 2010, Maarten Baijs
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Date: 13 / 11 / 2011
 * Depends on library: jQuery
 * 
 */

;(function($){
	$.tiny = $.tiny || { };
	
	$.tiny.scrollbar = {
		options: {	
			axis: 'y', // vertical or horizontal scrollbar? ( x || y ).
			wheel: 40,  //how many pixels must the mouswheel scroll at a time.
			scroll: true, //enable or disable the mousewheel;
			size: 'auto', //set the size of the scrollbar to auto or a fixed number.
			sizethumb: 'auto' //set the size of the thumb to auto or a fixed number.
		}
	};	
	
	$.fn.tinyscrollbar = function(options) { 
		var options = $.extend({}, $.tiny.scrollbar.options, options); 		
		this.each(function(){ $(this).data('tsb', new Scrollbar($(this), options)); });
		return this;
	};
	$.fn.tinyscrollbar_update = function(sScroll) { return $(this).data('tsb').update(sScroll); };
	
	function Scrollbar(root, options){
		var oSelf = this;
		var oWrapper = root;
		var oViewport = { obj: $('.viewport', root) };
		var oContent = { obj: $('.overview', root) };
		var oScrollbar = { obj: $('.scrollbar', root) };
		var oTrack = { obj: $('.track', oScrollbar.obj) };
		var oThumb = { obj: $('.thumb', oScrollbar.obj) };
		var sAxis = options.axis == 'x', sDirection = sAxis ? 'left' : 'top', sSize = sAxis ? 'Width' : 'Height';
		var iScroll, iPosition = { start: 0, now: 0 }, iMouse = {};

		function initialize() {	
			oSelf.update();
			setEvents();
			return oSelf;
		}
		this.update = function(sScroll){
      var axis = options.axis;
      oViewport[axis] = oViewport.obj[0]['offset'+ sSize];
			oContent[axis] = oContent.obj[0]['scroll'+ sSize];
      var content = oContent[axis];
      var viewport = oViewport[axis];
      oContent.ratio = viewport / content;
			oScrollbar.obj.toggleClass('disable', oContent.ratio >= 1);
			oTrack[axis] = options.size == 'auto' ? viewport : options.size;
      var track = oTrack[axis];
      oThumb[axis] = Math.min(track, Math.max(0, ( options.sizethumb == 'auto' ? (track * oContent.ratio) : options.sizethumb )));
      var thumb = oThumb[axis];
      oScrollbar.ratio = options.sizethumb == 'auto' ? (content / track) : (content - viewport) / (track - thumb);
			iScroll = (sScroll == 'relative' && oContent.ratio <= 1) ? Math.min((content - viewport), Math.max(0, iScroll)) : 0;
			iScroll = (sScroll == 'bottom' && oContent.ratio <= 1) ? (content - viewport) : isNaN(parseInt(sScroll)) ? iScroll : parseInt(sScroll);
			setSize();
		};
		function setSize(){
			oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
			oContent.obj.css(sDirection, -iScroll);
			iMouse['start'] = oThumb.obj.offset()[sDirection];
			var sCssSize = sSize.toLowerCase(); 
			oScrollbar.obj.css(sCssSize, oTrack[options.axis]);
			oTrack.obj.css(sCssSize, oTrack[options.axis]);
			oThumb.obj.css(sCssSize, oThumb[options.axis]);		
		};		
		function setEvents(){
			oThumb.obj.bind('mousedown', start);
			oThumb.obj[0].ontouchstart = function(oEvent){
				oEvent.preventDefault();
				oThumb.obj.unbind('mousedown');
				start(oEvent.touches[0]);
				return false;
			};	
			oTrack.obj.bind('mouseup', drag);
			if(options.scroll && this.addEventListener){
				oWrapper[0].addEventListener('DOMMouseScroll', wheel, false);
				oWrapper[0].addEventListener('mousewheel', wheel, false );
			}
			else if(options.scroll){oWrapper[0].onmousewheel = wheel;}
		};
		function start(oEvent){
			iMouse.start = sAxis ? oEvent.pageX : oEvent.pageY;
			var oThumbDir = parseInt(oThumb.obj.css(sDirection));
			iPosition.start = oThumbDir == 'auto' ? 0 : oThumbDir;
			$(document).bind('mousemove', drag);
			document.ontouchmove = function(oEvent){
				$(document).unbind('mousemove');
				drag(oEvent.touches[0]);
			};
			$(document).bind('mouseup', end);
			oThumb.obj.bind('mouseup', end);
			oThumb.obj[0].ontouchend = document.ontouchend = function(oEvent){
				$(document).unbind('mouseup');
				oThumb.obj.unbind('mouseup');
				end(oEvent.touches[0]);
			};
			return false;
		};		
		function wheel(oEvent){
			if(!(oContent.ratio >= 1)){
				var oEvent = oEvent || window.event;
				var iDelta = oEvent.wheelDelta ? oEvent.wheelDelta/120 : -oEvent.detail/3;
				iScroll -= iDelta * options.wheel;
				iScroll = Math.min((oContent[options.axis] - oViewport[options.axis]), Math.max(0, iScroll));
				oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
				oContent.obj.css(sDirection, -iScroll);
				
				oEvent = $.event.fix(oEvent);
				oEvent.preventDefault();
			};
		};
		function end(oEvent){
			$(document).unbind('mousemove', drag);
			$(document).unbind('mouseup', end);
			oThumb.obj.unbind('mouseup', end);
			document.ontouchmove = oThumb.obj[0].ontouchend = document.ontouchend = null;
			return false;
		};
		function drag(oEvent){
			if(!(oContent.ratio >= 1)){
				iPosition.now = Math.min((oTrack[options.axis] - oThumb[options.axis]), Math.max(0, (iPosition.start + ((sAxis ? oEvent.pageX : oEvent.pageY) - iMouse.start))));
				iScroll = iPosition.now * oScrollbar.ratio;
				oContent.obj.css(sDirection, -iScroll);
				oThumb.obj.css(sDirection, iPosition.now);
			}
			return false;
		};
		
		return initialize();
	};
})(jQuery);
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
  if (typeof define === 'function' && define.amd) {
    define(['jquery','tinyscrollbar', './DateFormat', './DateLocale', './DateRange', './DateTime'], function($, _tinyscrollbar, DateFormat, DateLocale, DateRange, DateTime) {
      factory($, DateFormat, DateLocale, DateRange, DateTime)
    })
  } else {
    factory(root.jQuery, root.DateFormat, root.DateLocale, root.DateRange, root.DateTime)
  }
})(this, function($, DateFormat, DateLocale, DateRange, DateTime) {
  $.fn.continuousCalendar = function(options) {
    return this.each(function() { _continuousCalendar.call($(this), options) })
    function _continuousCalendar(options) {
      $(this).addClass('continuousCalendarContainer').append('&nbsp;') //IE fix for popup version

      var defaults = {
        weeksBefore: 26,
        weeksAfter: 26,
        firstDate: null,
        lastDate: null,
        startField: $('input.startDate', this),
        endField: $('input.endDate', this),
        isPopup: false,
        selectToday: false,
        locale: DateLocale.DEFAULT,
        disableWeekends: false,
        disabledDates: null,
        minimumRange: -1,
        selectWeek: false,
        fadeOutDuration: 0,
        callback: $.noop,
        customScroll : false
      }
      var params = $.extend({}, defaults, options)
      params.locale = DateLocale.fromArgument(params.locale)
      var Status = {
        CREATE_OR_RESIZE: 'create',
        MOVE: 'move',
        NONE: 'none'
      }
      var startDate = fieldDate(params.startField)
      var endDate = fieldDate(params.endField)
      var today = DateTime.now()

      if(params.selectToday) {
        var formattedToday = formatDate(today)
        startDate = today
        endDate = today
        setStartField(formattedToday)
        setEndField(formattedToday)
      }
      var firstWeekdayOfGivenDate = params.locale.getFirstDateOfWeek(startDate || today)
      var container = this,
        dateCells = [],
        dateCellDates = [],
        dateCellMap = {},
        mouseDownDate = null, averageCellHeight,
        yearTitle,
        selection,
        oldSelection,
        calendarRange,
        status = Status.NONE,
        calendarContainer,
        scrollContent,
        beforeFirstOpening = true,
        bodyTable,
        calendar,
        customScrollContainer

      createCalendar()

      function createCalendar() {
        calendar = $.extend(popUpBehaviour(params.isPopup), dateBehaviour(isRange()))
        selection = startDate && endDate ? new DateRange(startDate, endDate, params.locale) : DateRange.emptyRange(params.locale);
        oldSelection = selection.clone()
        var rangeStart = params.firstDate ? DateFormat.parse(params.firstDate, params.locale) : firstWeekdayOfGivenDate.plusDays(-(params.weeksBefore * 7))
        var rangeEnd = params.lastDate ? DateFormat.parse(params.lastDate, params.locale) : firstWeekdayOfGivenDate.plusDays(params.weeksAfter * 7 + 6)
        params.disabledDates = params.disabledDates ? parseDisabledDates(params.disabledDates) : {}
        params.fadeOutDuration = parseInt(params.fadeOutDuration, 10)
        calendarRange = new DateRange(rangeStart, rangeEnd, params.locale)
        calendarContainer = getCalendarContainerOrCreateOne()
        calendarContainer.click(function(e) { e.stopPropagation() })
        if($('.startDateLabel', container).isEmpty()) {
          addDateLabels(container, calendar)
        }
        calendar.initUI()
        calendar.showInitialSelection()
        calendar.performTrigger()
      }
      function initScrollBar() {
        if(params.customScroll) {
          customScrollContainer = $('.tinyscrollbar', container);
          customScrollContainer.tinyscrollbar()
        }
      }

      function initCalendarTable() {
        if(scrollContent) return
        var headerTable = $('<table>').addClass('calendarHeader').append(headerRow())
        if(params.customScroll) {
          bodyTable = $('<table>').addClass('calendarBody').addClass('overview').append(calendarBody())
          scrollContent = $('<div>').addClass('calendarScrollContent').addClass('viewport').append(bodyTable)
          calendarContainer.append(headerTable)
            .append(
            $('<div class="tinyscrollbar"></div>')
              .append('<div class="scrollbar"> <div class="track"> <div class="thumb"> <div class="end"></div> </div> </div> </div>')
              .append(scrollContent))
        } else {
          bodyTable = $('<table>').addClass('calendarBody').append(calendarBody())
          scrollContent = $('<div>').addClass('calendarScrollContent').append(bodyTable)
          calendarContainer.append(headerTable).append(scrollContent)
        }
        dateCells = $('td.date', container).get()
        calendar.initState()
        calendar.addRangeLengthLabel()
        highlightToday()
        yearTitle = $('th.month', headerTable)
        bindScrollEvent()
        calendar.initEvents()
        if(!params.isPopup) {
          setYearLabel()
          scrollToSelection()
        }
      }

      function bindScrollEvent() {
        var didScroll = false
        scrollContent.scroll(function() {
          didScroll = true
        })

        setInterval(function() {
          if(didScroll) {
            didScroll = false
            setYearLabel()
          }
        }, 250)
      }

      function parseDisabledDates(dates) {
        var dateMap = {}
        $.each(dates.split(' '), function(index, date) { dateMap[DateFormat.parse(date).date] = true })
        return dateMap
      }

      function dateBehaviour(isRange) {
        var rangeVersion = {
          showInitialSelection: setRangeLabels,
          initEvents: function() {
            initRangeCalendarEvents(container, bodyTable)
            drawSelection()
          },
          addRangeLengthLabel: function() {
            if($('.rangeLengthLabel', container).isEmpty()) {
              var rangeLengthContainer = $('<div class="label"><span class="rangeLengthLabel"></span></div>')
              $('.continuousCalendar', container).append(rangeLengthContainer)
            }
          },
          addEndDateLabel: function(dateLabelContainer) { dateLabelContainer.append('<span class="separator"> - </span>').append('<span class="endDateLabel"></span>') },
          performTrigger: function() {
            container.data('calendarRange', selection)
            executeCallback(selection)
          }
        }
        var singleDateVersion = {
          showInitialSelection: function() {
            if(params.startField.val()) {
              setDateLabel(DateFormat.format(DateFormat.parse(params.startField.val()), params.locale.weekDateFormat, params.locale))
            }
          },
          initEvents: function() {
            initSingleDateCalendarEvents()
            var selectedDateKey = startDate && DateFormat.format(startDate, 'Ymd', params.locale)
            if(selectedDateKey in dateCellMap) {
              getDateCell(dateCellMap[selectedDateKey]).addClass('selected')
            }
          },
          addRangeLengthLabel: $.noop,
          addEndDateLabel: $.noop,
          performTrigger: function() {
            container.data('calendarRange', startDate)
            executeCallback(startDate)
          }
        }
        return isRange ? rangeVersion : singleDateVersion
      }

      function popUpBehaviour(isPopup) {
        var popUpVersion = {
          initUI: function() {
            calendarContainer.addClass('popup').hide()
            var icon = $('<a href="#" class="calendarIcon">' + today.getDate() + '</a>').click(toggleCalendar)
            container.prepend('<div></div>')
            container.prepend(icon)
          },
          initState: $.noop,
          getContainer: function(newContainer) { return $('<div>').addClass('popUpContainer').append(newContainer); },
          close: function(cell) { toggleCalendar.call(cell) },
          addDateLabelBehaviour: function(label) {
            label.addClass('clickable')
            label.click(toggleCalendar)
          }
        }
        var inlineVersion = {
          initUI: initCalendarTable,
          initState: calculateCellHeightAndSetScroll,
          getContainer: function(newContainer) {
            return newContainer
          },
          close: $.noop,
          addDateLabelBehaviour: $.noop
        }
        return isPopup ? popUpVersion : inlineVersion
      }

      function highlightToday() {
        var todayKey = DateFormat.format(today, 'Ymd', params.locale)
        if(todayKey in dateCellMap) {
          getDateCell(dateCellMap[todayKey]).addClass('today').wrapInner('<div>')
        }
      }

      function getCalendarContainerOrCreateOne() {
        var existingContainer = $('.continuousCalendar', container)
        if(existingContainer.exists()) {
          return existingContainer
        } else {
          var newContainer = $('<div>').addClass('continuousCalendar')
          container.append(calendar.getContainer(newContainer))
          return newContainer
        }
      }

      function addDateLabels(container, calendar) {
        var dateLabelContainer = $('<div class="label"><span class="startDateLabel"></span></div>')
        calendar.addEndDateLabel(dateLabelContainer)
        container.prepend(dateLabelContainer)
        calendar.addDateLabelBehaviour(dateLabelContainer.children())
      }

      function initRangeCalendarEvents(container, bodyTable) {
        $('span.rangeLengthLabel', container).text(params.locale.daysLabel(selection.days()))
        bodyTable.addClass(params.selectWeek ? 'weekRange' : 'freeRange')
        bodyTable.mousedown(mouseDown).mouseover(mouseMove).mouseup(mouseUp)
        disableTextSelection(bodyTable.get(0))
      }

      function scrollToSelection() {
          var selectionStartOrToday = $('.selected, .today', scrollContent).get(0)
          if(selectionStartOrToday) {
            var position = selectionStartOrToday.offsetTop - (scrollContent.height() - selectionStartOrToday.offsetHeight) / 2
            if(params.customScroll) {
              var totalHeight = bodyTable.height()
              var maxScroll = totalHeight - scrollContent.height()
              var validPosition = position > maxScroll ? maxScroll : position
              customScrollContainer.tinyscrollbar_update(validPosition > 0 ? validPosition : 0)
            } else {
              scrollContent.scrollTop(position)
          }
        }
      }

      function setYearLabel() {
        var scrollContent = $('.calendarScrollContent', container).get(0)
        var table = $('table', scrollContent).get(0)
        var rowNumber = parseInt(scrollContent.scrollTop / averageCellHeight)
        var date = getElemDate(table.rows[rowNumber].cells[2])
        yearTitle.text(date.getFullYear())
      }

      function headerRow() {
        var tr = $('<tr>').append(yearCell())
        tr.append($('<th class="week">&nbsp;</th>'))
        $(params.locale.dayNames).each(function(index) {
          //TODO move to DateLocale
          var weekDay = $('<th>').append(params.locale.dayNames[(index + params.locale.firstWeekday) % 7].substr(0, 2)).addClass('weekDay')
          tr.append(weekDay)
        })
        return $('<thead>').append(tr)
        function yearCell() { return $('<th>').addClass('month').append(firstWeekdayOfGivenDate.getFullYear()) }
      }

      function calculateCellHeightAndSetScroll() {
        initScrollBar()
        calculateCellHeight()
        scrollToSelection()
      }

      function calculateCellHeight() { averageCellHeight = parseInt(bodyTable.height() / $('tr', bodyTable).size()) }

      function toggleCalendar() {
        initCalendarTable()
        if(calendarContainer.is(':visible')) {
          calendarContainer.fadeOut(params.fadeOutDuration)
          $(document).unbind('click.continuousCalendar')
        } else {
          calendarContainer.show()
          if(beforeFirstOpening) {
            initScrollBar()
            calculateCellHeight()
            setYearLabel()
            beforeFirstOpening = false
          }
          scrollToSelection()
          $(document).bind('click.continuousCalendar', toggleCalendar)

        }
        return false
      }

      function calendarBody() {
        var firstWeekDay = params.locale.getFirstDateOfWeek(calendarRange.start)
        var isFirst = true;
        var rows = []
        while(firstWeekDay.compareTo(calendarRange.end) <= 0) {
          calendarRow(rows, firstWeekDay.clone(), isFirst)
          isFirst = false
          firstWeekDay = firstWeekDay.plusDays(7)
        }
        return '<tbody>' + rows.join('') + '</tbody>'
      }

      function calendarRow(rows, firstDayOfWeek, isFirst) {
        rows.push('<tr>')
        rows.push(monthCell(firstDayOfWeek, isFirst))
        rows.push(weekCell(firstDayOfWeek))
        for(var i = 0; i < 7; i++) {
          var date = firstDayOfWeek.plusDays(i)
          rows.push(dateCell(date))
        }
        rows.push('</tr>')
      }

      function dateCell(date) {
        var dateCell = '<td class="' + dateStyles(date) + '" date-cell-index="' + dateCellDates.length + '">' + date.getDate() + '</td>'
        dateCellMap[DateFormat.format(date, 'Ymd', params.locale)] = dateCellDates.length
        dateCellDates.push(date)
        return dateCell
      }

      function monthCell(firstDayOfWeek, isFirst) {
        var th = '<th class="month ' + backgroundBy(firstDayOfWeek)
        if(isFirst || firstDayOfWeek.getDate() <= 7) {
          th += ' monthName">'
          th += params.locale.monthNames[firstDayOfWeek.getMonth()]
        } else {
          th += '">'
          if(firstDayOfWeek.getDate() <= 7 * 2 && firstDayOfWeek.getMonth() == 0) {
            th += firstDayOfWeek.getFullYear()
          }
        }
        return th + '</th>'
      }

      function weekCell(firstDayOfWeek) { return '<th class="week ' + backgroundBy(firstDayOfWeek) + '">' + firstDayOfWeek.getWeekInYear('ISO') + '</th>' }

      function dateStyles(date) { return $.trim(['date', backgroundBy(date), disabledOrNot(date), todayStyle(date), holidayStyle(date)].sort().join(' ')) }

      function backgroundBy(date) { return date.isOddMonth() ? 'odd' : '' }

      function disabledOrNot(date) {
        var disabledWeekendDay = params.disableWeekends && date.isWeekend()
        var disabledDay = params.disabledDates[date.getOnlyDate().date]
        var outOfBounds = !calendarRange.hasDate(date)
        return outOfBounds || disabledWeekendDay || disabledDay ? 'disabled' : ''
      }

      function todayStyle(date) { return date.isToday() ? 'today' : '' }

      function holidayStyle(date) { return date.getDay() == 0 ? 'holiday' : '' }

      function initSingleDateCalendarEvents() {
        $('.date', container).bind('click', function() {
          var dateCell = $(this)
          if(dateCell.hasClass('disabled')) return
          $('td.selected', container).removeClass('selected')
          dateCell.addClass('selected')
          var selectedDate = getElemDate(dateCell.get(0));
          params.startField.val(DateFormat.shortDateFormat(selectedDate, params.locale))
          setDateLabel(DateFormat.format(selectedDate, params.locale.weekDateFormat, params.locale))
          calendar.close(this)
          executeCallback(selectedDate)
        })
      }

      function startNewRange() { selection = new DateRange(mouseDownDate, mouseDownDate, params.locale) }

      function mouseDown(event) {
        var elem = event.target

        if(isInstantSelection(event)) {
          selection = instantSelection(event)
          return
        }

        status = Status.CREATE_OR_RESIZE
        mouseDownDate = getElemDate(elem)

        if(mouseDownDate.equalsOnlyDate(selection.end)) {
          mouseDownDate = selection.start
          return
        }
        if(mouseDownDate.equalsOnlyDate(selection.start)) {
          mouseDownDate = selection.end
          return
        }
        if(selection.hasDate(mouseDownDate)) {
          status = Status.MOVE
          return
        }

        if(enabledCell(elem)) {
          startNewRange()
        }

        function enabledCell(elem) { return isDateCell(elem) && isEnabled(elem) }

        function isInstantSelection(event) {
          if(params.selectWeek) {
            return enabledCell(event.target) || isWeekCell(event.target)
          } else {
            return isWeekCell(event.target) || isMonthCell(event.target) || event.shiftKey
          }
        }

        function instantSelection(event) {
          var elem = event.target
          if((params.selectWeek && enabledCell(elem)) || isWeekCell(elem)) {
            status = Status.NONE
            var firstDayOfWeek = getElemDate($(elem).parent().children('.date').get(0))
            return instantSelectWeek(firstDayOfWeek)
          } else if(isMonthCell(elem)) {
            status = Status.NONE
            var dayInMonth = getElemDate($(elem).siblings('.date').get(0))
            return new DateRange(dayInMonth.firstDateOfMonth(), dayInMonth.lastDateOfMonth(), params.locale)
          } else if(event.shiftKey) {
            if(selection.days() > 0 && enabledCell(elem)) {
              status = Status.NONE
              selection = selection.expandTo(getElemDate(elem))
              return selection
            }
          }
          return selection
        }

        function instantSelectWeek(firstDayOfWeek) {
          var firstDay = firstDayOfWeek
          var lastDay = firstDayOfWeek.plusDays(6)
          if(params.disableWeekends) {
            firstDay = firstDayOfWeek.withWeekday(DateLocale.MONDAY)
            lastDay = firstDayOfWeek.withWeekday(DateLocale.FRIDAY)
          }
          return new DateRange(firstDay, lastDay, params.locale).and(calendarRange)
        }
      }

      function mouseMove(event) {
        if(status == Status.NONE) {
          return
        }
        var date = getElemDate(event.target)
          ;
        ({
          move: function() {
            var deltaDays = mouseDownDate.distanceInDays(date)
            var movedSelection = selection.shiftDays(deltaDays).and(calendarRange)
            if(isPermittedRange(movedSelection)) {
              mouseDownDate = date
              selection = movedSelection
            }
          },
          create: function() {
            var newSelection = new DateRange(mouseDownDate, date, params.locale)
            if(isEnabled(event.target) && isPermittedRange(newSelection)) {
              selection = newSelection
            }
          }

        })[status]()
        drawSelection()
      }

      function isPermittedRange(newSelection) { return newSelection.isPermittedRange(params.minimumRange, params.disableWeekends, calendarRange) }

      function mouseUp() {
        status = Status.NONE
        drawSelection()
        afterSelection()
      }

      function drawSelection() {
        selection = DateRange.rangeWithMinimumSize(selection, params.minimumRange, params.disableWeekends, calendarRange)
        drawSelectionBetweenDates(selection)
        $('span.rangeLengthLabel', container).text(params.locale.daysLabel(selection.days()))
      }

      function drawSelectionBetweenDates(range) {
        $('td.selected', container).removeClass('selected').removeClass('rangeStart').removeClass('rangeEnd')
        //iterateAndToggleCells(oldSelection.start, oldSelection.end)
        iterateAndToggleCells(range)
        oldSelection = range.clone()
      }

      function iterateAndToggleCells(range) {
        if(range.days() == 0) return
        var startIndex = dateCellMap[DateFormat.format(range.start, 'Ymd', params.locale)]
        var endIndex = dateCellMap[DateFormat.format(range.end, 'Ymd', params.locale)]
        for(var i = startIndex; i <= endIndex; i++) {
          setDateCellStyle(i, range.start, range.end)
        }
      }

      function setDateCellStyle(i, start, end) {
        var date = dateCellDates[i]
        var elem = getDateCell(i).get(0)
        var styleClass = [dateStyles(date)]
        if(date.equalsOnlyDate(end)) {
          styleClass.push('selected rangeEnd')
        } else {
          if(date.equalsOnlyDate(start)) {
            styleClass.push('selected rangeStart')
          } else {
            if(date.isBetweenDates(start, end)) {
              styleClass.push('selected')
            }
          }
        }
        elem.className = styleClass.join(' ')
      }

      function afterSelection() {
        var formattedStart = formatDate(selection.start)
        var formattedEnd = formatDate(selection.end)
        container.data('calendarRange', selection)
        setStartField(formattedStart)
        setEndField(formattedEnd)
        setRangeLabels()
        if(params.selectWeek) {
          calendar.close($('td.selected', container).first())
        }
        executeCallback(selection)
      }

      function setRangeLabels() {
        if(selection.start && selection.end) {
          var format = params.locale.weekDateFormat
          $('span.startDateLabel', container).text(DateFormat.format(selection.start, format, params.locale))
          $('span.endDateLabel', container).text(DateFormat.format(selection.end, format, params.locale))
          $('span.separator', container).show()
        } else {
          $('span.separator', container).hide()
        }
      }

      function fieldDate(field) { return field.length > 0 && field.val().length > 0 ? DateFormat.parse(field.val()) : null; }

      function disableTextSelection(elem) {
        if($.browser.mozilla) {//Firefox
          $(elem).css('MozUserSelect', 'none')
        } else {
          if($.browser.msie) {//IE
            $(elem).bind('selectstart', function() {
              return false
            })
          } else {//Opera, etc.
            $(elem).mousedown(function() {
              return false
            })
          }
        }
      }

      function executeCallback(selection) {
        params.callback.call(container, selection)
        container.trigger('calendarChange', selection)
      }

      function isDateCell(elem) { return $(elem).closest('[date-cell-index]').hasClass('date') }

      function isWeekCell(elem) { return $(elem).hasClass('week') }

      function isMonthCell(elem) { return $(elem).hasClass('month') }

      function isEnabled(elem) { return !$(elem).hasClass('disabled') }

      function getElemDate(elem) { return dateCellDates[$(elem).closest('[date-cell-index]').attr('date-cell-index')] }

      function getDateCell(index) { return $(dateCells[index]) }

      function setStartField(value) { params.startField.val(value) }

      function setEndField(value) { params.endField.val(value) }

      function formatDate(date) { return DateFormat.shortDateFormat(date, params.locale) }

      function setDateLabel(val) { $('span.startDateLabel', container).text(val) }

      function isRange() { return params.endField && params.endField.length > 0 }
    }
  }
  $.fn.calendarRange = function() { return $(this).data('calendarRange') }
  $.fn.exists = function() { return this.length > 0 }
  $.fn.isEmpty = function() { return this.length == 0 }
})
