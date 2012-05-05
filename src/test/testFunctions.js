/* ==============================================================================
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

var testIndex = 0
function createCalendarContainer() {
  testIndex++
  var container = $('<div>').addClass('testCalendarContainer')
  var containerWrapper = $('<div>').addClass('containerWrapper')
  var suite_description = jasmine.currentEnv_.currentSpec.suite.description;
  var description = jasmine.currentEnv_.currentSpec.description;
  var index = $('<div></div>').append('<strong>' + suite_description + '</strong><br>' + description).addClass('testLabel')
  container.attr('id', calendarId())
  containerWrapper.append(index)
  containerWrapper.append(container)
  $('#calendars').append(containerWrapper)
}

function cal(delta) {
  return $('#' + calendarId(delta))
}

function createCalendarFields(params) {
  var container = $('#' + calendarId())
  addFieldIfRequired('startDate')
  addFieldIfRequired('endDate')
  function addFieldIfRequired(fieldName) {
    if(params && params[fieldName] != undefined) {
      var field = $('<input>').attr('type', 'text').addClass(fieldName).val(params[fieldName])
      container.append(field)
    }
  }

  return container
}

function mouseClick(selector) {
  var targetElement = (typeof selector == 'object') ? selector : cal().find(selector)
  mouseEvent('mousedown', targetElement)
  mouseEvent('mouseup', targetElement)
}

function mouseEvent(eventType, elements, options) {
  var event = $.extend({target: elements.get(0)}, options)
  cal().find('.calendarBody').callEvent(eventType, event)
}

function clickDateWithShift(date) {
  var options = {shiftKey: true}
  mouseDownOnDay(date, options)
  mouseUpOnDay(date, options)
}

function mouseDownMouseUpOnDate(date) {
  mouseDownOnDay(date)
  mouseUpOnDay(date)
}

function dragDates(enter, exit) {
  mouseDownOnDay(enter)
  mouseUpOnDay(exit)
}

function dragDatesSlowly(enter, exit) {
  mouseDownOnDay(enter)
  for(var day = enter; day < exit; day++) {
    mouseMoveOnDay(day)
  }
  mouseUpOnDay(exit)
}

function createCalendarWithOneWeek() {
  createCalendarFields({startDate: '4/30/2008'}).continuousCalendar({weeksBefore: 0, weeksAfter: 0})
}

function createCalendarWithNoRange(start, end) {
  createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({firstDate: start, lastDate: end})
}

function createRangeCalendarWithFiveWeeks() {
  createCalendarFields({startDate: '4/29/2009', endDate: '5/5/2009'}).continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009'})
}

function createRangeCalendarWithFiveWeeksAndDisabledWeekends() {
  createCalendarFields({startDate: '4/29/2009', endDate: '5/5/2009'}).continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009', disableWeekends: true})
}

function createWeekCalendar() {
  createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009', selectWeek: true})
}

function createBigCalendar() {
  var todayText = DateFormat.format(DateTime.now(), Locale.EN.shortDateFormat)
  createCalendarFields({startDate: todayText, endDate: todayText }).continuousCalendar({weeksBefore: 60, weeksAfter: 30})
}

function createBigCalendarForSingleDate() {
  createCalendarFields({startDate: ''}).continuousCalendar({weeksBefore: 20, weeksAfter: 20})
}

function createCalendarFromJanuary() {
  createCalendarFields({startDate: ''}).continuousCalendar({firstDate: '1/1/2009', lastDate: '12/31/2009'})
}

function createPopupCalendar() {
  createCalendarFields({startDate: '4/29/2009'}).continuousCalendar({isPopup: true})
}

function createPopupWeekCalendar() {
  createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({firstDate: '5/1/2011', lastDate: '5/31/2011', isPopup: true, selectWeek: true})
}

function clickOnDate(date) {
  cal().find('.date:contains(' + date + ')').click()
}

function mouseEventOnDay(eventType, date, options) {
  var elem = cal().find('.date div').withText(date).length === 0 ?
    cal().find('.date').withText(date) :
    cal().find('.date div').withText(date);
  mouseEvent(eventType, elem, options);
}

function mouseDownOnDay(date) {
  mouseEventOnDay('mousedown', date, arguments[1]);
}

function mouseMoveOnDay(date) {
  mouseEventOnDay('mouseover', date);
}

function mouseUpOnDay(date, options) {
  mouseEventOnDay('mouseover', date, options)
  mouseEventOnDay('mouseup', date, options)
}

function calendarId(delta) {
  return 'continuousCalendar' + (testIndex - (delta || 0));
}

function startFieldValue() {
  return cal().find('input.startDate').val();
}

function startLabelValue() {
  return cal().find('span.startDateLabel').text();
}

function endFieldValue() {
  return cal().find('input.endDate').val();
}

function click(selector) {
  $(selector).click();
}

function value(selector) {
  var elem = $(selector)
  if(elem.is('input')) {
    return elem.val()
  } else {
    return elem.text()
  }
}

function assertHasValues(selector, expectedArray) {
  expect($.map(cal().find(selector), function(elem) {
    return $(elem).text()
  })).toEqual($.map(expectedArray, function(i) {
    return i.toString()
  }))
}

$.fn.callEvent = function(eventType, eventObj) {
  return this.each(function() {
    var eventFunctions = $(this).data('events')[eventType]
    for(var i in eventFunctions) {
      eventFunctions[i].handler.call($(this), eventObj)
    }
  })
};

$.fn.withText = function(text) {
  return this.filter(function() {
    return $(this).text() == text.toString()
  })
}

var custom_matchers = {
  toHaveLength: function(length) {
    var result = $(this.actual).length == length;
    if(this.actual instanceof jQuery) {
      this.actual = $('<div></div>').append(this.actual.clone()).html();
    }
    return result
  },
  toBeBetween: function(start, end) {
    var value = this.actual
    return value >= start && value <= end
  },
  toEndWith: function(end_string) {
    return this.actual.lastIndexOf(end_string) == this.actual.length - end_string.length
  },
  toHaveDate: function(date_str) {
    return this.actual.hasDate(new DateTime(date_str))
  },
  toBeInside: function(range) {
    return this.actual.isInside(range)
  },
  toBeValidRange: function() {
    return this.actual.isValid()
  },
  toPrintDefiningDurationOf: function(duration_str, locale) {
    return DateFormat.formatDefiningRangeDuration(this.actual, locale) == duration_str
  }
};

beforeEach(function() {
  this.addMatchers(custom_matchers)
})