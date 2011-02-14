
module("empty calendar of full year");

test("module init", function() {
  $('#tests').hide();
  createCalendarContainer();
  createCalendarFromJanuary();
});


test("shows year", function() {
  assertHasValues(".continuousCalendar thead th.month", [Date.NOW.getFullYear()]);
});

test("shows week days", function() {
  assertHasValues(".continuousCalendar thead th.weekDay", [
    "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"
  ]);
});

test("shows months", function() {
  assertHasValues(".monthName", Date.monthNames);
});

test("shows month name on first row of full week", function() {
  var months = cal().find("tbody .month");
  var firstMonth = months.eq(1);
  equals(firstMonth.text(), "January");
  equals(firstMonth.next().next().text(), "4");
  var secondMonth = months.eq(5);
  equals(secondMonth.text(), "February");
  equals(secondMonth.next().next().text(), "1");
});

test("shows year for january", function() {
  var year = cal().find(".month").withText("January").eq(0).parent().next().find(".month").text();
  equals(year, '2009');
});

test("render week numbers", function() {
  ok(cal().find(".week").text() > 0);
});

module("calendar bounds", {
  setup: createCalendarContainer
});

test("lists given number of weeks before given date", function() {
  createCalendarFields({startDate: "4/18/2009"}).continuousCalendar({weeksBefore: 2,weeksAfter: 0});
  assertHasValues(".date", [
    29, 30, 31, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11, 12,
    13, 14, 15, 16, 17, 18
  ]);
});

test("lists given number of weeks after given date", function() {
  createCalendarFields({startDate: "4/18/2009"}).continuousCalendar({weeksBefore: 0,weeksAfter: 2});
  assertHasValues(".date", [
    12, 13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, 1, 2
  ]);
});

test("if start date not selected show around current day instead", function() {
  createCalendarFields().continuousCalendar({weeksBefore: 0,weeksAfter: 0});
  equals(cal().find(".date").size(), 7);
  var weekDays = [];
  var firstDay = Date.NOW.getFirstDateOfWeek(Date.SUNDAY);
  for (var i = 0; i < 7; i++) {
    weekDays.push(firstDay.plusDays(i).getDate());
  }
  assertHasValues(".date", weekDays);
  equals(cal().find(".selected").size(), 0);
});

test("disabled date is not selectable", function() {
  createCalendarFields().continuousCalendar({firstDate:"4/15/2009",lastDate:"5/9/2009", disableWeekends: true});
  clickOnDate(15);
  assertSelectedDate(15);
  clickOnDate(13);
  assertSelectedDate(15);
  clickOnDate(18);
  assertSelectedDate(15);
  clickOnDate(19);
  assertSelectedDate(15);
});

module("date picker calendar with day selected", {
  setup: createCalendarContainer
});

test("calendar with no range has no range class", function() {
  createCalendarWithOneWeek();
  ok(!cal().find(".calendarBody").hasClass("range"));
});

test("highlights selected date", function() {
  createCalendarFields({startDate:"4/30/2009"}).continuousCalendar({weeksBefore:2,weeksAfter:2});
  equals(cal().find(".selected").text(), "30");
});

test("week number click on single date calendar does nothing", function () {
  createCalendarFields({startDate: "4/18/2009"}).continuousCalendar({weeksBefore: 2,weeksAfter: 0});
  cal().find(".week").withText(15).click();
  equals(cal().find(".selected").size(), 1);
});

module("calendar range selection", {
  setup: createCalendarContainer
});

test("highlights selected date range with move handles in first and last data", function() {
  createRangeCalendarWithFiveWeeks();
  equals(cal().find(".selected").size(), 7);
  equals(cal().find(".rangeLengthLabel").text(), "7 Days");
  ok(cal().find(".selected:first").hasClass("rangeStart"), "has class rangeStart");
});

test("calendar with range has range class", function() {
  createRangeCalendarWithFiveWeeks();
  ok(cal().find(".calendarBody").hasClass("range"));
});

module("calendar events", {
  setup: createCalendarContainer
});

test("highlights and selects clicked day", function() {
  createCalendarWithOneWeek();
  cal().find(".date:eq(1)").click();
  equals(cal().find(".selected").text(), "28");
  equals(startFieldValue(), "4/28/2008");
  equals(startLabelValue(), "Mon 4/28/2008");
});

test("week number click selects whole week", function () {
  createRangeCalendarWithFiveWeeks();
  var weekNumber = cal().find(".week").withText(18);
  mouseClick(weekNumber);
  assertHasValues(".selected", [3,4,5,6,7,8,9]);
  equals(startFieldValue(), "5/3/2009");
  equals(endFieldValue(), "5/9/2009");
  equals(cal().find(".rangeLengthLabel").text(), "7 Days");
});

function startTimer() {
  timerStart = new Date().getTime();
}

function stopTimer() {
  if (typeof timerStart == undefined) {
    return -1;
  }
  return new Date().getTime() - timerStart;
}

test("mouse click and drag highlights range and updates fields", function() {
  createRangeCalendarWithFiveWeeks();
  startTimer()
  dragDatesSlowly(15, 29);
  var duration = stopTimer()
  equals(cal().find(".selected").size(), 15, "("+duration+" ms)");
  equals(startFieldValue(), "4/15/2009");
  equals(endFieldValue(), "4/29/2009");
  equals(cal().find(".rangeLengthLabel").text(), "15 Days");
});

test("mouse click and drag works with no initial selection", function() {
  createCalendarFields({startDate: "", endDate: ""}).continuousCalendar({firstDate:"1/1/2009",lastDate:"2/1/2009"});
  dragDates(22, 23);
  equals(cal().find(".selected").size(), 2);
  equals(cal().find(".rangeLengthLabel").text(), "2 Days");
});

test("mouse click on month on range calendar selects whole month", function() {
  createBigCalendar();
  var monthName = cal().find(".month").withText("May");
  mouseClick(monthName);
  equals(cal().find(".selected").size(), 31);
  var year = startFieldValue().split('/')[2];
  equals(startFieldValue(), "5/1/"+year, "start field value");
  equals(endFieldValue(), "5/31/"+year, "end field value");
  equals(cal().find(".rangeLengthLabel").text(), "31 Days");
});

test("mouse click on month in singe date calendar does nothing", function() {
  createBigCalendarForSingleDate();
  cal().find(".month").withText("May").click();
  equals(cal().find(".selected").size(), 0);
  equals(startFieldValue(), "");
});

test("range is movable", function() {
  createRangeCalendarWithFiveWeeks();
  dragDates(30, 27);
  assertHasValues(".selected", [26,27,28,29,30,1,2]);
  equals(startFieldValue(), "4/26/2009");
  equals(endFieldValue(), "5/2/2009");
  dragDates(28, 29);
  assertHasValues(".selected", [27,28,29,30,1,2,3]);
  equals(startFieldValue(), "4/27/2009");
  equals(startLabelValue(), "Mon 4/27/2009");
  equals(endFieldValue(), "5/3/2009");
});

test("range is expandable by clicking with shift key", function() {
  createRangeCalendarWithFiveWeeks();
  clickDateWithShift(7);
  assertHasValues(".selected", [ 29, 30, 1, 2, 3, 4, 5, 6, 7]);
  clickDateWithShift(13);
  assertHasValues(".selected", [ 29, 30, 1, 2, 3, 4, 5, 6, 7]);
  equals(cal().find(".disabled").size(), 7, "disabled");
  //4/15/2009",lastDate:"5/12/2009
});

test("range has default of on year per direction", function() {
  createCalendarFields({startDate: "4/29/2009", endDate: "5/5/2009"}).continuousCalendar();
  equals(cal().find(".date").size(), 7 * (26 * 2 + 1));
});

test("highlights current date", function() {
  createBigCalendar();
  var cells = cal().find(".today");
  equals(cells.size(), 1);
  equals(cells.text(), Date.NOW.getDate());
});

test("range has current day selected as default when configured so", function() {
  createCalendarFields({startDate: "", endDate: ""}).continuousCalendar({weeksBefore:20, lastDate:'today', selectToday:true});
  equals(cal().find('.selected').size(), 1);
});

test("range can be specified with weeks and dates mixed", function() {
  createCalendarFields({startDate: "", endDate: ""}).continuousCalendar({weeksBefore:20, lastDate:'today'});
  equals(cal().find('.week').length, 22);
});

//TODO fails with IE7
test("calendar executes callback-function and triggers event when date is picked", function() {
  function testFunction(date) {
    calendarCallBack++
  }
  bindCalled = 0
  window.calendarCallBack = 0
  createCalendarFields({startDate: ""}).continuousCalendar({firstDate:"4/26/2009", lastDate:"5/2/2009", callback:testFunction});
  cal().bind('calendarChange', function() {
    bindCalled++
  });
  clickOnDate(28)
  equals(bindCalled, 1, 'bind');
  equals(calendarCallBack, 2, 'callback');
  //equals(window.calendarChanged, 2);
});

test("range calendar executes callback-function and triggers event when range is created or changed", function() {
  function testFunction(range) {
    window.calendarContainer = this;
    window.calendarCallBack = range.days();
  }

  createCalendarFields({startDate: "", endDate: ""}).continuousCalendar({firstDate:"4/26/2009", lastDate:"5/2/2009", callback:testFunction});
  cal().bind('calendarChange', function() {
    window.calendarChanged = $(this).find('.selected').length;
  });
  equals(window.calendarCallBack, 0);
  dragDates(28, 29);
  equals(window.calendarCallBack, 2);
  equals(window.calendarContainer.find('.selected').length, 2);
  equals(window.calendarChanged, 2);
});

test("calendar provides selection as public field", function() {
  createRangeCalendarWithFiveWeeks();
  equals(cal().calendarRange().days(), 7);
});

test("month and day names are localizable", function() {
  createCalendarFields({startDate: "", endDate: ""}).continuousCalendar({firstDate:"1.1.2009", lastDate:"31.12.2009", locale: DATE_LOCALE_FI});
  assertHasValues(".continuousCalendar thead th.weekDay", ['Ma','Ti','Ke','To','Pe','La','Su']);
  assertHasValues(".monthName", [
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
    "joulukuu"]);
  mouseDownMouseUpOnDate(1);
  equals(startFieldValue(), "1.1.2009");
  equals(startLabelValue(), "To 1.1.2009");
});

test("forward drag after one day selection expands selection", function() {
  createRangeCalendarWithFiveWeeks();
  mouseDownMouseUpOnDate(16);
  assertHasValues('.selected',[16]);

  dragDates(16, 18);
  assertHasValues('.selected',[16,17,18]);

  mouseDownMouseUpOnDate(19);
  assertHasValues('.selected', [19]);
  dragDates(19,17);
  assertHasValues('.selected', [17,18,19]);
});

module("pop-up calendar", {
  setup: createCalendarContainer
})

test("", function() {
  createPopupCalendar()
  ok(!cal().find('.continuousCalendar:visible').exists(), "pop-up calendar is not initially shown")
  equals(startLabelValue(), "Wed 4/29/2009", "Initially selected date is shown correctly");
  cal().find(".calendarIcon").click()
  ok(cal().find('.continuousCalendar:visible').exists(), "calendar pops up on click")
})

test("when selecting date", function() {
  var previous = cal(1)
  createPopupCalendar()
  cal().find(".calendarIcon").click()
  cal().find(".date:first").click();
  ok(!cal().find('.continuousCalendar:visible').exists(), "calendar is closed when date is selected")
  ok(previous.find('.continuousCalendar:visible').exists(), "only selected calendar is closed")
  equals(startLabelValue(), "Sun 10/26/2008", "selected date is shown correctly with day of week");
  equals(startFieldValue(), "10/26/2008", "selected date is set correctly to hidden field without day of week");
})

QUnit.done = function() {
  $('#tests').show();
};

var moduleName = "";
QUnit.moduleStart = function(name) {
  moduleName = name;
};

var testName = "";
QUnit.testStart = function(name) {
  testName = name;
};
var testIndex = 0;

function createCalendarContainer() {
  testIndex++;
  var container = $("<div>").addClass('testCalendarContainer');
  var index = $('<div></div>').append(testName).addClass('testLabel');
  container.attr("id", calendarId());
  container.append(index);
  $("#calendars").append(container);
}

function cal(delta) {
  return $("#" + calendarId(delta));
}

function createCalendarFields(params) {
  var container = $("#" + calendarId());
  addFieldIfRequired("startDate");
  addFieldIfRequired("endDate");
  function addFieldIfRequired(fieldName) {
    if (params && params[fieldName] != undefined) {
      var field = $("<input>").attr("type", "text").addClass(fieldName).val(params[fieldName]);
      container.append(field);
    }
  }
  return container;
}

function mouseClick(selector) {
  var targetElement = (typeof selector == 'object')? selector : cal().find(selector);
  mouseEvent('mousedown', targetElement);
  mouseEvent('mouseup', targetElement);
}

function mouseEvent(eventType, elements, options) {
  var event = $.extend({target:elements.get(0)}, options);
  cal().find('.calendarBody').callEvent(eventType, event);
}

function clickDateWithShift(date) {
  var options = {shiftKey:true};
  mouseDownOnDay(date, options);
  mouseUpOnDay(date, options);
}

function mouseDownMouseUpOnDate(date) {
  mouseDownOnDay(date);
  mouseUpOnDay(date);
}

function dragDates(enter, exit) {
  mouseDownOnDay(enter);
  mouseUpOnDay(exit);
}

function dragDatesSlowly(enter, exit) {
  mouseDownOnDay(enter);
  for(var day = enter; day < exit; day++) {
    mouseMoveOnDay(day);
  }
  mouseUpOnDay(exit);
}


function createCalendarWithOneWeek() {
  createCalendarFields({startDate:"4/30/2008"}).continuousCalendar({weeksBefore: 0,weeksAfter: 0});
}

function createRangeCalendarWithFiveWeeks() {
  createCalendarFields({startDate: "4/29/2009", endDate: "5/5/2009"}).continuousCalendar({firstDate:"4/15/2009",lastDate:"5/12/2009"});
}

function createBigCalendar() {
  var todayText = Date.NOW.dateFormat(DATE_LOCALE_EN.shortDateFormat);
  createCalendarFields({startDate: todayText, endDate: todayText }).continuousCalendar({weeksBefore: 60,weeksAfter: 30});
}

function createBigCalendarForSingleDate() {
  createCalendarFields({startDate: ""}).continuousCalendar({weeksBefore: 20,weeksAfter: 20});
}

function createCalendarFromJanuary() {
  createCalendarFields({startDate: ""}).continuousCalendar({firstDate:"1/1/2009", lastDate:"12/31/2009"});
}

function createPopupCalendar() {
  createCalendarFields({startDate: "4/29/2009"}).continuousCalendar({isPopup: true});
}

function clickOnDate(date) {
  cal().find(".date:contains(" + date + ")").click();
}

function assertSelectedDate(expectedDate) {
  equals(cal().find(".selected").text(), expectedDate);
}

function mouseEventOnDay(eventType, date, options) {mouseEvent(eventType, cal().find(".date").withText(date), options);}
function mouseDownOnDay(date) { mouseEventOnDay("mousedown", date, arguments[1]);}
function mouseMoveOnDay(date) {mouseEventOnDay("mouseover", date);}
function mouseUpOnDay(date, options) {
  mouseEventOnDay("mouseover", date, options);
  mouseEventOnDay("mouseup", date, options);
}
function calendarId(delta) {return "continuousCalendar" + (testIndex - (delta || 0));}
function startFieldValue() {return cal().find("input.startDate").val();}
function startLabelValue() {return cal().find("span.startDateLabel").text();}
function endFieldValue() {return cal().find("input.endDate").val();}

$.fn.callEvent = function(eventType, eventObj) {
  return this.each(function() {
    var eventFunctions = $(this).data('events')[eventType];
    for (var i in eventFunctions) {
      eventFunctions[i].call($(this), eventObj);
    }
  });
};