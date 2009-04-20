module("continuous calendar", {
  setup: resetAll,
  tearDown: resetAll
});

test("lists week days for vappu 2009", function() {
  $("#continuousCalendar").continuousCalendar({
    date: [30, 4, 2009],
    weeksBefore: 0,
    weeksAfter: 0
  });

  var actual = $("#continuousCalendar").html();
  var expected = [
    '<table class="continuousCalendar">',
    '<tbody>',
    '<tr>',
    '<td></td>',
    '<td class="date">27</td>',
    '<td class="date">28</td>',
    '<td class="date">29</td>',
    '<td class="date">30</td>',
    '<td class="date">1</td>',
    '<td class="date">2</td>',
    '<td class="date">3</td>',
    '</tr>',
    '</tbody>',
    '</table>'
  ].join("\n");
  equals(actual, expected);
});

test("lists given number of weeks before given date", function() {
  $("#continuousCalendar").continuousCalendar({
    date: [18, 4, 2009],
    weeksBefore: 2,
    weeksAfter: 0
  });
  equals($("#continuousCalendar").find(".date").text(), [
    "30","31","1","2","3","4","5",
    "6","7","8","9","10","11","12",
    "13","14","15","16","17","18","19"
  ].join(""));
});

test("lists given number of weeks after given date", function() {
  $("#continuousCalendar").continuousCalendar({
    date: [18, 4, 2009],
    weeksBefore: 0,
    weeksAfter: 2
  });
  equals($.trim($("#continuousCalendar").find(".date").text()), [
    "13","14","15","16","17","18","19",
    "20","21","22","23","24","25","26",
    "27","28","29","30","1","2","3"
  ].join(""));
});

test("shows month name on first row of full week", function() {
  $("#continuousCalendar").continuousCalendar({
    date: [30, 4, 2009],
    weeksBefore: 0,
    weeksAfter: 1
  });
  equals($("#continuousCalendar").find(".month").size(), 1);
  equals($("#continuousCalendar").find(".month").text(), "toukokuu");
  equals($("#continuousCalendar").find(".month").next().text(), "4");
});

function resetAll() {
  $("#continuousCalendar").empty();
}
