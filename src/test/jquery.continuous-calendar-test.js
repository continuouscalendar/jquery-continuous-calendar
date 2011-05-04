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
module("empty calendar of full year")

test("module init", function() {
  createCalendarContainer()
  createCalendarFromJanuary()
})


test("shows year", function() {
  assertHasValues(".continuousCalendar thead th.month", ["2008"])
})

test("shows week days", function() {
  assertHasValues(".continuousCalendar thead th.weekDay", [
    "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"
  ])
})

test("shows months", function() {
  assertHasValues(".monthName", [Date.monthNames[11]].concat(Date.monthNames))
})

test("shows month name on first row of full week", function() {
  var months = cal().find("tbody .month")
  var firstMonth = months.eq(1)
  equals(firstMonth.text(), "January")
  equals(firstMonth.next().next().text(), "4")
  var secondMonth = months.eq(5)
  equals(secondMonth.text(), "February")
  equals(secondMonth.next().next().text(), "1")
})

test("shows year for january", function() {
  var year = cal().find(".month").withText("January").eq(0).parent().next().find(".month").text()
  equals(year, '2009')
})

test("render week numbers", function() {
  ok(cal().find(".week").text() > 0)
})

module("calendar bounds", {
  setup: createCalendarContainer
})

test("lists given number of weeks before given date", function() {
  createCalendarFields({startDate: "4/18/2009"}).continuousCalendar({weeksBefore: 2,weeksAfter: 0})
  assertHasValues(".date", [
    29, 30, 31, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11, 12,
    13, 14, 15, 16, 17, 18
  ])
})

test("lists given number of weeks after given date", function() {
  createCalendarFields({startDate: "4/18/2009"}).continuousCalendar({weeksBefore: 0,weeksAfter: 2})
  assertHasValues(".date", [
    12, 13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, 1, 2
  ])
})

test("if start date not selected show around current day instead", function() {
  createCalendarFields().continuousCalendar({weeksBefore: 0,weeksAfter: 0})
  equals(cal().find(".date").size(), 7)
  var weekDays = []
  var firstDay = Date.NOW.getFirstDateOfWeek(Date.SUNDAY)
  for(var i = 0; i < 7; i++) {
    weekDays.push(firstDay.plusDays(i).getDate())
  }
  assertHasValues(".date", weekDays)
  equals(cal().find(".selected").size(), 0)
})

test("disabled date is not selectable", function() {
  createCalendarFields().continuousCalendar({firstDate:"4/15/2009",lastDate:"5/9/2009", disableWeekends: true})
  clickOnDate(15)
  assertSelectedDate(15)
  clickOnDate(13)
  assertSelectedDate(15)
  clickOnDate(18)
  assertSelectedDate(15)
  clickOnDate(19)
  assertSelectedDate(15)
})

module("date picker calendar with day selected", {
  setup: createCalendarContainer
})

test("calendar with no range has no range class", function() {
  createCalendarWithOneWeek()
  ok(!cal().find(".calendarBody").hasClass("range"))
})

test("highlights selected date", function() {
  createCalendarFields({startDate:"4/30/2009"}).continuousCalendar({weeksBefore:2,weeksAfter:2})
  equals(cal().find(".selected").text(), "30")
})

test("week number click on single date calendar does nothing", function () {
  createCalendarFields({startDate: "4/18/2009"}).continuousCalendar({weeksBefore: 2,weeksAfter: 0})
  cal().find(".week").withText(15).click()
  equals(cal().find(".selected").size(), 1)
})

module("calendar range selection", {
  setup: createCalendarContainer
})

test("highlights selected date range with move handles in first and last data", function() {
  createRangeCalendarWithFiveWeeks()
  equals(cal().find(".selected").size(), 7)
  equals(cal().find(".rangeLengthLabel").text(), "7 Days")
  ok(cal().find(".selected:first").hasClass("rangeStart"), "has class rangeStart")
})

test("calendar with range has freeRange class", function() {
  createRangeCalendarWithFiveWeeks()
  ok(cal().find(".calendarBody").hasClass("freeRange"))
})

module("calendar events", {
  setup: createCalendarContainer
})

test("highlights and selects clicked day", function() {
  createCalendarWithOneWeek()
  cal().find(".date:eq(1)").click()
  equals(cal().find(".selected").text(), "28")
  equals(startFieldValue(), "4/28/2008")
  equals(startLabelValue(), "Mon 4/28/2008")
})

test("week number click selects whole week", function () {
  createRangeCalendarWithFiveWeeks()
  var weekNumber = cal().find(".week").withText(18)
  mouseClick(weekNumber)
  assertHasValues(".selected", [3,4,5,6,7,8,9])
  equals(startFieldValue(), "5/3/2009")
  equals(endFieldValue(), "5/9/2009")
  equals(cal().find(".rangeLengthLabel").text(), "7 Days")
})

test("week number click selects whole week without weekend", function () {
  createRangeCalendarWithFiveWeeksAndDisabledWeekends()
  var weekNumber = cal().find(".week").withText(18)
  mouseClick(weekNumber)
  assertHasValues(".selected", [4,5,6,7,8])
  equals(startFieldValue(), "5/4/2009")
  equals(endFieldValue(), "5/8/2009")
  equals(cal().find(".rangeLengthLabel").text(), "5 Days")
})

test("week number click selects whole week within the calendar range", function () {
  createRangeCalendarWithFiveWeeks()
  var weekNumber = cal().find(".week").withText(19)
  mouseClick(weekNumber)
  assertHasValues(".selected", [10, 11, 12])
  equals(startFieldValue(), "5/10/2009")
  equals(endFieldValue(), "5/12/2009")
  equals(cal().find(".rangeLengthLabel").text(), "3 Days")
})

function startTimer() {
  timerStart = new Date().getTime()
}

function stopTimer() {
  if(typeof timerStart == undefined) {
    return -1
  }
  return new Date().getTime() - timerStart
}

test("mouse click and drag highlights range and updates fields", function() {
  createRangeCalendarWithFiveWeeks()
  startTimer()
  dragDatesSlowly(15, 29)
  var duration = stopTimer()
  equals(cal().find(".selected").size(), 15, "(" + duration + " ms)")
  equals(startFieldValue(), "4/15/2009")
  equals(endFieldValue(), "4/29/2009")
  equals(cal().find(".rangeLengthLabel").text(), "15 Days")
})

test("mouse click and drag works with no initial selection", function() {
  createCalendarFields({startDate: "", endDate: ""}).continuousCalendar({firstDate:"1/1/2009",lastDate:"2/1/2009"})
  dragDates(22, 23)
  equals(cal().find(".selected").size(), 2)
  equals(cal().find(".rangeLengthLabel").text(), "2 Days")
})

test("mouse click on month on range calendar selects whole month", function() {
  createBigCalendar()
  var monthName = cal().find(".month").withText("May")
  mouseClick(monthName)
  equals(cal().find(".selected").size(), 31)
  var year = startFieldValue().split('/')[2]
  equals(startFieldValue(), "5/1/" + year, "start field value")
  equals(endFieldValue(), "5/31/" + year, "end field value")
  equals(cal().find(".rangeLengthLabel").text(), "31 Days")
})

test("mouse click on month in single date calendar does nothing", function() {
  createBigCalendarForSingleDate()
  cal().find(".month").withText("May").click()
  equals(cal().find(".selected").size(), 0)
  equals(startFieldValue(), "")
})

test("range is movable", function() {
  createRangeCalendarWithFiveWeeks()
  dragDates(30, 27)
  assertHasValues(".selected", [26,27,28,29,30,1,2])
  equals(startFieldValue(), "4/26/2009")
  equals(endFieldValue(), "5/2/2009")
  dragDates(28, 29)
  assertHasValues(".selected", [27,28,29,30,1,2,3])
  equals(startFieldValue(), "4/27/2009")
  equals(startLabelValue(), "Mon 4/27/2009")
  equals(endFieldValue(), "5/3/2009")
})

test("range is expandable by clicking with shift key", function() {
  createRangeCalendarWithFiveWeeks()
  clickDateWithShift(7)
  assertHasValues(".selected", [ 29, 30, 1, 2, 3, 4, 5, 6, 7])
  clickDateWithShift(13)
  assertHasValues(".selected", [ 29, 30, 1, 2, 3, 4, 5, 6, 7])
  equals(cal().find(".disabled").size(), 7, "disabled")
  //4/15/2009",lastDate:"5/12/2009
})

test("range has default of one year per direction", function() {
  createCalendarFields({startDate: "4/29/2009", endDate: "5/5/2009"}).continuousCalendar()
  equals(cal().find(".date").size(), 7 * (26 * 2 + 1))
})

test("highlights current date", function() {
  createBigCalendar()
  var cells = cal().find(".today")
  equals(cells.size(), 1)
  equals(cells.text(), Date.NOW.getDate())
})

test("range has current day selected as default when configured so", function() {
  createCalendarFields({startDate: "", endDate: ""}).continuousCalendar({weeksBefore:20, lastDate:'today', selectToday:true})
  equals(cal().find('.selected').size(), 1)
})

test("range can be specified with weeks and dates mixed", function() {
  createCalendarFields({startDate: "", endDate: ""}).continuousCalendar({weeksBefore:20, lastDate:'today'})
  equals(cal().find('.week').length, 22)
})

//TODO fails with IE7
test("calendar executes callback-function and triggers event when date is picked", function() {
  function testFunction() {
    calendarCallBack++
  }

  bindCalled = 0
  window.calendarCallBack = 0
  createCalendarFields({startDate: ""}).continuousCalendar({firstDate:"4/26/2009", lastDate:"5/2/2009", callback:testFunction})
  cal().bind('calendarChange', function() {
    bindCalled++
  })
  clickOnDate(28)
  equals(bindCalled, 1, 'bind')
  equals(calendarCallBack, 2, 'callback')
  //equals(window.calendarChanged, 2)
})

test("range calendar executes callback-function and triggers event when range is created or changed", function() {
  function testFunction(range) {
    window.calendarContainer = this
    window.calendarCallBack = range.days()
  }

  createCalendarFields({startDate: "", endDate: ""}).continuousCalendar({firstDate:"4/26/2009", lastDate:"5/2/2009", callback:testFunction})
  cal().bind('calendarChange', function() {
    window.calendarChanged = $(this).find('.selected').length
  })
  equals(window.calendarCallBack, 0)
  dragDates(28, 29)
  equals(window.calendarCallBack, 2)
  equals(window.calendarContainer.find('.selected').length, 2)
  equals(window.calendarChanged, 2)
})

test("calendar provides selection as public field", function() {
  createRangeCalendarWithFiveWeeks()
  equals(cal().calendarRange().days(), 7)
})

test("month and day names are localizable", function() {
  createCalendarFields({startDate: "", endDate: ""}).continuousCalendar({firstDate:"1.1.2009", lastDate:"31.12.2009", locale: DATE_LOCALE_FI})
  assertHasValues(".continuousCalendar thead th.weekDay", ['ma','ti','ke','to','pe','la','su'])
  assertHasValues(".monthName", [
    "joulukuu",
    "tammikuu",
    "helmikuu",
    "maaliskuu",
    "huhtikuu",
    "toukokuu",
    "kesäkuu",
    "heinäkuu",
    "elokuu",
    "syyskuu",
    "lokakuu",
    "marraskuu",
    "joulukuu"])
  mouseDownMouseUpOnDate(1)
  equals(startFieldValue(), "1.1.2009")
  equals(startLabelValue(), "to 1.1.2009")
})

test("forward drag after one day selection expands selection", function() {
  createRangeCalendarWithFiveWeeks()
  mouseDownMouseUpOnDate(16)
  assertHasValues('.selected', [16])

  dragDates(16, 18)
  assertHasValues('.selected', [16,17,18])

  mouseDownMouseUpOnDate(19)
  assertHasValues('.selected', [19])
  dragDates(19, 17)
  assertHasValues('.selected', [17,18,19])
})

module("pop-up calendar", {
  setup: createCalendarContainer
})

test("", function() {
  createPopupCalendar()
  ok(!cal().find('.continuousCalendar:visible').exists(), "pop-up calendar is not initially shown")
  equals(startLabelValue(), "Wed 4/29/2009", "Initially selected date is shown correctly")
  cal().find(".calendarIcon").click()
  ok(cal().find('.continuousCalendar:visible').exists(), "calendar pops up on click")
  assertHasValues(".continuousCalendar thead th.month", ["2008"], "month is shown correctly")
})

test("when selecting date", function() {
  var previous = cal(1)
  createPopupCalendar()
  cal().find(".calendarIcon").click()
  cal().find(".date:first").click()
  ok(!cal().find('.continuousCalendar:visible').exists(), "calendar is closed when date is selected")
  ok(previous.find('.continuousCalendar:visible').exists(), "only selected calendar is closed")
  equals(startLabelValue(), "Sun 10/26/2008", "selected date is shown correctly with day of week")
  equals(startFieldValue(), "10/26/2008", "selected date is set correctly to hidden field without day of week")
})

module("minimum range with disabled weekends", {setup: function() {
  createCalendarContainer()
  createCalendarFields({startDate: "4/15/2009", endDate: "4/15/2009"}).continuousCalendar({firstDate:"4/15/2009",lastDate:"5/12/2009", minimumRange: 4, disableWeekends: true})
}})

test("moving and creation has constraints", function() {
  assertHasValues('.selected', [17, 18, 19 , 20], "initial range is in bounds")

})

test("moving and creation has constraints", function() {
  dragDates(27, 27)
  assertHasValues('.selected', [27,28,29,30], "initial range has minimum required size")
  dragDates(27, 28)
  assertHasValues('.selected', [27,28,29,30], "resizing to smaller that permitted from start is ignored")
  dragDates(30, 29)
  assertHasValues('.selected', [27,28,29,30], "resizing to smaller that permitted from end is ignored")
  dragDates(27, 26)
  assertHasValues('.selected', [27,28,29,30], "resizing to earlier skips weekends")
  dragDates(30, 1)
  assertHasValues('.selected', [27,28,29,30, 1], "resizing to later is allowed if not on weekend")
  dragDates(28, 29)
  assertHasValues('.selected', [27, 28,29,30, 1], "no reaction when moving over weekend (snap to weekdays)")
  dragDatesSlowly(28, 1)
  assertHasValues('.selected', [30, 1, 2, 3, 4], "moving skips weekends")
  dragDatesSlowly(3, 4)
  assertHasValues('.selected', [1, 2, 3, 4, 5], "moving right allowed")
  dragDatesSlowly(4, 3)
  assertHasValues('.selected', [30, 1, 2, 3, 4], "moving left allowed")
  mouseDownMouseUpOnDate(19)
  assertHasValues('.selected', [30, 1, 2, 3, 4], "prevent selecting range that starts or ends on weekend")
  mouseDownMouseUpOnDate(6)
  assertHasValues('.selected', [5, 6, 7, 8], "selecting range that don't start or end on weekend id is permitted")
})

module("calendar week selection", {
  setup: createCalendarContainer
})

test("date click selects whole week", function() {
  createWeekCalendar()
  mouseClick(cal().find(".date").withText(21).first())
  assertHasValues(".selected", [19, 20, 21, 22, 23, 24, 25])
  equals(startFieldValue(), "4/19/2009")
  equals(endFieldValue(), "4/25/2009")
  equals(cal().find(".rangeLengthLabel").text(), "7 Days")
})

test("date click selects whole week within calendar range", function() {
  createWeekCalendar()
  mouseClick(cal().find(".date").withText(15).first())
  assertHasValues(".selected", [15, 16, 17, 18])
  equals(startFieldValue(), "4/15/2009")
  equals(endFieldValue(), "4/18/2009")
  equals(cal().find(".rangeLengthLabel").text(), "4 Days")
})

test("date click closes the calendar", function() {
  createPopupWeekCalendar()
  cal().find(".calendarIcon").click()
  mouseClick(cal().find(".date").withText(11))
  ok(!cal().find(".continuousCalendar:visible").exists())
  equals(startFieldValue(), "5/8/2011")
  equals(endFieldValue(), "5/14/2011")
})

test("week click closes the calendar", function() {
  createPopupWeekCalendar()
  cal().find(".calendarIcon").click()
  mouseClick(cal().find(".week").withText(21))
  ok(!cal().find(".continuousCalendar:visible").exists())
  equals(startFieldValue(), "5/29/2011")
  equals(endFieldValue(), "5/31/2011")
})

//Help IDE to identify functions
test = QUnit.test
module = QUnit.module
equals = QUnit.equal
ok = QUnit.ok
