(function($) {
  $.fn.continuousCalendar = function(params) {
    var WEEK_DAYS = ["ma", "ti", "ke", "to", "pe", "la", "su"];
    var MONTHS = ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu",
      "syyskuu", "lokakuu", "marraskuu", "joulukuu"];
    var startField = this.find("input.startDate");
    var endField = this.find("input.endDate");
    var startDate = startField.size() > 0 ? new Date(startField.val()) : null;
    var endDate = endField.size() > 0 ? new Date(endField.val()) : startDate;
    var firstWeekdayOfGivenDate = (startDate || new Date()).getFirstDateOfWeek(Date.MONDAY);
    // TODO set corresponding range
    var rangeStart = null;
    var rangeEnd = null;
    var calendarContainer = this;
    var dateCells = null;
    createCalendar(this);

    if(!params.dateFormat) {
      params.dateFormat = dateFormat.masks.constructorFormat;
    }
    this.data("startSelection", startSelection);
    this.data("changeSelection", changeSelection);
    this.data("endSelection", endSelection);

    function createCalendar(container) {
      var headerTable = $("<table>").addClass("calendarHeader").append(headerRow());
      var bodyTable = $("<table>").addClass("calendarBody").append(calendarBody(params.weeksBefore, params.weeksAfter));
      var scrollContent = $("<div>").addClass("calendarScrollContent").append(bodyTable);
      var calendar = $("<div>").addClass("continuousCalendar").append(headerTable).append(scrollContent);
      container.append(calendar);
      dateCells = calendarContainer.find('.date');
      if (isRange()) {
        bodyTable.addClass("range");
        initRangeCalendarEvents();
      } else {
        initSingleDateCalendarEvents();
      }
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
        return $("<th>").addClass("month").append(firstWeekdayOfGivenDate.getFullYear());
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
        dateCell.data("date", date);
        if (date.isToday()) dateCell.addClass("today");
        if (isBetweenRange(date)) dateCell.addClass("selected");
        tr.append(dateCell);
      }
      function isBetweenRange(date) {
        if (!startDate) return false;
        return date.compareDateOnlyTo(startDate) >= 0 && date.compareDateOnlyTo(endDate) <= 0;
      }

      return tr;
    }

    function initSingleDateCalendarEvents() {
      dateCells.click(function() {
        dateCells.removeClass("selected");
        var dateCell = $(this);
        dateCell.addClass("selected");
        startField.val(dateCell.data("date").format(params.dateFormat));
      });
    }

    function initRangeCalendarEvents() {
      dateCells.mousedown(startSelection).mouseover(changeSelection).mouseup(endSelection);
    }

    function startSelection(e) {
      rangeStart = $(e.target);
      rangeEnd = null;
      dateCells.removeClass('selected');
      rangeStart.addClass("selected");
    }

    function changeSelection(e) {
      rangeEnd = $(e.target);
      if (rangeStart) {
        selectRange();
      }
    }

    function endSelection(e) {
      if (!rangeEnd) rangeEnd = $(e.target);
      updateTextFields();
      rangeStart = null;
    }

    function monthCell(firstDayOfWeek) {
      var th = $("<th>").addClass("month").addClass(backgroundBy(firstDayOfWeek));
      th.click(function() {
        startField.val(firstDayOfWeek.firstDateOfMonth().format(params.dateFormat));
        endField.val(firstDayOfWeek.lastDateOfMonth().format(params.dateFormat));
      });
      if (firstDayOfWeek.getDate() <= WEEK_DAYS.length) {
        th.append(MONTHS[firstDayOfWeek.getMonth()]);
      } else if (firstDayOfWeek.getDate() <= WEEK_DAYS.length * 2 && firstDayOfWeek.getMonth() == 0) {
        th.append(firstDayOfWeek.getFullYear());
      }
      return th;
    }

    function weekCell(firstDayOfWeek) {
      var weekNumber = $("<th>");
      weekNumber.addClass("week").addClass(backgroundBy(firstDayOfWeek)).append(firstDayOfWeek.getWeekInYear("ISO"));
      if (isRange()) {
        weekNumber.click(function () {
          dateCells.removeClass("selected");
          $(this).nextAll(".date").addClass("selected");
          startField.val(firstDayOfWeek.format(params.dateFormat));
          endField.val(firstDayOfWeek.plusDays(6).format(params.dateFormat));
        });
      }
      return weekNumber;
    }

    function backgroundBy(date) {
      return date.isOddMonth() ? ' odd' : '';
    }

    function selectRange() {
      dateCells.removeClass("selected").each(function() {
        var elem = arguments[1];
        var date = $(elem).data("date");
        if (date.isBetweenDates(earlierDate(), laterDate())) {
          $(elem).addClass("selected");
        }
      });
    }

    function earlierDate() {
      var date1 = rangeStart.data("date");
      var date2 = rangeEnd.data("date");
      return  (date1.compareDateOnlyTo(date2) > 0) ? date2 : date1;
    }

    function laterDate() {
      var date1 = rangeStart.data("date");
      var date2 = rangeEnd.data("date");
      return (date1.compareDateOnlyTo(date2) > 0) ? date1 : date2;
    }

    function updateTextFields() {
      startField.val(earlierDate().format(params.dateFormat));
      endField.val(laterDate().format(params.dateFormat));
    }

    function isRange() {
      return endField.length > 0;
    }
  };
})(jQuery);
