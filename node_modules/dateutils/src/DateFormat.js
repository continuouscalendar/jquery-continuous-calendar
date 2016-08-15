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
