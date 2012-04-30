$.continuousCalendar = {};$.continuousCalendar.version = '';$.continuousCalendar.released = '2012-05-04'
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
function DateRange(date1, date2, locale) {
  var _hasTimes = false
  if(!date1 || !date2) {
    throw('two dates must be specified, date1=' + date1 + ', date2=' + date2)
  }
  this.start = date1.compareTo(date2) > 0 ? date2 : date1
  this.end = date1.compareTo(date2) > 0 ? date1 : date2
  this.locale = Locale.fromArgument(locale)
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
    var date = dateWithoutTime.clone()
    date.setHours(parsedTime[0])
    date.setMinutes(parsedTime[1])
    date.setMilliseconds(0)
    return date
  },

  hours: function() { return this._hours; },

  minutes: function() { return this._minutes; },

  hasDate: function(date) { return date.isBetweenDates(this.start, this.end); },

  isValid: function() { return this._valid && this.end.getTime() - this.start.getTime() >= 0; },

  days: function() {
    if(this._hasTimes) {
      return this._days
    } else {
      return Math.round(this.start.distanceInDays(this.end) + 1)
    }
  },

  shiftDays: function(days) { return new DateRange(this.start.plusDays(days), this.end.plusDays(days), this.locale) },

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
    return new DateRange(newStart, newEnd, this.locale)
  },

  expandDaysTo: function(days) { return new DateRange(this.start, this.start.plusDays(days - 1), this.locale) },

  hasValidSize: function(minimumDays) { return minimumDays < 0 || this.days() >= minimumDays },

  hasValidSizeAndEndsOnWorkWeek: function(minimumDays) { return this.hasValidSize(minimumDays) && this.hasEndsOnWeekend() },

  and: function(that) {
    var latestStart = this.start.compareTo(that.start) > 0 ? this.start : that.start
    var earliestEnd = this.end.compareTo(that.end) > 0 ? that.end : this.end
    if(latestStart.compareTo(earliestEnd) < 0) {
      return new DateRange(latestStart, earliestEnd, this.locale)
    } else {
      return DateRange.emptyRange()
    }
  },

  isInside: function(outer) { return this.start.compareTo(outer.start) >= 0 && this.end.compareTo(outer.end) <= 0 },

  hasEndsOnWeekend: function() { return this.start.isWeekend() || this.end.isWeekend() },

  //TODO make immutable
  setTimes: function(startTimeStr, endTimeStr) {
    var parsedStartTime = DateTime.parseTime(startTimeStr)
    var parsedEndTime = DateTime.parseTime(endTimeStr)
    if(parsedStartTime && parsedEndTime) {
      this._valid = true
      this._hasTimes = true
      this.start = this._dateWithTime(this.start, parsedStartTime)
      this.end = this._dateWithTime(this.end, parsedEndTime)
      this._setDaysHoursAndMinutes()
    } else {
      this._valid = false
    }
    return this._valid
  },

  clone: function() { return new DateRange(this.start, this.end, this.locale) },

  toString: function() {
    if(this._hasTimes) {
      return  this.locale.daysLabel(this.days()) + ' ' + this.locale.hoursLabel(this.hours(), this.minutes())
    } else {
      return this.start.dateFormat(this.locale.shortDateFormat) + ' - ' + this.end.dateFormat(this.locale.shortDateFormat)
    }
  },

  printDefiningDuration: function() {
    var years = parseInt(this.days() / 360, 10)
    if(years > 0) return this.locale.yearsLabel(years)

    var months = parseInt(this.days() / 30, 10)
    if(months > 0) return this.locale.monthsLabel(months)

    return this.locale.daysLabel(this.days())
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
        return 0;
      }
      this.shiftDays = $.noop
      this.hasDate = function() { return false; }
      this.clone = function() { return DateRange.emptyRange() }
    }

    return new NullDateRange()
  },

  parse: function(dateStr1, dateStr2, dateFormat) { return new DateRange(Date.parseDate(dateStr1, dateFormat), Date.parseDate(dateStr2, dateFormat)) },

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

    function isTooSmallSelection() { return minimumSize && oldRange.days() <= minimumSize; }

    function delta(x) { return -((x + 1) % 7 + 1) }
  }
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

/*
 * @author Igor Vaynberg (ivaynberg)
 * @author Karri-Pekka Laakso (kplaakso)
 * @author Eero Anttila (eeroan)
 */

DateTime = function(date, locale) {
  if(typeof date == 'string') this.date = new Date(date)
  else this.date = date || new Date()
  this.locale = Locale.fromArgument(locale)
}

//TODO remove these later
DateTime.prototype.getTime = function() { return this.date.getTime() }

DateTime.prototype.getDate = function() { return this.date.getDate() }

DateTime.prototype.getMonth = function() { return this.date.getMonth() }

DateTime.prototype.getHours = function() { return this.date.getHours() }

DateTime.prototype.getHours = function() { return this.date.getHours() }

DateTime.prototype.getFullYear = function() { return this.date.getFullYear() }

DateTime.prototype.getYear = function() { return this.date.getYear() }

DateTime.prototype.getDay = function() { return this.date.getDay() }

DateTime.prototype.setTime = function(time) { this.date.setTime(time) }

DateTime.prototype.setHours = function(hours) { this.date.setHours(hours) }

DateTime.prototype.setMinutes = function(minutes) { this.date.setMinutes(minutes) }

DateTime.prototype.setMilliseconds = function(ms) { this.date.setMilliseconds(ms) }

DateTime.DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
DateTime.SECOND = 1000
DateTime.MINUTE = 60 * DateTime.SECOND
DateTime.HOUR = 60 * DateTime.MINUTE
DateTime.DAY = 24 * DateTime.HOUR
DateTime.WEEK = 7 * DateTime.DAY

//TODO remove these
DateTime.MONDAY = 1
DateTime.FRIDAY = 5
DateTime.SUNDAY = 0

DateTime.NOW = new DateTime()
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
  newDateTime.setTime(this.getTime() + days * DateTime.DAY)

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
    newDateTime.setTime(newDateTime.getTime() + (delta * DateTime.HOUR))
  }
  return newDateTime
}

DateTime.prototype.plusYears = function(years) {
  var newDateTime = this.clone()
  newDateTime.setFullYear(this.getFullYear() + years)
  return newDateTime()
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

DateTime.prototype.compareDateOnlyTo = function(DateTime) {
  if(!DateTime) {
    return 1
  }
  return this.stripped().compareTo(DateTime.stripped())
}

DateTime.prototype.isToday = function() { return this.equalsOnlyDate(DateTime.NOW) }

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

DateTime.prototype.getFirstDateOfWeek = function(firstDayOfWeek) {
  if(firstDayOfWeek < this.getDay()) {
    return this.plusDays(firstDayOfWeek - this.getDay())
  } else {
    if(firstDayOfWeek > this.getDay()) {
      return this.plusDays(firstDayOfWeek - this.getDay() - 7)
    } else {
      return this.clone()
    }
  }

}

DateTime.prototype.hasMonthChangedOnPreviousWeek = function(firstDayOfWeek) {
  var thisFirst = this.getFirstDateTimeOfWeek(firstDayOfWeek)
  var lastFirst = thisFirst.plusDays(-7)
  return thisFirst.getMonth() != lastFirst.getMonth()
}

//TODO refactor
DateTime.prototype.clone = function() { return new DateTime(new Date(this.getTime())) }

DateTime.prototype.isOddMonth = function() { return this.getMonth() % 2 != 0 }

DateTime.prototype.equalsOnlyDate = function(date) {
  if(!date) {
    return false
  }
  return this.getMonth() == date.getMonth() && this.getDate() == date.getDate() && this.getYear() == date.getYear()
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

DateTime.parseFunctions = {count:0}
DateTime.parseRegexes = []
DateTime.formatFunctions = {count:0}

//TODO refactor next three functions
DateTime.prototype.dateFormat = function(format) {
  if(DateTime.formatFunctions[format] == null) {
    this.createNewFormat(format)
  }
  var func = DateTime.formatFunctions[format]
  return this[func]()
}

DateTime.prototype.createNewFormat = function(format) {
  var funcName = "format" + DateTime.formatFunctions.count++
  DateTime.formatFunctions[format] = funcName
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
        code += this.getFormatCode(ch)
      }
    }
  }
  eval(code.substring(0, code.length - 3) + ";}")
}

DateTime.prototype.getFormatCode = function(character) {
  switch(character) {
    case "d":
      return "String.leftPad(this.getDate(), 2, '0') + "
    case "D":
      return "this.locale.dayNames[this.getDay()].substring(0, 3) + "
    case "j":
      return "this.getDate() + "
    case "l":
      return "this.locale.dayNames[this.getDay()] + "
    case "S":
      return "this.getSuffix() + "
    case "w":
      return "this.getDay() + "
    case "z":
      return "this.getDayOfYear() + "
    case "W":
      return "this.getWeekOfYear() + "
    case "F":
      return "this.locale.monthNames[this.getMonth()] + "
    case "m":
      return "String.leftPad(this.getMonth() + 1, 2, '0') + "
    case "M":
      return "this.locale.monthNames[this.getMonth()].substring(0, 3) + "
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

//TODO rename
DateTime.parseDate = function(input, format) {
  if(input == 'today') {
    return DateTime.NOW
  }
  if(DateTime.parseFunctions[format] == null) {
    DateTime.createParser(format)
  }
  var func = DateTime.parseFunctions[format]
  return DateTime[func](input)
}

DateTime.createParser = function(format) {
  var funcName = "parse" + DateTime.parseFunctions.count++
  var regexNum = DateTime.parseRegexes.length
  var currentGroup = 1
  DateTime.parseFunctions[format] = funcName

  var code = "DateTime." + funcName + " = function(input){\n" +
    "var y = -1, m = -1, d = -1, h = -1, i = -1, s = -1;\n" +
    "var d = DateTime.NOW;\n" + "y = d.getFullYear();\n" +
    "m = d.getMonth();\n" +
    "d = d.getDate();\n" +
    "var results = input.match(DateTime.parseRegexes[" + regexNum + "]);\n" +
    "if (results && results.length > 0) {"
  var regex = ""

  var special = false
  var ch = ''
  for(var i = 0; i < format.length; ++i) {
    ch = format.charAt(i)
    if(!special && ch == "\\") {
      special = true
    } else {
      if(special) {
        special = false
        regex += String.escape(ch)
      } else {
        var obj = DateTime.formatCodeToRegex(ch, currentGroup)
        currentGroup += obj.g
        regex += obj.s
        if(obj.g && obj.c) {
          code += obj.c
        }
      }
    }
  }

  code += "if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)\n" +
    "{return new DateTime(new Date(y, m, d, h, i, s));}\n" +
    "else if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)\n" +
    "{return new DateTime(new Date(y, m, d, h, i));}\n" +
    "else if (y > 0 && m >= 0 && d > 0 && h >= 0)\n" +
    "{return new DateTime(new Date(y, m, d, h));}\n" +
    "else if (y > 0 && m >= 0 && d > 0)\n" +
    "{return new DateTime(new Date(y, m, d));}\n" +
    "else if (y > 0 && m >= 0)\n" +
    "{return new DateTime(new Date(y, m));}\n" +
    "else if (y > 0)\n" +
    "{return new DateTime(new Date(y));}\n" +
    "}return null;}"

  DateTime.parseRegexes[regexNum] = new RegExp("^" + regex + "$")
  eval(code)
}

DateTime.formatCodeToRegex = function(character, currentGroup) {
  switch(character) {
    case "D":
      return {g:0,
        c:null,
        s:"(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)"}
    case "j":
    case "d":
      return {g:1,
        c:"d = parseInt(results[" + currentGroup + "], 10);\n",
        s:"(\\d{1,2})"}
    case "l":
      return {g:0,
        c:null,
        s:"(?:" + DateTime.dayNames.join("|") + ")"}
    case "S":
      return {g:0,
        c:null,
        s:"(?:st|nd|rd|th)"}
    case "w":
      return {g:0,
        c:null,
        s:"\\d"}
    case "z":
      return {g:0,
        c:null,
        s:"(?:\\d{1,3})"}
    case "W":
      return {g:0,
        c:null,
        s:"(?:\\d{2})"}
    case "F":
      //TODO add locale as parameter
      return {g:1,
        c:"m = parseInt(DateTime.monthNumbers[results[" + currentGroup + "].substring(0, 3)], 10);\n",
        s:"(" + Locale.DEFAULT.monthNames.join("|") + ")"}
    case "M":
      return {g:1,
        c:"m = parseInt(DateTime.monthNumbers[results[" + currentGroup + "]], 10);\n",
        s:"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"}
    case "n":
    case "m":
      return {g:1,
        c:"m = parseInt(results[" + currentGroup + "], 10) - 1;\n",
        s:"(\\d{1,2})"}
    case "t":
      return {g:0,
        c:null,
        s:"\\d{1,2}"}
    case "L":
      return {g:0,
        c:null,
        s:"(?:1|0)"}
    case "Y":
      return {g:1,
        c:"y = parseInt(results[" + currentGroup + "], 10);\n",
        s:"(\\d{4})"}
    case "y":
      return {g:1,
        c:"var ty = parseInt(results[" + currentGroup + "], 10);\n" + "y = ty > DateTime.y2kYear ? 1900 + ty : 2000 + ty;\n",
        s:"(\\d{1,2})"}
    case "a":
      return {g:1,
        c:"if (results[" + currentGroup + "] == 'am') {\n" + "if (h == 12) { h = 0; }\n" + "} else { if (h < 12) { h += 12; }}",
        s:"(am|pm)"}
    case "A":
      return {g:1,
        c:"if (results[" + currentGroup + "] == 'AM') {\n" + "if (h == 12) { h = 0; }\n" + "} else { if (h < 12) { h += 12; }}",
        s:"(AM|PM)"}
    case "g":
    case "G":
    case "h":
    case "H":
      return {g:1,
        c:"h = parseInt(results[" + currentGroup + "], 10);\n",
        s:"(\\d{1,2})"}
    case "i":
      return {g:1,
        c:"i = parseInt(results[" + currentGroup + "], 10);\n",
        s:"(\\d{2})"}
    case "s":
      return {g:1,
        c:"s = parseInt(results[" + currentGroup + "], 10);\n",
        s:"(\\d{2})"}
    case "O":
      return {g:0,
        c:null,
        s:"[+-]\\d{4}"}
    case "T":
      return {g:0,
        c:null,
        s:"[A-Z]{3}"}
    case "Z":
      return {g:0,
        c:null,
        s:"[+-]\\d{1,5}"}
    case ".":
      return {g:0,
        c:null,
        s:"\\."}
    default:
      return {g:0,
        c:null,
        s:String.escape(character)}
  }
}

DateTime.prototype.getTimezone = function() {
  return this.toString().replace(/^.*? ([A-Z]{3}) [0-9]{4}.*$/, "$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, "$1$2$3")
}

DateTime.prototype.getGMTOffset = function() {
  return (this.getTimezoneOffset() > 0 ? "-" : "+") +
    String.leftPad(Math.floor(this.getTimezoneOffset() / 60), 2, "0") +
    String.leftPad(this.getTimezoneOffset() % 60, 2, "0")
}

DateTime.prototype.getDayOfYear = function() {
  var num = 0
  DateTime.daysInMonth[1] = this.isLeapYear() ? 29 : 28
  for(var i = 0; i < this.getMonth(); ++i) {
    num += DateTime.daysInMonth[i]
  }
  return num + this.getDate() - 1
}

DateTime.prototype.getWeekOfYear = function() {
  // Skip to Thursday of this week
  var now = this.getDayOfYear() + (4 - this.getDay())
  // Find the first Thursday of the year
  var jan1 = new Date(this.getFullYear(), 0, 1)
  var then = (7 - jan1.getDay() + 4)
  document.write(then)
  return String.leftPad(((now - then) / 7) + 1, 2, "0")
}

DateTime.prototype.isLeapYear = function() {
  var year = this.getFullYear()
  return ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)))
}

DateTime.prototype.getFirstDayOfMonth = function() {
  var day = (this.getDay() - (this.getDate() - 1)) % 7
  return (day < 0) ? (day + 7) : day
}

DateTime.prototype.getLastDayOfMonth = function() {
  var day = (this.getDay() + (DateTime.daysInMonth[this.getMonth()] - this.getDate())) % 7
  return (day < 0) ? (day + 7) : day
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

String.escape = function(string) { return string.replace(/('|\\)/g, "\\$1") }

String.leftPad = function (val, size, ch) {
  var result = new String(val)
  if(ch == null) {
    ch = " "
  }
  while(result.length < size) {
    result = ch + result
  }
  return result
}

DateTime.daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31]
DateTime.y2kYear = 50
DateTime.monthNumbers = {
  Jan:0,
  Feb:1,
  Mar:2,
  Apr:3,
  May:4,
  Jun:5,
  Jul:6,
  Aug:7,
  Sep:8,
  Oct:9,
  Nov:10,
  Dec:11}
DateTime.patterns = {
  ISO8601LongPattern:"Y-m-d H:i:s",
  ISO8601ShortPattern:"Y-m-d",
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
DateTime.parseTime = function parseTime(timeStr) {
  var splittedTime = splitTime(timeStr.replace(/:|,/i, '.'))
  var time = [parseInt(splittedTime[0], 10), parseInt(splittedTime[1], 10)]
  return (isHour(time[0]) && isMinute(time[1])) ? time : null

  function splitTime(timeStr) {
    if(timeStr.indexOf('.') != -1) {
      return  timeStr.split('.')
    }
    switch(timeStr.length) {
      case 4: return [timeStr.slice(0, 2) ,timeStr.slice(2, 4)]
      case 3: return [timeStr.slice(0, 1) ,timeStr.slice(1, 3)]
      case 2: return [timeStr, 0]
      default: return [-1,-1]
    }
  }

  function isMinute(minutes) { return !isNaN(minutes) && minutes >= 0 && minutes <= 59 }

  function isHour(hours) { return !isNaN(hours) && hours >= 0 && hours <= 23 }
}


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
;
(function($) {
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
        locale: Locale.DEFAULT,
        disableWeekends: false,
        disabledDates: null,
        minimumRange: -1,
        selectWeek: false,
        fadeOutDuration: 0,
        callback: $.noop
      }
      var params = $.extend(defaults, options)
      var Status = {
        CREATE_OR_RESIZE: 'create',
        MOVE: 'move',
        NONE: 'none'
      }
      var startDate = fieldDate(params.startField)
      var endDate = fieldDate(params.endField)
      if(params.selectToday) {
        var today = DateTime.NOW
        var formattedToday = formatDate(today)
        startDate = today
        endDate = today
        setStartField(formattedToday)
        setEndField(formattedToday)
      }
      var firstWeekdayOfGivenDate = (startDate || DateTime.NOW).getFirstDateOfWeek(params.locale.firstWeekday)
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
        calendar

      createCalendar()

      function createCalendar() {
        calendar = $.extend(popUpBehaviour(params.isPopup), dateBehaviour(isRange()))
        selection = startDate && endDate ? new DateRange(startDate, endDate) : DateRange.emptyRange();
        oldSelection = selection.clone()
        var rangeStart = params.firstDate ? DateTime.parseDate(params.firstDate, params.locale.shortDateFormat) : firstWeekdayOfGivenDate.plusDays(-(params.weeksBefore * 7))
        var rangeEnd = params.lastDate ? DateTime.parseDate(params.lastDate, params.locale.shortDateFormat) : firstWeekdayOfGivenDate.plusDays(params.weeksAfter * 7 + 6)
        params.disabledDates = params.disabledDates ? parseDisabledDates(params.disabledDates) : {}
        params.fadeOutDuration = parseInt(params.fadeOutDuration, 10)
        calendarRange = new DateRange(rangeStart, rangeEnd)
        calendarContainer = getCalendarContainerOrCreateOne()
        calendarContainer.click(function(e) { e.stopPropagation() })
        if($('.startDateLabel', container).isEmpty()) {
          addDateLabels(container, calendar)
        }
        calendar.initUI()
        calendar.showInitialSelection()
        calendar.performTrigger()
      }

      function initCalendarTable() {
        if(scrollContent) return
        var headerTable = $('<table>').addClass('calendarHeader').append(headerRow())
        bodyTable = $('<table>').addClass('calendarBody').append(calendarBody())
        scrollContent = $('<div>').addClass('calendarScrollContent').append(bodyTable)
        calendarContainer.append(headerTable).append(scrollContent)
        dateCells = $('td.date', container).get()
        calendar.initState()
        calendar.addRangeLengthLabel()
        highlightToday()
        yearTitle = $('th.month', headerTable)
        scrollContent.scroll(setYearLabel)
        if(!params.isPopup) {
          setYearLabel()
          scrollToSelection()
        }
        calendar.initEvents()
      }

      function parseDisabledDates(dates) {
        var dateMap = {}
        $.each(dates.split(' '), function(index, date) { dateMap[DateTime.parseDate(date, params.locale.shortDateFormat).date] = true })
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
              setDateLabel(DateTime.parseDate(params.startField.val(), params.locale.shortDateFormat).dateFormat(params.locale.weekDateFormat))
            }
          },
          initEvents: function() {
            initSingleDateCalendarEvents()
            var selectedDateKey = startDate && startDate.dateFormat('Ymd')
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
            var icon = $('<a href="#" class="calendarIcon">' + DateTime.NOW.getDate() + '</a>').click(toggleCalendar)
            container.prepend('<div></div>')
            container.prepend(icon)
          },
          initState: $.noop,
          getContainer: function(newContainer) { return $('<div>').addClass('popUpContainer').append(newContainer); },
          addCloseButton: function(tr) {
            var close = $('<th><a href="#"><span>close</span></a></th>')
            $('a', close).click(toggleCalendar)
            tr.append(close)
          },
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
          addCloseButton: $.noop,
          close: $.noop,
          addDateLabelBehaviour: $.noop
        }
        return isPopup ? popUpVersion : inlineVersion
      }

      function highlightToday() {
        var todayKey = DateTime.NOW.dateFormat('Ymd')
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
          scrollContent.scrollTop(selectionStartOrToday.offsetTop - (scrollContent.height() - selectionStartOrToday.offsetHeight) / 2)
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
          var weekDay = $('<th>').append(params.locale.dayNames[(index + params.locale.firstWeekday) % 7].substr(0, 2)).addClass('weekDay')
          tr.append(weekDay)
        })
        calendar.addCloseButton(tr);
        return $('<thead>').append(tr)
        function yearCell() { return $('<th>').addClass('month').append(firstWeekdayOfGivenDate.getFullYear()) }
      }

      function calculateCellHeightAndSetScroll() {
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
        var firstWeekDay = calendarRange.start.getFirstDateOfWeek(params.locale.firstWeekday)
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
        dateCellMap[date.dateFormat('Ymd')] = dateCellDates.length
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
          params.startField.val(selectedDate.dateFormat(params.locale.shortDateFormat))
          setDateLabel(selectedDate.dateFormat(params.locale.weekDateFormat))
          calendar.close(this)
          executeCallback(selectedDate)
        })
      }

      function startNewRange() { selection = new DateRange(mouseDownDate, mouseDownDate) }

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
            return new DateRange(dayInMonth.firstDateOfMonth(), dayInMonth.lastDateOfMonth())
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
            firstDay = firstDayOfWeek.withWeekday(Locale.MONDAY)
            lastDay = firstDayOfWeek.withWeekday(Locale.FRIDAY)
          }
          return new DateRange(firstDay, lastDay).and(calendarRange)
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
            var newSelection = new DateRange(mouseDownDate, date)
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
        var startIndex = dateCellMap[range.start.dateFormat('Ymd')]
        var endIndex = dateCellMap[range.end.dateFormat('Ymd')]
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
          $('span.startDateLabel', container).text(selection.start.dateFormat(format))
          $('span.endDateLabel', container).text(selection.end.dateFormat(format))
          $('span.separator', container).show()
        } else {
          $('span.separator', container).hide()
        }
      }

      function fieldDate(field) { return field.length > 0 && field.val().length > 0 ? DateTime.parseDate(field.val(), params.locale.shortDateFormat) : null; }

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

      function isDateCell(elem) { return $(elem).hasClass('date') }

      function isWeekCell(elem) { return $(elem).hasClass('week') }

      function isMonthCell(elem) { return $(elem).hasClass('month') }

      function isEnabled(elem) { return !$(elem).hasClass('disabled') }

      function getElemDate(elem) { return dateCellDates[$(elem).closest('[date-cell-index]').attr('date-cell-index')] }

      function getDateCell(index) { return $(dateCells[index]) }

      function setStartField(value) { params.startField.val(value) }

      function setEndField(value) { params.endField.val(value) }

      function formatDate(date) { return date.dateFormat(params.locale.shortDateFormat) }

      function setDateLabel(val) { $('span.startDateLabel', container).text(val) }

      function isRange() { return params.endField && params.endField.length > 0 }
    }
  }
  $.fn.calendarRange = function() { return $(this).data('calendarRange') }
  $.fn.exists = function() { return this.length > 0 }
  $.fn.isEmpty = function() { return this.length == 0 }
})(jQuery)
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
Locale = {}

Locale.MONDAY = 1
Locale.FRIDAY = 5
Locale.SUNDAY = 0
Locale.hoursAndMinutes = function(hours, minutes) { return (Math.round((hours + minutes / 60) * 100) / 100).toString() }

Locale.FI = {
  monthNames: [
    'tammikuu',
    'helmikuu',
    'maaliskuu',
    'huhtikuu',
    'toukokuu',
    'kesäkuu',
    'heinäkuu',
    'elokuu',
    'syyskuu',
    'lokakuu',
    'marraskuu',
    'joulukuu'],
  dayNames: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
  yearsLabel: function(years) { return years + ' ' + (years == '1' ? 'vuosi' : 'vuotta'); },
  monthsLabel: function(months) { return months + ' ' + (months == '1' ? 'kuukausi' : 'kuukautta'); },
  daysLabel: function(days) { return days + ' ' + (days == '1' ? 'päivä' : 'päivää'); },
  hoursLabel: function(hours, minutes) {
    var hoursAndMinutes = Locale.hoursAndMinutes(hours, minutes).replace('.', ',')
    return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'tunti' : 'tuntia');
  },
  shortDateFormat: 'j.n.Y',
  weekDateFormat: 'D j.n.Y',
  dateTimeFormat: 'D j.n.Y k\\lo G:i',
  firstWeekday: Locale.MONDAY
}
Locale.EN = {
  monthNames: ['January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'],
  dayNames: ['Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'],
  yearsLabel: function(years) { return years + ' ' + (years == '1' ? 'Year' : 'Years'); },
  monthsLabel: function(months) { return months + ' ' + (months == '1' ? 'Months' : 'Months'); },
  daysLabel: function(days) { return days + ' ' + (days == '1' ? 'Day' : 'Days'); },
  hoursLabel: function(hours, minutes) {
    var hoursAndMinutes = Locale.hoursAndMinutes(hours, minutes)
    return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Hour' : 'Hours');
  },
  shortDateFormat: 'n/j/Y',
  weekDateFormat: 'D n/j/Y',
  dateTimeFormat: 'D n/j/Y G:i',
  firstWeekday: Locale.SUNDAY
};
Locale.AU = {
  monthNames: ['January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'],
  dayNames: ['Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'],
  yearsLabel: function(years) { return years + ' ' + (years == '1' ? 'Year' : 'Years'); },
  monthsLabel: function(months) { return months + ' ' + (months == '1' ? 'Months' : 'Months'); },
  daysLabel: function(days) { return days + ' ' + (days == '1' ? 'Day' : 'Days'); },
  hoursLabel: function(hours, minutes) {
    var hoursAndMinutes = Locale.hoursAndMinutes(hours, minutes)
    return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Hour' : 'Hours');
  },
  shortDateFormat: 'j/n/Y',
  weekDateFormat: 'D j/n/Y',
  dateTimeFormat: 'D j/n/Y G:i',
  firstWeekday: Locale.SUNDAY
}
Locale.DEFAULT = Locale.EN

Locale.fromArgument = function(stringOrObject) {
  if(typeof stringOrObject == 'string')
    return Locale[stringOrObject]
  else return stringOrObject || Locale.DEFAULT
}