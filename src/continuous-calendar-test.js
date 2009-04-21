module("continuous calendar", {
  setup: resetAll,
  tearDown: resetAll
});

test("shows year", function() {
  $("#continuousCalendar").continuousCalendar({
    date: [30, 4, 2008],
    weeksBefore: 0,
    weeksAfter: 0
  });
  equals($.trim($("#continuousCalendar .continuousCalendar thead th.year").text()), "2008");
});

test("shows week days", function() {
  $("#continuousCalendar").continuousCalendar({
    date: [30, 4, 2008],
    weeksBefore: 0,
    weeksAfter: 0
  });
  equals($.trim($("#continuousCalendar .continuousCalendar thead th.weekDay").text()), [
    "ma", "ti", "ke", "to", "pe", "la", "su"
  ].join(""));
});

test("lists week days for vappu 2009", function() {
  $("#continuousCalendar").continuousCalendar({
    date: [30, 4, 2009],
    weeksBefore: 0,
    weeksAfter: 0
  });
  equals($.trim($("#continuousCalendar .continuousCalendar tbody").html()), [
    '<tr>',
    '<th class="odd"></th>',
    '<td class="date odd">27</td>',
    '<td class="date odd">28</td>',
    '<td class="date odd">29</td>',
    '<td class="date odd">30</td>',
    '<td class="date">1</td>',
    '<td class="date">2</td>',
    '<td class="date">3</td>',
    '</tr>'
  ].join("\n"));
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
    weeksAfter: 5
  });
  var months = $("#continuousCalendar .month");
  equals(months.size(), 2);
  var firstMonth = months.eq(0);
  equals(firstMonth.text(), "toukokuu");
  equals(firstMonth.next().text(), "4");
  var secondMonth = months.eq(1);
  equals(secondMonth.text(), "kesäkuu");
  equals(secondMonth.next().text(), "1");
});

function resetAll() {
  $("#continuousCalendar").empty();
}
