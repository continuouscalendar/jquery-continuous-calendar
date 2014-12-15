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
