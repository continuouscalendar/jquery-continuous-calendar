module("calendar rendering", {
  setup: createCalendarContainer
});

test("shows year", function() {
  createCalendarWithOneWeek();
  assertHasValues(".continuousCalendar thead th.month", ["2008"]);
});

test("shows week days", function() {
  cal({startDate: "4/30/2008"}).continuousCalendar({weeksBefore: 0,weeksAfter: 0});
  assertHasValues(".continuousCalendar thead th.weekDay", [
    "ma", "ti", "ke", "to", "pe", "la", "su"
  ]);
});

test("lists given number of weeks before given date", function() {
  cal({startDate: "4/18/2009"}).continuousCalendar({weeksBefore: 2,weeksAfter: 0});
  assertHasValues(".date", [
    30, 31, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11, 12,
    13, 14, 15, 16, 17, 18, 19
  ]);
});

test("lists given number of weeks after given date", function() {
  cal({startDate: "4/18/2009"}).continuousCalendar({weeksBefore: 0,weeksAfter: 2});
  assertHasValues(".date", [
    13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, 1, 2, 3
  ]);
});

test("shows month name on first row of full week", function() {
  cal({startDate: "4/30/2009"}).continuousCalendar({weeksBefore: 0,weeksAfter: 5});
  var months = cal().find("tbody .month");
  var firstMonth = months.eq(1);
  equals(firstMonth.text(), "toukokuu");
  equals(firstMonth.next().next().text(), "4");
  var secondMonth = months.eq(5);
  equals(secondMonth.text(), "kesäkuu");
  equals(secondMonth.next().next().text(), "1");
});

test("highlights current date and shows year for january", function() {
  var today = new Date();
  createBigCalendar();
  var cells = cal().find(".today");
  equals(cells.size(), 1);
  equals(cells.text(), today.getDate());
  var year = cal().find(".month").withText("tammikuu").eq(0).parent().next().find(".month").text();
  ok(parseInt(year) == new Date().getFullYear());
});

test("highlights selected date", function() {
  cal({startDate:"30.4.2009"}).continuousCalendar({weeksBefore:2,weeksAfter:2, dateFormat: Date.patterns.FiShortDatePattern});
  equals(cal().find(".selected").text(), "30");
});

test("higlights selected date range with move handles in first and last data", function() {
  createRangeCalendarWithFiveWeeks();
  equals(cal().find(".selected").size(), 7);
  equals(cal().find("em span").text(), "7");
  ok(cal().find(".selected:first").hasClass("rangeStart"), "has class rangeStart");
});

test("if start date not selected show around current day instead", function() {
  cal().continuousCalendar({weeksBefore: 0,weeksAfter: 0});
  var today = new Date();
  equals(cal().find(".date").size(), 7);
  var weekDays = [];
  var firstDay = today.getFirstDateOfWeek(Date.MONDAY);
  for (var i = 0; i < 7; i++) {
    weekDays.push(firstDay.plusDays(i).getDate());
  }
  assertHasValues(".date", weekDays);
  equals(cal().find(".selected").size(), 0);
});

test("render week numbers", function() {
  createCalendarWithOneWeek();
  ok(cal().find(".week").text() > 0);
});

test("calendar with no range has no range class", function() {
  createCalendarWithOneWeek();
  ok(!cal().find(".calendarBody").hasClass("range"));
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
  equals(cal().find(".selected").text(), "29");
  equals(startFieldValue(), "4/29/2008");
  equals(startLabelValue(), "4/29/2008");
});

test("week number click selects whole week", function () {
  createRangeCalendarWithFiveWeeks();
  var weekNumber = cal().find(".week").withText(18);
  mouseEvent("mouseDown", weekNumber);
  mouseEvent("mouseUp", weekNumber);
  assertHasValues(".selected", [27,28,29,30,1,2,3]);
  equals(startFieldValue(), "4/27/2009");
  equals(endFieldValue(), "5/3/2009");
  equals(cal().find("em span").text(), "7");
});

test("week number click on single date calendar does nothing", function () {
  cal({startDate: "4/18/2009"}).continuousCalendar({weeksBefore: 2,weeksAfter: 0});
  cal().find(".week").withText(15).click();
  equals(cal().find(".selected").size(), 1);
});


test("mouse click and drag highlights range and updates fields", function() {
  createRangeCalendarWithFiveWeeks();
  mouseDownOnDay(27);
  mouseMoveOnDay(27);
  mouseMoveOnDay(28);
  mouseMoveOnDay(29);
  mouseUpOnDay(29);
  equals(cal().find(".selected").size(), 3);
  equals(startFieldValue(), "4/27/2009");
  equals(endFieldValue(), "4/29/2009");
  equals(cal().find("em span").text(), "3");
});

test("mouse click and drag works with no initial selection", function() {
  cal({startDate: "", endDate: ""}).continuousCalendar({weeksBefore:3,weeksAfter:3});
  mouseDownOnDay(22);
  mouseMoveOnDay(22);
  mouseMoveOnDay(23);
  mouseUpOnDay(23);
  equals(cal().find(".selected").size(), 2);
  equals(cal().find("em span").text(), "2");
});

test("mouse click on month on range calendar selects whole month", function() {
  createBigCalendar();
  var monthName = cal().find(".month").withText("toukokuu");
  mouseEvent("mouseDown", monthName);
  mouseEvent("mouseUp", monthName);
  equals(cal().find(".selected").size(), 31);
  equals(startFieldValue(), "1.5.2009");
  equals(endFieldValue(), "31.5.2009");
  equals(cal().find("em span").text(), "31");
});

test("mouse click on month in singe date calendar does nothing", function() {
  createBigCalendarForSingleDate();
  cal().find(".month").withText("toukokuu").click();
  equals(cal().find(".selected").size(), 0);
  equals(startFieldValue(), "");
});

test("range is movable", function() {
  createRangeCalendarWithFiveWeeks();
  mouseDownOnDay(30);
  mouseMoveOnDay(27);
  mouseUpOnDay(27);
  assertHasValues(".selected", [26,27,28,29,30,1,2]);
  equals(startFieldValue(), "4/26/2009");
  equals(endFieldValue(), "5/2/2009");
  mouseDownOnDay(28);
  mouseMoveOnDay(29);
  mouseUpOnDay(29);
  assertHasValues(".selected", [27,28,29,30,1,2,3]);
  equals(startFieldValue(), "4/27/2009");
  equals(endFieldValue(), "5/3/2009");
});

test("range is expandable by clicking with shift key", function() {
  createRangeCalendarWithFiveWeeks();
  clickWithShiftOnDay(7);
  assertHasValues(".selected", [ 29, 30, 1, 2, 3, 4, 5, 6, 7]);
  clickWithShiftOnDay(13);
  assertHasValues(".selected", [ 29, 30, 1, 2, 3, 4, 5, 6, 7]);
  equals(cal().find(".disabled").size(), 7, "disabled");
  //4/15/2009",lastDate:"5/12/2009
});

test("range has default of on year per direction", function() {
  cal({startDate: "4/29/2009", endDate: "5/5/2009"}).continuousCalendar();
  equals(cal().find(".date").size(),7*(26*2+1));
});

test("range has current day selected as default when configured so", function() {
  cal({startDate: "", endDate: ""}).continuousCalendar({weeksBefore:2, weeksAfter:2, selectToday:true});
  equals(cal().find('.selected').size(), 1);
});

test("range can be specified with weeks and dates mixed", function() {
  cal({startDate: "", endDate: ""}).continuousCalendar({weeksBefore:20, lastDate:'today'});
  equals(cal().find('.week').length, 22);
});

test("calendar executes callback-function and triggers event when range is created or changed", function() {
  function testFunction(range) {
    window.calendarContainer = this;
    window.calendarCallBack = range.days();
  }
  cal({startDate: "", endDate: ""}).continuousCalendar({firstDate:"4/26/2009", lastDate:"5/2/2009", callback:testFunction});
  cal().bind('calendarChange', function() {
    window.calendarChanged = $(this).find('.selected').length;
  });
  equals(window.calendarCallBack, 0);
  mouseDownOnDay(28);
  mouseMoveOnDay(29);
  mouseUpOnDay(29);
  equals(window.calendarCallBack, 2);
  equals(window.calendarContainer.find('.selected').length, 2);
  equals(window.calendarChanged, 2);
  delete window.calendarCallBack;
  delete window.calendarContainer;
  delete window.calendarChanged;
});

test("calendar provides selection as public field", function() {
  createRangeCalendarWithFiveWeeks();
  equals(cal().calendarRange().days(),7);
});

var testIndex = 0;

function createCalendarContainer() {
  testIndex++;
  var container = $("<div>").css({
    margin: "10px",
    float: "left",
    height: "160px"
  });
  var index = $('<div></div>').append(testIndex).css({
    "font-weight": "bold",
    "color": "green"
  });
  container.attr("id", calendarId());
  container.append(index);
  $("#main").append(container);
}

function cal(params) {
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

function mouseEventOnDay(functionName, date, options) {
  mouseEvent(functionName, cal().find(".date").withText(date), options);
}

function mouseEvent(functionName, elements, options) {
  var e = {
    target:elements.get(0)
  };
  for (var i in options) {
    e[i] = options[i];
  }
  cal().data(functionName)(e);
}

function clickWithShiftOnDay(date) {
  var options = {shiftKey:true};
  mouseDownOnDay(date, options);
  mouseUpOnDay(date, options);
}

function mouseDownOnDay(date, options) {
  mouseEventOnDay("mouseDown", date, options);
}
function mouseMoveOnDay(date) {
  mouseEventOnDay("mouseMove", date);
}

function mouseUpOnDay(date, options) {
  mouseEventOnDay("mouseUp", date, options);
}

function calendarId() {
  return "continuousCalendar" + testIndex;
}

function createCalendarWithOneWeek() {
  cal({startDate:"4/30/2008"}).continuousCalendar({weeksBefore: 0,weeksAfter: 0});
}

function createRangeCalendarWithFiveWeeks() {
  cal({startDate: "4/29/2009", endDate: "5/5/2009"}).continuousCalendar({firstDate:"4/15/2009",lastDate:"5/12/2009"});

}
function createBigCalendar() {
  var todayText = new Date().dateFormat(Date.patterns.FiShortDatePattern);
  cal({startDate: todayText, endDate: todayText }).continuousCalendar({weeksBefore: 60,weeksAfter: 30, dateFormat: Date.patterns.FiShortDatePattern});
}

function createBigCalendarForSingleDate() {
  cal({startDate: ""}).continuousCalendar({weeksBefore: 20,weeksAfter: 20});
}

function startFieldValue() {
  return cal().find("input.startDate").val();
}
function startLabelValue() {
  return cal().find("span.startDateLabel").text();
}
function endFieldValue() {
  return cal().find("input.endDate").val();
}