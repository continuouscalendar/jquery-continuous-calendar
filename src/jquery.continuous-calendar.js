(function($) {
  $.fn.continuousCalendar = function(params) {
    var WEEK_DAYS = ["ma", "ti", "ke", "to", "pe", "la", "su"];
    var MONTHS = ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"];
    var startDate = params.startDate ? createDateBy(params.startDate) : null;
    var middleDate = startDate ? startDate : new Date();
    var endDate = params.endDate ? createDateBy(params.endDate) : middleDate;
    var firstWeekdayOfGivenDate = middleDate.getFirstDateOfWeek(Date.MONDAY);
    var calendarContainer = this;
    createCalendar(this);

    function createCalendar(container) {
      container.empty();
      var headerTable = $("<table>").addClass("calendarHeader").append(headerRow());
      var bodyTable = $("<table>").addClass("calendarBody").append(calendarBody(params.weeksBefore, params.weeksAfter));
      var scrollContent = $("<div>").addClass("calendarScrollContent").append(bodyTable);
      var calendar = $("<div>").addClass("continuousCalendar").append(headerTable).append(scrollContent);
      container.append(calendar);
    }

    function headerRow() {
      var thead = $("<thead>").append(yearCell());
      thead.append('<th class="week"></th>');
      $(WEEK_DAYS).each(function() {
        var weekDay = $('<th>').append(this.toString()).addClass("weekDay");
        thead.append(weekDay);
      });
      return thead;

      function yearCell() {
        //TODO will react on scroll and depends on top left corner date
        return $("<th>").addClass("month").append(middleDate.getFullYear());
      }
    }

    function calendarBody(before, after) {
      var tbody = $("<tbody>");
      for (var i = before; i >= -after; i--) {
        tbody.append(calendarRow(firstWeekdayOfGivenDate.plusDays(i * (-WEEK_DAYS.length))));
      }
      return tbody;
    }

    function calendarRow(firstDayOfWeek) {
      var tr = $("<tr>").append(monthCell(firstDayOfWeek)).append(weekCell(firstDayOfWeek));
      for (var i = 0; i < WEEK_DAYS.length; i++) {
        var date = firstDayOfWeek.plusDays(i);
        var dateCell = $("<td>").addClass("date").addClass(backgroundBy(date)).append(date.getDate());
        dateCell.click(function() {
          calendarContainer.find(".selected").removeClass("selected");
          $(this).addClass("selected");
        });
        if (date.isToday()) {
          dateCell.addClass("today");
        }
        if (isBetweenRange(date)) {
          dateCell.addClass("selected");
        }
        tr.append(dateCell);
      }

      function isBetweenRange(date) {
        if(!startDate) {
          return false;
        }
        return date.compareDateOnlyTo(startDate) >= 0 && date.compareDateOnlyTo(endDate) <= 0;
      }

      return tr;
    }

    function monthCell(firstDayOfWeek) {
      var th = $("<th>");
      th.addClass("month");
      if (firstDayOfWeek.getDate() <= WEEK_DAYS.length) {
        th.append(MONTHS[firstDayOfWeek.getMonth()]);
      }
      th.addClass(backgroundBy(firstDayOfWeek));
      return th;
    }

    function weekCell(firstDayOfWeek) {
      return $("<th>").addClass("week").addClass(backgroundBy(firstDayOfWeek)).append(firstDayOfWeek.getWeekInYear("ISO"));
    }

    function backgroundBy(date) {
      return date.isOddMonth() ? ' odd' : '';
    }

    function createDateBy(array) {
      return new Date(array[1] + "/" + array[0] + "/" + array[2]);
    }
  };
})(jQuery);
