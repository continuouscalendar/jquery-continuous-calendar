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

DateTime = function(date) {
  if(typeof date == 'string') this.date = new Date(date)
  else this.date = date || new Date()
}

DateTime.prototype.getTime = function() { return this.date.getTime() }

DateTime.prototype.getDate = function() { return this.date.getDate() }

DateTime.prototype.getMonth = function() { return this.date.getMonth() }

DateTime.prototype.getHours = function() { return this.date.getHours() }

DateTime.prototype.getHours = function() { return this.date.getHours() }

DateTime.prototype.getFullYear = function() { return this.date.getFullYear() }

DateTime.prototype.getDay = function() { return this.date.getDay() }

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

DateTime.prototype.getGMTOffset = function() {
  return (this.date.getTimezoneOffset() > 0 ? "-" : "+") +
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

String.escape = function(string) { return string.replace(/('|\\)/g, "\\$1") }

String.leftPad = function(val, size, ch) {
  var result = new String(val)
  if(ch == null) {
    ch = " "
  }
  while(result.length < size) {
    result = ch + result
  }
  return result
}

DateTime.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
DateTime.y2kYear = 50
DateTime.monthNumbers = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
