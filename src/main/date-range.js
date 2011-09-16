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
function DateRange(date1, date2) {
  var _hasTimes = false
  if(!date1 || !date2) {
    throw('two dates must be specified, date1=' + date1 + ', date2=' + date2)
  }
  this.start = date1.compareTo(date2) > 0 ? date2 : date1
  this.end = date1.compareTo(date2) > 0 ? date1 : date2
  this._days = 0
  this._hours = 0
  this._minutes = 0
  this._valid = true
}
DateRange.prototype._setDaysHoursAndMinutes = function() {
  if(this._hasTimes) {
    var ms = parseInt((this.end.getTime() - this.start.getTime()))
    this._days = parseInt(ms / Date.DAY)
    ms = ms - (this._days * Date.DAY)
    this._hours = parseInt(ms / Date.HOUR)
    ms = ms - (this._hours * Date.HOUR)
    this._minutes = parseInt(ms / Date.MINUTE)
  }
}

DateRange.prototype._dateWithTime = function(dateWithoutTime, parsedTime) {
  var date = dateWithoutTime.clone()
  date.setHours(parsedTime[0])
  date.setMinutes(parsedTime[1])
  date.setMilliseconds(0)
  return date
}

DateRange.prototype.hours = function() {
  return this._hours;
}
DateRange.prototype.minutes = function() {
  return this._minutes;
}
DateRange.prototype.hasDate = function(date) {
  return date.isBetweenDates(this.start, this.end);
}
DateRange.prototype.isValid = function() {
  return this._valid && this.end.getTime() - this.start.getTime() >= 0;
}
DateRange.prototype.days = function() {
  if(this._hasTimes) {
    return this._days
  } else {
    return Math.round(this.start.distanceInDays(this.end) + 1)
  }
}
DateRange.prototype.shiftDays = function(days) {
  return new DateRange(this.start.plusDays(days), this.end.plusDays(days))
}
DateRange.prototype.expandTo = function(date) {
  var newStart = this.start.clone()
  var newEnd = this.end.clone()
  if(date.compareTo(this.start) < 0) {
    newStart = date
  } else {
    if(date.compareTo(this.end) > 0) {
      newEnd = date
    }
  }
  return new DateRange(newStart, newEnd)
}

DateRange.prototype.expandDaysTo = function(days) {
  return new DateRange(this.start, this.start.plusDays(days - 1))
}

DateRange.prototype.hasValidSize = function(minimumDays) {
  return minimumDays < 0 || this.days() >= minimumDays
}

DateRange.prototype.hasValidSizeAndEndsOnWorkWeek = function(minimumDays) {
  return this.hasValidSize(minimumDays) && this.hasEndsOnWeekend()
}

DateRange.prototype.and = function(that) {
  var latestStart = this.start.compareTo(that.start) > 0 ? this.start : that.start
  var earliestEnd = this.end.compareTo(that.end) > 0 ? that.end : this.end
  if(latestStart.compareTo(earliestEnd) < 0) {
    return new DateRange(latestStart, earliestEnd)
  } else {
    return DateRange.emptyRange()
  }
}

DateRange.prototype.isInside = function(outer) {
  return this.start.compareTo(outer.start) >= 0 && this.end.compareTo(outer.end) <= 0
}

DateRange.prototype.hasEndsOnWeekend = function() {
  return this.start.isWeekend() || this.end.isWeekend()
}

DateRange.prototype.setTimes = function(startTimeStr, endTimeStr) {
  var parsedStartTime = Date.parseTime(startTimeStr)
  var parsedEndTime = Date.parseTime(endTimeStr)
  if(parsedStartTime && parsedEndTime) {
    this._valid = true
    this._hasTimes = true
    this.start = this._dateWithTime(this.start, parsedStartTime)
    this.end = this._dateWithTime(this.end, parsedEndTime)
    this._setDaysHoursAndMinutes()
  } else {
    this._valid = false
  }
  return this._valid
}
DateRange.prototype.clone = function() {
  return new DateRange(this.start, this.end)
}

DateRange.prototype.toString = function(locale) {
  if(this._hasTimes) {
    return  Date.daysLabel(this.days()) + ' ' + Date.hoursLabel(this.hours(), this.minutes())
  } else {
    return this.start.dateFormat(locale.shortDateFormat) + ' - ' + this.end.dateFormat(locale.shortDateFormat)
  }
}

DateRange.prototype.printDefiningDuration = function() {
  var years = parseInt(this.days() / 360, 10)
  if(years > 0) return Date.yearsLabel(years)

  var months = parseInt(this.days() / 30, 10)
  if(months > 0) return Date.monthsLabel(months)

  return Date.daysLabel(this.days())
}

DateRange.prototype.isPermittedRange = function(minimumSize, disableWeekends, outerRange) {
  return this.hasValidSize(minimumSize) && (!(disableWeekends && this.hasEndsOnWeekend())) && this.isInside(outerRange)
}

DateRange.prototype.shiftInside = function(outerRange) {
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


DateRange.emptyRange = function() {
  function NullDateRange() {
    this.start = null
    this.end = null
    this.days = function() {
      return 0;
    }
    this.shiftDays = function() {
    }
    this.hasDate = function() {
      return false;
    }
    this.clone = function() {
      return DateRange.emptyRange()
    }
  }

  return new NullDateRange()
}
DateRange.parse = function(dateStr1, dateStr2, dateFormat) {
  return new DateRange(Date.parseDate(dateStr1, dateFormat), Date.parseDate(dateStr2, dateFormat))
}
DateRange.rangeWithMinimumSize = function(oldRange, minimumSize, disableWeekends, outerRange) {
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

  function isTooSmallSelection() {
    return minimumSize && oldRange.days() <= minimumSize;
  }

  function delta(x) {
    return -((x + 1) % 7 + 1)
  }
}
