(function($) {
  $.fn.continuousCalendar = function(params) {
    var WEEK_DAYS = ["ma", "ti", "ke", "to", "pe", "la", "su"];
    var MONTHS = ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu",
      "syyskuu", "lokakuu", "marraskuu", "joulukuu"];
    var Status = {
      CREATE:"create",
      MOVE:"move",
      SHIFT_EXPAND:"shift_expand",
      DRAG_EXPAND_START:"drag_expand_start",
      DRAG_EXPAND_END:"drag_expand_end",
      NONE:"none"
    };
    
    var defaultParams = {
      weeksBefore: 26,
      weeksAfter: 26,
      dateFormat: Date.patterns.ShortDatePattern,
      startField: this.find("input.startDate"),
      endField: this.find("input.endDate")
    };

    setDefaultParams();

    var rangeLengthLabel = $("<span>");
    var startDate = fieldDate(params.startField);
    var endDate = fieldDate(params.endField);
    var firstWeekdayOfGivenDate = (startDate || new Date()).getFirstDateOfWeek(Date.MONDAY);
    var calendarContainer = this;
    var dateCells = null;
    var dateCellDates = null;
    var moveStartDate = null;
    var mouseDownDate = null;
    var averageCellHeight;
    var yearTitle;
    var selection;
    var calendarRange;
    var status = Status.NONE;

    createCalendar(this);

    this.data("mouseDown", mouseDown);
    this.data("mouseMove", mouseMove);
    this.data("mouseUp", mouseUp);

    function createCalendar(container) {
      if (startDate && endDate) {
        selection = new DateRange(startDate, endDate);
      } else {
        selection = DateRange.emptyRange();
      }
      //TODO fix logic; smart defaults
      if ("firstDate" in params && "lastDate" in params) {
        calendarRange = DateRange.parse(params.firstDate, params.lastDate, params.dateFormat);
      } else {
        var rangeStart = firstWeekdayOfGivenDate.plusDays(-(params.weeksBefore * WEEK_DAYS.length));
        var rangeEnd = firstWeekdayOfGivenDate.plusDays(params.weeksAfter * WEEK_DAYS.length + WEEK_DAYS.length - 1);
        calendarRange = new DateRange(rangeStart, rangeEnd);
      }

      var headerTable = $("<table>").addClass("calendarHeader").append(headerRow());
      var bodyTable = $("<table>").addClass("calendarBody").append(calendarBody());
      var scrollContent = $("<div>").addClass("calendarScrollContent").append(bodyTable);
      var calendar = $("<div>").addClass("continuousCalendar").append(headerTable).append(scrollContent);
      container.append(calendar);
      dateCells = calendarContainer.find('.date');
      dateCellDates = dateCells.map(function() {
        return this.date;
      });
      if (isRange()) {
        var daysContainer = $("<em>");
        rangeLengthLabel.text(selection.days());
        daysContainer.append(rangeLengthLabel).append(" Päivää");
        container.append(daysContainer);
        bodyTable.addClass("range");
        initRangeCalendarEvents();
      } else {
        initSingleDateCalendarEvents();
      }
      averageCellHeight = parseInt(bodyTable.height() / bodyTable.find("tr").size());
      yearTitle = headerTable.find("th.month");
      scrollContent.scroll(function() {
        setYearLabel(this);
      });

      var selected = scrollContent.find(".today, .selected").get(0);
      if (selected) {
        scrollContent.scrollTop(selected.offsetTop - (scrollContent.height() - selected.offsetHeight) / 2);
      }
    }

    function setDefaultParams() {
      if(params == undefined) params = {};
      for (var i in defaultParams) {
        if (!(i in params)) {
          params[i] = defaultParams[i];
        }
      }
    }

    function setYearLabel(scrollContent) {
      var table = $(scrollContent).find("table").get(0);
      var rowNumber = parseInt(scrollContent.scrollTop / averageCellHeight);
      var date = table.rows[rowNumber].cells[2].date;
      yearTitle.text(date.getFullYear());
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
        return $("<th>").addClass("month").append(firstWeekdayOfGivenDate.getFullYear());
      }
    }

    function calendarBody() {
      var tbody = $("<tbody>");
      var currentMonday = calendarRange.start.getFirstDateOfWeek(Date.MONDAY);
      while (currentMonday.compareTo(calendarRange.end) <= 0) {
        tbody.append(calendarRow(currentMonday.clone()));
        currentMonday = currentMonday.plusDays(WEEK_DAYS.length);
      }
      return tbody;
    }

    function calendarRow(firstDayOfWeek) {
      var tr = $("<tr>").append(monthCell(firstDayOfWeek)).append(weekCell(firstDayOfWeek));
      for (var i = 0; i < WEEK_DAYS.length; i++) {
        var date = firstDayOfWeek.plusDays(i);
        var dateCell = $("<td>").addClass(dateStyles(date)).append(date.getDate());
        dateCell.get(0).date = date;
        if (date.isToday()) dateCell.addClass("today");
        if (isRange()) {
          dateCell.toggleClass("selected", selection.hasDate(date));
          dateCell.toggleClass("rangeStart", date.equalsOnlyDate(selection.start));
          dateCell.toggleClass("rangeEnd", date.equalsOnlyDate(selection.end));
        } else {
          dateCell.toggleClass("selected", date.equalsOnlyDate(startDate));
        }
        tr.append(dateCell);
      }
      return tr;
    }

    function monthCell(firstDayOfWeek) {
      var th = $("<th>").addClass("month").addClass(backgroundBy(firstDayOfWeek));
      if (isRange()) {
        th.click(function() {
          selection = new DateRange(firstDayOfWeek.firstDateOfMonth(), firstDayOfWeek.lastDateOfMonth());
          updateTextFields();
          selectRange();
        });
      }
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
          selection = new DateRange(firstDayOfWeek, firstDayOfWeek.plusDays(6));
          updateTextFields();
          selectRange();
        });
      }
      return weekNumber;
    }

    function dateStyles(date) {
      return "date " + backgroundBy(date) + disabledOrNot(date) + todayStyle(date);
    }

    function backgroundBy(date) {
      return date.isOddMonth() ? ' odd' : '';
    }

    function disabledOrNot(date) {
      return calendarRange.hasDate(date) ? "" : " disabled";
    }

    function todayStyle(date) {
      return date.isToday() ? " today" : "";
    }

    function initSingleDateCalendarEvents() {
      dateCells.click(function() {
        dateCells.removeClass("selected");
        var dateCell = $(this);
        dateCell.addClass("selected");
        params.startField.val(dateCell.get(0).date.dateFormat(params.dateFormat));
      });
    }

    function initRangeCalendarEvents() {
      dateCells.mousedown(mouseDown).mouseover(mouseMove).mouseup(mouseUp);
    }

    function mouseDown(e) {
      var elem = e.target;
      mouseDownDate = elem.date;
      if (mouseDownDate.equalsOnlyDate(selection.start)) {
        status = Status.DRAG_EXPAND_START;
      } else if (mouseDownDate.equalsOnlyDate(selection.end)) {
        status = Status.DRAG_EXPAND_END;
      } else if (selection.hasDate(mouseDownDate)) {
        startMovingRange(mouseDownDate);
      } else if (isEnabled(elem)) {
        if (e.shiftKey) {
          selection.expandTo(mouseDownDate);
          selectRange();
          updateTextFields();
        } else {
          startCreatingRange($(elem));
        }
      }
      e.preventDefault();
    }

    function isEnabled(elem) {
      return !$(elem).hasClass("disabled");
    }

    function mouseMove(e) {
      var date = e.target.date;
      if (isEnabled(e.target)) {
        switch (status) {
          case Status.MOVE:
            moveRange(date);
            break;
          case Status.CREATE:
            selection = new DateRange(mouseDownDate, date);
            selectRange();
            break;
          case Status.DRAG_EXPAND_START:
            if (date.compareTo(selection.end) < 0) {
              selection = new DateRange(date, selection.end);
              selectRange();
            }
            break;
          case Status.DRAG_EXPAND_END:
            if (date.compareTo(selection.start) > 0) {
              selection = new DateRange(selection.start, date);
              selectRange();
            }
            break;
          default:
            break;
        }
      }
    }

    function mouseUp(e) {
      if (isEnabled(e.target)) {
        switch (status) {
          case Status.MOVE:
            updateTextFields();
            status = Status.NONE;
            break;
          case Status.CREATE:
            selection = new DateRange(mouseDownDate, e.target.date);
            status = Status.NONE;
            selectRange();
            updateTextFields();
            break;
          case Status.DRAG_EXPAND_START:
          case Status.DRAG_EXPAND_END:
            status = Status.NONE;
            updateTextFields();
            break;
          default:
            break;
        }
      } else {
        status = Status.NONE;
      }
    }

    function startMovingRange(date) {
      status = Status.MOVE;
      moveStartDate = date;
    }

    function moveRange(date) {
      var deltaDays = moveStartDate.distanceInDays(date);
      moveStartDate = date;
      selection.shiftDays(deltaDays);
      selection = selection.and(calendarRange);
      selectRange();
    }

    function startCreatingRange(elem) {
      status = Status.CREATE;
      selection = new DateRange(mouseDownDate, mouseDownDate);
      dateCells.each(function(i) {
        this.className = dateStyles(dateCellDates[i]);
      });
      var domElem = elem.get(0);
      domElem.className = dateStyles(domElem.date) + " selected rangeStart";
      rangeLengthLabel.text(selection.days());
    }

    function selectRange() {
      selectRangeBetweenDates(selection.start, selection.end);
      rangeLengthLabel.text(selection.days());
    }

    function selectRangeBetweenDates(start, end) {
      dateCells.each(function(i, elem) {
        var date = dateCellDates[i];
        var class = [dateStyles(date)];

        if (date.equalsOnlyDate(end)) {
          class.push("selected rangeEnd");
        } else if (date.equalsOnlyDate(start)) {
          class.push("selected rangeStart");
        } else if (date.isBetweenDates(start, end)) {
          class.push("selected");
        }
        elem.className = class.join(" ");
      });
    }

    function updateTextFields() {
      params.startField.val(selection.start.dateFormat(params.dateFormat));
      params.endField.val(selection.end.dateFormat(params.dateFormat));
    }

    function isRange() {
      return params.endField && params.endField.length > 0;
    }

    function fieldDate(field) {
      if (field.size() > 0 && field.val().length > 0)
        return Date.parseDate(field.val(), params.dateFormat);
      else
        return null;
    }

  };
})(jQuery);

function DateRange(date1, date2) {
  if (!date1 || !date2) {
    throw("two dates must be specified, date1=" + date1 + ", date2=" + date2);
  }
  this.start = date1.compareTo(date2) > 0 ? date2 : date1;
  this.end = date1.compareTo(date2) > 0 ? date1 : date2;
  this.days = function() {
    return Math.round(this.start.distanceInDays(this.end) + 1);
  };
  this.shiftDays = function(days) {
    this.start = this.start.plusDays(days);
    this.end = this.end.plusDays(days);
  };
  this.hasDate = function(date) {
    return date.isBetweenDates(this.start, this.end);
  };
  this.expandTo = function(date) {
    if (date.compareTo(this.start) < 0) {
      this.start = date;
    } else if (date.compareTo(this.end) > 0) {
      this.end = date;
    }
  };
  this.and = function(that) {
    var latestStart = this.start.compareTo(that.start) > 0 ? this.start : that.start;
    var earliestEnd = this.end.compareTo(that.end) > 0 ? that.end : this.end;
    if (latestStart.compareTo(earliestEnd) < 0) {
      return new DateRange(latestStart, earliestEnd);
    } else {
      return DateRange.emptyRange();
    }
  };
}

DateRange.emptyRange = function() {
  function NullDateRange() {
    this.start = null;
    this.end = null;
    this.days = function() {
      return 0;
    };
    this.shiftDays = function() {
    };
    this.hasDate = function() {
      return false;
    };
  }

  return new NullDateRange();
};
DateRange.parse = function(dateStr1, dateStr2, dateFormat) {
  var date1 = dateStr1 == "today" ? new Date() : Date.parseDate(dateStr1, dateFormat);
  var date2 = dateStr2 == "today" ? new Date() : Date.parseDate(dateStr2, dateFormat);
  return new DateRange(date1, date2);
};