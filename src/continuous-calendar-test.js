module("Charge from customer selector", {
  setup: resetAll,
  tearDown: resetAll
});

test("lists week days for vappu 2009", function() {
  $("#continuousCalendar").continuousCalendar({
    date: [30, 4, 2009],
    weeksBefore: 0
  });

  var actual = $("#continuousCalendar").html();
  var expected = [
    "<table>",
    "<tbody>",
    "<tr>",
    "<td>27</td>",
    "<td>28</td>",
    "<td>29</td>",
    "<td>30</td>",
    "<td>1</td>",
    "<td>2</td>",
    "<td>3</td>",
    "</tr>",
    "</tbody>",
    "</table>"
  ].join("\n");
  equals(actual, expected);
  console.log(actual, "expected: ",expected);
});


test("lists given number of weeks before given date", function() {
  $("#continuousCalendar").continuousCalendar({
    date: [18, 4, 2009],
    weeksBefore: 2
  });
  equals($.trim($("#continuousCalendar").text()), [
    "30",
    "31",
    "1",
    "2",
    "3",
    "4",
    "5",
    "",
    "",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "",
    "",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19"
  ].join("\n"));
});

function equalsWithLog(actual, expected) {
  equals(actual,expected);
  console.log('actual:\n"',actual,'"\nexpected:\n"',expected+'"');
}

function resetAll() {
  $("#continuousCalendar").empty();
}