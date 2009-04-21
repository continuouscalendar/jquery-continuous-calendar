$.fn.continuousCalendar = function(params) {
  var months = ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"];
  var selectedDate = new Date(params.date[1] + "/" + params.date[0] + "/" + params.date[2]);
  var firstWeekdayOfGivenDate = selectedDate.getFirstDateOfWeek(Date.MONDAY);

  this.append([
    '<table class="continuousCalendar">',
    '<thead><th>2009</th></thead>',
    '</table>',
    '<table class="continuousCalendar">',
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
    var cell = $("<th></th>");
    if (firstDayOfWeek.getDate() <= 7) {
      cell.append(months[firstDayOfWeek.getMonth()]);
      cell.addClass("month");
    }
    cell.addClass(background(firstDayOfWeek));
    markup.push(cell.parent().html());
    for (var i = 0; i < 7; i++) {
      var date = firstDayOfWeek.plusDays(i);
      markup.push('<td class="date'+background(date)+'">' + date.getDate() + "</td>");
    }
    markup.push("</tr>");
    return markup.join("\n");

    function background(date) {
      return date.isOddMonth()?' odd':'';
    }
  }
};
