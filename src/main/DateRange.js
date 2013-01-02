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

;(function(root, factory) {
  if (typeof define === "function" && define.amd) {
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

    _dateWithTime: function(dateWithoutTime, parsedTime) {
      return dateWithoutTime.withTime(parsedTime[0], parsedTime[1])
    },

    hours: function() { return this._hours },

    minutes: function() { return this._minutes },

    hasDate: function(date) { return date.isBetweenDates(this.start, this.end) },

    isValid: function() { return this._valid && this.end.getTime() - this.start.getTime() >= 0 },

    days: function() {
      if(this._hasTimes) {
        return this._days
      } else {
        return Math.round(this.start.distanceInDays(this.end) + 1)
      }
    },

    shiftDays: function(days) { return new DateRange(this.start.plusDays(days), this.end.plusDays(days)) },

    expandTo: function(date) {
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
    },

    expandDaysTo: function(days) { return new DateRange(this.start, this.start.plusDays(days - 1)) },

    hasValidSize: function(minimumDays) { return minimumDays < 0 || this.days() >= minimumDays },

    hasValidSizeAndEndsOnWorkWeek: function(minimumDays) { return this.hasValidSize(minimumDays) && this.hasEndsOnWeekend() },

    and: function(that) {
      var latestStart = this.start.compareTo(that.start) > 0 ? this.start : that.start
      var earliestEnd = this.end.compareTo(that.end) > 0 ? that.end : this.end
      if(latestStart.compareTo(earliestEnd) < 0) {
        return new DateRange(latestStart, earliestEnd)
      } else {
        return DateRange.emptyRange()
      }
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
