;
(function(root, factory) {
  if(typeof define === "function" && define.amd) {
    define(["jquery"], factory)
  } else {
    root.DateTime = factory(root.jQuery)
  }
})(this, function($) {
  var DateTime = function(year, month, date, hours, minutes) {
    if(typeof year == 'string') this.date = new Date(year)
    else if(typeof year == 'object') this.date = year
    else if(typeof year == 'number') this.date = new Date(year, month - 1, date, hours, minutes, 0, 0)
    else this.date = new Date()
  }

  DateTime.SUNDAY = 0
  DateTime.MONDAY = 1
  DateTime.TUESDAY = 2
  DateTime.WEDNESDAY = 3
  DateTime.THURSDAY = 4
  DateTime.FRIDAY = 5
  DateTime.SATURDAY = 6

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

  /**
   * Returns date from ISO date ignoring time information
   * @param isoDateTime String YYYY-MM-DDTHH-MM
   * @return {DateTime}
   */
  DateTime.fromIsoDate = function(isoDateTime) {
    var date = parseDate(isoDateTime.split('T')[0])
    return new DateTime(date.year, date.month, date.day, 0, 0)
  }

  /**
   * Returns date with time from ISO date
   * @param isoDateTime String YYYY-MM-DDTHH-MM
   * @return {DateTime}
   */
  DateTime.fromIsoDateTime = function(isoDateTime) {
    var dateAndTime = isoDateTime.split('T')
    var time = parseTime(dateAndTime.length == 2 && dateAndTime[1])
    var date = parseDate(dateAndTime[0])
    return new DateTime(date.year, date.month, date.day, time.hours, time.minutes)
  }

  function parseDate(str) {
    var dateComponents = str.split('-')
    return {
      year : +dateComponents[0],
      month: +dateComponents[1],
      day  : +dateComponents[2]
    }
  }

  function parseTime(str) {
    if(str) {
      var timeComponents = str.split(':')
      return {
        hours  : +timeComponents[0],
        minutes: +timeComponents[1],
        seconds: +timeComponents[2] || 0
      }
    } else {
      return { hours: 0, minutes: 0 }
    }
  }

  DateTime.prototype.withTime = function(h, m) {
    if(typeof h == 'string') {
      var hoursAndMinutes = h.split(':')
      h = hoursAndMinutes[0]
      m = hoursAndMinutes[1]
    }
    var dateWithTime = this.clone()
    dateWithTime.date.setHours(h)
    dateWithTime.date.setMinutes(m)
    dateWithTime.date.setSeconds(0)
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
    if(weekday == 0) weekday = 7
    if(firstDay == 0) firstDay = 7
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
    if(firstDay > THU) week--
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

  DateTime.prototype.isWeekend = function() { return this.getDay() == 6 || this.getDay() == 0 }

  DateTime.prototype.toString = function() { return this.date.toISOString() }

  DateTime.prototype.getFirstDateOfWeek = function(locale) {
    var firstWeekday = locale ? locale.firstWeekday : DateTime.MONDAY
    if(firstWeekday < this.getDay()) return this.plusDays(firstWeekday - this.getDay())
    else if(firstWeekday > this.getDay()) return this.plusDays(firstWeekday - this.getDay() - 7)
    else return this.clone()
  }

  DateTime.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  DateTime.y2kYear = 50
  DateTime.monthNumbers = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }

  return DateTime
})
