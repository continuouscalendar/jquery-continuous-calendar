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
      calendarContainer.find('.date').click(function() {
        calendarContainer.find(".selected").removeClass("selected");
        $(this).addClass("selected");
        startField.val($(this).data("date").format(dateFormat.masks.constructorFormat));
      });
    }

    function initRangeCalendarEvents() {
      var dateCells = calendarContainer.find('.date');
      dateCells.mousedown(startSelection).mouseover(changeSelection).mouseup(endSelection);
    }

    function startSelection(e) {
      var elem = e.target;
      rangeStart = $(elem);
      rangeEnd = null;
      calendarContainer.find('.selected').removeClass('selected');
      rangeStart.addClass("selected");
    }

    function changeSelection(e) {
      var elem = e.target;
      rangeEnd = $(elem);
      if (rangeStart) {
        selectRange();
      }
    }

    function endSelection(e) {
      var elem = e.target;
      if (!rangeEnd) rangeEnd = $(elem);
      updateTextFields();
      rangeStart = null;
    }

    function monthCell(firstDayOfWeek) {
      var th = $("<th>").addClass("month").addClass(backgroundBy(firstDayOfWeek));
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
          $(".selected").removeClass("selected");
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

    //TODO refactor
    function selectRange() {
      var date1 = rangeStart.data("date");
      var date2 = rangeEnd.data("date");
      var start = (date1.compareDateOnlyTo(date2) > 0) ? date2 : date1;
      var end = (date1.compareDateOnlyTo(date2) > 0) ? date1 : date2;
      calendarContainer.find(".date").removeClass("selected").each(function(i, elem) {
        var date = $(elem).data("date");
        if (date.compareDateOnlyTo(start) >= 0 && date.compareDateOnlyTo(end) <= 0) {
          $(elem).addClass("selected");
        }
      });
    }

    function updateTextFields() {
      var date1 = rangeStart.data("date");
      var date2 = rangeEnd.data("date");
      var start = (date1.compareDateOnlyTo(date2) > 0) ? date2 : date1;
      var end = (date1.compareDateOnlyTo(date2) > 0) ? date1 : date2;
      startField.val(start.format(params.dateFormat));
      endField.val(end.format(params.dateFormat));
    }

    function isRange() {
      return endField.length > 0;
    }
  };
})(jQuery);
