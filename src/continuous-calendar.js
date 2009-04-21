$.fn.continuousCalendar = function(params) {
  var weekDays = ["ma", "ti", "ke", "to", "pe", "la", "su"];
  var months = ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"];
  var selectedDate = new Date(params.date[1] + "/" + params.date[0] + "/" + params.date[2]);
  var firstWeekdayOfGivenDate = selectedDate.getFirstDateOfWeek(Date.MONDAY);

  this.empty();
  this.append([
    '<div class="continuousCalendar">',
    '<table>',
    '<thead><th class="year">' + selectedDate.getFullYear() + '</th>',
    weekDaysMarkup(),
    '</thead>',
    '</table>',
    '<div class="calendarScrollContent">',
    '<table>',
    '<tbody>',
    weekRangeMarkup(params.weeksBefore, params.weeksAfter),
    '</tbody>',
    '</table>',
    '</div>',
    '</div>'
  ].join("\n"));

  function weekDaysMarkup() {
    var markup = [];
    for (var i in weekDays) {
      markup.push('<th class="weekDay">' + weekDays[i] + '</th>');
    }
    return markup.join("\n");
  }

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
    var monthCell = $("<th></th>");
    if (firstDayOfWeek.getDate() <= 7) {
      monthCell.append(months[firstDayOfWeek.getMonth()]);
      monthCell.addClass("month");
    }
    monthCell.addClass(background(firstDayOfWeek));
    markup.push(monthCell.parent().html());
    for (var i = 0; i < 7; i++) {
      var date = firstDayOfWeek.plusDays(i);
      var dateCell = $("<td></td>");
      dateCell.addClass("date");
      dateCell.addClass(background(date));
      if (date.isToday()) {
        dateCell.addClass("today");
      }
      dateCell.append(date.getDate());
      markup.push(dateCell.parent().html());
    }
    markup.push("</tr>");
    return markup.join("\n");

    function background(date) {
      return date.isOddMonth() ? ' odd' : '';
    }
  }
};
