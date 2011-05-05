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
Date.FRIDAY = 5
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

Date.prototype.withWeekday = function(weekday) {
  return this.plusDays(weekday - this.getDay())
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

