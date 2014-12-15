var DateTime = require('./DateTime')
var DateFormat = {}
var codes = {
  d: function (d, l) { return leftPad(d.getDate(), 2, '0') },
  D: function (d, l) { return l.shortDayNames[d.getDay()] },
  j: function (d, l) { return d.getDate() },
  l: function (d, l) { return l.dayNames[d.getDay()] },
  w: function (d, l) { return d.getDay() },
  z: function (d, l) { return d.getDayInYear() },
  F: function (d, l) { return l.monthNames[d.getMonth() - 1] },
  m: function (d, l) { return leftPad(d.getMonth(), 2, '0') },
  M: function (d, l) { return l.monthNames[d.getMonth() - 1].substring(0, 3) },
  n: function (d, l) { return (d.getMonth()) },
  t: function (d, l) { return d.getDaysInMonth() },
  Y: function (d, l) { return d.getFullYear() },
  y: function (d, l) { return ('' + d.getFullYear()).substring(2, 4) },
  a: function (d, l) { return (d.getHours() < 12 ? 'am' : 'pm') },
  A: function (d, l) { return (d.getHours() < 12 ? 'AM' : 'PM') },
  g: function (d, l) { return ((d.getHours() % 12) ? d.getHours() % 12 : 12) },
  G: function (d, l) { return d.getHours() },
  h: function (d, l) { return leftPad((d.getHours() % 12) ? d.getHours() % 12 : 12, 2, '0') },
  H: function (d, l) { return leftPad(d.getHours(), 2, '0') },
  i: function (d, l) { return leftPad(d.getMinutes(), 2, '0') },
  s: function (d, l) { return leftPad(d.getSeconds(), 2, '0') },
  O: function (d, l) { return getGMTOffset(d) },
  Z: function (d, l) { return (d.getTimezoneOffset() * -60) }
}

DateFormat.hoursAndMinutes = function (hours, minutes) { return (Math.round((hours + minutes / 60) * 100) / 100).toString() }

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

DateFormat.shortDateFormat = function (dateTime, locale) { return DateFormat.format(dateTime, locale ? locale.shortDateFormat : 'n/j/Y', locale) }

DateFormat.formatRange = function (dateRange, locale) {
  if (dateRange._hasTimes) {
    return locale.daysLabel(dateRange.days()) + ' ' + locale.hoursLabel(dateRange.hours(), dateRange.minutes())
  } else {
    return DateFormat.shortDateFormat(dateRange.start, locale) + ' - ' + DateFormat.shortDateFormat(dateRange.end, locale)
  }
}

DateFormat.formatDefiningRangeDuration = function (dateRange, locale) {
  var years = parseInt(dateRange.days() / 360, 10)
  if (years > 0) return locale.yearsLabel(years)
  var months = parseInt(dateRange.days() / 30, 10)
  if (months > 0) return locale.monthsLabel(months)
  return locale.daysLabel(dateRange.days())
}

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

function codeToValue(dateTime, ch, locale) {
  return ch in codes ? codes[ch](dateTime, locale) : ch
}

function getGMTOffset(dateTime) {
  return (dateTime.date.getTimezoneOffset() > 0 ? '-' : '+') +
    leftPad(Math.floor(dateTime.getTimezoneOffset() / 60), 2, '0') +
    leftPad(dateTime.getTimezoneOffset() % 60, 2, '0')
}

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