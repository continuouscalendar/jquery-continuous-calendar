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
    define("DateFormat", ["DateTime"], factory)
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
          code += "'" + String.escape(ch) + "' + "
        } else {
          code += DateFormat.getFormatCode(ch, locale)
        }
      }
    }
    eval(code.substring(0, code.length - 3) + ";}")
  }

  DateFormat.getFormatCode = function(character, locale) {
    switch(character) {
      case "d":
        return "String.leftPad(this.getDate(), 2, '0') + "
      case "D":
        return "locale.dayNames[this.getDay()].substring(0, 3) + "
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
        return "this.getWeekOfYear() + "
      case "F":
        return "locale.monthNames[this.getMonth()] + "
      case "m":
        return "String.leftPad(this.getMonth() + 1, 2, '0') + "
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
        return "String.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + "
      case "H":
        return "String.leftPad(this.getHours(), 2, '0') + "
      case "i":
        return "String.leftPad(this.getMinutes(), 2, '0') + "
      case "s":
        return "String.leftPad(this.getSeconds(), 2, '0') + "
      case "O":
        return "this.getGMTOffset() + "
      case "T":
        return "this.getTimezone() + "
      case "Z":
        return "(this.getTimezoneOffset() * -60) + "
      default:
        return "'" + String.escape(character) + "' + "
    }
  }

  return DateFormat
})
