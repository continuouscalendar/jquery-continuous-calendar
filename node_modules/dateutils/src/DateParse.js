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
