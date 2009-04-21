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

/*
 * @author Igor Vaynberg (ivaynberg)
 * @author Karri-Pekka Laakso (kplaakso)
 */

Date.DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
Date.SECOND = 1000;
Date.MINUTE = 60 * Date.SECOND;
Date.HOUR = 60 * Date.MINUTE;
Date.DAY = 24 * Date.HOUR;
Date.WEEK = 7 * Date.DAY;
Date.MONDAY = 1;
Date.SUNDAY = 0;

Date.getDaysInMonth = function(year, month) {
  if (((0 == (year % 4)) && ( (0 != (year % 100)) || (0 == (year % 400)))) && month == 1) {
    return 29;
  } else {
    return Date.DAYS_IN_MONTH[month];
  }
};

Date.getDayInYear = function(year, month, day) {
  var days = 0;
  for (var i = 0; i < month; i++) {
    days += Date.getDaysInMonth(year, i);
  }
  days += day;
  return days;
};

Date.prototype.getDaysInMonth = function() {
  return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.getDayInYear = function() {
  return Date.getDayInYear(this.getFullYear(), this.getMonth(), this.getDate());
};

Date.prototype.plusDays = function(days) {
  var newDate = this.clone();
  var hours = this.getHours();
  newDate.setTime(this.getTime() + days * Date.DAY);

  // Fix the date offset caused by daylight saving time
  var delta = hours - newDate.getHours();
  if (delta != 0) {
    // Correct the delta to be between [-12, 12]
    if (delta > 12) {
      delta -= 24;
    }
    if (delta < -12) {
      delta += 24;
    }
    newDate.setTime(newDate.getTime() + (delta * Date.HOUR));
  }
  return newDate;
};

Date.prototype.addYears = function(years) {
  this.setFullYear(this.getFullYear() + years);
  return this;
};

Date.prototype.stripTime = function() {
  this.setHours(0);
  this.setMinutes(0);
  this.setSeconds(0);
  this.setMilliseconds(0);
};

Date.prototype.compareTo = function(date) {
  if (!date) {
    return 1;
  }

  var lhs = this.getTime();
  var rhs = date.getTime();

  if (lhs < rhs) {
    return -1;
  } else if (lhs > rhs) {
    return 1;
  } else {
    return 0;
  }
};

Date.prototype.compareDateOnlyTo = function(date) {
  if (!date) {
    return 1;
  }

  var lhs = new Date();
  lhs.setTime(this.getTime());
  lhs.stripTime();

  var rhs = new Date();
  rhs.setTime(date.getTime());
  rhs.stripTime();

  return lhs.compareTo(rhs);
};

Date.prototype.isToday = function() {
  return (this.compareDateOnlyTo(new Date()) == 0);
};

Date.prototype.getWeekInYear = function(weekNumberingSystem) {
  if (weekNumberingSystem != "US" && weekNumberingSystem != "ISO") {
    throw("Week numbering system must be either US or ISO, was " + weekNumberingSystem);
  }

  var firstDay = new Date(this.getFullYear(), 0, 1).getDay();
  if (weekNumberingSystem == "US") {
    return Math.ceil((this.getDayInYear() + firstDay) / 7);
  }

  var THU = 4;
  var weekday = this.getDay();
  if (weekday == 0) {
    weekday = 7;
  }
  if (firstDay == 0) {
    firstDay = 7;
  }

  // If Dec 29 falls on Mon, Dec 30 on Mon or Tue, Dec 31 on Mon - Wed, it's on the first week of next year
  if (this.getMonth() == 11 && this.getDate() >= 29 && (this.getDate() - weekday) > 27) {
    return 1;
  }
  // If Jan 1-3 falls on Fri, Sat or Sun, it's on the last week of the previous year
  if (this.getMonth() == 0 && this.getDate() < 4 && weekday > THU) {
    return new Date(this.getFullYear() - 1, 11, 31).getWeekInYear('ISO');
  }

  var week = Math.ceil((this.getDayInYear() + firstDay - 1) / 7);

  // If first days of this year are on last year's last week, the above gives one week too much
  if (firstDay > THU) {
    week--;
  }

  return week;
};

Date.prototype.getFirstDateOfWeek = function(firstDayOfWeek) {
  if (firstDayOfWeek < this.getDay()) {
    return this.plusDays(firstDayOfWeek - this.getDay());
  }
  else if (firstDayOfWeek > this.getDay()) {
    return this.plusDays(firstDayOfWeek - this.getDay() - 7);
  } else {
    return this.clone();
  }

};

Date.prototype.hasMonthChangedOnPreviousWeek = function(firstDayOfWeek) {
  var thisFirst = this.getFirstDateOfWeek(firstDayOfWeek);
  var lastFirst = thisFirst.plusDays(-7);
  return thisFirst.getMonth() != lastFirst.getMonth();
};

Date.prototype.clone = function() {
  return new Date(this.getTime());
};
Date.prototype.isOddMonth = function() {
  return this.getMonth()%2 != 0;
}