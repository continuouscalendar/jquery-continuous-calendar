$.fn.continuousCalendar = function(params) {
  var date = new Date(params.date[1] + "/" + params.date[0] + "/" + params.date[2]);
  var firstWeekdayOfGivenDate = date.getFirstDateOfWeek(1);

  this.append([
    "<table>",
    "<tbody>",
    weekRangeMarkup(params.weeksBefore, params.weeksAfter),
    "</tbody>",
    "</table>"
  ].join("\n"));

  function weekRangeMarkup(before, after) {
    var markup = [];
    for (var i = before; i >= -after; i--) {
      markup.push(weekMarkup(firstWeekdayOfGivenDate.plusDays(i * (-7))));
    }
    return markup.join("\n");
  }

  function weekMarkup(firstDayOfWeek) {
    var markup = [];
    markup.push("<tr>");
    for (var i = 0; i < 7; i++) {
      markup.push('<td class="date">' + firstDayOfWeek.plusDays(i).getDate() + "</td>");
    }
    markup.push("</tr>");
    return markup.join("\n");
  }
};
