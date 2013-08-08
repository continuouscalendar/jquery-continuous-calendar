define(function(require) {
  var $ = require('jquery')

  function DateTime(year, month, date, hours, minutes, seconds) {
    if(arguments.length === 0) this.date = new Date()
    else if(year instanceof Date) this.date = new Date(year.getTime())
    else if(year instanceof DateTime) this.date = new Date(year.date.getTime())
    else if(typeof year === 'string') this.date = new Date(year)
    else if(typeof year === 'number') this.date = createSafeDate(+year, +month, +date, +hours, +minutes, +seconds)
    else throw Error('None of supported parameters was used for constructor: ' + Array.prototype.slice.call(arguments).join(', '))

    function createSafeDate(year, month, date, hours, minutes, seconds) {
      hours = hours || 0
      minutes = minutes || 0
      seconds = seconds || 0
      var newDate = new Date(year, month -1, date, hours, minutes, seconds, 0)
      if(newDate.toString() === 'Invalid Date' ||
          month !== newDate.getMonth() + 1 ||
          year !== newDate.getFullYear() ||
          date !== newDate.getDate() ||
          hours !== newDate.getHours() ||
          minutes !== newDate.getMinutes() ||
          seconds !== newDate.getSeconds()) throw Error('Invalid Date: ' + year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds)
      return  newDate
    }
  }

  DateTime.SUNDAY = 0
  DateTime.MONDAY = 1
  DateTime.TUESDAY = 2
  DateTime.WEDNESDAY = 3
  DateTime.THURSDAY = 4
  DateTime.FRIDAY = 5
  DateTime.SATURDAY = 6

  DateTime.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  DateTime.y2kYear = 50
  DateTime.monthNumbers = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }

  DateTime.fromDateTime = function(year, month, day, hours, minutes) {
    return new DateTime(year, month, day, hours, minutes)
  }

  DateTime.fromDate = function(year, month, day) {
    return DateTime.fromDateTime(year, month, day, 0, 0)
  }

  DateTime.fromDateObject = function(date) {
    return DateTime.fromMillis(date.getTime())
  }

  /**
   * Returns date from ISO date ignoring time information
   * @param isoDate String YYYY-MM-DDTHH-MM
   * @return {DateTime}
   */
  DateTime.fromIsoDate = function(isoDate) {
    var optionalTimePattern = /^\d{4}-[01]\d-[0-3]\d(T[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z?))?$/
    if(!optionalTimePattern.test(isoDate)) throw Error(isoDate + ' is not valid ISO Date (YYYY-MM-DD or YYYY-MM-DDTHH:MM)')
    var date = parseDate(isoDate.split('T')[0])
    return DateTime.fromDate(date.year, date.month, date.day)
  }

  /**
   * Returns date with time from ISO date
   * @param isoDateTime String YYYY-MM-DDTHH-MM
   * @return {DateTime}
   */
  DateTime.fromIsoDateTime = function(isoDateTime) {
    var fullPatternTest = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z?)/
    if(!fullPatternTest.test(isoDateTime)) throw Error(isoDateTime + ' is not valid ISO Date (YYYY-MM-DDTHH:MM)')

    var dateAndTime = isoDateTime.split('T')
    var time = parseTime(dateAndTime.length === 2 && dateAndTime[1])
    var date = parseDate(dateAndTime[0])
    return new DateTime(date.year, date.month, date.day, time.hours, time.minutes, time.seconds)
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

  DateTime.fromMillis = function(ms) { return new DateTime(new Date(ms)) }

  $.each([
    'getTime',
    'getFullYear',
    'getDate',
    'getDay',
    'getHours',
    'getMinutes',
    'getSeconds',
    'getMilliseconds'
  ], function(_index, func) {
    DateTime.prototype[func] = function() { return this.date[func]() }
  })

  DateTime.prototype.withResetMS = function() {
    var newDate = this.clone()
    newDate.date.setMilliseconds(0)
    return newDate
  }

  DateTime.prototype.withTime = function(h, m) {
    if(typeof h === 'string') {
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

  DateTime.SECOND = 1000
  DateTime.MINUTE = 60 * DateTime.SECOND
  DateTime.HOUR = 60 * DateTime.MINUTE
  DateTime.DAY = 24 * DateTime.HOUR
  DateTime.WEEK = 7 * DateTime.DAY

  DateTime.now = function() {
    if(typeof DateTime._now === 'undefined') {
      DateTime._now = new DateTime()
    }
    return DateTime._now
  }

  DateTime.today = function() {
    if(typeof DateTime._today == 'undefined') {
      DateTime._today = new DateTime().getOnlyDate()
    }
    return DateTime._today
  }

  DateTime.getDaysInMonth = function(year, month) {
    if(month > 12 || month < 1)
      throw new Error('Month must be between 1-12')
    var yearAndMonth = year * 12 + month
    return DateTime.fromDate(Math.floor(yearAndMonth / 12), yearAndMonth % 12 + 1, 1).minusDays(1).getDate()
  }

  DateTime.getDayInYear = function(year, month, day) {
    return DateTime.fromDate(year, 1, 1).distanceInDays(DateTime.fromDate(year, month, day)) + 1
  }

  DateTime.prototype.getDaysInMonth = function() { return DateTime.getDaysInMonth(this.getFullYear(), this.getMonth()) }

  DateTime.prototype.getDayInYear = function() { return DateTime.getDayInYear(this.getFullYear(), this.getMonth(), this.getDate()) }

  DateTime.prototype.plusDays = function(days) {
    var newDateTime = this.clone()
    var hours = this.getHours()
    newDateTime.date.setTime(this.getTime() + days * DateTime.DAY)

    // Fix the DateTime offset caused by daylight saving time
    var delta = hours - newDateTime.getHours()
    if(delta !== 0) {
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

  DateTime.prototype.minusDays = function(days) {
    return this.plusDays(-days)
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

  DateTime.prototype.isToday = function() { return this.equalsOnlyDate(DateTime.today()) }

  DateTime.prototype.getWeekInYear = function(weekNumberingSystem) {
    if(weekNumberingSystem !== 'US' && weekNumberingSystem !== 'ISO') {
      throw('Week numbering system must be either US or ISO, was ' + weekNumberingSystem)
    }

    var firstDay = new Date(this.getFullYear(), 0, 1).getDay()
    if(weekNumberingSystem === 'US') {
      return Math.ceil((this.getDayInYear() + firstDay) / 7)
    }
    var THU = 4
    var weekday = this.getDay()
    if(weekday === 0) weekday = 7
    if(firstDay === 0) firstDay = 7
    // If Dec 29 falls on Mon, Dec 30 on Mon or Tue, Dec 31 on Mon - Wed, it's on the first week of next year
    if(this.getMonth() === 12 && this.getDate() >= 29 && (this.getDate() - weekday) > 27) {
      return 1
    }
    // If Jan 1-3 falls on Fri, Sat or Sun, it's on the last week of the previous year
    if(this.getMonth() === 1 && this.getDate() < 4 && weekday > THU) {
      return new DateTime(new Date(this.getFullYear() - 1, 11, 31)).getWeekInYear('ISO')
    }
    var week = Math.ceil((this.getDayInYear() + firstDay - 1) / 7)
    // If first days of this year are on last year's last week, the above gives one week too much
    if(firstDay > THU) week--
    return week
  }

  DateTime.prototype.clone = function() { return new DateTime(this.date) }

  DateTime.prototype.isOddMonth = function() { return this.getMonth() % 2 === 0 }

  DateTime.prototype.equalsOnlyDate = function(date) {
    if(!date) {
      return false
    }
    return this.getMonth() === date.getMonth() && this.getDate() === date.getDate() && this.getFullYear() === date.getFullYear()
  }

  DateTime.prototype.isBetweenDates = function(start, end) {
    if(start.getTime() > end.getTime()) throw Error("start date can't be after end date")
    var onlyDate = this.getOnlyDate()
    return onlyDate.compareTo(start.getOnlyDate()) >= 0 && onlyDate.compareTo(end.getOnlyDate()) <= 0
  }

  DateTime.prototype.firstDateOfMonth = function() { return DateTime.fromDate(this.getFullYear(), this.getMonth(), 1) }

  DateTime.prototype.lastDateOfMonth = function() { return DateTime.fromDate(this.getFullYear(), this.getMonth(), this.getDaysInMonth()) }

  DateTime.prototype.distanceInDays = function(date) {
    var first = parseInt(this.getTime() / DateTime.DAY, 10)
    var last = parseInt(date.getTime() / DateTime.DAY, 10)
    return (last - first)
  }

  DateTime.prototype.withWeekday = function(weekday) { return this.plusDays(weekday - this.getDay()) }

  DateTime.prototype.getOnlyDate = function() { return DateTime.fromDate(this.getFullYear(), this.getMonth(), this.getDate()) }

  DateTime.prototype.isWeekend = function() { return this.getDay() === 6 || this.getDay() === 0 }

  DateTime.prototype.toString = function() { return this.toISOString() }

  DateTime.prototype.getFirstDateOfWeek = function(locale) {
    var firstWeekday = locale ? locale.firstWeekday : DateTime.MONDAY
    if(firstWeekday < this.getDay()) return this.plusDays(firstWeekday - this.getDay())
    else if(firstWeekday > this.getDay()) return this.plusDays(firstWeekday - this.getDay() - 7)
    else return this.clone()
  }

  DateTime.prototype.toISOString = function() {
    return $.map([this.getFullYear(), (this.getMonth()), this.getDate()], withTwoDigitsAtLeast).join('-') + 'T' +
        $.map([this.getHours(), this.getMinutes(), this.getSeconds()], withTwoDigitsAtLeast).join(':')
    function withTwoDigitsAtLeast(value) { return value < 10 ? '0' + value : '' + value}
  }

  DateTime.prototype.getMonth = function() {
    return this.date.getMonth() + 1
  }

  return DateTime
})
