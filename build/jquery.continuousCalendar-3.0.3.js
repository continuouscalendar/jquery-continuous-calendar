$.continuousCalendar = {};$.continuousCalendar.version = '3.0.3';$.continuousCalendar.released = '2013-04-13'
;
(function(root, factory) {
  if(typeof define === "function" && define.amd) {
    define(["jquery"], factory)
  } else {
    root.DateTime = factory(root.jQuery)
  }
})(this, function($) {
  var DateTime = function(year, month, date, hours, minutes, seconds) {
    if(arguments.length == 0) this.date = new Date()
    else if(year instanceof Date) this.date = new Date(year.getTime())
    else if(typeof year == 'string') this.date = new Date(year)
    else if(typeof year == 'number') this.date = createSafeDate(year, month - 1, date, hours, minutes, seconds)
    else throw Error('None of supported parameters was used for constructor: ' + Array.prototype.slice.call(arguments).join(', '))

    function createSafeDate(year, month, date, hours, minutes, seconds) {
      seconds = seconds || 0
      var newDate = new Date(year, month, date, hours, minutes, seconds || 0, 0)
      if(newDate.toString() == 'Invalid Date' ||
        month != newDate.getMonth() ||
        year != newDate.getFullYear() ||
        date != newDate.getDate() ||
        hours != newDate.getHours() ||
        minutes != newDate.getMinutes() ||
        seconds != newDate.getSeconds()) throw Error('Invalid Date: ' + year + '/' + month + '/' + date + ' ' + hours + ':' + minutes + ':' + seconds)
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

  DateTime.fromDateTime = function(year, month, day, hours, minutes) {
    return new DateTime(year, month, day, hours, minutes)
  }

  DateTime.fromDate = function(year, month, day) {
    return DateTime.fromDateTime(year, month, day, 0, 0)
  }

  DateTime.fromDateObject = function(date) {
    return DateTime.fromMillis(date.getTime())
  }

  DateTime.prototype.toISOString = function() {
    return $.map([this.getFullYear(), (this.getMonth()), this.getDate()], withTwoDigitsAtLeast).join('-') + 'T' +
      $.map([this.getHours(), this.getMinutes(), this.getSeconds()], withTwoDigitsAtLeast).join(':')
    function withTwoDigitsAtLeast(value) { return value < 10 ? '0' + value : '' + value}
  }

  DateTime.prototype.getMonth = function() {
    return this.date.getMonth() + 1
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
    var time = parseTime(dateAndTime.length == 2 && dateAndTime[1])
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

  DateTime.prototype.withResetMS = function() {
    var newDate = this.clone()
    newDate.date.setMilliseconds(0)
    return newDate
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
    if(this.getMonth() == 12 && this.getDate() >= 29 && (this.getDate() - weekday) > 27) {
      return 1
    }
    // If Jan 1-3 falls on Fri, Sat or Sun, it's on the last week of the previous year
    if(this.getMonth() == 1 && this.getDate() < 4 && weekday > THU) {
      return new DateTime(new Date(this.getFullYear() - 1, 11, 31)).getWeekInYear('ISO')
    }
    var week = Math.ceil((this.getDayInYear() + firstDay - 1) / 7)
    // If first days of this year are on last year's last week, the above gives one week too much
    if(firstDay > THU) week--
    return week
  }

  DateTime.prototype.clone = function() { return new DateTime(this.date) }

  DateTime.fromMillis = function(ms) { return new DateTime(new Date(ms)) }

  DateTime.prototype.isOddMonth = function() { return this.getMonth() % 2 == 0 }

  DateTime.prototype.equalsOnlyDate = function(date) {
    if(!date) {
      return false
    }
    return this.getMonth() == date.getMonth() && this.getDate() == date.getDate() && this.getFullYear() == date.getFullYear()
  }

  DateTime.prototype.isBetweenDates = function(start, end) {
    if(start.getTime() > end.getTime()) throw Error("start date can't be after end date")
    return this.compareTo(start) >= 0 && this.compareTo(end) <= 0
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

  DateTime.prototype.isWeekend = function() { return this.getDay() == 6 || this.getDay() == 0 }

  DateTime.prototype.toString = function() { return this.toISOString() }

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
;
(function(root, factory) {
  if(typeof define === "function" && define.amd) {
    define(["./DateTime"], factory)
  } else {
    root.DateFormat = factory(root.DateTime)
  }
})(this, function(DateTime) {
  var DateFormat = {}
  DateFormat.parseFunctions = {count: 0}
  DateFormat.parseRegexes = []
  DateFormat.formatFunctions = {count: 0}

  DateFormat.hoursAndMinutes = function(hours, minutes) { return (Math.round((hours + minutes / 60) * 100) / 100).toString() }

  DateFormat.format = function(dateTime, format, locale) {
    if(DateFormat.formatFunctions[format] == null) {
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
    return (dateTime.date.getTimezoneOffset() > 0 ? "-" : "+") +
      DateFormat.leftPad(Math.floor(dateTime.getTimezoneOffset() / 60), 2, "0") +
      DateFormat.leftPad(dateTime.getTimezoneOffset() % 60, 2, "0")
  }

  DateFormat.leftPad = function(val, size, ch) {
    var result = String(val)
    if(ch == null) {
      ch = " "
    }
    while(result.length < size) {
      result = ch + result
    }
    return result
  }

  DateFormat.escape = function(string) { return string.replace(/('|\\)/g, "\\$1") }

  DateFormat.parse = function(input, locale) {
    if(input == 'today') {
      return DateTime.now()
    }
    var date = new Date(input)
    if(isNaN(date.getTime())) {
      throw Error('Could not parse date from "' + input + '"')
    }
    return new DateTime(date, locale)
  }

  DateFormat.patterns = {
    ISO8601LongPattern              : "Y-m-d H:i:s",
    ISO8601ShortPattern             : "Y-m-d",
    ShortDatePattern                : "n/j/Y",
    FiShortDatePattern              : "j.n.Y",
    FiWeekdayDatePattern            : "D j.n.Y",
    FiWeekdayDateTimePattern        : "D j.n.Y k\\lo G:i",
    LongDatePattern                 : "l, F d, Y",
    FullDateTimePattern             : "l, F d, Y g:i:s A",
    MonthDayPattern                 : "F d",
    ShortTimePattern                : "g:i A",
    LongTimePattern                 : "g:i:s A",
    SortableDateTimePattern         : "Y-m-d\\TH:i:s",
    UniversalSortableDateTimePattern: "Y-m-d H:i:sO",
    YearMonthPattern                : "F, Y"
  }

  DateFormat.parseTime = function(timeStr) {
    var splittedTime = splitTime(timeStr.replace(/:|,/i, '.'))
    var time = [+(splittedTime[0]), +(splittedTime[1])]
    return (isHour(time[0]) && isMinute(time[1])) ? time : null

    function splitTime(timeStr) {
      if(timeStr.indexOf('.') != -1) {
        return  timeStr.split('.')
      }
      switch(timeStr.length) {
        case 4:
          return [timeStr.slice(0, 2) , timeStr.slice(2, 4)]
        case 3:
          return [timeStr.slice(0, 1) , timeStr.slice(1, 3)]
        case 2:
          return [timeStr, 0]
        default:
          return [-1, -1]
      }
    }

    function isMinute(minutes) { return !isNaN(minutes) && minutes >= 0 && minutes <= 59 }

    function isHour(hours) { return !isNaN(hours) && hours >= 0 && hours <= 23 }
  }

  DateFormat.createNewFormat = function(dateTime, format, locale) {
    var funcName = "format" + DateFormat.formatFunctions.count++
    DateFormat.formatFunctions[format] = funcName
    var code = "DateTime.prototype." + funcName + " = function(){return "
    var special = false
    var ch = ''
    for(var i = 0; i < format.length; ++i) {
      ch = format.charAt(i)
      if(!special && ch == "\\") {
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
    eval(code.substring(0, code.length - 3) + ";}")
  }

  DateFormat.getFormatCode = function(character) {
    switch(character) {
      case "d":
        return "DateFormat.leftPad(this.getDate(), 2, '0') + "
      case "D":
        return "locale.shortDayNames[this.getDay()] + "
      case "j":
        return "this.getDate() + "
      case "l":
        return "locale.dayNames[this.getDay()] + "
      case "w":
        return "this.getDay() + "
      case "z":
        return "this.getDayInYear() + "
      case "F":
        return "locale.monthNames[this.getMonth()-1] + "
      case "m":
        return "DateFormat.leftPad(this.getMonth(), 2, '0') + "
      case "M":
        return "locale.monthNames[this.getMonth()-1].substring(0, 3) + "
      case "n":
        return "(this.getMonth()) + "
      case "t":
        return "this.getDaysInMonth() + "
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
        return "DateFormat.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + "
      case "H":
        return "DateFormat.leftPad(this.getHours(), 2, '0') + "
      case "i":
        return "DateFormat.leftPad(this.getMinutes(), 2, '0') + "
      case "s":
        return "DateFormat.leftPad(this.getSeconds(), 2, '0') + "
      case "O":
        return "DateFormat.getGMTOffset(this) + "
      case "Z":
        return "(this.getTimezoneOffset() * -60) + "
      default:
        return "'" + DateFormat.escape(character) + "' + "
    }
  }
  return DateFormat
})
;
(function(root, factory) {
  if(typeof define === "function" && define.amd) {
    define(["./DateTime", "./DateFormat"], factory)
  } else {
    root.DateLocale = factory(root.DateTime, root.DateFormat)
  }
})(this, function(DateTime, DateFormat) {
  var DateLocale = {
    FI: {
      id             : 'FI',
      monthNames     : ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'],
      dayNames       : ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'],
      shortDayNames  : ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
      yearsLabel     : function(years) { return years + ' ' + (years == '1' ? 'vuosi' : 'vuotta') },
      monthsLabel    : function(months) { return months + ' ' + (months == '1' ? 'kuukausi' : 'kuukautta') },
      daysLabel      : function(days) { return days + ' ' + (days == '1' ? 'päivä' : 'päivää') },
      hoursLabel     : function(hours, minutes) {
        var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
        return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'tunti' : 'tuntia')
      },
      shortDateFormat: 'j.n.Y',
      weekDateFormat : 'D j.n.Y',
      dateTimeFormat : 'D j.n.Y k\\lo G:i',
      firstWeekday   : DateTime.MONDAY
    },
    EN: {
      id             : 'EN',
      monthNames     : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      dayNames       : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      shortDayNames  : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      yearsLabel     : function(years) { return years + ' ' + (years == '1' ? 'Year' : 'Years'); },
      monthsLabel    : function(months) { return months + ' ' + (months == '1' ? 'Months' : 'Months') },
      daysLabel      : function(days) { return days + ' ' + (days == '1' ? 'Day' : 'Days') },
      hoursLabel     : function(hours, minutes) {
        var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes)
        return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Hour' : 'Hours')
      },
      shortDateFormat: 'n/j/Y',
      weekDateFormat : 'D n/j/Y',
      dateTimeFormat : 'D n/j/Y G:i',
      firstWeekday   : DateTime.SUNDAY
    },
    AU: {
      id             : 'AU',
      monthNames     : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      dayNames       : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      shortDayNames  : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      yearsLabel     : function(years) { return years + ' ' + (years == '1' ? 'Year' : 'Years'); },
      monthsLabel    : function(months) { return months + ' ' + (months == '1' ? 'Months' : 'Months') },
      daysLabel      : function(days) { return days + ' ' + (days == '1' ? 'Day' : 'Days') },
      hoursLabel     : function(hours, minutes) {
        var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes)
        return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Hour' : 'Hours')
      },
      shortDateFormat: 'j/n/Y',
      weekDateFormat : 'D j/n/Y',
      dateTimeFormat : 'D j/n/Y G:i',
      firstWeekday   : DateTime.SUNDAY
    },
    ET: {
      id             : 'ET',
      monthNames     : [ 'Jaanuar', 'Veebruar', 'Märts', 'Aprill', 'Mai', 'Juuni', 'Juuli', 'August', 'September', 'Oktoober', 'November', 'Detsember'],
      dayNames       : ['Pühapäev', 'Esmaspäev', 'Teisipäev', 'Kolmapäev', 'Neljapäev', 'Reede', 'Laupäev'],
      shortDayNames  : ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
      yearsLabel     : function(years) { return years + ' ' + (years == '1' ? 'Aasta' : 'Aastat') },
      monthsLabel    : function(months) { return months + ' ' + (months == '1' ? 'Kuu' : 'Kuud') },
      daysLabel      : function(days) { return days + ' ' + (days == '1' ? 'Päev' : 'Päeva') },
      hoursLabel     : function(hours, minutes) {
        var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
        return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Tund' : 'Tundi')
      },
      shortDateFormat: 'j.n.Y',
      weekDateFormat : 'D j.n.Y',
      dateTimeFormat : 'D j.n.Y k\\l G:i',
      firstWeekday   : DateTime.MONDAY
    },
    RU: {
      id             : 'RU',
      monthNames     : [ 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
      dayNames       : ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
      shortDayNames  : ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      yearsLabel     : function(years) { return years + ' ' + (years == '1' ? 'Год' : 'Года') },
      monthsLabel    : function(months) { return months + ' ' + (months == '1' ? 'Месяц' : 'Месяца') },
      daysLabel      : function(days) { return days + ' ' + (days == '1' ? 'День' : 'Дня') },
      hoursLabel     : function(hours, minutes) {
        var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
        return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Минута' : 'Минуты')
      },
      shortDateFormat: 'j.n.Y',
      weekDateFormat : 'D j.n.Y',
      dateTimeFormat : 'D j.n.Y k\\lo G:i',
      firstWeekday   : DateTime.MONDAY
    },
    SV: {
      id             : 'SV',
      monthNames     : ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
      dayNames       : ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'],
      shortDayNames  : ['Sö', 'Må', 'Ti', 'On', 'To', 'Fr', 'Lö'],
      yearsLabel     : function(years) { return years + ' ' + (years == '1' ? 'År' : 'År') },
      monthsLabel    : function(months) { return months + ' ' + (months == '1' ? 'Månad' : 'Månader') },
      daysLabel      : function(days) { return days + ' ' + (days == '1' ? 'Dag' : 'Dagar') },
      hoursLabel     : function(hours, minutes) {
        var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
        return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Minut' : 'Minuter')
      },
      shortDateFormat: 'j.n.Y',
      weekDateFormat : 'D j.n.Y',
      dateTimeFormat : 'D j.n.Y k\\lo G:i',
      firstWeekday   : DateTime.MONDAY
    }
  }

  DateLocale.fromArgument = function(stringOrObject) {
    if(typeof stringOrObject == 'string')
      return DateLocale[stringOrObject.toUpperCase()]
    else return stringOrObject
  }

  return DateLocale
})
;
(function(root, factory) {
  if(typeof define === "function" && define.amd) {
    define(["jquery", "./DateTime", "./DateFormat"], factory)
  } else {
    root.DateRange = factory(root.jQuery, root.DateTime, root.DateFormat)
  }
})(this, function($, DateTime, DateFormat) {
  function DateRange(date1, date2) {
    if(!date1 || !date2) {
      throw('two dates must be specified, date1=' + date1 + ', date2=' + date2)
    }
    this.start = (date1.compareTo(date2) > 0 ? date2 : date1)
    this.end = (date1.compareTo(date2) > 0 ? date1 : date2)
    this._days = 0
    this._hours = 0
    this._minutes = 0
    this._valid = true
  }

  DateRange.prototype = {
    _setDaysHoursAndMinutes: function() {
      if(this._hasTimes) {
        var ms = parseInt((this.end.getTime() - this.start.getTime()), 10)
        this._days = parseInt(ms / DateTime.DAY, 10)
        ms = ms - (this._days * DateTime.DAY)
        this._hours = parseInt(ms / DateTime.HOUR, 10)
        ms = ms - (this._hours * DateTime.HOUR)
        this._minutes = parseInt(ms / DateTime.MINUTE, 10)
      }
    },

    _dateWithTime: function(dateWithoutTime, parsedTime) { return dateWithoutTime.withTime(parsedTime[0], parsedTime[1]) },

    hours: function() { return this._hours },

    minutes: function() { return this._minutes },

    hasDate: function(date) { return date.isBetweenDates(this.start, this.end) },

    isValid: function() { return this._valid && this.end.getTime() - this.start.getTime() >= 0 },

    days: function() { return this._hasTimes ? this._days : Math.round(this.start.distanceInDays(this.end) + 1); },

    shiftDays: function(days) { return new DateRange(this.start.plusDays(days), this.end.plusDays(days)) },

    expandTo: function(date) {
      var newStart = this.start.clone()
      var newEnd = this.end.clone()
      if(date.compareTo(this.start) < 0) newStart = date
      else if(date.compareTo(this.end) > 0) newEnd = date
      return new DateRange(newStart, newEnd)
    },

    expandDaysTo: function(days) { return new DateRange(this.start, this.start.plusDays(days - 1)) },

    hasValidSize: function(minimumDays) { return minimumDays < 0 || this.days() >= minimumDays },

    hasValidSizeAndEndsOnWorkWeek: function(minimumDays) { return this.hasValidSize(minimumDays) && this.hasEndsOnWeekend() },

    and: function(that) {
      var latestStart = this.start.compareTo(that.start) > 0 ? this.start : that.start
      var earliestEnd = this.end.compareTo(that.end) > 0 ? that.end : this.end
      return latestStart.compareTo(earliestEnd) < 0 ? new DateRange(latestStart, earliestEnd) : DateRange.emptyRange()
    },

    isInside: function(outer) { return this.start.compareTo(outer.start) >= 0 && this.end.compareTo(outer.end) <= 0 },

    hasEndsOnWeekend: function() { return this.start.isWeekend() || this.end.isWeekend() },

    withTimes: function(startTimeStr, endTimeStr) {
      var parsedStartTime = DateFormat.parseTime(startTimeStr)
      var parsedEndTime = DateFormat.parseTime(endTimeStr)
      var rangeWithTimes = this.clone()
      if(parsedStartTime && parsedEndTime) {
        rangeWithTimes._valid = true
        rangeWithTimes._hasTimes = true
        rangeWithTimes.start = this._dateWithTime(this.start, parsedStartTime)
        rangeWithTimes.end = this._dateWithTime(this.end, parsedEndTime)
        rangeWithTimes._setDaysHoursAndMinutes()
      } else {
        rangeWithTimes._valid = false
      }
      return rangeWithTimes
    },

    clone: function() { return new DateRange(this.start, this.end) },

    toString: function() {
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
    },

    isPermittedRange: function(minimumSize, disableWeekends, outerRange) { return this.hasValidSize(minimumSize) && (!(disableWeekends && this.hasEndsOnWeekend())) && this.isInside(outerRange) },

    shiftInside: function(outerRange) {
      if(this.days() > outerRange.days()) {
        return DateRange.emptyRange()
      }
      var distanceToOuterRangeStart = this.start.distanceInDays(outerRange.start)
      var distanceToOuterRangeEnd = this.end.distanceInDays(outerRange.end)
      if(distanceToOuterRangeStart > 0) {
        return this.shiftDays(distanceToOuterRangeStart)
      }
      if(distanceToOuterRangeEnd < 0) {
        return this.shiftDays(distanceToOuterRangeEnd)
      }
      return this
    }
  }

  DateRange = $.extend(DateRange, {
    emptyRange: function() {
      function NullDateRange() {
        this.start = null
        this.end = null
        this.days = function() {
          return 0
        }
        this.shiftDays = $.noop
        this.hasDate = function() { return false }
        this.clone = function() { return DateRange.emptyRange() }
        this.expandDaysTo = function() { return this }
        this.hasEndsOnWeekend = function() { return false }
        this.isPermittedRange = function() { return true }
      }

      return new NullDateRange()
    },

    rangeWithMinimumSize: function(oldRange, minimumSize, disableWeekends, outerRange) {
      if(isTooSmallSelection()) {
        var newRange = oldRange.expandDaysTo(minimumSize)
        if(disableWeekends && newRange.hasEndsOnWeekend()) {
          var shiftedDays = newRange.shiftDays(delta(newRange.end.getDay())).shiftInside(outerRange)
          while(!shiftedDays.isPermittedRange(minimumSize, disableWeekends, outerRange) || shiftedDays.end.compareTo(outerRange.end) > 0) {
            if(!shiftedDays.isPermittedRange(minimumSize, false, outerRange)) {
              return DateRange.emptyRange()
            }
            shiftedDays = shiftedDays.shiftDays(1)
          }
          newRange = shiftedDays
        }
        if(!newRange.isPermittedRange(minimumSize, false, outerRange)) {
          return DateRange.emptyRange()
        }
        return newRange
      }
      return oldRange

      function isTooSmallSelection() { return minimumSize && oldRange.days() <= minimumSize }

      function delta(x) { return -((x + 1) % 7 + 1) }
    }
  })
  return DateRange
})
/*!
 * Tiny Scrollbar 1.66
 * http://www.baijs.nl/tinyscrollbar/
 *
 * Copyright 2010, Maarten Baijs
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Date: 13 / 11 / 2011
 * Depends on library: jQuery
 * 
 */

;
(function($) {
  $.tiny = $.tiny || { };

  $.tiny.scrollbar = {
    options: {
      axis     : 'y', // vertical or horizontal scrollbar? ( x || y ).
      wheel    : 40,  //how many pixels must the mouswheel scroll at a time.
      scroll   : true, //enable or disable the mousewheel;
      size     : 'auto', //set the size of the scrollbar to auto or a fixed number.
      sizethumb: 'auto' //set the size of the thumb to auto or a fixed number.
    }
  };

  $.fn.tinyscrollbar = function(options) {
    var options = $.extend({}, $.tiny.scrollbar.options, options);
    this.each(function() { $(this).data('tsb', new Scrollbar($(this), options)); });
    return this;
  };
  $.fn.tinyscrollbar_update = function(sScroll) { return $(this).data('tsb').update(sScroll); };

  function Scrollbar(root, options) {
    var oSelf = this;
    var oWrapper = root;
    var oViewport = { obj: $('.viewport', root) };
    var oContent = { obj: $('.overview', root) };
    var oScrollbar = { obj: $('.scrollbar', root) };
    var oTrack = { obj: $('.track', oScrollbar.obj) };
    var oThumb = { obj: $('.thumb', oScrollbar.obj) };
    var sAxis = options.axis == 'x', sDirection = sAxis ? 'left' : 'top', sSize = sAxis ? 'Width' : 'Height';
    var iScroll, iPosition = { start: 0, now: 0 }, iMouse = {};

    function initialize() {
      oSelf.update();
      setEvents();
      return oSelf;
    }

    this.update = function(sScroll) {
      var axis = options.axis;
      oViewport[axis] = oViewport.obj[0]['offset' + sSize];
      oContent[axis] = oContent.obj[0]['scroll' + sSize];
      var content = oContent[axis];
      var viewport = oViewport[axis];
      oContent.ratio = viewport / content;
      oScrollbar.obj.toggleClass('disable', oContent.ratio >= 1);
      oTrack[axis] = options.size == 'auto' ? viewport : options.size;
      var track = oTrack[axis];
      oThumb[axis] = Math.min(track, Math.max(0, ( options.sizethumb == 'auto' ? (track * oContent.ratio) : options.sizethumb )));
      var thumb = oThumb[axis];
      oScrollbar.ratio = options.sizethumb == 'auto' ? (content / track) : (content - viewport) / (track - thumb);
      iScroll = (sScroll == 'relative' && oContent.ratio <= 1) ? Math.min((content - viewport), Math.max(0, iScroll)) : 0;
      iScroll = (sScroll == 'bottom' && oContent.ratio <= 1) ? (content - viewport) : isNaN(parseInt(sScroll, 10)) ? iScroll : parseInt(sScroll, 10);
      setSize();
    };
    function setSize() {
      oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
      oContent.obj.css(sDirection, -iScroll);
      iMouse['start'] = oThumb.obj.offset()[sDirection];
      var sCssSize = sSize.toLowerCase();
      oScrollbar.obj.css(sCssSize, oTrack[options.axis]);
      oTrack.obj.css(sCssSize, oTrack[options.axis]);
      oThumb.obj.css(sCssSize, oThumb[options.axis]);
    };
    function setEvents() {
      oThumb.obj.bind('mousedown', start);
      oThumb.obj[0].ontouchstart = function(oEvent) {
        oEvent.preventDefault();
        oThumb.obj.unbind('mousedown');
        start(oEvent.touches[0]);
        return false;
      };
      oTrack.obj.bind('mouseup', drag);
      if(options.scroll && this.addEventListener) {
        oWrapper[0].addEventListener('DOMMouseScroll', wheel, false);
        oWrapper[0].addEventListener('mousewheel', wheel, false);
      }
      else if(options.scroll) {oWrapper[0].onmousewheel = wheel;}
    };
    function start(oEvent) {
      iMouse.start = sAxis ? oEvent.pageX : oEvent.pageY;
      var oThumbDir = parseInt(oThumb.obj.css(sDirection), 10);
      iPosition.start = oThumbDir == 'auto' ? 0 : oThumbDir;
      $(document).bind('mousemove', drag);
      document.ontouchmove = function(oEvent) {
        $(document).unbind('mousemove');
        drag(oEvent.touches[0]);
      };
      $(document).bind('mouseup', end);
      oThumb.obj.bind('mouseup', end);
      oThumb.obj[0].ontouchend = document.ontouchend = function(oEvent) {
        $(document).unbind('mouseup');
        oThumb.obj.unbind('mouseup');
        end(oEvent.touches[0]);
      };
      return false;
    };
    function wheel(oEvent) {
      if(!(oContent.ratio >= 1)) {
        oWrapper.trigger('scroll')
        oEvent = oEvent || window.event;
        var iDelta = oEvent.wheelDelta ? oEvent.wheelDelta / 120 : -oEvent.detail / 3;
        iScroll -= iDelta * options.wheel;
        iScroll = Math.min((oContent[options.axis] - oViewport[options.axis]), Math.max(0, iScroll));
        oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
        oContent.obj.css(sDirection, -iScroll);

        oEvent = $.event.fix(oEvent);
        oEvent.preventDefault();
      }
      ;
    };
    function end() {
      $(document).unbind('mousemove', drag);
      $(document).unbind('mouseup', end);
      oThumb.obj.unbind('mouseup', end);
      document.ontouchmove = oThumb.obj[0].ontouchend = document.ontouchend = null;
      return false;
    };
    function drag(oEvent) {
      oWrapper.trigger('scroll')
      if(!(oContent.ratio >= 1)) {
        iPosition.now = Math.min((oTrack[options.axis] - oThumb[options.axis]), Math.max(0, (iPosition.start + ((sAxis ? oEvent.pageX : oEvent.pageY) - iMouse.start))));
        iScroll = iPosition.now * oScrollbar.ratio;
        oContent.obj.css(sDirection, -iScroll);
        oThumb.obj.css(sDirection, iPosition.now);
      }
      return false;
    };

    return initialize();
  };
})(jQuery);
;
(function(root, factory) {
  if(typeof define === 'function' && define.amd) {
    define(['jquery', './DateFormat', './DateLocale', './DateRange', './DateTime'], factory)
  } else {
    root.CalendarBody = factory(root.jQuery, root.DateFormat, root.DateLocale, root.DateRange, root.DateTime)
  }
})(this, function($, DateFormat, DateLocale, DateRange, DateTime) {
  return function(calendarContainer, calendarRange, locale, customScroll, disableWeekends, disabledDatesObject) {
    var dateCellMap = {}
    var dateCellDates = []

    var headerTable = $('<table class="calendarHeader">').append(headerRow())
    var bodyTable = $('<table class="calendarBody">').append(calendarBody())
    var scrollContent = $('<div class="calendarScrollContent">').append(bodyTable)
    calendarContainer.append(headerTable)

    if(customScroll) {
      bodyTable.addClass('overview')
      scrollContent.addClass('viewport')
      calendarContainer.append(
          $('<div class="tinyscrollbar"></div>')
            .append('<div class="scrollbar"> <div class="track"> <div class="thumb"> <div class="end"></div> </div> </div> </div>')
            .append(scrollContent))
    } else {
      calendarContainer.append(scrollContent)
    }
    var dateCells = $('td.date', calendarContainer).get()
    highlightToday(dateCellMap)
    var yearTitle = $('th.month', headerTable)

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

    function headerRow() {
      var tr = $('<tr><th class="month"></th><th class="week">&nbsp;</th>')
      $(locale.dayNames).each(function(index) {
        //TODO move to DateLocale
        var weekDay = $('<th>').append(locale.shortDayNames[(index + locale.firstWeekday) % 7]).addClass('weekDay')
        tr.append(weekDay)
      })
      return $('<thead>').append(tr)
    }

    function highlightToday(dateCellMap) {
      var todayKey = DateFormat.format(DateTime.now(), 'Ymd', locale)
      if(todayKey in dateCellMap) {
        getDateCell(dateCellMap[todayKey]).addClass('today').wrapInner('<div>')
      }
    }

    function calendarBody() {
      var firstWeekDay = calendarRange.start.getFirstDateOfWeek(locale)
      var isFirst = true;
      var rows = []
      while(firstWeekDay.compareTo(calendarRange.end) <= 0) {
        calendarRow(rows, firstWeekDay.clone(), isFirst)
        isFirst = false
        firstWeekDay = firstWeekDay.plusDays(7)
      }

      return '<tbody>' + rows.join('') + '</tbody>'

      function calendarRow(rows, firstDayOfWeek, isFirst) {
        rows.push('<tr>')
        rows.push(monthCell(firstDayOfWeek, isFirst))
        rows.push(weekCell(firstDayOfWeek))
        for(var i = 0; i < 7; i++) {
          var date = firstDayOfWeek.plusDays(i)
          rows.push(dateCell(date))
        }
        rows.push('</tr>')
      }

      function dateCell(date) {
        var dateCell = '<td class="' + dateStyles(date) + '" date-cell-index="' + dateCellDates.length + '">' + date.getDate() + '</td>'
        dateCellMap[DateFormat.format(date, 'Ymd', locale)] = dateCellDates.length
        dateCellDates.push(date)
        return dateCell
      }

      function monthCell(firstDayOfWeek, isFirst) {
        var th = '<th class="month ' + backgroundBy(firstDayOfWeek)
        if(isFirst || firstDayOfWeek.getDate() <= 7) {
          th += ' monthName">'
          th += locale.monthNames[firstDayOfWeek.getMonth()-1]
        } else {
          th += '">'
          if(firstDayOfWeek.getDate() <= 7 * 2 && firstDayOfWeek.getMonth() == 1) {
            th += firstDayOfWeek.getFullYear()
          }
        }
        return th + '</th>'
      }

      function weekCell(firstDayOfWeek) { return '<th class="week ' + backgroundBy(firstDayOfWeek) + '">' + firstDayOfWeek.getWeekInYear('ISO') + '</th>' }
    }

    function dateStyles(date) { return $.trim(['date', backgroundBy(date), disabledOrNot(date), todayStyle(date), holidayStyle(date)].sort().join(' ')) }

    function backgroundBy(date) { return date.isOddMonth() ? 'odd' : '' }

    function disabledOrNot(date) {
      var disabledWeekendDay = disableWeekends && date.isWeekend()
      var disabledDay = disabledDatesObject[date.getOnlyDate().date]
      var outOfBounds = !calendarRange.hasDate(date)
      return outOfBounds || disabledWeekendDay || disabledDay ? 'disabled' : ''
    }

    function todayStyle(date) { return date.isToday() ? 'today' : '' }

    function holidayStyle(date) { return date.getDay() == 0 ? 'holiday' : '' }

    function getDateCell(index) { return $(dateCells[index]) }
  }
})
;
(function(root, factory) {
  if(typeof define === 'function' && define.amd) {
    define(['jquery', './DateFormat', './DateLocale', './DateRange', './DateTime'], factory)
  } else {
    root.RangeEvents = factory(root.jQuery, root.DateFormat, root.DateLocale, root.DateRange, root.DateTime)
  }
})(this, function($, DateFormat, DateLocale, DateRange, DateTime) {
  return function(container, calendarBody, executeCallback, locale, params, getElemDate, calendarRange, setStartField, setEndField, calendar, formatDate, startDate, endDate, disabledDatesList) {
    var mouseDownDate = null
    var selection
    var oldSelection
    var Status = {
      CREATE_OR_RESIZE: 'create',
      MOVE            : 'move',
      NONE            : 'none'
    }
    var status = Status.NONE

    return {
      showInitialSelection: setRangeLabels,
      initEvents          : function() {
        setInitialSelection()
        oldSelection = selection.clone()
        initRangeCalendarEvents(container, calendarBody.bodyTable)
        drawSelection()
      },
      addRangeLengthLabel : function() {
        if($('.rangeLengthLabel', container).isEmpty()) {
          var rangeLengthContainer = $('<div class="label"><span class="rangeLengthLabel"></span></div>')
          $('.continuousCalendar', container).append(rangeLengthContainer)
        }
      },
      addEndDateLabel     : function(dateLabelContainer) { dateLabelContainer.append('<span class="separator"> - </span>').append('<span class="endDateLabel"></span>') },
      performTrigger      : function() {
        container.data('calendarRange', selection)
        executeCallback(selection)
      }
    }

    function setInitialSelection() { selection = startDate && endDate ? new DateRange(startDate, endDate, locale) : DateRange.emptyRange(locale) }

    function initRangeCalendarEvents(container, bodyTable) {
      $('span.rangeLengthLabel', container).text(locale.daysLabel(selection.days()))
      bodyTable.addClass(params.selectWeek ? 'weekRange' : 'freeRange')
      bodyTable.mousedown(mouseDown).mouseover(mouseMove).mouseup(mouseUp)
      disableTextSelection(bodyTable.get(0))
    }

    function mouseDown(event) {
      var elem = event.target
      var hasShiftKeyPressed = event.shiftKey
      if(isInstantSelection(elem, hasShiftKeyPressed)) {
        selection = instantSelection(elem, hasShiftKeyPressed)
        return
      }

      status = Status.CREATE_OR_RESIZE
      mouseDownDate = getElemDate(elem)

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

      if(enabledCell(elem)) startNewRange()

      function enabledCell(elem) { return isDateCell(elem) && isEnabled(elem) }

      function isInstantSelection(elem, hasShiftKeyPressed) {
        if(params.selectWeek) return enabledCell(elem) || isWeekCell(elem)
        else return isWeekCell(elem) || isMonthCell(elem) || hasShiftKeyPressed

      }

      function instantSelection(elem, hasShiftKeyPressed) {
        if((params.selectWeek && enabledCell(elem)) || isWeekCell(elem)) {
          status = Status.NONE
          var firstDayOfWeek = getElemDate($(elem).parent().children('.date').get(0))
          return instantSelectWeek(firstDayOfWeek)
        } else if(isMonthCell(elem)) {
          status = Status.NONE
          var dayInMonth = getElemDate($(elem).siblings('.date').get(0))
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
      $(elem).css('MozUserSelect', 'none')
      //IE
      $(elem).bind('selectstart', function() { return false })
      //Opera, etc.
      $(elem).mousedown(function() { return false })
    }

    function mouseMove(event) {
      if(status == Status.NONE) return
      var date = getElemDate(event.target)
      var actions = {
        move  : function() {
          var deltaDays = mouseDownDate.distanceInDays(date)
          var movedSelection = selection.shiftDays(deltaDays).and(calendarRange)
          if(isPermittedRange(movedSelection)) {
            mouseDownDate = date
            selection = movedSelection
          }
        },
        create: function() {
          var newSelection = new DateRange(mouseDownDate, date, locale)
          if(isEnabled(event.target) && isPermittedRange(newSelection)) selection = newSelection
        }
      }
      actions[status]()
      drawSelection()
    }

    function isPermittedRange(newSelection) { return newSelection.isPermittedRange(params.minimumRange, params.disableWeekends, calendarRange) }

    function mouseUp() {
      status = Status.NONE
      if(rangeHasDisabledDate()) selection = DateRange.emptyRange()
      drawSelection()
      afterSelection()
    }

    function rangeHasDisabledDate() {
      for(var i = 0; i < disabledDatesList.length; i++) {
        if(selection.hasDate(new DateTime(disabledDatesList[i]))) return true
      }
      return false
    }

    function drawSelection() {
      selection = DateRange.rangeWithMinimumSize(selection, params.minimumRange, params.disableWeekends, calendarRange)
      drawSelectionBetweenDates(selection)
      $('span.rangeLengthLabel', container).text(locale.daysLabel(selection.days()))
    }

    function drawSelectionBetweenDates(range) {
      $('td.selected', container).removeClass('selected').removeClass('rangeStart').removeClass('rangeEnd').removeClass('invalidSelection')
      iterateAndToggleCells(range)
      oldSelection = range.clone()
    }

    function iterateAndToggleCells(range) {
      if(range.days() == 0) return
      var startIndex = index(range.start)
      var endIndex = index(range.end)
      for(var i = startIndex; i <= endIndex; i++)
        calendarBody.getDateCell(i).get(0).className = dateCellStyle(calendarBody.dateCellDates[i], range.start, range.end).join(' ')
      if(rangeHasDisabledDate()) $('td.selected', container).addClass('invalidSelection')
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
      var formattedStart = formatDate(selection.start)
      var formattedEnd = formatDate(selection.end)
      container.data('calendarRange', selection)
      setStartField(formattedStart)
      setEndField(formattedEnd)
      setRangeLabels()
      if(params.selectWeek) calendar.close($('td.selected', container).first())
      executeCallback(selection)
    }

    function setRangeLabels() {
      if(!selection) setInitialSelection()
      if(selection.start && selection.end) {
        var format = locale.weekDateFormat
        $('span.startDateLabel', container).text(DateFormat.format(selection.start, format, locale))
        $('span.endDateLabel', container).text(DateFormat.format(selection.end, format, locale))
        $('span.separator', container).show()
      } else {
        $('span.separator', container).hide()
      }
    }

    function isDateCell(elem) { return $(elem).closest('[date-cell-index]').hasClass('date') }

    function isWeekCell(elem) { return $(elem).hasClass('week') }

    function isMonthCell(elem) { return $(elem).hasClass('month') }

    function isEnabled(elem) { return !$(elem).hasClass('disabled') }
  }
});
(function(root, factory) {
  if(typeof define === 'function' && define.amd) {
    define(['jquery', './DateFormat', './DateLocale', './DateRange', './DateTime', './CalendarBody', './RangeEvents', 'jquery.tinyscrollbar'], factory)
  } else {
    factory(root.jQuery, root.DateFormat, root.DateLocale, root.DateRange, root.DateTime, root.CalendarBody, RangeEvents)
  }
})(this, function($, DateFormat, DateLocale, DateRange, DateTime, CalendarBody, RangeEvents) {
  $.fn.continuousCalendar = function(options) {
    return this.each(function() { _continuousCalendar.call($(this), options) })
    function _continuousCalendar(options) {
      var defaults = {
        weeksBefore    : 26,
        weeksAfter     : 26,
        firstDate      : null,
        lastDate       : null,
        startField     : $('input.startDate', this),
        endField       : $('input.endDate', this),
        isPopup        : false,
        selectToday    : false,
        locale         : DateLocale.EN,
        disableWeekends: false,
        disabledDates  : null,
        minimumRange   : -1,
        selectWeek     : false,
        fadeOutDuration: 0,
        callback       : $.noop,
        customScroll   : false,
        theme          : ''
      }
      var params = $.extend({}, defaults, options)
      var locale = DateLocale.fromArgument(params.locale)
      var startDate = fieldDate(params.startField)
      var endDate = fieldDate(params.endField)
      var today = DateTime.now()

      if(params.selectToday) {
        var formattedToday = formatDate(today)
        startDate = today
        endDate = today
        setStartField(formattedToday)
        setEndField(formattedToday)
      }
      var container = this
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

      $(this).addClass('continuousCalendarContainer').addClass(params.theme).append('&nbsp;') //IE fix for popup version
      createCalendar()

      function createCalendar() {
        disabledDatesList = params.disabledDates ? params.disabledDates.split(' ') : []
        disabledDatesObject = params.disabledDates ? parseDisabledDates(disabledDatesList) : {}
        calendarRange = determineRangeToRenderFormParams(params)
        popupBehavior = popUpBehaviour(params.isPopup)
        dateBehavior = dateBehaviour(isRange())
        params.fadeOutDuration = +params.fadeOutDuration
        calendarContainer = getCalendarContainerOrCreateOne()
        calendarContainer.click(function(e) { e.stopPropagation() })
        if($('.startDateLabel', container).isEmpty()) addDateLabels(container, popupBehavior, dateBehavior)
        popupBehavior.initUI()
        dateBehavior.showInitialSelection()
        dateBehavior.performTrigger()
      }

      function initScrollBar() { if(params.customScroll) customScrollContainer = $('.tinyscrollbar', container).tinyscrollbar() }

      function initCalendarTable() {
        if(calendarBody.scrollContent) return

        calendarBody = $.extend(calendarBody, CalendarBody(calendarContainer, calendarRange, locale,
          params.customScroll, params.disableWeekends, disabledDatesObject))
        bindScrollEvent()

        popupBehavior.initState()
        dateBehavior.addRangeLengthLabel()
        dateBehavior.initEvents()
        scrollToSelection()
      }

      function determineRangeToRenderFormParams(params) {
        var firstWeekdayOfGivenDate = (startDate || DateTime.now()).getFirstDateOfWeek(locale)
        var firstDate = params.firstDate
        var lastDate = params.lastDate
        var rangeStart = firstDate ? DateFormat.parse(firstDate, locale) : firstWeekdayOfGivenDate.minusDays(params.weeksBefore * 7)
        var rangeEnd = lastDate ? DateFormat.parse(lastDate, locale) : firstWeekdayOfGivenDate.plusDays(params.weeksAfter * 7 + 6)

        return  new DateRange(rangeStart, rangeEnd)
      }

      function bindScrollEvent() {
        if(params.customScroll) {
          if(!customScrollContainer) initScrollBar()
          customScrollContainer.bind('scroll', setYearLabel)
        } else {
          var didScroll = false
          calendarBody.scrollContent.scroll(function() {
            didScroll = true
          })

          setInterval(function() {
            if(didScroll) {
              didScroll = false
              setYearLabel()
            }
          }, 250)
        }
      }

      function parseDisabledDates(dates) {
        var dateMap = {}
        $.each(dates, function(index, date) { dateMap[DateFormat.parse(date).date] = true })
        return dateMap
      }

      function dateBehaviour(isRange) {
        var singleDateVersion = {
          showInitialSelection: function() {
            if(startDate) setDateLabel(DateFormat.format(startDate, locale.weekDateFormat, locale))
          },
          initEvents          : function() {
            initSingleDateCalendarEvents()
            var selectedDateKey = startDate && DateFormat.format(startDate, 'Ymd', locale)
            if(selectedDateKey in calendarBody.dateCellMap) {
              calendarBody.getDateCell(calendarBody.dateCellMap[selectedDateKey]).addClass('selected')
            }
          },
          addRangeLengthLabel : $.noop,
          addEndDateLabel     : $.noop,
          performTrigger      : function() {
            container.data('calendarRange', startDate)
            executeCallback(startDate)
          }
        }
        return isRange ? RangeEvents(container, calendarBody, executeCallback, locale, params, getElemDate,
          calendarRange, setStartField, setEndField, popupBehavior, formatDate, startDate, endDate, disabledDatesList) : singleDateVersion

        function initSingleDateCalendarEvents() {
          $('.date', container).bind('click', function() {
            var dateCell = $(this)
            if(dateCell.hasClass('disabled')) return
            $('td.selected', container).removeClass('selected')
            dateCell.addClass('selected')
            var selectedDate = getElemDate(dateCell.get(0));
            params.startField.val(DateFormat.shortDateFormat(selectedDate, locale))
            setDateLabel(DateFormat.format(selectedDate, locale.weekDateFormat, locale))
            popupBehavior.close(this)
            executeCallback(selectedDate)
          })
        }

        function setDateLabel(val) { $('span.startDateLabel', container).text(val) }

      }

      function popUpBehaviour(isPopup) {
        var popUpVersion = {
          initUI               : function() {
            calendarContainer.addClass('popup').hide()
            var icon = $('<a href="#" class="calendarIcon">' + today.getDate() + '</a>').click(toggleCalendar)
            container.prepend('<div></div>')
            container.prepend(icon)
          },
          initState            : $.noop,
          getContainer         : function(newContainer) { return $('<div class="popUpContainer">').append(newContainer); },
          close                : function(cell) { toggleCalendar.call(cell) },
          addDateLabelBehaviour: function(label) {
            label.addClass('clickable')
            label.click(toggleCalendar)
          }
        }
        var inlineVersion = {
          initUI               : initCalendarTable,
          initState            : calculateCellHeightAndInitScroll,
          getContainer         : function(newContainer) {
            return newContainer
          },
          close                : $.noop,
          addDateLabelBehaviour: $.noop
        }
        return isPopup ? popUpVersion : inlineVersion
      }

      function getCalendarContainerOrCreateOne() {
        var existingContainer = $('.continuousCalendar', container)
        if(existingContainer.exists()) {
          return existingContainer
        } else {
          var newContainer = $('<div class="continuousCalendar">')
          container.append(popupBehavior.getContainer(newContainer))
          return newContainer
        }
      }

      function addDateLabels(container, popupBehavior, dateBehavior) {
        var dateLabelContainer = $('<div class="label"><span class="startDateLabel"></span></div>')
        dateBehavior.addEndDateLabel(dateLabelContainer)
        container.prepend(dateLabelContainer)
        popupBehavior.addDateLabelBehaviour(dateLabelContainer.children())
      }

      function scrollToSelection() {
        var selectionStartOrToday = $('.selected', calendarBody.scrollContent).get(0) || $('.today', calendarBody.scrollContent).get(0)
        if(selectionStartOrToday) {
          var position = selectionStartOrToday.offsetTop - (calendarBody.scrollContent.height() - selectionStartOrToday.offsetHeight) / 2
          if(params.customScroll) {
            var totalHeight = calendarBody.bodyTable.height()
            var maxScroll = totalHeight - calendarBody.scrollContent.height()
            var validPosition = position > maxScroll ? maxScroll : position
            customScrollContainer.tinyscrollbar_update(validPosition > 0 ? validPosition : 0)
          } else {
            calendarBody.scrollContent.scrollTop(position)
          }
        }
      }

      function setYearLabel() {
        var scrollContent = calendarBody.scrollContent.get(0)
        var table = $('table', scrollContent).get(0)
        var scrollTop = params.customScroll ? -$('.overview', calendarContainer).position().top : scrollContent.scrollTop
        var rowNumber = parseInt(scrollTop / averageCellHeight, 10)
        var date = getElemDate(table.rows[rowNumber].cells[2])
        calendarBody.yearTitle.text(date.getFullYear())
      }

      function calculateCellHeightAndInitScroll() {
        initScrollBar()
        calculateCellHeight()
        setYearLabel()
      }

      function calculateCellHeight() { averageCellHeight = parseInt(calendarBody.bodyTable.height() / $('tr', calendarBody.bodyTable).size(), 10) }

      function toggleCalendar() {
        initCalendarTable()
        if(calendarContainer.is(':visible')) {
          calendarContainer.fadeOut(params.fadeOutDuration)
          $(document).unbind('click.continuousCalendar')
        } else {
          calendarContainer.show()
          if(beforeFirstOpening) {
            initScrollBar()
            calculateCellHeight()
            setYearLabel()
            beforeFirstOpening = false
          }
          scrollToSelection()
          $(document).bind('click.continuousCalendar', toggleCalendar)

        }
        return false
      }

      function fieldDate(field) { return field.length > 0 && field.val().length > 0 ? DateFormat.parse(field.val()) : null }

      function executeCallback(selection) {
        params.callback.call(container, selection)
        container.trigger('calendarChange', selection)
      }

      function getElemDate(elem) { return calendarBody.dateCellDates[$(elem).closest('[date-cell-index]').attr('date-cell-index')] }

      function setStartField(value) { params.startField.val(value) }

      function setEndField(value) { params.endField.val(value) }

      function formatDate(date) { return date ? DateFormat.shortDateFormat(date, locale) : '' }

      function isRange() { return params.endField && params.endField.length > 0 }
    }
  }
  $.fn.calendarRange = function() { return $(this).data('calendarRange') }
  $.fn.exists = function() { return this.length > 0 }
  $.fn.isEmpty = function() { return this.length == 0 }
})
