$.fn.continuousCalendar = function(params) {
  var date = new Date(params.date[1] + "/" + params.date[0] + "/" + params.date[2]);
  var monday = date.getFirstDateOfWeek(1);

  this.append([
    "<table>",
    "<tbody>",
    weeksBefore(params.weeksBefore),
    "</tbody>",
    "</table>"
  ].join("\n"));

  function weeksBefore(numberOfWeeks) {
    var markup = [];
    for (var i = numberOfWeeks; i >= 0; i--) {
      markup.push(weekMarkup(monday.plusDays(i * (-7))));
    }
    return markup.join("\n");
  }

  function weekMarkup(firstDayOfWeek) {
    var markup = [];
    markup.push("<tr>");
    for (var i = 0; i < 7; i++) {
      markup.push("<td>" + firstDayOfWeek.plusDays(i).getDate() + "</td>");
    }
    markup.push("</tr>");
    return markup.join("\n");
  }
};