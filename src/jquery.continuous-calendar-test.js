module("calendar rendering", {
  setup: createCalendarContainer
});

test("shows year", function() {
  createCalendarWithOneWeek();
  assertHasValues(".continuousCalendar thead th.month", ["2008"]);
});

test("shows week days", function() {
  calendar().continuousCalendar({startDate: [30, 4, 2008],weeksBefore: 0,weeksAfter: 0});
  assertHasValues(".continuousCalendar thead th.weekDay", [
    "ma", "ti", "ke", "to", "pe", "la", "su"
  ]);
});

test("lists week days for vappu 2009", function() {
  calendar().continuousCalendar({startDate: [30, 4, 2009],weeksBefore: 0,weeksAfter: 0});
  equals($.trim(calendar().find(".continuousCalendar tbody").html()), [
    '<tr>',
    '<th class="month odd"></th>',
    '<th class="week odd">18</th>',
    '<td class="date odd">27</td>',
    '<td class="date odd">28</td>',
    '<td class="date odd">29</td>',
    '<td class="date odd selected">30</td>',
    '<td class="date">1</td>',
    '<td class="date">2</td>',
    '<td class="date">3</td>',
    '</tr>'
  ].join(""));
});

test("lists given number of weeks before given date", function() {
  calendar().continuousCalendar({startDate: [18, 4, 2009],weeksBefore: 2,weeksAfter: 0});
  assertHasValues(".date", [
    "30","31","1","2","3","4","5",
    "6","7","8","9","10","11","12",
    "13","14","15","16","17","18","19"
  ]);
});

test("lists given number of weeks after given date", function() {
  calendar().continuousCalendar({startDate: [18, 4, 2009],weeksBefore: 0,weeksAfter: 2});
  assertHasValues(".date", [
    "13","14","15","16","17","18","19",
    "20","21","22","23","24","25","26",
    "27","28","29","30","1","2","3"
  ]);
});

test("shows month name on first row of full week", function() {
  calendar().continuousCalendar({startDate: [30, 4, 2009],weeksBefore: 0,weeksAfter: 5});
  var months = calendar().find(" tbody .month");
  equals(months.size(), 6);
  var firstMonth = months.eq(1);
  equals(firstMonth.text(), "toukokuu");
  equals(firstMonth.next().next().text(), "4");
  var secondMonth = months.eq(5);
  equals(secondMonth.text(), "kesäkuu");
  equals(secondMonth.next().next().text(), "1");
});

test("highlights current date and shows year for janary", function() {
  var today = new Date();
  calendar().continuousCalendar({startDate: [
    today.getDate(), today.getMonth() + 1, today.getFullYear()],
    weeksBefore: 20,weeksAfter: 20});
  var cells = calendar().find(".today");
  equals(cells.size(), 1);
  equals(cells.text(), today.getDate());
  equals(calendar().find(".month:contains(tammikuu)").parent().next().find(".month").text(), "2009");
});

test("highlights selected date", function() {
  calendar().continuousCalendar({startDate:  [30, 4, 2009],weeksBefore:2,weeksAfter:2});
  equals(calendar().find(".selected").text(), "30");
});

test("higlights selected date range", function() {
  calendar().continuousCalendar({startDate:  [29, 4, 2009],endDate: [5, 5, 2009],weeksBefore:2,weeksAfter:2});
  equals(calendar().find(".selected").size(), 7);
});

test("if start date not selected show around current day instead", function() {
  calendar().continuousCalendar({weeksBefore: 0,weeksAfter: 0});
  var today = new Date();
  equals(calendar().find(".date").size(), 7);
  equals(calendar().find(".date:contains(" + today.getDay() + ")").size(), 1);
  //assertHasValues(".date", ["20","21","22","23","24","25","26"]);
  equals(calendar().find(".selected").size(), 0);
});

test("render week numbers", function() {
  createCalendarWithOneWeek();
  var today = new Date();
  ok(calendar().find(".week").text() >0);
});
//TODO render year for first month

module("calendar events", {
  setup: createCalendarContainer
});

test("highlight clicked day", function() {
  createCalendarWithOneWeek();
  calendar().find(".date:eq(1)").click();
  equals(calendar().find(".selected").text(), "29");
});

//TODO week number selects week
//TODO month nam selects month
//TODO kahva selectioniin
var testIndex = 0;

function createCalendarContainer() {
  testIndex++;
  var container = $("<div style='margin:1em'></div>");
  var index = $('<div></div>').append(testIndex).css({
    "float": "left",
    "font-weight": "bold",
    "color": "green"
  });
  container.attr("id", calendarId());
  $("#main").append(index).append(container);
}

function calendar() {
  return $("#" + calendarId());
}

function calendarId() {
  return "continuousCalendar" + testIndex;
}

function createCalendarWithOneWeek() {
  calendar().continuousCalendar({
    startDate: [30, 4, 2008],
    weeksBefore: 0,
    weeksAfter: 0
  });
}

function assertHasValues(selector, expectedArray) {
  same($.map(calendar().find(selector), function (elem) {
    return $(elem).text();
  }), expectedArray);
}