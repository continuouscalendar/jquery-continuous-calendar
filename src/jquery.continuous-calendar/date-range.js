function DateRange(date1, date2) {
  var hasTimes = false;
  if (!date1 || !date2) {
    throw('two dates must be specified, date1=' + date1 + ', date2=' + date2);
  }
  this.start = date1.compareTo(date2) > 0 ? date2 : date1;
  this.end = date1.compareTo(date2) > 0 ? date1 : date2;
  var days;
  var hours;
  var minutes;
  var valid = true;
  this.hours = function() {return hours;};
  this.minutes = function() {return minutes;};
  this.hasDate = function(date) {return date.isBetweenDates(this.start, this.end);};
  this.isValid = function() {return valid && this.end.getTime() - this.start.getTime() >= 0;};
  this.days = function() {
    if (hasTimes) {
      return days;
    } else {
      return Math.round(this.start.distanceInDays(this.end) + 1);
    }
  };
  this.shiftDays = function(days) {
    this.start = this.start.plusDays(days);
    this.end = this.end.plusDays(days);
  };
  this.expandTo = function(date) {
    if (date.compareTo(this.start) < 0) {
      this.start = date;
    } else {
      if (date.compareTo(this.end) > 0) {
        this.end = date;
      }
    }
  };
  this.and = function(that) {
    var latestStart = this.start.compareTo(that.start) > 0 ? this.start : that.start;
    var earliestEnd = this.end.compareTo(that.end) > 0 ? that.end : this.end;
    if (latestStart.compareTo(earliestEnd) < 0) {
      return new DateRange(latestStart, earliestEnd);
    } else {
      return DateRange.emptyRange();
    }
  };
  this.setTimes = function(startTimeStr, endTimeStr) {
    var parsedStartTime = Date.parseTime(startTimeStr);
    var parsedEndTime = Date.parseTime(endTimeStr);
    if (parsedStartTime && parsedEndTime) {
      valid = true;
      hasTimes = true;
      this.start = dateWithTime(this.start, parsedStartTime);
      this.end = dateWithTime(this.end, parsedEndTime);
      setDaysHoursAndMinutes.call(this);
    } else {
      valid = false;
    }
    return valid;
  };
  function setDaysHoursAndMinutes() {
    if (hasTimes) {
      var ms = parseInt((this.end.getTime() - this.start.getTime()));
      days = parseInt(ms / Date.DAY);
      ms = ms - (days * Date.DAY);
      hours = parseInt(ms / Date.HOUR);
      ms = ms - (hours * Date.HOUR);
      minutes = parseInt(ms / Date.MINUTE);
    }
  }

  function dateWithTime(dateWithoutTime, parsedTime) {
    var date = dateWithoutTime.clone();
    date.setHours(parsedTime[0]);
    date.setMinutes(parsedTime[1]);
    date.setMilliseconds(0);
    return date;
  }

  this.toString = function(locale) {
    if (hasTimes) {
      var minutes = this.minutes() > 0 ? ',' + (this.minutes() / 6) : '';
      return  Date.daysLabel(this.days()) + ' ' + Date.hoursLabel(this.hours(), this.minutes());
    } else {
      return this.start.dateFormat(locale.shortDateFormat) + ' - ' + this.end.dateFormat(locale.shortDateFormat);
    }
  };
}
DateRange.emptyRange = function() {
  function NullDateRange() {
    this.start = null;
    this.end = null;
    this.days = function() {return 0;};
    this.shiftDays = function() {};
    this.hasDate = function() {return false;};
  }

  return new NullDateRange();
};
DateRange.parse = function(dateStr1, dateStr2, dateFormat) {
  return new DateRange(Date.parseDate(dateStr1, dateFormat), Date.parseDate(dateStr2, dateFormat));
};
