module("calendar rendering", {
  setup: createCalendarContainer
});

test("shows year", function() {
  calendar().continuousCalendar({
    startDate: [30, 4, 2008],
    weeksBefore: 0,
    weeksAfter: 0
  });
  equals($.trim(calendar().find(".continuousCalendar thead th.year").text()), "2008");
});

test("shows week days", function() {
  calendar().continuousCalendar({
    startDate: [30, 4, 2008],
    weeksBefore: 0,
    weeksAfter: 0
  });
  equals($.trim(calendar().find(".continuousCalendar thead th.weekDay").text()), [
    "ma", "ti", "ke", "to", "pe", "la", "su"
  ].join(""));
});

test("lists week days for vappu 2009", function() {
  calendar().continuousCalendar({
    startDate: [30, 4, 2009],
    weeksBefore: 0,
    weeksAfter: 0
  });
  equals($.trim(calendar().find(".continuousCalendar tbody").html()), [
    '<tr>',
    '<th class="odd"></th>',
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
  calendar().continuousCalendar({
    startDate: [18, 4, 2009],
    weeksBefore: 2,
    weeksAfter: 0
  });
  equals(calendar().find(".date").text(), [
    "30","31","1","2","3","4","5",
    "6","7","8","9","10","11","12",
    "13","14","15","16","17","18","19"
  ].join(""));
});

test("lists given number of weeks after given date", function() {
  calendar().continuousCalendar({
    startDate: [18, 4, 2009],
    weeksBefore: 0,
    weeksAfter: 2
  });
  equals($.trim(calendar().find(".date").text()), [
    "13","14","15","16","17","18","19",
    "20","21","22","23","24","25","26",
    "27","28","29","30","1","2","3"
  ].join(""));
});

test("shows month name on first row of full week", function() {
  calendar().continuousCalendar({
    startDate: [30, 4, 2009],
    weeksBefore: 0,
    weeksAfter: 5
  });
  var months = calendar().find(".month");
  equals(months.size(), 2);
  var firstMonth = months.eq(0);
  equals(firstMonth.text(), "toukokuu");
  equals(firstMonth.next().text(), "4");
  var secondMonth = months.eq(1);
  equals(secondMonth.text(), "kesäkuu");
  equals(secondMonth.next().text(), "1");
});

test("highlights current date", function() {
  var today = new Date();
  calendar().continuousCalendar({
    startDate: [today.getDate(), today.getMonth() + 1, today.getFullYear()],
    weeksBefore: 20,
    weeksAfter: 20
  });
  var cells = calendar().find(".today");
  equals(cells.size(), 1);
  equals(cells.text(), today.getDate());
});

test("highlights selected date", function() {
  calendar().continuousCalendar({
    startDate:  [30, 4, 2009],
    weeksBefore:2,
    weeksAfter:2
  });
  equals(calendar().find(".selected").text(), "30");
});

test("higlights selected date range", function() {
  calendar().continuousCalendar({
    startDate:  [29, 4, 2009],
    endDate: [5, 5, 2009],
    weeksBefore:2,
    weeksAfter:2
  });
  equals(calendar().find(".selected").size(), 7);
});

module("calendar events", {
  setup: createCalendarContainer
});

test("highlight clicked day", function() {
  calendar().continuousCalendar({
    startDate: [30, 4, 2008],
    weeksBefore: 0,
    weeksAfter: 0
  });
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
