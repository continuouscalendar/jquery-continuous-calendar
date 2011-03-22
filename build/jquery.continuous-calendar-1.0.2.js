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

Date.DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
Date.SECOND = 1000
Date.MINUTE = 60 * Date.SECOND
Date.HOUR = 60 * Date.MINUTE
Date.DAY = 24 * Date.HOUR
Date.WEEK = 7 * Date.DAY
Date.MONDAY = 1
Date.SUNDAY = 0
Date.NOW = new Date()
Date.getDaysInMonth = function(year, month) {
  if(((0 == (year % 4)) && ( (0 != (year % 100)) || (0 == (year % 400)))) && month == 1) {
    return 29
  } else {
    return Date.DAYS_IN_MONTH[month]
  }
}

Date.getDayInYear = function(year, month, day) {
  var days = 0
  for(var i = 0; i < month; i++) {
    days += Date.getDaysInMonth(year, i)
  }
  days += day
  return days
}

Date.prototype.getDaysInMonth = function() {
  return Date.getDaysInMonth(this.getFullYear(), this.getMonth())
}

Date.prototype.getDayInYear = function() {
  return Date.getDayInYear(this.getFullYear(), this.getMonth(), this.getDate())
}

Date.prototype.plusDays = function(days) {
  var newDate = this.clone()
  var hours = this.getHours()
  newDate.setTime(this.getTime() + days * Date.DAY)

  // Fix the date offset caused by daylight saving time
  var delta = hours - newDate.getHours()
  if(delta != 0) {
    // Correct the delta to be between [-12, 12]
    if(delta > 12) {
      delta -= 24
    }
    if(delta < -12) {
      delta += 24
    }
    newDate.setTime(newDate.getTime() + (delta * Date.HOUR))
  }
  return newDate
}

Date.prototype.plusYears = function(years) {
  var newDate = this.clone()
  newDate.setFullYear(this.getFullYear() + years)
  return newDate()
}

Date.prototype.stripped = function() {
  return new Date(parseInt(this.getTime() / Date.DAY, 10))
}

Date.prototype.compareTo = function(date) {
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

Date.prototype.compareDateOnlyTo = function(date) {
  if(!date) {
    return 1
  }
  return this.stripped().compareTo(date.stripped())
}

Date.prototype.isToday = function() {
  return this.equalsOnlyDate(Date.NOW)
}

Date.prototype.getWeekInYear = function(weekNumberingSystem) {
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
    return new Date(this.getFullYear() - 1, 11, 31).getWeekInYear('ISO')
  }

  var week = Math.ceil((this.getDayInYear() + firstDay - 1) / 7)

  // If first days of this year are on last year's last week, the above gives one week too much
  if(firstDay > THU) {
    week--
  }

  return week
}

Date.prototype.getFirstDateOfWeek = function(firstDayOfWeek) {
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

Date.prototype.hasMonthChangedOnPreviousWeek = function(firstDayOfWeek) {
  var thisFirst = this.getFirstDateOfWeek(firstDayOfWeek)
  var lastFirst = thisFirst.plusDays(-7)
  return thisFirst.getMonth() != lastFirst.getMonth()
}

Date.prototype.clone = function() {
  return new Date(this.getTime())
}

Date.prototype.isOddMonth = function() {
  return this.getMonth() % 2 != 0
}

Date.prototype.equalsOnlyDate = function(date) {
  if(!date) {
    return false
  }
  return this.getMonth() == date.getMonth() && this.getDate() == date.getDate() && this.getYear() == date.getYear()
}

Date.prototype.isBetweenDates = function(start, end) {
  return this.compareTo(start) >= 0 && this.compareTo(end) <= 0
}

Date.prototype.firstDateOfMonth = function() {
  return new Date((this.getMonth() + 1) + "/1/" + this.getFullYear())
}

Date.prototype.lastDateOfMonth = function() {
  return new Date((this.getMonth() + 1) + "/" + this.getDaysInMonth() + "/" + this.getFullYear())
}

Date.prototype.distanceInDays = function(date) {
  var first = parseInt(this.getTime() / Date.DAY, 10)
  var last = parseInt(date.getTime() / Date.DAY, 10)
  return (last - first)
}

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

Date.parseFunctions = {count:0}
Date.parseRegexes = []
Date.formatFunctions = {count:0}

Date.prototype.dateFormat = function(format) {
  if(Date.formatFunctions[format] == null) {
    Date.createNewFormat(format)
  }
  var func = Date.formatFunctions[format]
  return this[func]()
}

Date.createNewFormat = function(format) {
  var funcName = "format" + Date.formatFunctions.count++
  Date.formatFunctions[format] = funcName
  var code = "Date.prototype." + funcName + " = function(){return "
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
        code += Date.getFormatCode(ch)
      }
    }
  }
  eval(code.substring(0, code.length - 3) + ";}")
}

Date.getFormatCode = function(character) {
  switch(character) {
    case "d":
      return "String.leftPad(this.getDate(), 2, '0') + "
    case "D":
      return "Date.dayNames[this.getDay()].substring(0, 3) + "
    case "j":
      return "this.getDate() + "
    case "l":
      return "Date.dayNames[this.getDay()] + "
    case "S":
      return "this.getSuffix() + "
    case "w":
      return "this.getDay() + "
    case "z":
      return "this.getDayOfYear() + "
    case "W":
      return "this.getWeekOfYear() + "
    case "F":
      return "Date.monthNames[this.getMonth()] + "
    case "m":
      return "String.leftPad(this.getMonth() + 1, 2, '0') + "
    case "M":
      return "Date.monthNames[this.getMonth()].substring(0, 3) + "
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

Date.parseDate = function(input, format) {
  if(input == 'today') {
    return Date.NOW
  }
  if(Date.parseFunctions[format] == null) {
    Date.createParser(format)
  }
  var func = Date.parseFunctions[format]
  return Date[func](input)
}

Date.createParser = function(format) {
  var funcName = "parse" + Date.parseFunctions.count++
  var regexNum = Date.parseRegexes.length
  var currentGroup = 1
  Date.parseFunctions[format] = funcName

  var code = "Date." + funcName + " = function(input){\n" + "var y = -1, m = -1, d = -1, h = -1, i = -1, s = -1;\n" + "var d = Date.NOW;\n" + "y = d.getFullYear();\n" + "m = d.getMonth();\n" + "d = d.getDate();\n" + "var results = input.match(Date.parseRegexes[" + regexNum + "]);\n" + "if (results && results.length > 0) {"
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
        obj = Date.formatCodeToRegex(ch, currentGroup)
        currentGroup += obj.g
        regex += obj.s
        if(obj.g && obj.c) {
          code += obj.c
        }
      }
    }
  }

  code += "if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)\n" + "{return new Date(y, m, d, h, i, s);}\n" + "else if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)\n" + "{return new Date(y, m, d, h, i);}\n" + "else if (y > 0 && m >= 0 && d > 0 && h >= 0)\n" + "{return new Date(y, m, d, h);}\n" + "else if (y > 0 && m >= 0 && d > 0)\n" + "{return new Date(y, m, d);}\n" + "else if (y > 0 && m >= 0)\n" + "{return new Date(y, m);}\n" + "else if (y > 0)\n" + "{return new Date(y);}\n" + "}return null;}"

  Date.parseRegexes[regexNum] = new RegExp("^" + regex + "$")
  eval(code)
}

Date.formatCodeToRegex = function(character, currentGroup) {
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
        s:"(?:" + Date.dayNames.join("|") + ")"}
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
      return {g:1,
        c:"m = parseInt(Date.monthNumbers[results[" + currentGroup + "].substring(0, 3)], 10);\n",
        s:"(" + Date.monthNames.join("|") + ")"}
    case "M":
      return {g:1,
        c:"m = parseInt(Date.monthNumbers[results[" + currentGroup + "]], 10);\n",
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
        c:"var ty = parseInt(results[" + currentGroup + "], 10);\n" + "y = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n",
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
    default:
      return {g:0,
        c:null,
        s:String.escape(character)}
  }
}

Date.prototype.getTimezone = function() {
  return this.toString().replace(/^.*? ([A-Z]{3}) [0-9]{4}.*$/, "$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, "$1$2$3")
}

Date.prototype.getGMTOffset = function() {
  return (this.getTimezoneOffset() > 0 ? "-" : "+") + String.leftPad(Math.floor(this.getTimezoneOffset() / 60), 2, "0") + String.leftPad(this.getTimezoneOffset() % 60, 2, "0")
}

Date.prototype.getDayOfYear = function() {
  var num = 0
  Date.daysInMonth[1] = this.isLeapYear() ? 29 : 28
  for(var i = 0; i < this.getMonth(); ++i) {
    num += Date.daysInMonth[i]
  }
  return num + this.getDate() - 1
}

Date.prototype.getWeekOfYear = function() {
  // Skip to Thursday of this week
  var now = this.getDayOfYear() + (4 - this.getDay())
  // Find the first Thursday of the year
  var jan1 = new Date(this.getFullYear(), 0, 1)
  var then = (7 - jan1.getDay() + 4)
  document.write(then)
  return String.leftPad(((now - then) / 7) + 1, 2, "0")
}

Date.prototype.isLeapYear = function() {
  var year = this.getFullYear()
  return ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)))
}

Date.prototype.getFirstDayOfMonth = function() {
  var day = (this.getDay() - (this.getDate() - 1)) % 7
  return (day < 0) ? (day + 7) : day
}

Date.prototype.getLastDayOfMonth = function() {
  var day = (this.getDay() + (Date.daysInMonth[this.getMonth()] - this.getDate())) % 7
  return (day < 0) ? (day + 7) : day
}

Date.prototype.getDaysInMonth = function() {
  Date.daysInMonth[1] = this.isLeapYear() ? 29 : 28
  return Date.daysInMonth[this.getMonth()]
}

Date.prototype.getSuffix = function() {
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

Date.prototype.isWeekend = function() {
  return this.getDay() == 6 || this.getDay() == 0
}

String.escape = function(string) {
  return string.replace(/('|\\)/g, "\\$1")
}

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

Date.daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31]
Date.monthNames = ["January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"]
Date.dayNames = ["Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"]
Date.y2kYear = 50
Date.monthNumbers = {
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
Date.patterns = {
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
Date.parseTime = function parseTime(timeStr) {
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

  function isMinute(minutes) {
    return !isNaN(minutes) && minutes >= 0 && minutes <= 59
  }

  function isHour(hours) {
    return !isNaN(hours) && hours >= 0 && hours <= 23
  }
}

Date.hoursAndMinutes = function(hours, minutes) {
  return (Math.round((hours + minutes / 60) * 100) / 100).toString()
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
window.DATE_LOCALE_FI = {
  init: function() {
    Date.monthNames = [
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
      'joulukuu']
    Date.dayNames = ['Su','Ma','Ti','Ke','To','Pe','La']
    Date.daysLabel = function(days) {
      return days + ' ' + (days == '1' ? 'päivä' : 'päivää');
    }
    Date.hoursLabel = function(hours, minutes) {
      var hoursAndMinutes = Date.hoursAndMinutes(hours, minutes).replace('.', ',')
      return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'tunti' : 'tuntia');
    }
  },
  shortDateFormat: 'j.n.Y',
  weekDateFormat: 'D j.n.Y',
  dateTimeFormat: 'D j.n.Y k\\lo G:i',
  firstWeekday: Date.MONDAY
}
window.DATE_LOCALE_EN = {
  init: function() {
    Date.monthNames = ['January',
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
      'December']
    Date.dayNames = ['Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday']
    Date.daysLabel = function(days) {
      return days + ' ' + (days == '1' ? 'Day' : 'Days');
    }
    Date.hoursLabel = function(hours, minutes) {
      var hoursAndMinutes = Date.hoursAndMinutes(hours, minutes)
      return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Hour' : 'Hours');
    }
  },
  shortDateFormat: 'n/j/Y',
  weekDateFormat: 'D n/j/Y',
  dateTimeFormat: 'D n/j/Y G:i',
  firstWeekday: Date.SUNDAY
};
window.DATE_LOCALE_AU = {
  init: function() {
    Date.monthNames = ['January',
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
      'December']
    Date.dayNames = ['Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday']
    Date.daysLabel = function(days) {
      return (days - 1) + ' Days'
    }
    Date.hoursLabel = function(hours, minutes) {
      var hoursAndMinutes = Date.hoursAndMinutes(hours, minutes)
      return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Hour' : 'Hours');
    }
  },
  shortDateFormat: 'j/n/Y',
  weekDateFormat: 'D j/n/Y',
  dateTimeFormat: 'D j/n/Y G:i',
  firstWeekday: Date.SUNDAY
};/* ==============================================================================
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
function DateRange(date1, date2) {
  var hasTimes = false
  if(!date1 || !date2) {
    throw('two dates must be specified, date1=' + date1 + ', date2=' + date2)
  }
  this.start = date1.compareTo(date2) > 0 ? date2 : date1
  this.end = date1.compareTo(date2) > 0 ? date1 : date2
  var days
  var hours
  var minutes
  var valid = true
  this.hours = function() {
    return hours;
  }
  this.minutes = function() {
    return minutes;
  }
  this.hasDate = function(date) {
    return date.isBetweenDates(this.start, this.end);
  }
  this.isValid = function() {
    return valid && this.end.getTime() - this.start.getTime() >= 0;
  }
  this.days = function() {
    if(hasTimes) {
      return days
    } else {
      return Math.round(this.start.distanceInDays(this.end) + 1)
    }
  }
  this.shiftDays = function(days) {
    return new DateRange(this.start.plusDays(days), this.end.plusDays(days))
  }
  this.expandTo = function(date) {
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
  }

  this.expandDaysTo = function(days) {
    return new DateRange(this.start, this.start.plusDays(days - 1))
  }

  this.hasValidSize = function(minimumDays) {
    return minimumDays < 0 || this.days() >= minimumDays
  }

  this.hasValidSizeAndEndsOnWorkWeek = function(minimumDays) {
    return this.hasValidSize(minimumDays) && this.hasEndsOnWeekend()
  }

  this.and = function(that) {
    var latestStart = this.start.compareTo(that.start) > 0 ? this.start : that.start
    var earliestEnd = this.end.compareTo(that.end) > 0 ? that.end : this.end
    if(latestStart.compareTo(earliestEnd) < 0) {
      return new DateRange(latestStart, earliestEnd)
    } else {
      return DateRange.emptyRange()
    }
  }

  this.isInside = function(outer) {
    return this.start.compareTo(outer.start) >= 0 && this.end.compareTo(outer.end) <= 0
  }

  this.hasEndsOnWeekend = function() {
    return this.start.isWeekend() || this.end.isWeekend()
  }

  this.setTimes = function(startTimeStr, endTimeStr) {
    var parsedStartTime = Date.parseTime(startTimeStr)
    var parsedEndTime = Date.parseTime(endTimeStr)
    if(parsedStartTime && parsedEndTime) {
      valid = true
      hasTimes = true
      this.start = dateWithTime(this.start, parsedStartTime)
      this.end = dateWithTime(this.end, parsedEndTime)
      setDaysHoursAndMinutes.call(this)
    } else {
      valid = false
    }
    return valid
  }
  function setDaysHoursAndMinutes() {
    if(hasTimes) {
      var ms = parseInt((this.end.getTime() - this.start.getTime()))
      days = parseInt(ms / Date.DAY)
      ms = ms - (days * Date.DAY)
      hours = parseInt(ms / Date.HOUR)
      ms = ms - (hours * Date.HOUR)
      minutes = parseInt(ms / Date.MINUTE)
    }
  }

  function dateWithTime(dateWithoutTime, parsedTime) {
    var date = dateWithoutTime.clone()
    date.setHours(parsedTime[0])
    date.setMinutes(parsedTime[1])
    date.setMilliseconds(0)
    return date
  }

  this.clone = function() {
    return new DateRange(this.start, this.end)
  }

  this.toString = function(locale) {
    if(hasTimes) {
      return  Date.daysLabel(this.days()) + ' ' + Date.hoursLabel(this.hours(), this.minutes())
    } else {
      return this.start.dateFormat(locale.shortDateFormat) + ' - ' + this.end.dateFormat(locale.shortDateFormat)
    }
  }
  this.isPermittedRange = function(minimumSize, disableWeekends, outerRange) {
    return this.hasValidSize(minimumSize) && (!(disableWeekends && this.hasEndsOnWeekend())) && this.isInside(outerRange)
  }
}
DateRange.emptyRange = function() {
  function NullDateRange() {
    this.start = null
    this.end = null
    this.days = function() {
      return 0;
    }
    this.shiftDays = function() {
    }
    this.hasDate = function() {
      return false;
    }
    this.clone = function() {
      return DateRange.emptyRange()
    }
  }

  return new NullDateRange()
}
DateRange.parse = function(dateStr1, dateStr2, dateFormat) {
  return new DateRange(Date.parseDate(dateStr1, dateFormat), Date.parseDate(dateStr2, dateFormat))
}
DateRange.rangeWithMinimumSize = function(oldRange, minimumSize, disableWeekends, outerRange) {
  if(isTooSmallSelection()) {
    var newSelection = oldRange.expandDaysTo(minimumSize)
    if(disableWeekends && newSelection.hasEndsOnWeekend()) {
      var shiftedDays = newSelection.shiftDays(delta(newSelection.end.getDay()));
      while(!shiftedDays.isPermittedRange(minimumSize, disableWeekends, outerRange) || shiftedDays.end.compareTo(outerRange.end) > 0) {
        shiftedDays = shiftedDays.shiftDays(1)
      }
      newSelection = shiftedDays
    }
    return newSelection
  }
  return oldRange

  function isTooSmallSelection() {
    return minimumSize && oldRange.days() <= minimumSize;
  }

  function delta(x) {
    return -((x + 1) % 7 + 1)
  }
}/* ==============================================================================
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
    this.each(function() {
      _continuousCalendar.call($(this), options)
    })
    return this
    function _continuousCalendar(options) {
      $(this).addClass('continuousCalendarContainer')

      var defaults = {
        weeksBefore: 26,
        weeksAfter: 26,
        firstDate: null,
        lastDate: null,
        startField: $('input.startDate', this),
        endField: $('input.endDate', this),
        isPopup: false,
        selectToday: false,
        locale: DATE_LOCALE_EN,
        disableWeekends: false,
        minimumRange:-1,
        callback: function() {
        }
      }
      var params = $.extend(defaults, options)
      var Status = {
        CREATE_OR_RESIZE:'create',
        MOVE:'move',
        NONE:'none'
      }
      params.locale.init()
      var startDate = fieldDate(params.startField)
      var endDate = fieldDate(params.endField)
      if(params.selectToday) {
        var today = Date.NOW
        var formattedToday = formatDate(today)
        startDate = today
        endDate = today
        setStartField(formattedToday)
        setEndField(formattedToday)
      }
      var firstWeekdayOfGivenDate = (startDate || Date.NOW).getFirstDateOfWeek(params.locale.firstWeekday)
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
        var rangeStart = params.firstDate ? Date.parseDate(params.firstDate, params.locale.shortDateFormat) : firstWeekdayOfGivenDate.plusDays(-(params.weeksBefore * 7))
        var rangeEnd = params.lastDate ? Date.parseDate(params.lastDate, params.locale.shortDateFormat) : firstWeekdayOfGivenDate.plusDays(params.weeksAfter * 7 + 6)
        calendarRange = new DateRange(rangeStart, rangeEnd)
        var headerTable = $('<table>').addClass('calendarHeader').append(headerRow())
        bodyTable = $('<table>').addClass('calendarBody').append(calendarBody())
        scrollContent = $('<div>').addClass('calendarScrollContent').append(bodyTable)
        calendarContainer = getCalendarContainerOrCreateOne()
        calendarContainer.append(headerTable).append(scrollContent)
        calendar.initState()
        if($('.startDateLabel', container).isEmpty()) {
          addDateLabels(container, calendar)
        }
        calendar.addRangeLengthLabel()
        highlightToday()
        calendar.initEvents()
        yearTitle = $('th.month', headerTable)
        scrollContent.scroll(setYearLabel)
        scrollToSelection()
        container.data('calendarRange', selection)
        executeCallback()
      }

      function dateBehaviour(isRange) {
        var rangeVersion = {
          initEvents: function() {
            initRangeCalendarEvents(container, bodyTable)
            drawSelection()
          },
          addRangeLengthLabel: function() {
            if($('.rangeLengthLabel', container).isEmpty()) {
              var rangeLengthContainer = $('<div class="label">')
              rangeLengthContainer.append('<span class="rangeLengthLabel"></span>')
              $('.continuousCalendar', container).append(rangeLengthContainer)
            }
          },
          addEndDateLabel: function(dateLabelContainer) {
            dateLabelContainer.append('<span class="separator"> - </span>').append('<span class="endDateLabel"></span>')
          }
        }
        var singleDateVersion = {
          initEvents: function() {
            initSingleDateCalendarEvents()
            var selectedDateKey = startDate && startDate.dateFormat('Ymd')
            if(dateCellMap[selectedDateKey]) {
              dateCells[dateCellMap[selectedDateKey]].addClass('selected')
            }
          },
          addRangeLengthLabel: function() {
          },
          addEndDateLabel: function() {
          }
        }
        return isRange ? rangeVersion : singleDateVersion
      }

      function popUpBehaviour(isPopup) {
        var popUpVersion = {
          initState: function() {
            calendarContainer.addClass('popup').hide()
            var icon = $('<a href="#" class="calendarIcon">' + Date.NOW.getDate() + '</a>').click(toggleCalendar)
            container.append(icon)
          },
          getContainer: function(newContainer) {
            return $('<div>').addClass('popUpContainer').append(newContainer);
          },
          addCloseButton: function(tr) {
            var close = $('<th><a href="#"><span>close</span></a>')
            $('a', close).click(toggleCalendar)
            tr.append(close)
          },
          close: function(cell) {
            toggleCalendar.call(cell)
          }
        }
        var inlineVersion = {
          initState: calculateCellHeightAndSetScroll,
          getContainer: function(newContainer) {
            return newContainer
          },
          addCloseButton: function() {
          },
          close: function() {
          }
        }
        return isPopup ? popUpVersion : inlineVersion
      }

      function highlightToday() {
        var todayKey = Date.NOW.dateFormat('Ymd')
        if(dateCellMap[todayKey]) {
          dateCells[dateCellMap[todayKey]].addClass('today')
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
        var dateLabelContainer = $('<div class="label">')
        dateLabelContainer.append('<span class="startDateLabel"></span>')
        calendar.addEndDateLabel(dateLabelContainer)
        container.append(dateLabelContainer)
        dateLabelContainer.click(toggleCalendar)
      }

      function initRangeCalendarEvents(container, bodyTable) {
        $('span.rangeLengthLabel', container).text(Date.daysLabel(selection.days()))
        bodyTable.addClass('range')
        bodyTable.mousedown(mouseDown).mouseover(mouseMove).mouseup(mouseUp)
        disableTextSelection(bodyTable.get(0))
        setRangeLabels()
      }

      function scrollToSelection() {
        var selectionStartOrToday = $('.selected, .today', scrollContent).get(0)
        if(selectionStartOrToday) {
          scrollContent.scrollTop(selectionStartOrToday.offsetTop - (scrollContent.height() - selectionStartOrToday.offsetHeight) / 2)
        }
		setYearLabel()
      }

      function setYearLabel() {
        var scrollContent = this
        var table = $('table', scrollContent).get(0)
        var rowNumber = parseInt(scrollContent.scrollTop / averageCellHeight)
        var date = table.rows[rowNumber].cells[2].date
        yearTitle.text(date.getFullYear())
      }

      function headerRow() {
        var tr = $('<tr>').append(yearCell())
        tr.append($('<th class="week">&nbsp;</th>'))
        $(Date.dayNames).each(function(index) {
          var weekDay = $('<th>').append(Date.dayNames[(index + params.locale.firstWeekday) % 7].substr(0, 2)).addClass('weekDay')
          tr.append(weekDay)
        })
        calendar.addCloseButton(tr);
        return $('<thead>').append(tr)
        function yearCell() {
          return $('<th>').addClass('month').append(firstWeekdayOfGivenDate.getFullYear())
        }
      }

      function calculateCellHeightAndSetScroll() {
        calculateCellHeight()
        scrollToSelection()
      }

      function calculateCellHeight() {
        averageCellHeight = parseInt(bodyTable.height() / $('tr', bodyTable).size())
      }

      function toggleCalendar() {
        calendarContainer.toggle()
        if(beforeFirstOpening) {
          calculateCellHeight()
          beforeFirstOpening = false
        }
        scrollToSelection()
        return false
      }

      function calendarBody() {
        var tbody = $('<tbody>')
        var firstWeekDay = calendarRange.start.getFirstDateOfWeek(params.locale.firstWeekday)
        var isFirst = true;
        while(firstWeekDay.compareTo(calendarRange.end) <= 0) {
          tbody.append(calendarRow(firstWeekDay.clone(), isFirst))
          isFirst = false
          firstWeekDay = firstWeekDay.plusDays(7)
        }
        return tbody
      }

      function calendarRow(firstDayOfWeek, isFirst) {
        var tr = $('<tr>').append(monthCell(firstDayOfWeek, isFirst)).append(weekCell(firstDayOfWeek))
        for(var i = 0; i < 7; i++) {
          var date = firstDayOfWeek.plusDays(i)
          tr.append(dateCell(date))
        }
        return tr
      }

      function dateCell(date) {
        var dateCell = $('<td>').addClass(dateStyles(date)).append(date.getDate())
        dateCell.get(0).date = date
        dateCellMap[date.dateFormat('Ymd')] = dateCells.length
        dateCells.push(dateCell)
        dateCellDates.push(date)
        return dateCell
      }

      function monthCell(firstDayOfWeek, isFirst) {
        var th = $('<th>').addClass('month').addClass(backgroundBy(firstDayOfWeek))
        if(isFirst || firstDayOfWeek.getDate() <= 7) {
          th.append(Date.monthNames[firstDayOfWeek.getMonth()]).addClass('monthName')
        } else {
          if(firstDayOfWeek.getDate() <= 7 * 2 && firstDayOfWeek.getMonth() == 0) {
            th.append(firstDayOfWeek.getFullYear())
          }
        }
        return th
      }

      function weekCell(firstDayOfWeek) {
        return $('<th>').addClass('week').addClass(backgroundBy(firstDayOfWeek)).append(firstDayOfWeek.getWeekInYear('ISO'))
      }

      function dateStyles(date) {
        return $.trim(['date', backgroundBy(date), disabledOrNot(date), todayStyle(date)].sort().join(' '))
      }

      function backgroundBy(date) {
        return date.isOddMonth() ? 'odd' : ''
      }

      function disabledOrNot(date) {
        var disabledWeekendDay = params.disableWeekends && date.isWeekend()
        var outOfBounds = !calendarRange.hasDate(date)
        return outOfBounds || disabledWeekendDay ? 'disabled' : ''
      }

      function todayStyle(date) {
        return date.isToday() ? 'today' : ''
      }

      function initSingleDateCalendarEvents() {
        $('.date', container).bind('click', function() {
          var dateCell = $(this)
          if(dateCell.hasClass('disabled')) return
          $('td.selected', container).removeClass('selected')
          dateCell.addClass('selected')
          params.startField.val(date(dateCell).dateFormat(params.locale.shortDateFormat))
          setDateLabel(date(dateCell).dateFormat(params.locale.weekDateFormat))
          calendar.close(this)
          executeCallback()
        })

        if(params.startField.val()) {
          setDateLabel(Date.parseDate(params.startField.val(), params.locale.shortDateFormat).dateFormat(params.locale.weekDateFormat))
        }
      }

      function startNewRange() {
        selection = new DateRange(mouseDownDate, mouseDownDate)
      }

      function mouseDown(event) {
        var elem = event.target

        if(isInstantSelection(event)) {
          selection = instantSelection(event)
          return
        }

        status = Status.CREATE_OR_RESIZE
        mouseDownDate = elem.date

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

        function enabledCell(elem) {
          return isDateCell(elem) && isEnabled(elem)
        }

        function isInstantSelection(event) {
          return isWeekCell(event.target) || isMonthCell(event.target) || event.shiftKey
        }

        function instantSelection(event) {
          var elem = event.target
          if(isWeekCell(elem)) {
            status = Status.NONE
            var dayInWeek = date($(elem).siblings('.date'))
            return new DateRange(dayInWeek, dayInWeek.plusDays(6))
          } else if(isMonthCell(elem)) {
            status = Status.NONE
            var dayInMonth = date($(elem).siblings('.date'))
            return new DateRange(dayInMonth.firstDateOfMonth(), dayInMonth.lastDateOfMonth())
          } else if(event.shiftKey) {
            if(selection.days() > 0 && enabledCell(elem)) {
              status = Status.NONE
              selection = selection.expandTo(elem.date)
              return selection
            }
          }
          return selection
        }
      }

      function mouseMove(event) {
        if(status == Status.NONE) {
          return
        }
        var date = event.target.date
          ;
        ({
          move : function() {
            var deltaDays = mouseDownDate.distanceInDays(date)
            var movedSelection = selection.shiftDays(deltaDays).and(calendarRange)
            if(isPermittedRange(movedSelection)) {
              mouseDownDate = date
              selection = movedSelection
            }
          },
          create : function() {
            var newSelection = new DateRange(mouseDownDate, date)
            if(isEnabled(event.target) && isPermittedRange(newSelection)) {
              selection = newSelection
            }
          }

        })[status]()
        drawSelection()
      }

      function isPermittedRange(newSelection) {
        return newSelection.isPermittedRange(params.minimumRange, params.disableWeekends, calendarRange)
      }

      function mouseUp() {
        status = Status.NONE
        drawSelection()
        afterSelection()
      }

      function drawSelection() {
        selection = DateRange.rangeWithMinimumSize(selection, params.minimumRange, params.disableWeekends, calendarRange)
        drawSelectionBetweenDates(selection)
        $('span.rangeLengthLabel', container).text(Date.daysLabel(selection.days()))
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
        var elem = dateCells[i].get(0)
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
        executeCallback()
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

      function fieldDate(field) {
        if(field.length > 0 && field.val().length > 0) {
          return Date.parseDate(field.val(), params.locale.shortDateFormat)
        } else {
          return null
        }
      }

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

      function executeCallback() {
        params.callback.call(container, selection)
        container.trigger('calendarChange', selection)
      }

      function isDateCell(elem) {
        return $(elem).hasClass('date')
      }

      function isWeekCell(elem) {
        return $(elem).hasClass('week')
      }

      function isMonthCell(elem) {
        return $(elem).hasClass('month')
      }

      function isEnabled(elem) {
        return !$(elem).hasClass('disabled')
      }

      function date(elem) {
        return elem.get(0).date
      }

      function setStartField(value) {
        params.startField.val(value)
      }

      function setEndField(value) {
        params.endField.val(value)
      }

      function formatDate(date) {
        return date.dateFormat(params.locale.shortDateFormat)
      }

      function setDateLabel(val) {
        $('span.startDateLabel', container).text(val)
      }

      function isRange() {
        return params.endField && params.endField.length > 0
      }
    }
  }
  $.fn.calendarRange = function() {
    return $(this).data('calendarRange')
  }
  $.fn.exists = function() {
    return this.length > 0
  }
  $.fn.isEmpty = function() {
    return this.length == 0
  }
})(jQuery)
