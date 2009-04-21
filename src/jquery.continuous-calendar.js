$.fn.continuousCalendar = function(params) {
  var weekDays = ["ma", "ti", "ke", "to", "pe", "la", "su"];
  var months = ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"];
  var selectedDate = new Date(params.date[1] + "/" + params.date[0] + "/" + params.date[2]);
  var firstWeekdayOfGivenDate = selectedDate.getFirstDateOfWeek(Date.MONDAY);

  this.empty();
  var headerTable = $("<table>").append(header());
  var bodyTable = $("<table>").append(weekRange(params.weeksBefore, params.weeksAfter));
  var scrollContent = $("<div>").addClass("calendarScrollContent").append(bodyTable);
  var calendar = $("<div>").addClass("continuousCalendar").append(headerTable).append(scrollContent);
  this.append(calendar);

  function header() {
    var year = $("<th>").addClass("year").append(selectedDate.getFullYear());
    var thead = $("<thead>").append(year);
    $(weekDays).each(function() {
      var weekDay = $('<th>').append(this.toString()).addClass("weekDay");
      thead.append(weekDay);
    });
    return thead;
  }

  function weekRange(before, after) {
    var markup = $("<tbody>");
    for (var i = before; i >= -after; i--) {
      markup.append(week(firstWeekdayOfGivenDate.plusDays(i * (-7))));
    }
    return markup;
  }

  function week(firstDayOfWeek) {
    var markup = $("<tr>");
    var monthCell = $("<th>");
    if (firstDayOfWeek.getDate() <= 7) {
      monthCell.append(months[firstDayOfWeek.getMonth()]);
      monthCell.addClass("month");
    }
    monthCell.addClass(background(firstDayOfWeek));
    markup.append(monthCell);
    for (var i = 0; i < 7; i++) {
      var date = firstDayOfWeek.plusDays(i);
      var dateCell = $("<td>").addClass("date").addClass(background(date)).append(date.getDate());
      if (date.isToday()) {
        dateCell.addClass("today");
      }
      markup.append(dateCell);
    }
    return markup;

    function background(date) {
      return date.isOddMonth() ? ' odd' : '';
    }
  }
};
