(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var DateTime = require('./DateTime')
var DateFormat = {}
/**
 * Formatting patterns listed above
 * @param {Date} d [01-31]
 * @param {Short_Day_Name} D [Su, Mo, Tu, We, Th, Fr, Sa]
 * @param {Date} j [1-31]
 * @param {Full_day_name} l  [Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday]
 * @param {Week_day_number} w 0=Sunday, 1=Monday, 2=Tuesday etc...
 * @param {Nth_day_of_year} z [1-365] except leap years
 * @param {Full_month_name} F [January, February, ...]
 * @param {Month_number} m [01-12]
 * @param {Month_name_stripped_to_three_letters} M [Jan, Feb, ...]
 * @param {Month_number} n [1-12]
 * @param {Days_in_current_month} t [28-31]
 * @param {Full_year} Y [1900, ...]
 * @param {Last_two_digits_of_a_year} y [01-99]
 * @param {Time_postfix} a [am|pm]
 * @param {Time_postfix} A [AM|PM]
 * @param {Hours_in_12h_format} g [1-12]
 * @param {Hours_in_24h_format} G [0-23]
 * @param {Hour_in_12h_format_with_padding} h [01-12]
 * @param {Hours_in_24h_format_with_padding} H [00-23]
 * @param {Minutes_with_padding} i [00-59]
 * @param {Seconds_with_padding} s [00-59]
 * @param {Timezone} Z 2 for GMT+2
 */
var codes = {
  d: function (d) { return leftPad(d.getDate(), 2, '0') },
  D: function (d, l) { return l.shortDayNames[d.getDay()] },
  j: function (d) { return d.getDate() },
  l: function (d, l) { return l.dayNames[d.getDay()] },
  w: function (d) { return d.getDay() },
  z: function (d) { return d.getDayInYear() },
  F: function (d, l) { return l.monthNames[d.getMonth() - 1] },
  m: function (d) { return leftPad(d.getMonth(), 2, '0') },
  M: function (d, l) { return l.monthNames[d.getMonth() - 1].substring(0, 3) },
  n: function (d) { return (d.getMonth()) },
  t: function (d) { return d.getDaysInMonth() },
  Y: function (d) { return d.getFullYear() },
  y: function (d) { return ('' + d.getFullYear()).substring(2, 4) } ,
  a: function (d) { return (d.getHours() < 12 ? 'am' : 'pm') },
  A: function (d) { return (d.getHours() < 12 ? 'AM' : 'PM') },
  g: function (d) { return ((d.getHours() % 12) ? d.getHours() % 12 : 12) },
  G: function (d) { return d.getHours() },
  h: function (d) { return leftPad((d.getHours() % 12) ? d.getHours() % 12 : 12, 2, '0') },
  H: function (d) { return leftPad(d.getHours(), 2, '0') },
  i: function (d) { return leftPad(d.getMinutes(), 2, '0') },
  s: function (d) { return leftPad(d.getSeconds(), 2, '0') },
  Z: function (d) { return (d.date.getTimezoneOffset() / -60) }
}

/** Returns hours and minutes as hours in decimal. For example <code>DateFormat.hoursAndMinutes(22,30)</code> returns <code>22.5</code> */
DateFormat.hoursAndMinutes = function (hours, minutes) { return (Math.round((hours + minutes / 60) * 100) / 100).toString() }

/** Formats dateTime. For example <code>DateFormat.format(DateTime.fromDateTime(2014, 2, 25, 14, 30), 'Y-m-d H:i:s', DateLocale.EN)</code> returns <code>2014-02-25 14:30:00</code>
 * @param {DateTime} dateTime DateTime object to be formatted
 * @param {String} format  Pattern to be used for formatting
 * @param {DateLocale} locale  Locale to be used for formatting
 * @see DateFormat.patterns
 * @returns {String} Formatted date
 * */
DateFormat.format = function (dateTime, format, locale) {
  var result = ''
  var special = false
  var ch = ''
  for (var i = 0; i < format.length; ++i) {
    ch = format.charAt(i)
    if (!special && ch === '\\') {
      special = true
    } else {
      if (special) {
        special = false
        result += ch
      } else {
        result += codeToValue(dateTime, ch, locale)
      }
    }
  }
  return result
}

/**
 * Shorthand for formatting in short date format. For example <code>DateFormat.shortDateFormat(DateTime.fromDateTime(2014, 2, 25, 14, 30), DateLocale.EN)</code> returns <code>2/25/2014</code>
 * @param {DateTime} dateTime DateTime to be formattend
 * @param {DateLocale} locale locale to be used for formatting
 * @returns {String} Returns Date in short date format depending on locale
 */
DateFormat.shortDateFormat = function (dateTime, locale) { return DateFormat.format(dateTime, locale ? locale.shortDateFormat : 'n/j/Y', locale) }

/**
 * Formats DateRange. TODO
 * @param {DateRange} dateRange DateRange to be formatted
 * @param {DateLocale} locale to be used for formatting
 * @returns {string} returns date range in formatted form, for example <code>2/25/2014-2/15/2015</code>
 */
DateFormat.formatRange = function (dateRange, locale) {
  if (dateRange._hasTimes) {
    return locale.daysLabel(dateRange.days()) + ' ' + locale.hoursLabel(dateRange.hours(), dateRange.minutes())
  } else {
    return DateFormat.shortDateFormat(dateRange.start, locale) + ' - ' + DateFormat.shortDateFormat(dateRange.end, locale)
  }
}

/**
 * Need's documentation
 * @param dateRange
 * @param locale
 * @returns {*}
 */
DateFormat.formatDefiningRangeDuration = function (dateRange, locale) {
  var years = parseInt(dateRange.days() / 360, 10)
  if (years > 0) return locale.yearsLabel(years)
  var months = parseInt(dateRange.days() / 30, 10)
  if (months > 0) return locale.monthsLabel(months)
  return locale.daysLabel(dateRange.days())
}

/**
 * List of commonly used date format patterns
 * Above are listed results for following command: <code>DateFormat.format(DateTime.fromDateTime(2014, 2, 5, 14, 30), PATTERN,  DateLocale.EN)</code>
 *
 * @param {DateLocale.EN} ISO8601LongPattern 2014-02-05 14:30:00
 * @param {DateLocale.EN} ISO8601ShortPattern 2014-02-05
 * @param {DateLocale.EN} ShortDatePattern 2/5/2014
 * @param {DateLocale.EN} ShortDatePattern 2/5/2014
 * @param {DateLocale.EN} FiShortDatePattern  5.2.2014
 * @param {DateLocale.EN} FiWeekdayDatePattern We 5.2.2014
 * @param {DateLocale.FI} FiWeekdayDateTimePattern ke 5.2.2014 klo 14:30 (for DateLocale.FI)
 * @param {DateLocale.EN} LongDatePattern Wednesday, February 05, 2014
 * @param {DateLocale.EN} FullDateTimePattern Wednesday, February 05, 2014 2:30:00 PM
 * @param {DateLocale.EN} MontdDayPattern February 05
 * @param {DateLocale.EN} ShortTimePattern 2:30 PM
 * @param {DateLocale.EN} LongTimePattern 2:30:00 PM
 * @param {DateLocale.EN} SortableDateTimePattern 2014-02-05T14:30:00
 * @param {DateLocale.EN} UniversalSortableDateTimePattern 2014-02-05 14:30:00+-200
 * @param {DateLocale.EN} YearMontdPattern February, 2014
 */
DateFormat.patterns = {
  ISO8601LongPattern: 'Y-m-d H:i:s',
  ISO8601ShortPattern: 'Y-m-d',
  ShortDatePattern: 'n/j/Y',
  FiShortDatePattern: 'j.n.Y',
  FiWeekdayDatePattern: 'D j.n.Y',
  FiWeekdayDateTimePattern: 'D j.n.Y k\\lo G:i',
  LongDatePattern: 'l, F d, Y',
  FullDateTimePattern: 'l, F d, Y g:i:s A',
  MonthDayPattern: 'F d',
  ShortTimePattern: 'g:i A',
  LongTimePattern: 'g:i:s A',
  SortableDateTimePattern: 'Y-m-d\\TH:i:s',
  UniversalSortableDateTimePattern: 'Y-m-d H:i:sO',
  YearMonthPattern: 'F, Y'
}

/** @private */
function codeToValue(dateTime, ch, locale) { return ch in codes ? codes[ch](dateTime, locale) : ch }

/** @private */
function getGMTOffset(dateTime) {
  return (dateTime.date.getTimezoneOffset() > 0 ? '-' : '+') +
    leftPad(Math.floor(dateTime.date.getTimezoneOffset() / 60), 2, '0') +
    leftPad(dateTime.date.getTimezoneOffset() % 60, 2, '0')
}

/** @private */
function leftPad(val, size, ch) {
  var result = String(val)
  if (ch === null) {
    ch = ' '
  }
  while (result.length < size) {
    result = ch + result
  }
  return result
}
module.exports = DateFormat

},{"./DateTime":5}],2:[function(require,module,exports){
module.exports = {
    FI: require('./locale/FI'),
    EN: require('./locale/EN'),
    AU: require('./locale/AU'),
    ET: require('./locale/ET'),
    RU: require('./locale/RU'),
    SV: require('./locale/SV'),
    LV: require('./locale/LV'),
    FR: require('./locale/FR'),
    DE: require('./locale/DE'),
    CN: require('./locale/CN')
}

},{"./locale/AU":8,"./locale/CN":9,"./locale/DE":10,"./locale/EN":11,"./locale/ET":12,"./locale/FI":14,"./locale/FR":15,"./locale/LV":16,"./locale/RU":17,"./locale/SV":18}],3:[function(require,module,exports){
var DateTime = require('./DateTime')
var DateParse = {}
DateParse.parseRegexes = []
DateParse.defaultFormat = 'n/j/Y'

DateParse.parse = function (input, locale) {
  if (typeof input === 'string') {
    if (input === 'today') {
      return DateTime.today()
    }
    var format = locale ? locale.shortDateFormat : DateParse.defaultFormat
    var date = DateParse.parseDate(input, format)
    return date ? date : new DateTime(new Date(input))
  }
  throw new Error("DateParse only accepts strings")
}

DateParse.parseDate = function (input, format) {
  var values = input.match(getOrCreateParseRegexp())
  return values ? matchesToDateTime(values) : null

  function matchesToDateTime(values) {
    var day = matchesToObject(values)
    return DateTime.fromDate(day.Y, (day.m ? day.m : day.n), (day.d ? day.d : day.j))
  }

  function matchesToObject(matchValues) {
    var day = {}
    var keys = format.replace(/[^djmnY]/g, '').split('')
    for (var i = 0; i < keys.length; i++) day[keys[i]] = +matchValues[i + 1]
    return day
  }

  function getOrCreateParseRegexp() {
    if (DateParse.parseRegexes[format] === undefined) {
      DateParse.parseRegexes[format] = new RegExp(format.replace(/[djmnY]/g, '(\\d+)').replace(/\./g, '\\.'))
    }
    return DateParse.parseRegexes[format]
  }
}

DateParse.parseTime = function (timeStr) {
  var splittedTime = splitTime(timeStr.replace(/:|,/i, '.'))
  var time = [+(splittedTime[0]), +(splittedTime[1])]
  return (isHour(time[0]) && isMinute(time[1])) ? time : null

  function splitTime(timeStr) {
    if (timeStr.indexOf('.') !== -1) {
      return timeStr.split('.')
    }
    var splitTimes = {
      4: [timeStr.slice(0, 2), timeStr.slice(2, 4)],
      3: [timeStr.slice(0, 1), timeStr.slice(1, 3)],
      2: [timeStr, 0]
    }
    return splitTimes[timeStr.length] || [-1, -1]
  }

  function isMinute(minutes) { return !isNaN(minutes) && minutes >= 0 && minutes <= 59 }

  function isHour(hours) { return !isNaN(hours) && hours >= 0 && hours <= 23 }
}

module.exports = DateParse

},{"./DateTime":5}],4:[function(require,module,exports){
var DateTime = require('./DateTime')
var DateFormat = require('./DateFormat')
var DateParse = require('./DateParse')

function DateRange(date1, date2) {
  if (!date1 || !date2) {
    throw('two dates must be specified, date1=' + date1 + ', date2=' + date2)
  }
  this.start = (date1.compareTo(date2) > 0 ? date2 : date1)
  this.end = (date1.compareTo(date2) > 0 ? date1 : date2)
  this._days = 0
  this._hours = 0
  this._minutes = 0
  this._valid = true
}

DateRange.emptyRange = function () {
  function NullDateRange() {
    this.start = null
    this.end = null
    this.days = function () {
      return 0
    }
    this.shiftDays = function () {}
    this.hasDate = function () { return false }
    this.clone = function () { return DateRange.emptyRange() }
    this.expandDaysTo = function () { return this }
    this.hasEndsOnWeekend = function () { return false }
    this.isPermittedRange = function () { return true }
    this.hasSelection = function () { return false }
  }

  return new NullDateRange()
}

DateRange.rangeWithMinimumSize = function (oldRange, minimumSize, disableWeekends, outerRange) {
  if (isTooSmallSelection()) {
    var newRange = oldRange.expandDaysTo(minimumSize)
    if (disableWeekends && newRange.hasEndsOnWeekend()) {
      var shiftedDays = newRange.shiftDays(delta(newRange.end.getDay())).shiftInside(outerRange)
      while (!shiftedDays.isPermittedRange(minimumSize, disableWeekends, outerRange) || shiftedDays.end.compareTo(outerRange.end) > 0) {
        if (!shiftedDays.isPermittedRange(minimumSize, false, outerRange)) {
          return DateRange.emptyRange()
        }
        shiftedDays = shiftedDays.shiftDays(1)
      }
      newRange = shiftedDays
    }
    if (!newRange.isPermittedRange(minimumSize, false, outerRange)) {
      return DateRange.emptyRange()
    }
    return newRange
  }
  return oldRange

  function isTooSmallSelection() { return minimumSize && oldRange.days() <= minimumSize }

  function delta(x) { return -((x + 1) % 7 + 1) }
}

DateRange.prototype._setDaysHoursAndMinutes = function () {
  if (this._hasTimes) {
    var ms = parseInt((this.end.getTime() - this.start.getTime()), 10)
    this._days = parseInt(ms / DateTime.DAY, 10)
    ms = ms - (this._days * DateTime.DAY)
    this._hours = parseInt(ms / DateTime.HOUR, 10)
    ms = ms - (this._hours * DateTime.HOUR)
    this._minutes = parseInt(ms / DateTime.MINUTE, 10)
  }
}

DateRange.prototype._dateWithTime = function (dateWithoutTime, parsedTime) { return dateWithoutTime.withTime(parsedTime[0], parsedTime[1]) }

DateRange.prototype.hours = function () { return this._hours }

DateRange.prototype.minutes = function () { return this._minutes }

DateRange.prototype.hasDate = function (date) { return date.isBetweenDates(this.start, this.end) }

DateRange.prototype.isValid = function () { return this._valid && this.end.getTime() - this.start.getTime() >= 0 }

DateRange.prototype.days = function () { return this._hasTimes ? this._days : Math.round(this.start.distanceInDays(this.end) + 1) }

DateRange.prototype.shiftDays = function (days) { return new DateRange(this.start.plusDays(days), this.end.plusDays(days)) }

DateRange.prototype.expandTo = function (date) {
  var newStart = this.start.clone()
  var newEnd = this.end.clone()
  if (date.compareTo(this.start) < 0) newStart = date
  else if (date.compareTo(this.end) > 0) newEnd = date
  return new DateRange(newStart, newEnd)
}

DateRange.prototype.expandDaysTo = function (days) { return new DateRange(this.start, this.start.plusDays(days - 1)) }

DateRange.prototype.hasValidSize = function (minimumDays) { return minimumDays < 0 || this.days() >= minimumDays }

DateRange.prototype.hasValidSizeAndEndsOnWorkWeek = function (minimumDays) {
  return this.hasValidSize(minimumDays) && this.hasEndsOnWeekend()
}

DateRange.prototype.and = function (that) {
  var latestStart = this.start.compareTo(that.start) > 0 ? this.start : that.start
  var earliestEnd = this.end.compareTo(that.end) > 0 ? that.end : this.end
  return latestStart.compareTo(earliestEnd) < 0 ? new DateRange(latestStart, earliestEnd) : DateRange.emptyRange()
}

DateRange.prototype.isInside = function (outer) {
  return this.start.compareTo(outer.start) >= 0 && this.end.compareTo(outer.end) <= 0
}

DateRange.prototype.hasEndsOnWeekend = function () { return this.start.isWeekend() || this.end.isWeekend() }

DateRange.prototype.withTimes = function (startTimeStr, endTimeStr) {
  var parsedStartTime = DateParse.parseTime(startTimeStr)
  var parsedEndTime = DateParse.parseTime(endTimeStr)
  var rangeWithTimes = this.clone()
  if (parsedStartTime && parsedEndTime) {
    rangeWithTimes._valid = true
    rangeWithTimes._hasTimes = true
    rangeWithTimes.start = this._dateWithTime(this.start, parsedStartTime)
    rangeWithTimes.end = this._dateWithTime(this.end, parsedEndTime)
    rangeWithTimes._setDaysHoursAndMinutes()
  } else {
    rangeWithTimes._valid = false
  }
  return rangeWithTimes
}

DateRange.prototype.clone = function () { return new DateRange(this.start, this.end) }

DateRange.prototype.toString = function () {
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
}

DateRange.prototype.isPermittedRange = function (minimumSize, disableWeekends, outerRange) {
  return this.hasValidSize(minimumSize) && (!(disableWeekends && this.hasEndsOnWeekend())) && this.isInside(outerRange)
}

DateRange.prototype.shiftInside = function (outerRange) {
  if (this.days() > outerRange.days()) {
    return DateRange.emptyRange()
  }
  var distanceToOuterRangeStart = this.start.distanceInDays(outerRange.start)
  var distanceToOuterRangeEnd = this.end.distanceInDays(outerRange.end)
  if (distanceToOuterRangeStart > 0) {
    return this.shiftDays(distanceToOuterRangeStart)
  }
  if (distanceToOuterRangeEnd < 0) {
    return this.shiftDays(distanceToOuterRangeEnd)
  }
  return this
}

DateRange.prototype.hasSelection = function () {
  return this.days() > 0
}

module.exports = DateRange

},{"./DateFormat":1,"./DateParse":3,"./DateTime":5}],5:[function(require,module,exports){
function DateTime(date) {
  if(arguments.length === 0) this.date = new Date()
  else if(date instanceof Date) this.date = new Date(date)
  else throw Error('Argument must be a date object. ' + date + ' was given')
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
DateTime.monthNumbers = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11
}

/**
 * Returns DateTime for given date and time
 * @param year
 * @param month 1-12
 * @param day 1-31
 * @param hours 0-23
 * @param minutes 0-59
 * @param seconds 0-59
 * @returns {DateTime} new DateTime object or throws error
 */
DateTime.fromDateTime = function(year, month, day, hours, minutes, seconds) {
  return new DateTime(createSafeDate(+year, +month, +day, +hours, +minutes, +seconds || 0))
}

/**
 * Returns DateTime for given date by setting time to midnight
 * @param year
 * @param month
 * @param day
 * @returns {DateTime} new DateTime object or throws error
 */
DateTime.fromDate = function(year, month, day) { return DateTime.fromDateTime(year, month, day, 0, 0, 0) }

/**
 * Returns DateTime from given Date object
 * @param date
 * @returns {DateTime}
 */
DateTime.fromDateObject = function(date) { return new DateTime(date) }

/**
 * Returns DateTime from ISO date ignoring time information
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
 * Returns DateTime with time from ISO date
 * @param isoDateTime String YYYY-MM-DDTHH-MM
 * @return {DateTime} Returns DateTime or throws error for invalid syntax
 */
DateTime.fromIsoDateTime = function(isoDateTime) {
  var fullPatternTest = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z?)/
  if(!fullPatternTest.test(isoDateTime)) throw Error(isoDateTime + ' is not valid ISO Date (YYYY-MM-DDTHH:MM)')

  var dateAndTime = isoDateTime.split('T')
  var time = parseTime(dateAndTime.length === 2 && dateAndTime[1])
  var date = parseDate(dateAndTime[0])
  return DateTime.fromDateTime(date.year, date.month, date.day, time.hours, time.minutes, time.seconds)
}

/**
 * Returns DateTime from current time in milliseconds
 * @param ms
 * @returns {DateTime}
 */
DateTime.fromMillis = function(ms) { return new DateTime(new Date(ms)) }

/**
 * Returns new DateTime with milliseconds set to 0
 */
DateTime.prototype.withResetMS = function() {
  var newDate = this.clone()
  newDate.date.setMilliseconds(0)
  return newDate
}

/**
 * Returns new DateTime with given hours and minutes and 0 milliseconds
 * @param h 0-23
 * @param m 0-59
 */
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

/**
 * Returns new DateTime with current time
 * @returns {DateTime}
 */
DateTime.now = function() { return new DateTime() }

/**
 * Returns new DateTime with current date and midnight time
 */
DateTime.today = function() { return DateTime.now().getOnlyDate() }

/**
 * Returns time in milliseconds
 * @returns {number} milliseconds
 */
DateTime.prototype.getTime = function() { return this.date.getTime() }

/**
 * Returns year
 * @returns {number} year
 */
DateTime.prototype.getFullYear = function() { return this.date.getFullYear() }

/**
 * Returns day of month
 * @returns {number} 1-31
 */
DateTime.prototype.getDate = function() { return this.date.getDate() }

/**
 * Returns month
 * @returns {number} 1-12
 */
DateTime.prototype.getMonth = function() { return this.date.getMonth() + 1 }

/**
 * Returns day of week. 0=sunday, 1=monday, ...
 * @returns {number} 0-6
 */
DateTime.prototype.getDay = function() { return this.date.getDay() }

/**
 * Returns hours
 * @returns {number} 0-23
 */
DateTime.prototype.getHours = function() { return this.date.getHours() }

/**
 * Returns minutes
 * @returns {number} 0-59
 */
DateTime.prototype.getMinutes = function() { return this.date.getMinutes() }

/**
 * Returns seconds
 * @returns {number} 0-59
 */
DateTime.prototype.getSeconds = function() { return this.date.getSeconds() }

/**
 * Returns milliseconds
 * @returns {number} 0-999
 */
DateTime.prototype.getMilliseconds = function() { return this.date.getMilliseconds() }

/**
 * Returns days in month for current DateTime
 * @returns {number}
 */
DateTime.prototype.getDaysInMonth = function() { return DateTime.getDaysInMonth(this.getFullYear(), this.getMonth()) }

/**
 * Returns days in year for current Date
 * @returns {*}
 */
DateTime.prototype.getDayInYear = function() { return DateTime.getDayInYear(this.getFullYear(), this.getMonth(), this.getDate()) }

/**
 * Returns new DateTime with given days later
 * @param days
 * @returns {DateTime}
 */
DateTime.prototype.plusDays = function(days) {
  var newDateTime = DateTime.fromMillis(this.getTime() + days * DateTime.DAY)
  var hours = this.getHours()

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
    return DateTime.fromMillis(newDateTime.getTime() + (delta * DateTime.HOUR))
  }
  return newDateTime
}

/**
 * Returns new DateTime with given minutes later
 * @param minutes
 * @returns {DateTime}
 */
DateTime.prototype.plusMinutes = function(minutes) { return DateTime.fromMillis(this.clone().getTime() + (minutes * DateTime.MINUTE)) }

/**
 * Returns new DateTime with given minutes earlier
 * @param minutes
 * @returns {DateTime}
 */
DateTime.prototype.minusMinutes = function(minutes) { return this.plusMinutes(-minutes) }

/**
 * Returns new DateTime with given days earlier
 * @param days
 * @returns {DateTime}
 */
DateTime.prototype.minusDays = function(days) { return this.plusDays(-days) }

/**
 * Compares DateTimes. Examples:
 * earlier.compareTo(later)) < 0
 * later.compareTo(earlier)) > 0
 * later.compareTo(later)) == 0

 * @param date {DateTime}
 * @returns {number}
 */
DateTime.prototype.compareTo = function(date) {
  if(!date) {
    return 1
  }
  var diff = this.getTime() - date.getTime()
  return diff === 0 ? 0 : diff / Math.abs(diff)
}

/**
 * Returns true if DateTime is within today
 */
DateTime.prototype.isToday = function() { return this.equalsOnlyDate(DateTime.today()) }

/**
 * Returns the week number of current DateTime
 * @param {string} weekNumberingSystem US or ISO
 * @returns {number}
 */
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

/**
 * Creates clone of current DateTime
 * @returns {DateTime}
 */
DateTime.prototype.clone = function() { return new DateTime(this.date) }

/**
 * Returs true if month is odd, ie. january=true
 * @returns {boolean}
 */
DateTime.prototype.isOddMonth = function() { return this.getMonth() % 2 === 0 }

/**
 * Returns true if given DateTime has same day as current DateTime
 * @param date
 * @returns {boolean}
 */
DateTime.prototype.equalsOnlyDate = function(date) {
  if(!date) return false
  return this.getMonth() === date.getMonth() && this.getDate() === date.getDate() && this.getFullYear() === date.getFullYear()
}

/**
 * Returns first date of month from current date
 * @returns {DateTime}
 */
DateTime.prototype.firstDateOfMonth = function() { return DateTime.fromDate(this.getFullYear(), this.getMonth(), 1) }

/**
 * Returns last date of month from current date
 * @returns {DateTime}
 */
DateTime.prototype.lastDateOfMonth = function() { return DateTime.fromDate(this.getFullYear(), this.getMonth(), this.getDaysInMonth()) }

/**
 * Returns number of days between current and given date
 * @param date
 * @returns {number}
 */
DateTime.prototype.distanceInDays = function(date) {
  var first = parseInt(this.getTime() / DateTime.DAY, 10)
  var last = parseInt(date.getTime() / DateTime.DAY, 10)
  return (last - first)
}

/**
 * Returns new DateTime from same week with given weekDay
 * @param weekday 0=sunday, 1=monday, ...
 * @returns {DateTime}
 */
DateTime.prototype.withWeekday = function(weekday) { return this.plusDays(weekday - this.getDay()) }

/**
 * Returns new DateTime with midnight time
 * @returns {DateTime}
 */
DateTime.prototype.getOnlyDate = function() { return DateTime.fromDate(this.getFullYear(), this.getMonth(), this.getDate()) }

/**
 * Returns true if date is in weekend
 * @returns {boolean}
 */
DateTime.prototype.isWeekend = function() { return this.getDay() === 6 || this.getDay() === 0 }

/**
 * Returns default string representation
 */
DateTime.prototype.toString = function() { return this.toISOString() }

/**
 * Returns first date from same week
 * @param locale Based on locale it can be a monday or a sunday
 * @returns {DateTime}
 */
DateTime.prototype.getFirstDateOfWeek = function(locale) {
  var firstWeekday = locale ? locale.firstWeekday : DateTime.MONDAY
  if(firstWeekday == this.getDay) return this.clone()
  else return this.plusDays(firstWeekday - this.getDay() - (firstWeekday > this.getDay() ? 7 : 0))
}

/**
 * Returns ISO DateTime string: YYYY-MM-DDT:HH:MM:SS
 * @returns {string}
 */
DateTime.prototype.toISOString = function() { return isoDate.call(this) + 'T' + isoTime.call(this) }

/**
 * Returns ISO Date string: YYYY-MM-DD
 */
DateTime.prototype.toISODateString = function() { return isoDate.call(this) }

/**
 * Returns true if current DateTime is between start and end DateTimes
 * @param {DateTime} start
 * @param {DateTime} end
 * @returns {boolean}
 */
DateTime.prototype.isBetweenDates = function(start, end) {
  if(start.getTime() > end.getTime()) throw Error("start date can't be after end date")
  var onlyDate = this.getOnlyDate()
  return onlyDate.compareTo(start.getOnlyDate()) >= 0 && onlyDate.compareTo(end.getOnlyDate()) <= 0
}

/**
 * Returns number of days for given month
 * @param {Number} year Year of month
 * @param {Number} month Number of month (1-12)
 * @returns {Number} [28-31]
 */
DateTime.getDaysInMonth = function(year, month) {
  if(month > 12 || month < 1)
    throw new Error('Month must be between 1-12')
  var yearAndMonth = year * 12 + month
  return DateTime.fromDate(Math.floor(yearAndMonth / 12), yearAndMonth % 12 + 1, 1).minusDays(1).getDate()
}

/**
 * Returns index of given day from beginning of year
 * @param year year
 * @param month month
 * @param day day
 * @returns {Number} index number starting grom beginning of year
 */
DateTime.getDayInYear = function(year, month, day) {
  return DateTime.fromDate(year, 1, 1).distanceInDays(DateTime.fromDate(year, month, day)) + 1
}

function isoDate() { return this.getFullYear() + '-' + twoDigits(this.getMonth()) + '-' + twoDigits(this.getDate()) }

function isoTime() {
  return twoDigits(this.getHours()) + ':' + twoDigits(this.getMinutes()) + ':' + twoDigits(this.getSeconds())
}

function twoDigits(value) { return value < 10 ? '0' + value : '' + value}

function createSafeDate(year, month, date, hours, minutes, seconds) {
  hours = hours || 0
  minutes = minutes || 0
  seconds = seconds || 0
  var newDate = new Date(year, month - 1, date, hours, minutes, seconds, 0)
  if(newDate.toString() === 'Invalid Date' ||
    month !== newDate.getMonth() + 1 ||
    year !== newDate.getFullYear() ||
    date !== newDate.getDate() ||
    hours !== newDate.getHours() ||
    minutes !== newDate.getMinutes() ||
    seconds !== newDate.getSeconds()) throw Error('Invalid Date: ' + year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds)
  return newDate
}

function parseDate(str) {
  var dateComponents = str.split('-')
  return {
    year:  +dateComponents[0],
    month: +dateComponents[1],
    day:   +dateComponents[2]
  }
}

function parseTime(str) {
  if(str) {
    var timeComponents = str.split(':')
    return {
      hours:   +timeComponents[0],
      minutes: +timeComponents[1],
      seconds: +timeComponents[2] || 0
    }
  } else {
    return {hours: 0, minutes: 0}
  }
}

module.exports = DateTime


},{}],6:[function(require,module,exports){
var Duration = function (durationMs) {
  this.durationMs = durationMs
}

Duration.MS = 1
Duration.SECOND = 1000
Duration.MIN = 60 * Duration.SECOND
Duration.HOUR = 60 * Duration.MIN
Duration.DAY = 24 * Duration.HOUR

Duration.fromMS = function (milliSeconds) { return new Duration(milliSeconds) }
Duration.fromSeconds = function (seconds) { return Duration.fromMS(seconds * Duration.SECOND) }
Duration.fromMinutes = function (minutes) { return Duration.fromMS(minutes * Duration.MIN) }
Duration.fromHours = function (hours) { return Duration.fromMS(hours * Duration.HOUR) }
Duration.fromDays = function (days) { return Duration.fromMS(days * Duration.DAY) }

Duration.prototype.toMS = function () { return this.durationMs }
Duration.prototype.asUnit = function (unit) { return Number(this.durationMs / unit) }
module.exports = Duration

},{}],7:[function(require,module,exports){
module.exports = {
  "version":  "0.3.1",
  DateFormat: require('./DateFormat'),
  DateLocale: require('./DateLocale'),
  DateParse:  require('./DateParse'),
  DateRange:  require('./DateRange'),
  DateTime:   require('./DateTime'),
  Duration:   require('./Duration')
}


},{"./DateFormat":1,"./DateLocale":2,"./DateParse":3,"./DateRange":4,"./DateTime":5,"./Duration":6}],8:[function(require,module,exports){
var DateTime = require('../DateTime')
var DateFormat = require('../DateFormat')
module.exports = {
  id: 'AU',
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  shortDayNames: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  yearsLabel: function (years) { return years + ' ' + (years === 1 ? 'Year' : 'Years'); },
  monthsLabel: function (months) { return months + ' ' + (months === 1 ? 'Months' : 'Months') },
  daysLabel: function (days) { return days + ' ' + (days === 1 ? 'Day' : 'Days') },
  hoursLabel: function (hours, minutes) {
    var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes)
    return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? 'Hour' : 'Hours')
  },
  clearRangeLabel: 'Clear Range',
  clearDateLabel: 'Clear Date',
  shortDateFormat: 'j/n/Y',
  weekDateFormat: 'D j/n/Y',
  dateTimeFormat: 'D j/n/Y G:i',
  firstWeekday: DateTime.SUNDAY,
  holidays: {}
}

},{"../DateFormat":1,"../DateTime":5}],9:[function(require,module,exports){
//简体中文
var DateTime = require('../DateTime');
var DateFormat = require('../DateFormat');
module.exports = {
    id: 'AU',
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    shortDayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    yearsLabel: function (years) {
        return years + ' ' + (years === 1 ? '年' : '年');
    },
    monthsLabel: function (months) {
        return months + ' ' + (months === 1 ? '月' : '月')
    },
    daysLabel: function (days) {
        return days + ' ' + (days === 1 ? '日' : '日')
    },
    hoursLabel: function (hours, minutes) {
        var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes);
        return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? '小时' : '小时')
    },
    clearRangeLabel: '范围',
    clearDateLabel: '日期',
    shortDateFormat: 'Y年m月d日',
    weekDateFormat: 'Y年m月d日 D',
    dateTimeFormat: 'Y年m月d日 H时i分s秒',
    firstWeekday: DateTime.MONDAY,
    holidays: {}
};
},{"../DateFormat":1,"../DateTime":5}],10:[function(require,module,exports){
var DateTime = require('../DateTime')
var DateFormat = require('../DateFormat')
module.exports = {
  id: 'DE',
  monthNames: ['Januar','Februar','März','April','Mai','Juni', 'Juli','August','September','Oktober','November','Dezember'],
  dayNames: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
  shortDayNames: ['So','Mo','Di','Mi','Do','Fr','Sa'],
  yearsLabel: function (years) { return years + ' ' + 'Jahr'; },
  monthsLabel: function (months) { return months + ' ' + (months === 1 ? 'Monat' : 'Months') },
  daysLabel: function (days) { return days + ' ' + (days === 1 ? 'Tag' : 'Tage') },
  hoursLabel: function (hours, minutes) {
    var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes)
    return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? 'Stunde' : 'Stunden')
  },
  clearRangeLabel: 'Auswahl löschen',
  clearDateLabel: 'Auswahl löschen',
  shortDateFormat: 'j.n.Y',
  weekDateFormat: 'D j.n.Y',
  dateTimeFormat: 'D j.n.Y G:i',
  firstWeekday: DateTime.MONDAY,
  holidays: {}
}

},{"../DateFormat":1,"../DateTime":5}],11:[function(require,module,exports){
var DateTime = require('../DateTime')
var DateFormat = require('../DateFormat')
module.exports = {
  id: 'EN',
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  shortDayNames: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  yearsLabel: function (years) { return years + ' ' + (years === 1 ? 'Year' : 'Years'); },
  monthsLabel: function (months) { return months + ' ' + (months === 1 ? 'Months' : 'Months') },
  daysLabel: function (days) { return days + ' ' + (days === 1 ? 'Day' : 'Days') },
  hoursLabel: function (hours, minutes) {
    var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes)
    return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? 'Hour' : 'Hours')
  },
  clearRangeLabel: 'Clear Range',
  clearDateLabel: 'Clear Date',
  shortDateFormat: 'n/j/Y',
  weekDateFormat: 'D n/j/Y',
  dateTimeFormat: 'D n/j/Y G:i',
  firstWeekday: DateTime.SUNDAY,
  holidays: {}
}

},{"../DateFormat":1,"../DateTime":5}],12:[function(require,module,exports){
  var DateTime = require('../DateTime')
  var DateFormat = require('../DateFormat')
  module.exports = {
    id             : 'ET',
    monthNames     : [ 'Jaanuar', 'Veebruar', 'Märts', 'Aprill', 'Mai', 'Juuni', 'Juuli', 'August', 'September', 'Oktoober', 'November', 'Detsember'],
    dayNames       : ['Pühapäev', 'Esmaspäev', 'Teisipäev', 'Kolmapäev', 'Neljapäev', 'Reede', 'Laupäev'],
    shortDayNames  : ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
    yearsLabel     : function(years) { return years + ' ' + (years === 1 ? 'Aasta' : 'Aastat') },
    monthsLabel    : function(months) { return months + ' ' + (months === 1 ? 'Kuu' : 'Kuud') },
    daysLabel      : function(days) { return days + ' ' + (days === 1 ? 'Päev' : 'Päeva') },
    hoursLabel     : function(hours, minutes) {
      var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
      return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? 'Tund' : 'Tundi')
    },
    clearRangeLabel: 'TODO',
    clearDateLabel: 'TODO',
    shortDateFormat: 'j.n.Y',
    weekDateFormat : 'D j.n.Y',
    dateTimeFormat : 'D j.n.Y G:i',
    firstWeekday   : DateTime.MONDAY,
    holidays: {}
  }

},{"../DateFormat":1,"../DateTime":5}],13:[function(require,module,exports){
module.exports = {
  "2015-01-01": "Uudenvuodenpäivä",
  "2015-01-06": "Loppiainen",
  "2015-04-03": "Pitkäperjantai",
  "2015-04-04": "Pääsiäislauantai",
  "2015-04-05": "Pääsiäispäivä",
  "2015-04-06": "2. pääsiäispäivä",
  "2015-05-01": "Vappu",
  "2015-05-14": "Helatorstai",
  "2015-06-19": "Juhannusaatto",
  "2015-06-20": "Juhannuspäivä",
  "2015-10-31": "Pyhäinpäivä",
  "2015-12-06": "Itsenäisyyspäivä",
  "2015-12-24": "Jouluaatto",
  "2015-12-25": "Joulupäivä",
  "2015-12-26": "Tapaninpäivä",
  "2016-01-01": "Uudenvuodenpäivä",
  "2016-01-06": "Loppiainen",
  "2016-03-25": "Pitkäperjantai",
  "2016-03-26": "Pääsiäislauantai",
  "2016-03-27": "Pääsiäispäivä",
  "2016-03-28": "2. pääsiäispäivä",
  "2016-05-01": "Vappu",
  "2016-05-05": "Helatorstai",
  "2016-06-24": "Juhannusaatto",
  "2016-06-25": "Juhannuspäivä",
  "2016-11-05": "Pyhäinpäivä",
  "2016-12-06": "Itsenäisyyspäivä",
  "2016-12-24": "Jouluaatto",
  "2016-12-25": "Joulupäivä",
  "2016-12-26": "Tapaninpäivä",
  "2017-01-01": "Uudenvuodenpäivä",
  "2017-01-06": "Loppiainen",
  "2017-04-14": "Pitkäperjantai",
  "2017-04-15": "Pääsiäislauantai",
  "2017-04-16": "Pääsiäispäivä",
  "2017-04-17": "2. pääsiäispäivä",
  "2017-05-01": "Vappu",
  "2017-05-25": "Helatorstai",
  "2017-06-23": "Juhannusaatto",
  "2017-06-24": "Juhannuspäivä",
  "2017-11-04": "Pyhäinpäivä",
  "2017-12-06": "Itsenäisyyspäivä",
  "2017-12-24": "Jouluaatto",
  "2017-12-25": "Joulupäivä",
  "2017-12-26": "Tapaninpäivä",
  "2018-01-01": "Uudenvuodenpäivä",
  "2018-01-06": "Loppiainen",
  "2018-03-30": "Pitkäperjantai",
  "2018-03-31": "Pääsiäislauantai",
  "2018-04-01": "Pääsiäispäivä",
  "2018-04-02": "2. pääsiäispäivä",
  "2018-05-01": "Vappu",
  "2018-05-10": "Helatorstai",
  "2018-06-22": "Juhannusaatto",
  "2018-06-23": "Juhannuspäivä",
  "2018-11-03": "Pyhäinpäivä",
  "2018-12-06": "Itsenäisyyspäivä",
  "2018-12-24": "Jouluaatto",
  "2018-12-25": "Joulupäivä",
  "2018-12-26": "Tapaninpäivä",
  "2019-01-01": "Uudenvuodenpäivä",
  "2019-01-06": "Loppiainen",
  "2019-04-19": "Pitkäperjantai",
  "2019-04-20": "Pääsiäislauantai",
  "2019-04-21": "Pääsiäispäivä",
  "2019-04-22": "2. pääsiäispäivä",
  "2019-05-01": "Vappu",
  "2019-05-30": "Helatorstai",
  "2019-06-21": "Juhannusaatto",
  "2019-06-22": "Juhannuspäivä",
  "2019-11-02": "Pyhäinpäivä",
  "2019-12-06": "Itsenäisyyspäivä",
  "2019-12-24": "Jouluaatto",
  "2019-12-25": "Joulupäivä",
  "2019-12-26": "Tapaninpäivä",
  "2020-01-01": "Uudenvuodenpäivä",
  "2020-01-06": "Loppiainen",
  "2020-04-10": "Pitkäperjantai",
  "2020-04-11": "Pääsiäislauantai",
  "2020-04-12": "Pääsiäispäivä",
  "2020-04-13": "2. pääsiäispäivä",
  "2020-05-01": "Vappu",
  "2020-05-21": "Helatorstai",
  "2020-06-19": "Juhannusaatto",
  "2020-06-20": "Juhannuspäivä",
  "2020-10-31": "Pyhäinpäivä",
  "2020-12-06": "Itsenäisyyspäivä",
  "2020-12-24": "Jouluaatto",
  "2020-12-25": "Joulupäivä",
  "2020-12-26": "Tapaninpäivä",
  "2021-01-01": "Uudenvuodenpäivä",
  "2021-01-06": "Loppiainen",
  "2021-04-02": "Pitkäperjantai",
  "2021-04-03": "Pääsiäislauantai",
  "2021-04-04": "Pääsiäispäivä",
  "2021-04-05": "2. pääsiäispäivä",
  "2021-05-01": "Vappu",
  "2021-05-13": "Helatorstai",
  "2021-06-25": "Juhannusaatto",
  "2021-06-26": "Juhannuspäivä",
  "2021-11-06": "Pyhäinpäivä",
  "2021-12-06": "Itsenäisyyspäivä",
  "2021-12-24": "Jouluaatto",
  "2021-12-25": "Joulupäivä",
  "2021-12-26": "Tapaninpäivä"
}

},{}],14:[function(require,module,exports){
var DateTime = require('../DateTime')
var DateFormat = require('../DateFormat')
var holidays = require('./FI-holidays')
module.exports = {
  id: 'FI',
  monthNames: ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'],
  dayNames: ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'],
  shortDayNames: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
  yearsLabel: function (years) { return years + ' ' + (years === 1 ? 'vuosi' : 'vuotta') },
  monthsLabel: function (months) { return months + ' ' + (months === 1 ? 'kuukausi' : 'kuukautta') },
  daysLabel: function (days) { return days + ' ' + (days === 1 ? 'päivä' : 'päivää') },
  hoursLabel: function (hours, minutes) {
    var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
    return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? 'tunti' : 'tuntia')
  },
  clearRangeLabel: 'Poista valinta',
  clearDateLabel: 'Poista valinta',
  shortDateFormat: 'j.n.Y',
  weekDateFormat: 'D j.n.Y',
  dateTimeFormat: 'D j.n.Y k\\lo G:i',
  firstWeekday: DateTime.MONDAY,
  holidays: holidays
}

},{"../DateFormat":1,"../DateTime":5,"./FI-holidays":13}],15:[function(require,module,exports){
var DateTime = require('../DateTime')
var DateFormat = require('../DateFormat')
module.exports = {
  id: 'FR',
  monthNames: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  shortDayNames: ['D','L','M','M','J','V','S'],
  yearsLabel: function (years) { return years + ' ' + (years === 1 ? 'Année' : 'Années'); },
  monthsLabel: function (months) { return months + ' ' + (months === 1 ? 'Mois' : 'Moiss') },
  daysLabel: function (days) { return days + ' ' + (days === 1 ? 'Jour' : 'Jours') },
  hoursLabel: function (hours, minutes) {
    var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes)
    return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? 'Heure' : 'Heures')
  },
  clearRangeLabel: 'Effacer la sélection',
  clearDateLabel: 'Effacer la date',
  shortDateFormat: 'j/n/Y',
  weekDateFormat: 'D j/n/Y',
  dateTimeFormat: 'D j/n/Y G:i',
  firstWeekday: DateTime.MONDAY,
  holidays: {}
}

},{"../DateFormat":1,"../DateTime":5}],16:[function(require,module,exports){
var DateTime = require('../DateTime')
var DateFormat = require('../DateFormat')
module.exports = {
  id: 'LV',
  monthNames: ['Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs', ' Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'],
  dayNames: ['Svētdiena', 'Pirmdiena', 'Otrdiena', 'Trešdiena', 'Ceturtdiena', 'Piektdiena', 'Sestdiena'],
  shortDayNames: ['Sv', 'P', 'O', 'T', 'C', 'Pk', 'S'],
  yearsLabel: function (years) { return years + ' ' + (years === 1 ? 'G' : 'G'); },
  monthsLabel: function (months) { return months + ' ' + (months === 1 ? 'Mēnesī' : 'Mēnešiem') },
  daysLabel: function (days) { return days + ' ' + (days === 1 ? 'Diena' : 'Dienas') },
  hoursLabel: function (hours, minutes) {
    var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes)
    return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? 'Stundas' : 'Minūtes')
  },
  clearRangeLabel: 'TODO',
  clearDateLabel: 'TODO',
  shortDateFormat: 'j.n.Y',
  weekDateFormat: 'D j.n.Y',
  dateTimeFormat: 'D j.n.Y G:i',
  firstWeekday: DateTime.MONDAY,
  holidays: {}
}

},{"../DateFormat":1,"../DateTime":5}],17:[function(require,module,exports){
var DateTime = require('../DateTime')
var DateFormat = require('../DateFormat')

/**
 * For example:
 *   1 год
 *   2 года, 3 года, 4 года
 *   5 лет, 6 лет … 11 лет, 12 лет … 20 лет
 *   21 год, 31 год
 *   22 года, 32 года
 * @param {number} number
 * @param {Array} words
 * @return {string}
 */
function pluralize(number, words) {
  var magnitude = number % 100;
  var pluralWord = ''

  if ((magnitude > 10 && magnitude < 20) || (number === 0)) {
    pluralWord = words[2];
  } else {
    switch (Math.abs(number % 10)) {
      case 1:
        pluralWord = words[0];
        break
      case 2:
      case 3:
      case 4:
        pluralWord = words[1];
        break
      default:
        pluralWord = words[2];
        break
    }
  }
  return [number, pluralWord].join(' ')
}

module.exports = {
  id: 'RU',
  monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  shortDayNames: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  yearsLabel: function (years) {return pluralize(years, ['Год', 'Года', 'Лет'])},
  monthsLabel: function (months) {return pluralize(months, ['Месяц', 'Месяца', 'Месяцев'])},
  daysLabel: function (days) {return pluralize(days, ['День', 'Дня', 'Дней'])},
  hoursLabel: function (hours, minutes) {
    var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
    /*
     * It's weird to say like this but correct pronounce is:
     * 1,2  = '1 целая две десятых часа'
     * 0,1  = '1 десятая часа'
     * 0,06 = '6 сотых часа'
     * 2,05 = '2 целых пять сотых часа'
     * 3,12 = '3 целых двенадцать сотых часа'
     * 4,29 = '4 целых 29 сотых часа'
     */
    return hoursAndMinutes + ' Часа'
  },
  learRangeLabel: 'Очистить диапазон',
  clearDateLabel: 'Очистить дату',
  shortDateFormat: 'j.n.Y',
  weekDateFormat: 'D j.n.Y',
  dateTimeFormat: 'D j.n.Y G:i',
  firstWeekday: DateTime.MONDAY,
  holidays: {}
}

},{"../DateFormat":1,"../DateTime":5}],18:[function(require,module,exports){
var DateTime = require('../DateTime')
var DateFormat = require('../DateFormat')
module.exports = {
  id: 'SV',
  monthNames: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
  dayNames: ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'],
  shortDayNames: ['Sö', 'Må', 'Ti', 'On', 'To', 'Fr', 'Lö'],
  yearsLabel: function (years) { return years + ' ' + (years === 1 ? 'År' : 'År') },
  monthsLabel: function (months) { return months + ' ' + (months === 1 ? 'Månad' : 'Månader') },
  daysLabel: function (days) { return days + ' ' + (days === 1 ? 'Dag' : 'Dagar') },
  hoursLabel: function (hours, minutes) {
    var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
    return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? 'Minut' : 'Minuter')
  },
  clearRangeLabel: 'TODO',
  clearDateLabel: 'TODO',
  shortDateFormat: 'j.n.Y',
  weekDateFormat: 'D j.n.Y',
  dateTimeFormat: 'D j.n.Y G:i',
  firstWeekday: DateTime.MONDAY,
  holidays: {}
}

},{"../DateFormat":1,"../DateTime":5}],19:[function(require,module,exports){
window.ContinuousCalendar = require('../continuousCalendar/continuousCalendar')
window.DateFormat = require('dateutils').DateFormat
window.DateParse = require('dateutils').DateParse
window.DateLocale = require('dateutils').DateLocale
window.DateTime = require('dateutils').DateTime
window.DateRange = require('dateutils').DateRange

},{"../continuousCalendar/continuousCalendar":23,"dateutils":7}],20:[function(require,module,exports){
var DateFormat = require('dateutils').DateFormat
var DateTime = require('dateutils').DateTime
var util = require('./util')
var el = util.el

module.exports = function(calendarContainer, calendarRange, locale, customScroll, disableWeekends, disabledDatesObject) {
  var dateCellMap = {}
  var dateCellDates = []
  var dateCells = []
  var yearTitle = el('th', {className:'month'})
  var headerTable = el('table', {className: 'calendarHeader'}, headerRow(yearTitle))
  var bodyTable = el('table', {className: 'calendarBody'}, calendarBody())
  var scrollContent = el('div', {className:'calendarScrollContent'}, bodyTable)
  calendarContainer.appendChild(headerTable)

  if(customScroll) {
    bodyTable.classList.add('overview')
    scrollContent.classList.add('viewport')
    calendarContainer.appendChild(el('div', {
      className: 'tinyscrollbar',
      innerHTML: '<div class="scrollbar"> <div class="track"> <div class="thumb"> <div class="end"></div> </div> </div> </div>'
    }, scrollContent))
  } else {
    calendarContainer.appendChild(scrollContent)
  }
  highlightToday(dateCellMap)

  return {
    bodyTable    : bodyTable,
    scrollContent: scrollContent,
    dateCells    : dateCells,
    yearTitle    : yearTitle,
    dateCellMap  : dateCellMap,
    dateCellDates: dateCellDates,
    dateStyles   : dateStyles,
    getDateCell  : getDateCell
  }

  function headerRow(yearTitle) {
    var thead = el('thead')
    var tr = el('tr', {className:'month'}, yearTitle)
    tr.insertAdjacentHTML('beforeend', '<th class="week">&nbsp;</th>' + locale.dayNames.map(function(name, index) {
      return'<th class="weekDay">' + locale.shortDayNames[(index + locale.firstWeekday) % 7] + '</th>'
    }).join(''))
    thead.appendChild(tr)
    return thead
  }

  function highlightToday(dateCellMap) {
    var todayKey = DateFormat.format(DateTime.today(), 'Ymd', locale)
    if(todayKey in dateCellMap) {
      var dateCell = getDateCell(dateCellMap[todayKey])
      dateCell.classList.add('today')
      dateCell.innerHTML = '<div>' + dateCell.innerText + '</div>'

    }
  }

  function calendarBody() {
    var firstWeekDay = calendarRange.start.getFirstDateOfWeek(locale)
    var isFirst = true
    var rows = document.createDocumentFragment()

    while(firstWeekDay.compareTo(calendarRange.end) <= 0) {
      rows.appendChild(calendarRow(firstWeekDay, isFirst))
      isFirst = false
      firstWeekDay = firstWeekDay.plusDays(7)
    }

    return el('tbody', {}, rows)

    function calendarRow(firstDayOfWeek, isFirst) {
      var row = el('tr', {}, monthCell(firstDayOfWeek, isFirst))
      row.appendChild(weekCell(firstDayOfWeek))
      for(var i = 0; i < 7; i++) {
        var date = firstDayOfWeek.plusDays(i)
        row.appendChild(dateCell(date))
      }
      return row
    }

    function dateCell(date) {
      var td = el('td', {
        className:         dateStyles(date),
        innerText:         date.getDate()
      })
      if(locale.holidays && (date.toISODateString() in locale.holidays))
        td.title = locale.holidays[date.toISODateString()]
      td.setAttribute('date-cell-index', String(dateCellDates.length))
      dateCellMap[DateFormat.format(date, 'Ymd', locale)] = dateCellDates.length
      dateCellDates.push(date)
      dateCells.push(td)
      return td
    }

    function monthCell(firstDayOfWeek, isFirst) {
      var showMonth = isFirst || firstDayOfWeek.getDate() <= 7
      var showYear = firstDayOfWeek.getDate() <= 7 * 2 && firstDayOfWeek.getMonth() === 1
      return el('th', {
        className: 'month ' + backgroundBy(firstDayOfWeek) + (showMonth ? ' monthName':''),
        innerText: (showMonth ? locale.monthNames[firstDayOfWeek.getMonth()-1] : (showYear ? firstDayOfWeek.getFullYear() : ''))
      })
    }

    function weekCell(firstDayOfWeek) {
      return el('th', {
        className: 'week ' + backgroundBy(firstDayOfWeek),
        innerText: firstDayOfWeek.getWeekInYear('ISO')
      })
    }
  }

  function dateStyles(date) {
    return ['date', backgroundBy(date), disabledOrNot(date), todayStyle(date), holidayStyle(date)]
      .filter(function(x) { return x}).join(' ')
  }

  function backgroundBy(date) { return date.isOddMonth() ? 'odd' : '' }

  function disabledOrNot(date) {
    var disabledWeekendDay = disableWeekends && date.isWeekend()
    var disabledDay = disabledDatesObject[date.getOnlyDate().date]
    var outOfBounds = !calendarRange.hasDate(date)
    return outOfBounds || disabledWeekendDay || disabledDay ? 'disabled' : ''
  }

  function todayStyle(date) { return date.isToday() ? 'today' : '' }

  function holidayStyle(date) {
    var isSunday = date.getDay() === 0
    var isHoliday =  locale.holidays && (date.toISODateString() in locale.holidays)
    return (isSunday || isHoliday) ? 'holiday' : ''
  }

  function getDateCell(index) { return dateCells[index] }
}

},{"./util":24,"dateutils":7}],21:[function(require,module,exports){
var DateFormat = require('dateutils').DateFormat
var DateRange = require('dateutils').DateRange
var DateTime = require('dateutils').DateTime
var elemsAsList = require('./util').elemsAsList
var toggle = require('./util').toggle

module.exports = function(container, calendarBody, executeCallback, locale, params, getElemDate, calendar, startDate, setStartField,
                endDate, setEndField, calendarRange, disabledDatesList) {
  var mouseDownDate = null
  var selection
  var Status = {
    CREATE_OR_RESIZE: 'create',
    MOVE            : 'move',
    NONE            : 'none'
  }
  var status = Status.NONE

  return {
    showInitialSelection: setRangeLabels,
    initEvents          : initEvents,
    addRangeLengthLabel : addRangeLengthLabel,
    addEndDateLabel     : addEndDateLabel,
    addDateClearingLabel: addDateClearingLabel,
    setSelection        : setSelection,
    performTrigger      : performTrigger
  }

  function initEvents() {
    setInitialSelection()
    initRangeCalendarEvents(container, calendarBody.bodyTable)
    drawSelection()
  }

  function setSelection(start, end) {
    if (start && end) selection = new DateRange(start, end)
    mouseUp()
  }

  function addRangeLengthLabel() {
    var rangeLengthLabel = container.querySelector('.rangeLengthLabel')
    if(rangeLengthLabel && rangeLengthLabel.childNodes)
      return
    container.querySelector('.continuousCalendar').insertAdjacentHTML('beforeend', '<div class="label"><span class="rangeLengthLabel"></span></div>')
  }

  function addEndDateLabel(dateLabelContainer) { dateLabelContainer.insertAdjacentHTML('beforeend', '<span class="separator"> - </span><span class="endDateLabel"></span>') }

  function addDateClearingLabel() {
    if(params.allowClearDates) {
      container.querySelector('.continuousCalendar').insertAdjacentHTML('beforeend', '<div class="label clearLabel"><span class="clearDates clickable">' + locale.clearRangeLabel + '</span></div>')
    }
  }

  function performTrigger() {
    container.calendarRange = selection
    executeCallback(container, selection, params)
  }

  function setInitialSelection() {
    selection = startDate && endDate ? new DateRange(startDate, endDate) : DateRange.emptyRange()
    toggle(container.querySelector('span.separator'), selection.start || selection.end)
  }

  function initRangeCalendarEvents(container, bodyTable) {
    var rangeLengthLabel = container.querySelector('span.rangeLengthLabel')
    rangeLengthLabel.innerText = locale.daysLabel(selection.days())
    if (params.allowClearDates) {
      container.querySelector('span.clearDates').addEventListener('click', clearRangeClick)
    }
    bodyTable.classList.add(params.selectWeek ? 'weekRange' : 'freeRange')
    bodyTable.addEventListener('mousedown', mouseDown)
    bodyTable.addEventListener('mouseover', mouseMove)
    bodyTable.addEventListener('mouseup', mouseUp)
    disableTextSelection(bodyTable)
  }

  function mouseDown(event) {
    var elem = event.target
    var hasShiftKeyPressed = event.shiftKey
    if(isInstantSelection(elem, hasShiftKeyPressed)) {
      selection = instantSelection(elem, hasShiftKeyPressed)
    } else {
      status = Status.CREATE_OR_RESIZE
      mouseDownDate = getElemDate(elem)
      if(mouseDownDate.equalsOnlyDate(selection.end)) mouseDownDate = selection.start
      else if(mouseDownDate.equalsOnlyDate(selection.start)) mouseDownDate = selection.end
      else if(selection.hasDate(mouseDownDate)) status = Status.MOVE
      else if(enabledCell(elem)) startNewRange()
    }

    function enabledCell(elem) { return isDateCell(elem) && isEnabled(elem) }

    function isInstantSelection(elem, hasShiftKeyPressed) {
      if(params.selectWeek) return enabledCell(elem) || isWeekCell(elem)
      else return isWeekCell(elem) || isMonthCell(elem) || hasShiftKeyPressed

    }

    function instantSelection(elem, hasShiftKeyPressed) {
      if((params.selectWeek && enabledCell(elem)) || isWeekCell(elem)) {
        status = Status.NONE
        var firstDayOfWeek = getElemDate(elem.parentNode.querySelector('.date'))
        return instantSelectWeek(firstDayOfWeek)
      } else if(isMonthCell(elem)) {
        status = Status.NONE
        var dayInMonth = getElemDate(elem.parentNode.querySelector('.date'))
        return new DateRange(dayInMonth.firstDateOfMonth(), dayInMonth.lastDateOfMonth(), locale)
      } else if(hasShiftKeyPressed) {
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
        firstDay = firstDayOfWeek.withWeekday(DateTime.MONDAY)
        lastDay = firstDayOfWeek.withWeekday(DateTime.FRIDAY)
      }
      return new DateRange(firstDay, lastDay, locale).and(calendarRange)
    }
  }

  function startNewRange() { selection = new DateRange(mouseDownDate, mouseDownDate, locale) }

  function disableTextSelection(elem) {
    //Firefox
    elem.style.MozUserSelect = 'none'
    //IE
    elem.addEventListener('selectstart', function() { return false })
    //Opera, etc.
    elem.addEventListener('onmousedown', function() { return false })
  }

  function mouseMove(event) {
    if (status !== Status.NONE) {
      var date = getElemDate(event.target)
      var actions = {
        move:   function() {
          var deltaDays = mouseDownDate.distanceInDays(date)
          var movedSelection = selection.shiftDays(deltaDays).and(calendarRange)
          if (isPermittedRange(movedSelection)) {
            mouseDownDate = date
            selection = movedSelection
          }
        },
        create: function() {
          var newSelection = new DateRange(mouseDownDate, date, locale)
          if (isEnabled(event.target) && isPermittedRange(newSelection)) selection = newSelection
        }
      }
      if (date) actions[status]()
      drawSelection()
    }
  }

  function isPermittedRange(newSelection) { return newSelection.isPermittedRange(params.minimumRange, params.disableWeekends, calendarRange) }

  function mouseUp() {
    status = Status.NONE
    if(rangeHasDisabledDate()) selection = DateRange.emptyRange()
    drawSelection()
    afterSelection()
  }

  function clearRangeClick() {
    selection = DateRange.emptyRange()
    drawSelection()
    afterSelection()
  }

  function rangeHasDisabledDate() {
    for(var i = 0; i < disabledDatesList.length; i++) {
      if(selection.hasDate(DateTime.fromIsoDate(disabledDatesList[i]))) return true
    }
    return false
  }

  function drawSelection() {
    selection = DateRange.rangeWithMinimumSize(selection, params.minimumRange, params.disableWeekends, calendarRange)
    drawSelectionBetweenDates(selection)
    container.querySelector('span.rangeLengthLabel').innerText = locale.daysLabel(selection.days())
    var clearDates = container.querySelector('span.clearDates')
    if(clearDates) toggle(clearDates, selection.hasSelection())
  }

  function drawSelectionBetweenDates(range) {
    elemsAsList(container.querySelectorAll('td.selected')).forEach(function(el) {
      el.classList.remove('selected', 'rangeStart', 'rangeEnd', 'invalidSelection')
    })
    iterateAndToggleCells(range)
  }

  function iterateAndToggleCells(range) {
    if (range.days() > 0) {
      var startIndex = index(range.start)
      var endIndex = index(range.end)
      for (var i = startIndex; i <= endIndex; i++)
        calendarBody.getDateCell(i).className = dateCellStyle(calendarBody.dateCellDates[i], range.start, range.end).join(' ')
      if (rangeHasDisabledDate()) container.querySelector('td.selected').classList.add('invalidSelection')
    }
    function index(date) { return calendarBody.dateCellMap[DateFormat.format(date, 'Ymd', locale)] }
  }

  function dateCellStyle(date, start, end) {
    var styleClass = [calendarBody.dateStyles(date)]
    if(date.equalsOnlyDate(end)) return styleClass.concat('selected rangeEnd')
    if(date.equalsOnlyDate(start)) return styleClass.concat('selected rangeStart')
    if(date.isBetweenDates(start, end)) return styleClass.concat('selected')
    return styleClass
  }

  function afterSelection() {
    if(rangeHasDisabledDate()) {
      selection = DateRange.emptyRange()
      // Flash invalidSelection styled cells when selection is expanded to minimum length
      setTimeout(function() { drawSelectionBetweenDates(selection) }, 200)
    }
    container.calendarRange = selection
    setStartField(selection.start)
    setEndField(selection.end)
    setRangeLabels()
    if(params.selectWeek) calendar.close()
    executeCallback(container, selection, params)
  }

  function setRangeLabels() {
    if(!selection) setInitialSelection()
    var cont = container
    var startDateLabel = cont.querySelector('span.startDateLabel')
    var endDateLabel = cont.querySelector('span.endDateLabel')
    var clearRangeLabel = cont.querySelector('span.clearRangeLabel')
    var separator = cont.querySelector('span.separator')

    if(selection.start && selection.end) {
      var format = locale.weekDateFormat
      startDateLabel.innerText = DateFormat.format(selection.start, format, locale)
      endDateLabel.innerText = DateFormat.format(selection.end, format, locale)
      toggle(separator, true)
      if(clearRangeLabel) toggle(clearRangeLabel, true)
      toggle(startDateLabel.parentNode, true)
    } else {
      if (!selection.start) {
        startDateLabel.innerText = ''
        toggle(startDateLabel.parentNode, false)
      }
      if (!selection.end) {
        endDateLabel.innerText = ''
      }
      toggle(separator, false)
      if(clearRangeLabel) toggle(clearRangeLabel, false)
    }
  }

  function isDateCell(elem) { return elem.classList.contains('date') || elem.parentNode.classList.contains('date') }

  function isWeekCell(elem) { return elem.classList.contains('week') }

  function isMonthCell(elem) { return elem.classList.contains('month') }

  function isEnabled(elem) { return !elem.classList.contains('disabled') }
}

},{"./util":24,"dateutils":7}],22:[function(require,module,exports){
var DateFormat = require('dateutils').DateFormat
var DateParse = require('dateutils').DateParse
var toggle = require('./util').toggle

module.exports = function(container, calendarBody, executeCallback, locale, params, getElemDate, popupBehavior, startDate, setStartField) {
  return {
    showInitialSelection: showInitialSelection,
    initEvents          : initEvents,
    addRangeLengthLabel : function () { },
    addEndDateLabel     : function () { },
    addDateClearingLabel: addDateClearingLabel,
    setSelection        : setSelection,
    performTrigger      : performTrigger
  }

  function showInitialSelection() {
    if(startDate) {
      setFieldValues(startDate)
      var clearDates = container.querySelector('.clearDates')
      if(clearDates) toggle(clearDates, true)
    }
  }

  function initEvents() {
    initSingleDateCalendarEvents()
    setSelection(fieldDate(params.startField) || startDate)
  }

  function fieldDate(field) { return field && field.value && field.value.length > 0 ? DateParse.parse(field.value, locale) : null }

  function setSelection(date) {
    var selectedDateKey = date && DateFormat.format(date, 'Ymd', locale)
    if(selectedDateKey in calendarBody.dateCellMap) {
      setSelectedDate(date, calendarBody.getDateCell(calendarBody.dateCellMap[selectedDateKey]))
    }
  }

  function setSelectedDate(date, cell) {
    var selectedElem = container.querySelector('td.selected')
    selectedElem && selectedElem.classList.remove('selected')
    cell.classList.add('selected')
    setFieldValues(date)
  }

  function setFieldValues(date) {
    container.calendarRange = date
    setStartField(date)
    setDateLabel(DateFormat.format(date, locale.weekDateFormat, locale))
  }

  function addDateClearingLabel() {
    if(params.allowClearDates) {
      container.querySelector('.continuousCalendar').insertAdjacentHTML('beforeend', '<div class="label clearLabel">' +
        '<span class="clearDates clickable" style="display: none">' + locale.clearDateLabel + '</span></div>')
    }
  }

  function performTrigger() {
    container.calendarRange = startDate
    executeCallback(container, startDate, params)
  }

  function initSingleDateCalendarEvents() {
    container.addEventListener('click', function(e) {
      var dateCell = e.target.tagName === 'DIV' ? e.target.parentNode : e.target
      if (dateCell.classList.contains('date') && !dateCell.classList.contains('disabled')) {
        var selectedDate = getElemDate(dateCell)
        setSelectedDate(selectedDate, dateCell)
        popupBehavior.close()
        executeCallback(container, selectedDate, params)
      }
    })
    var clearDates = container.querySelector('.clearDates')
    if(clearDates) clearDates.addEventListener('click', clickClearDate)
  }

  function setDateLabel(val) {
    container.querySelector('span.startDateLabel').innerText = val
    if(params.allowClearDates) {
      toggle(container.querySelector('.clearDates'), val !== '')
    }
  }

  function clickClearDate() {
    container.querySelector('td.selected').classList.remove('selected')
    params.startField.value = ''
    setDateLabel('')
  }
}

},{"./util":24,"dateutils":7}],23:[function(require,module,exports){
var DateFormat = require('dateutils').DateFormat
var DateParse = require('dateutils').DateParse
var EN = require('dateutils').DateLocale.EN
var DateRange = require('dateutils').DateRange
var DateTime = require('dateutils').DateTime
var CalendarBody = require('./CalendarBody')
var RangeEvents = require('./RangeEvents')
var SingleDateEvents = require('./SingleDateEvents')
var el = require('./util').el
var extend = require('./util').extend
var elemsAsList = require('./util').elemsAsList
var toggle = require('./util').toggle

module.exports = function(container, options) {
  var defaults = {
    weeksBefore:     26,
    weeksAfter:      26,
    firstDate:       null,
    lastDate:        null,
    startField:      container.querySelector('input.startDate'),
    endField:        container.querySelector('input.endDate'),
    isPopup:         false,
    selectToday:     false,
    locale:          EN,
    disableWeekends: false,
    disabledDates:   null,
    minimumRange:    -1,
    selectWeek:      false,
    fadeOutDuration: 0,
    callback:        function() {},
    popupCallback:   function() {},
    customScroll:    false,
    scrollOptions:   {
      sizethumb: 'auto'
    },
    theme:           '',
    allowClearDates: false,
    isRange:         false,
    startDate:       null,
    endDate:         null,
    useIsoForInput:  false,
    initScrollBar: function() { },
    executeCallback: function() { }
  }
  var params = extend(defaults, options)
  var locale = params.locale
  var startDate = fieldDate(params.startField) || params.startDate
  var endDate = fieldDate(params.endField) || params.endDate
  var today = DateTime.today()

  if(params.selectToday) {
    startDate = today
    endDate = today
    setStartField(today)
    setEndField(today)
  }
  var averageCellHeight
  var calendarContainer
  var beforeFirstOpening = true
  var popupBehavior
  var dateBehavior
  var customScrollContainer
  var calendarBody = {}
  var calendarRange
  var disabledDatesList
  var disabledDatesObject

  container.classList.add('continuousCalendarContainer', 'params.theme')
  createCalendar()

  function createCalendar() {
    //TODO change api to take YYYY-MM-DD instead of MM/DD/YYYY and array instead of space separated string
    disabledDatesList = params.disabledDates ? params.disabledDates.split(' ').map(function(slashStr) {
      var mdy = slashStr.split('/')
      var year = mdy[2]
      var month = mdy[0]
      var day = mdy[1]
      return [year, (month.length === 1 ? '0' : '') + month, (day.length === 1 ? '0' : '') + day].join('-')
    }) : []
    disabledDatesObject = params.disabledDates ? parseDisabledDates(disabledDatesList) : {}
    calendarRange = determineRangeToRenderFormParams(params)
    popupBehavior = popUpBehaviour(params.isPopup)
    dateBehavior = dateBehaviour(params.isRange)
    params.fadeOutDuration = +params.fadeOutDuration
    calendarContainer = getCalendarContainerOrCreateOne()
    //calendarContainer.click(function(e) { e.stopPropagation() })
    if(!container.querySelector('.startDateLabel')) addDateLabels(container, popupBehavior, dateBehavior)
    popupBehavior.initUI()
    dateBehavior.showInitialSelection()
    dateBehavior.performTrigger()
  }

  function initCalendarTable() {
    if(!calendarBody.scrollContent) {

      calendarBody = extend(calendarBody, CalendarBody(calendarContainer, calendarRange, locale,
        params.customScroll, params.disableWeekends, disabledDatesObject))
      bindScrollEvent()

      popupBehavior.initState()
      dateBehavior.addRangeLengthLabel()
      dateBehavior.addDateClearingLabel()
      dateBehavior.initEvents()
      scrollToSelection()
    }
  }

  function determineRangeToRenderFormParams(params) {
    var firstWeekdayOfGivenDate = (startDate || DateTime.today()).getFirstDateOfWeek(locale)
    var rangeStart = dateOrWeek(params.firstDate, -params.weeksBefore * 7)
    var rangeEnd = dateOrWeek(params.lastDate, params.weeksAfter * 7 + 6)

    return new DateRange(rangeStart, rangeEnd)

    function dateOrWeek(date, week) {
      if(date) {
        if(date instanceof Date) {
          return DateTime.fromDateObject(date)
        } else if(date instanceof DateTime) {
          return date
        } else {
          return DateParse.parse(date, locale)
        }
      }
      return firstWeekdayOfGivenDate.plusDays(week)
    }
  }

  function bindScrollEvent() {
    if(params.customScroll) {
      if(!customScrollContainer) customScrollContainer = params.initScrollBar(container, params)
      customScrollContainer.bind('scroll', setYearLabel)
    } else {
      var waiting = false
      calendarBody.scrollContent.addEventListener('scroll', function() {
        if(!waiting) {
          setTimeout(function() {
            waiting = false
            setYearLabel()
          }, 250)
          waiting = true
        }
      })
    }
  }

  function parseDisabledDates(dates) {
    var dateMap = {}
    dates.forEach(function(date) { dateMap[DateTime.fromIsoDate(date).date] = true })
    return dateMap
  }

  function dateBehaviour(isRange) {
    var basicParams = [container, calendarBody, params.executeCallback, locale, params, getElemDate, popupBehavior, startDate, setStartField]
    var rangeParams = [endDate, setEndField, calendarRange, disabledDatesList]
    return isRange ? RangeEvents.apply(null, basicParams.concat(rangeParams)) : SingleDateEvents.apply(null, basicParams)
  }

  function popUpBehaviour(isPopup) {
    var popUpVersion = {
      initUI:                function() {
        calendarContainer.classList.add('popup')
        toggle(calendarContainer, false)
        var icon = el('a', {
          'href':  '#',
          'className': 'calendarIcon',
          'innerText': today.getDate()
        })
        icon.addEventListener('click', toggleCalendar)
        container.insertBefore(icon, container.firstChild)
      },
      initState:             function() { },
      getContainer:          function(newContainer) {
        var popUpContainer = el('div', {
          'className': 'popUpContainer'
        })
        popUpContainer.appendChild(newContainer)
        return popUpContainer
      },
      close:                 toggleCalendar,
      addDateLabelBehaviour: function(labels) {
        elemsAsList(labels).forEach(function(label) {
          label.classList.add('clickable')
          label.addEventListener('click', toggleCalendar)
        })
      }
    }

    function toggleCalendar() {
      initCalendarTable()
      if(calendarContainer.style.display === '' ) {
        //calendarContainer.fadeOut(params.fadeOutDuration)
        toggle(calendarContainer, false)
        //TODO re-actiate
        //$(document).unbind('click.continuousCalendar')
      } else {
        params.popupCallback()
        toggle(calendarContainer, true)
        if(beforeFirstOpening) {
          params.initScrollBar(container, params)
          calculateCellHeight()
          setYearLabel()
          beforeFirstOpening = false
        }
        dateBehavior.setSelection(fieldDate(params.startField), fieldDate(params.endField))
        scrollToSelection()
        //TODO re-actiate
        //$(document).bind('click.continuousCalendar', toggleCalendar)

      }
      return false
    }

    var inlineVersion = {
      initUI:                initCalendarTable,
      initState:             calculateCellHeightAndInitScroll,
      getContainer:          function(newContainer) {
        return newContainer
      },
      close:                 function() {},
      addDateLabelBehaviour: function() {}
    }
    return isPopup ? popUpVersion : inlineVersion
  }

  function getCalendarContainerOrCreateOne() {
    var existingContainer = container.querySelector('.continuousCalendar')
    if(existingContainer) {
      return existingContainer
    } else {
      var newContainer = el('div', {'className':'continuousCalendar'})
      container.appendChild(popupBehavior.getContainer(newContainer))
      return newContainer
    }
  }

  function addDateLabels(container2, popupBehavior, dateBehavior) {
    var dateLabelContainer = el('div', {'className': 'label'})
    dateLabelContainer.appendChild(el('span', {'className': 'startDateLabel'}))
    dateBehavior.addEndDateLabel(dateLabelContainer)
    container2.insertBefore(dateLabelContainer, container2.firstChild)
    popupBehavior.addDateLabelBehaviour(dateLabelContainer.childNodes)
  }

  function scrollToSelection() {
    var scrollContent = calendarBody.scrollContent
    var selectionStartOrToday = scrollContent.querySelector('.selected') || scrollContent.querySelector('.today')
    if(selectionStartOrToday) {
      var height = calendarBody.scrollContent.clientHeight
      var position = selectionStartOrToday.offsetTop - (height - selectionStartOrToday.offsetHeight) / 2
      if(params.customScroll) {
        var totalHeight = calendarBody.bodyTable.clientHeight
        var maxScroll = totalHeight - height
        var validPosition = position > maxScroll ? maxScroll : position
        customScrollContainer.tinyscrollbar_update(validPosition > 0 ? validPosition : 0)
      } else {
        calendarBody.scrollContent.scrollTop = position
      }
    }
  }

  function setYearLabel() {
    var scrollContent = calendarBody.scrollContent
    var table = scrollContent.querySelector('table')
    var scrollTop = params.customScroll ? -calendarContainer.querySelector('.overview').offsetTop : scrollContent.scrollTop
    var rowNumber = parseInt(scrollTop / averageCellHeight, 10)
    var date = getElemDate(table.rows[rowNumber].cells[2])
    calendarBody.yearTitle.innerText = date.getFullYear()
  }

  function calculateCellHeightAndInitScroll() {
    params.initScrollBar(container, params)
    calculateCellHeight()
    setYearLabel()
  }

  function calculateCellHeight() { averageCellHeight = parseInt(calendarBody.bodyTable.clientHeight / calendarBody.bodyTable.querySelectorAll('tr').length, 10) }

  function fieldDate(field) { return field && field.value && field.value.length > 0 ? (params.useIsoForInput ? DateTime.fromIsoDate(field.value) : DateParse.parse(field.value, locale)) : null }

  function getElemDate(elem) {
    return calendarBody.dateCellDates[elem.getAttribute('date-cell-index') || elem.parentNode.getAttribute('date-cell-index')]
  }

  function setStartField(date) { if(params.startField) params.startField.value = formatDate(date) }

  function setEndField(date) { if(params.endField) params.endField.value = formatDate(date) }

  function formatDate(date) { return date ? (params.useIsoForInput ? date.toISODateString() : DateFormat.shortDateFormat(date, locale)) : '' }

}

},{"./CalendarBody":20,"./RangeEvents":21,"./SingleDateEvents":22,"./util":24,"dateutils":7}],24:[function(require,module,exports){
module.exports = {
  el: el,
  extend: extend,
  elemsAsList: elemsAsList,
  toggle: toggle
}

function extend(destination, source) {
  for(var property in source)
    destination[property] = source[property]
  return destination
}

function el(tagName, properties, childNode) {
  var elem = document.createElement(tagName)
  for(var i in properties) elem[i] = properties[i]
  if(childNode) elem.appendChild(childNode)
  return elem
}

function elemsAsList(selector) {
  return Array.prototype.slice.call(selector)
}

function toggle(elem, show) {
  if(elem) elem.style.display = show ? '' : 'none'
}

},{}]},{},[19]);
