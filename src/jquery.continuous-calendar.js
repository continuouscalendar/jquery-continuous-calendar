(function($) {
  $.fn.continuousCalendar = function(params) {
    var WEEK_DAYS = ["ma", "ti", "ke", "to", "pe", "la", "su"];
    var MONTHS = ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"];
    var startDate = createDateBy(params.startDate);
    var endDate = params.endDate ? createDateBy(params.endDate) : startDate;
    var firstWeekdayOfGivenDate = startDate.getFirstDateOfWeek(Date.MONDAY);

    createCalendar(this);

    function createCalendar(container) {
      container.empty();
      var headerTable = $("<table>").addClass("calendarHeader").append(header());
      var bodyTable = $("<table>").addClass("calendarBody").append(weekRange(params.weeksBefore, params.weeksAfter));
      var scrollContent = $("<div>").addClass("calendarScrollContent").append(bodyTable);
      var calendar = $("<div>").addClass("continuousCalendar").append(headerTable).append(scrollContent);
      container.append(calendar);
    }

    function header() {
      var thead = $("<thead>").append(year());
      $(WEEK_DAYS).each(function() {
        var weekDay = $('<th>').append(this.toString()).addClass("weekDay");
        thead.append(weekDay);
      });
      return thead;

      function year() {
        //TODO will react on scroll and depends on top left corner date
        return $("<th>").addClass("year").append(startDate.getFullYear());
      }
    }

    function weekRange(before, after) {
      var tbody = $("<tbody>");
      for (var i = before; i >= -after; i--) {
        tbody.append(week(firstWeekdayOfGivenDate.plusDays(i * (-WEEK_DAYS.length))));
      }
      return tbody;
    }

    function week(firstDayOfWeek) {
      var tr = $("<tr>");
      tr.append(month(firstDayOfWeek));
      for (var i = 0; i < WEEK_DAYS.length; i++) {
        var date = firstDayOfWeek.plusDays(i);
        var dateCell = $("<td>").addClass("date").addClass(backgroundBy(date)).append(date.getDate());
        if (date.isToday()) {
          dateCell.addClass("today");
        }
        if (date.equalsOnlyDate(startDate)) {
          dateCell.addClass("selected");
        }
        tr.append(dateCell);
      }
      return tr;
    }

    function month(firstDayOfWeek) {
      var th = $("<th>");
      if (firstDayOfWeek.getDate() <= WEEK_DAYS.length) {
        th.append(MONTHS[firstDayOfWeek.getMonth()]);
        th.addClass("month");
      }
      th.addClass(backgroundBy(firstDayOfWeek));
      return th;
    }

    function backgroundBy(date) {
      return date.isOddMonth() ? ' odd' : '';
    }

    function createDateBy(array) {
      return new Date(array[1] + "/" + array[0] + "/" + array[2]);
    }
  };
})(jQuery);
