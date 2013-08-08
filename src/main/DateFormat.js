define(function(require) {
  var DateTime = require('./DateTime')

  var DateFormat = {}
  DateFormat.parseFunctions = {count: 0}
  DateFormat.parseRegexes = []
  DateFormat.formatFunctions = {count: 0}

  DateFormat.hoursAndMinutes = function(hours, minutes) { return (Math.round((hours + minutes / 60) * 100) / 100).toString() }

  DateFormat.format = function(dateTime, format, locale) {
    if(DateFormat.formatFunctions[format] === undefined) {
      DateFormat.createNewFormat(dateTime, format, locale)
    }
    var func = DateFormat.formatFunctions[format]
    return dateTime[func]()
  }

  DateFormat.shortDateFormat = function(dateTime, locale) { return DateFormat.format(dateTime, locale ? locale.shortDateFormat : 'n/j/Y', locale) }

  DateFormat.formatRange = function(dateRange, locale) {
    if(dateRange._hasTimes) {
      return  locale.daysLabel(dateRange.days()) + ' ' + locale.hoursLabel(dateRange.hours(), dateRange.minutes())
    } else {
      return DateFormat.shortDateFormat(dateRange.start, locale) + ' - ' + DateFormat.shortDateFormat(dateRange.end, locale)
    }
  }

  DateFormat.formatDefiningRangeDuration = function(dateRange, locale) {
    var years = parseInt(dateRange.days() / 360, 10)
    if(years > 0) return locale.yearsLabel(years)
    var months = parseInt(dateRange.days() / 30, 10)
    if(months > 0) return locale.monthsLabel(months)
    return locale.daysLabel(dateRange.days())
  }

  DateFormat.getGMTOffset = function(dateTime) {
    return (dateTime.date.getTimezoneOffset() > 0 ? '-' : '+') +
        DateFormat.leftPad(Math.floor(dateTime.getTimezoneOffset() / 60), 2, '0') +
        DateFormat.leftPad(dateTime.getTimezoneOffset() % 60, 2, '0')
  }

  DateFormat.leftPad = function(val, size, ch) {
    var result = String(val)
    if(ch === null) {
      ch = ' '
    }
    while(result.length < size) {
      result = ch + result
    }
    return result
  }

  DateFormat.escape = function(string) { return string.replace(/('|\\)/g, '\\$1') }

  DateFormat.parse = function(input) {
    if(input === 'today') {
      return DateTime.today()
    }
    return new DateTime(input)
  }

  DateFormat.patterns = {
    ISO8601LongPattern              : 'Y-m-d H:i:s',
    ISO8601ShortPattern             : 'Y-m-d',
    ShortDatePattern                : 'n/j/Y',
    FiShortDatePattern              : 'j.n.Y',
    FiWeekdayDatePattern            : 'D j.n.Y',
    FiWeekdayDateTimePattern        : 'D j.n.Y k\\lo G:i',
    LongDatePattern                 : 'l, F d, Y',
    FullDateTimePattern             : 'l, F d, Y g:i:s A',
    MonthDayPattern                 : 'F d',
    ShortTimePattern                : 'g:i A',
    LongTimePattern                 : 'g:i:s A',
    SortableDateTimePattern         : 'Y-m-d\\TH:i:s',
    UniversalSortableDateTimePattern: 'Y-m-d H:i:sO',
    YearMonthPattern                : 'F, Y'
  }

  DateFormat.parseTime = function(timeStr) {
    var splittedTime = splitTime(timeStr.replace(/:|,/i, '.'))
    var time = [+(splittedTime[0]), +(splittedTime[1])]
    return (isHour(time[0]) && isMinute(time[1])) ? time : null

    function splitTime(timeStr) {
      if (timeStr.indexOf('.') !== -1) {
        return  timeStr.split('.')
      }
      var splitTimes = {
        4: [timeStr.slice(0, 2) , timeStr.slice(2, 4)],
        3: [timeStr.slice(0, 1) , timeStr.slice(1, 3)],
        2: [timeStr, 0]
      }
      return splitTimes[timeStr.length] || [-1, -1]
    }

    function isMinute(minutes) { return !isNaN(minutes) && minutes >= 0 && minutes <= 59 }

    function isHour(hours) { return !isNaN(hours) && hours >= 0 && hours <= 23 }
  }

  DateFormat.createNewFormat = function(dateTime, format, locale) {
    var funcName = 'format' + DateFormat.formatFunctions.count++
    DateFormat.formatFunctions[format] = funcName
    var code = 'DateTime.prototype.' + funcName + ' = function(){return '
    var special = false
    var ch = ''
    for(var i = 0; i < format.length; ++i) {
      ch = format.charAt(i)
      if(!special && ch === '\\') {
        special = true
      } else {
        if(special) {
          special = false
          code += "'" + DateFormat.escape(ch) + "' + "
        } else {
          code += DateFormat.getFormatCode(ch, locale)
        }
      }
    }
    eval(code.substring(0, code.length - 3) + ';}')
  }

  DateFormat.getFormatCode = function(character) {
    var codes = {
      d: "DateFormat.leftPad(this.getDate(), 2, '0') + ",
      D: 'locale.shortDayNames[this.getDay()] + ',
      j: 'this.getDate() + ',
      l: 'locale.dayNames[this.getDay()] + ',
      w: 'this.getDay() + ',
      z: 'this.getDayInYear() + ',
      F: 'locale.monthNames[this.getMonth()-1] + ',
      m: "DateFormat.leftPad(this.getMonth(), 2, '0') +",
      M: 'locale.monthNames[this.getMonth()-1].substring(0, 3) + ',
      n: '(this.getMonth()) + ',
      t: 'this.getDaysInMonth() + ',
      Y: 'this.getFullYear() + ',
      y: "('' + this.getFullYear()).substring(2, 4) + ",
      a: "(this.getHours() < 12 ? 'am' : 'pm') + ",
      A: "(this.getHours() < 12 ? 'AM' : 'PM') + ",
      g: '((this.getHours() %12) ? this.getHours() % 12 : 12) + ',
      G: 'this.getHours() + ',
      h: "DateFormat.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + ",
      H: "DateFormat.leftPad(this.getHours(), 2, '0') + ",
      i: "DateFormat.leftPad(this.getMinutes(), 2, '0') + ",
      s: "DateFormat.leftPad(this.getSeconds(), 2, '0') + ",
      O: 'DateFormat.getGMTOffset(this) + ',
      Z: '(this.getTimezoneOffset() * -60) + '
    }
    return character in codes ? codes[character] : "'" + DateFormat.escape(character) + "' + "
  }
  return DateFormat
})
