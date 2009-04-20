module("Charge from customer selector", {
  setup: resetAll,
  tearDown: resetAll
});

test("lists week days for vappu 2009", function() {
  $("#continuousCalendar").continuousCalendar(30, 4, 2009);
  equals($("#continuousCalendar").html(), [
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
  ].join("\n"));
});

function resetAll() {}