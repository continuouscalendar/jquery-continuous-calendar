$.fn.continuousCalendar = function(day, month, year) {
  var date = new Date(month + "/" + day + "/" + year);
  var monday = date.getFirstDateOfWeek(1);
  var weekMarkup = [];
  for (var i = 0; i < 7; i++) {
    weekMarkup.push("<td>" + monday.plusDays(i).getDate() + "</td>");
  }
  this.append([
    "<table>",
    "<tbody>",
    "<tr>",
    weekMarkup.join("\n"),
    "</tr>",
    "</tbody>",
    "</table>"
  ].join("\n"));
};