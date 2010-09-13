(function($) {
  $.fn.continuousCalendar = function(options) {
    this.each(function() {
      _continuousCalendar.call($(this), options);
    });
    return this;
    function _continuousCalendar(options) {
      var defaults = {
        weeksBefore: 26,
        weeksAfter: 26,
        startField: this.find('input.startDate'),
        endField: this.find('input.endDate'),
        isPopup: false,
        selectToday: false,
        locale: DATE_LOCALE_EN,
        callback: function() {
        }
      };
      var params = $.extend(defaults, options);
      var Status = {
        CREATE:'create',
        MOVE:'move',
        NONE:'none'
      };
      params.locale.init();
      var startDate = fieldDate(params.startField);
      var endDate = fieldDate(params.endField);
      if (params.selectToday) {
        var today = Date.NOW;
        var formattedToday = formatDate(today);
        startDate = today;
        endDate = today;
        setStartField(formattedToday);
        setEndField(formattedToday);
      }
      var firstWeekdayOfGivenDate = (startDate || Date.NOW).getFirstDateOfWeek(params.locale.firstWeekday);
      var container = this;
      var dateCells = null;
      var dateCellDates = null;
      var moveStartDate = null;
      var mouseDownDate = null;
      var averageCellHeight;
      var yearTitle;
      var selection;
      var calendarRange;
      var status = Status.NONE;
      var calendar;
      var scrollContent;
      var beforeFirstOpening = true;
      var bodyTable;
      createCalendar();
      container.trigger('calendarChange');
      function createCalendar() {
        if (startDate && endDate) {
          selection = new DateRange(startDate, endDate);
        } else {
          selection = DateRange.emptyRange();
        }
        container.data('calendarRange', selection);
        var rangeStart = 'firstDate' in params ? Date.parseDate(params.firstDate, params.locale.shortDateFormat) : firstWeekdayOfGivenDate.plusDays(-(params.weeksBefore * 7));
        var rangeEnd = 'lastDate' in params ? Date.parseDate(params.lastDate, params.locale.shortDateFormat) : firstWeekdayOfGivenDate.plusDays(params.weeksAfter * 7 + 6);
        calendarRange = new DateRange(rangeStart, rangeEnd);
        var headerTable = $('<table>').addClass('calendarHeader').append(headerRow());
        bodyTable = $('<table>').addClass('calendarBody').append(calendarBody());
        scrollContent = $('<div>').addClass('calendarScrollContent').append(bodyTable);
        calendar = getCalendarContainerOrCreateOne();
        calendar.append(headerTable).append(scrollContent);
        if (params.isPopup) {
          isHidden = true;
          calendar.addClass('popup').hide();
          var icon = $('<a href="#" class="calendarIcon"><span>calendar</span></a>').click(toggleCalendar);
          container.append(icon);
        } else {
          calculateCellHeightAndSetScroll();
        }
        if (container.find('.startDateLabel').isEmpty()) {
          addDateLabels(container);
        }
        if (container.find('.rangeLengthLabel').isEmpty() && isRange()) {
          addRangeLengthLabel(container);
        }
        dateCells = container.find('.date');
        dateCellDates = dateCells.map(function() {
          return this.date;
        });
        if (isRange()) {
          initRangeCalendarEvents(container, bodyTable);
        } else {
          initSingleDateCalendarEvents();
        }
        yearTitle = headerTable.find('th.month');
        scrollContent.scroll(setYearLabel);
        scrollToSelection();
        params.callback.call(container, selection);
      }

      function getCalendarContainerOrCreateOne() {
        var existingContainer = container.find('.continuousCalendar');
        if (existingContainer.exists()) {
          return existingContainer;
        } else {
          var newContainer = $('<div>').addClass('continuousCalendar');
          container.append(newContainer);
          return newContainer;
        }
      }

      function addDateLabels(container) {
        var dateLabelContainer = $('<div class="label">');
        dateLabelContainer.append('<span class="startDateLabel"></span>');
        if (isRange()) {
          dateLabelContainer.append('<span class="separator"> - </span>').append('<span class="endDateLabel"></span>');
        }
        container.append(dateLabelContainer);
        dateLabelContainer.click(toggleCalendar);
      }

      function addRangeLengthLabel(container) {
        var rangeLengthContainer = $('<div class="label">');
        rangeLengthContainer.append('<span class="rangeLengthLabel"></span>');
        container.find('.continuousCalendar').append(rangeLengthContainer);
      }

      function initRangeCalendarEvents(container, bodyTable) {
        container.find('span.rangeLengthLabel').text(Date.daysLabel(selection.days()));
        bodyTable.addClass('range');
        bodyTable.mousedown(mouseDown).mouseover(mouseMove).mouseup(mouseUp);
        disableTextSelection(bodyTable.get(0));
        setRangeLabels();
      }

      function scrollToSelection() {
        var selectionStartOrToday = scrollContent.find('.selected, .today').get(0);
        if (selectionStartOrToday) {
          scrollContent.scrollTop(selectionStartOrToday.offsetTop - (scrollContent.height() - selectionStartOrToday.offsetHeight) / 2);
        }
      }

      function setYearLabel() {
        var scrollContent = this;
        var table = $(scrollContent).find('table').get(0);
        var rowNumber = parseInt(scrollContent.scrollTop / averageCellHeight);
        var date = table.rows[rowNumber].cells[2].date;
        yearTitle.text(date.getFullYear());
      }

      function headerRow() {
        var tr = $('<tr>').append(yearCell());
        tr.append($('<th class="week">&nbsp;</th>'));
        $(Date.dayNames).each(function(index) {
          var weekDay = $('<th>').append(Date.dayNames[(index + params.locale.firstWeekday) % 7].substr(0, 2)).addClass('weekDay');
          tr.append(weekDay);
        });
        if (params.isPopup) {
          var close = $('<th><a href="#"><span>close</span></a>');
          close.find('a').click(toggleCalendar);
          tr.append(close);
        }
        return $('<thead>').append(tr);
        function yearCell() {
          return $('<th>').addClass('month').append(firstWeekdayOfGivenDate.getFullYear());
        }
      }

      function calculateCellHeightAndSetScroll() {
        averageCellHeight = parseInt(bodyTable.height() / bodyTable.find('tr').size());
        scrollToSelection();
      }

      function toggleCalendar() {
        calendar.toggle();
        if (beforeFirstOpening) {
          calculateCellHeightAndSetScroll();
          beforeFirstOpening = false;
        }
        return false;
      }

      function calendarBody() {
        var tbody = $('<tbody>');
        var firstWeekDay = calendarRange.start.getFirstDateOfWeek(params.locale.firstWeekday);
        while (firstWeekDay.compareTo(calendarRange.end) <= 0) {
          tbody.append(calendarRow(firstWeekDay.clone()));
          firstWeekDay = firstWeekDay.plusDays(7);
        }
        return tbody;
      }

      function calendarRow(firstDayOfWeek) {
        var tr = $('<tr>').append(monthCell(firstDayOfWeek)).append(weekCell(firstDayOfWeek));
        for (var i = 0; i < 7; i++) {
          var date = firstDayOfWeek.plusDays(i);
          var dateCell = $('<td>').addClass(dateStyles(date)).append(date.getDate());
          dateCell.get(0).date = date;
          if (date.isToday()) {
            dateCell.addClass('today');
          }
          if (isRange()) {
            dateCell.toggleClass('selected', selection.hasDate(date)).toggleClass('rangeStart', date.equalsOnlyDate(selection.start)).toggleClass('rangeEnd', date.equalsOnlyDate(selection.end));
          } else {
            dateCell.toggleClass('selected', date.equalsOnlyDate(startDate));
          }
          tr.append(dateCell);
        }
        return tr;
      }

      function monthCell(firstDayOfWeek) {
        var th = $('<th>').addClass('month').addClass(backgroundBy(firstDayOfWeek));
        if (firstDayOfWeek.getDate() <= 7) {
          th.append(Date.monthNames[firstDayOfWeek.getMonth()]).addClass('monthName');
        } else {
          if (firstDayOfWeek.getDate() <= 7 * 2 && firstDayOfWeek.getMonth() == 0) {
            th.append(firstDayOfWeek.getFullYear());
          }
        }
        return th;
      }

      function weekCell(firstDayOfWeek) {
        return $('<th>').addClass('week').addClass(backgroundBy(firstDayOfWeek)).append(firstDayOfWeek.getWeekInYear('ISO'));
      }

      function dateStyles(date) {return $.trim(['date', backgroundBy(date), disabledOrNot(date), todayStyle(date)].sort().join(' '));}

      function backgroundBy(date) {return date.isOddMonth() ? 'odd' : '';}

      function disabledOrNot(date) {return calendarRange.hasDate(date) ? '' : 'disabled';}

      function todayStyle(date) {return date.isToday() ? 'today' : '';}

      function initSingleDateCalendarEvents() {
        dateCells.click(function() {
          dateCells.removeClass('selected');
          var dateCell = $(this);
          dateCell.addClass('selected');
          var formattedDate = date(dateCell).dateFormat(params.locale.shortDateFormat);
          params.startField.val(formattedDate);
          setDateLabel(formattedDate);
          if (params.isPopup) {
            toggleCalendar.call(this);
          }
        });
        setDateLabel(params.startField.val());
      }

      function mouseDown(event) {
        var elem = event.target;
        if (isDateCell(elem) && isEnabled(elem)) {
          status = Status.CREATE;
          mouseDownDate = elem.date;
          if (mouseDownDate.equalsOnlyDate(selection.end)) {
            mouseDownDate = selection.start;
          } else {
            if (mouseDownDate.equalsOnlyDate(selection.start)) {
              mouseDownDate = selection.end;
            } else {
              if (selection.hasDate(mouseDownDate)) {
                status = Status.MOVE;
                moveStartDate = mouseDownDate;
              } else {
                if (event.shiftKey) {
                  status = Status.NONE;
                  selection.expandTo(mouseDownDate);
                } else {
                  selection = new DateRange(mouseDownDate, mouseDownDate);
                }
              }
            }
          }
        } else {
          if (isWeekCell(elem)) {
            status = Status.NONE;
            var dayInWeek = date($(elem).siblings('.date'));
            selection = new DateRange(dayInWeek, dayInWeek.plusDays(6));
          } else {
            if (isMonthCell(elem)) {
              status = Status.NONE;
              var dayInMonth = date($(elem).siblings('.date'));
              selection = new DateRange(dayInMonth.firstDateOfMonth(), dayInMonth.lastDateOfMonth());
            }
          }
        }
      }

      function mouseMove(event) {
        if (status == Status.NONE) {
          return;
        }
        var date = event.target.date;
        if (isEnabled(event.target)) {
          switch (status) {
            case Status.MOVE:
              var deltaDays = moveStartDate.distanceInDays(date);
              moveStartDate = date;
              selection.shiftDays(deltaDays);
              selection = selection.and(calendarRange);
              break;
            case Status.CREATE:
              selection = new DateRange(mouseDownDate, date);
              break;
          }
          drawSelection();
        }
      }

      function mouseUp() {
        status = Status.NONE;
        drawSelection();
        afterSelection();
      }

      function drawSelection() {
        drawSelectionBetweenDates(selection.start, selection.end);
        container.find('span.rangeLengthLabel').text(Date.daysLabel(selection.days()));
      }

      function drawSelectionBetweenDates(start, end) {
        dateCells.each(function(i, elem) {
          var date = dateCellDates[i];
          var styleClass = [dateStyles(date)];
          if (date.equalsOnlyDate(end)) {
            styleClass.push('selected rangeEnd');
          } else {
            if (date.equalsOnlyDate(start)) {
              styleClass.push('selected rangeStart');
            } else {
              if (date.isBetweenDates(start, end)) {
                styleClass.push('selected');
              }
            }
          }
          elem.className = styleClass.join(' ');
        });
      }

      function afterSelection() {
        var formattedStart = formatDate(selection.start);
        var formattedEnd = formatDate(selection.end);
        container.data('calendarRange', selection);
        setStartField(formattedStart);
        setEndField(formattedEnd);
        setRangeLabels();
        params.callback.call(container, selection);
        container.trigger('calendarChange');
      }

      function setRangeLabels() {
        if (selection.start && selection.end) {
          var format = params.locale.weekDateFormat;
          container.find('span.startDateLabel').text(selection.start.dateFormat(format));
          container.find('span.endDateLabel').text(selection.end.dateFormat(format));
          container.find('span.separator').show();
        } else {
          container.find('span.separator').hide();
        }
      }

      function fieldDate(field) {
        if (field.length > 0 && field.val().length > 0) {
          return Date.parseDate(field.val(), params.locale.shortDateFormat);
        } else {
          return null;
        }
      }

      function disableTextSelection(elem) {
        if ($.browser.mozilla) {//Firefox
          $(elem).css('MozUserSelect', 'none');
        } else {
          if ($.browser.msie) {//IE
            $(elem).bind('selectstart', function() {
              return false;
            });
          } else {//Opera, etc.
            $(elem).mousedown(function() {
              return false;
            });
          }
        }
      }

      function isDateCell(elem) {return $(elem).hasClass('date');}

      function isWeekCell(elem) {return $(elem).hasClass('week');}

      function isMonthCell(elem) {return $(elem).hasClass('month');}

      function isEnabled(elem) {return !$(elem).hasClass('disabled');}

      function date(elem) {return elem.get(0).date;}

      function setStartField(value) {params.startField.val(value);}

      function setEndField(value) {params.endField.val(value);}

      function formatDate(date) {return date.dateFormat(params.locale.shortDateFormat);}

      function setDateLabel(val) {container.find('span.startDateLabel').text(val);}

      function isRange() {return params.endField && params.endField.length > 0;}
    }
  };
  $.fn.calendarRange = function() {
    return $(this).data('calendarRange');
  };
  $.fn.exists = function() {
    return this.length > 0;
  };
  $.fn.isEmpty = function() {
    return this.length == 0;
  };
})(jQuery);
function DateRange(date1, date2) {
  var hasTimes = false;
  if (!date1 || !date2) {
    throw('two dates must be specified, date1=' + date1 + ', date2=' + date2);
  }
  this.start = date1.compareTo(date2) > 0 ? date2 : date1;
  this.end = date1.compareTo(date2) > 0 ? date1 : date2;
  var days;
  var hours;
  var minutes;
  var valid = true;
  this.hours = function() {return hours;};
  this.minutes = function() {return minutes;};
  this.hasDate = function(date) {return date.isBetweenDates(this.start, this.end);};
  this.isValid = function() {return valid &&  this.end.getTime() - this.start.getTime() >= 0;};
  this.days = function() {
    if (hasTimes) {
      return days;
    } else {
      return Math.round(this.start.distanceInDays(this.end) + 1);
    }
  };
  this.shiftDays = function(days) {
    this.start = this.start.plusDays(days);
    this.end = this.end.plusDays(days);
  };
  this.expandTo = function(date) {
    if (date.compareTo(this.start) < 0) {
      this.start = date;
    } else {
      if (date.compareTo(this.end) > 0) {
        this.end = date;
      }
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
  this.setTimes = function(startTimeStr, endTimeStr) {
    var parsedStartTime = Date.parseTime(startTimeStr);
    var parsedEndTime = Date.parseTime(endTimeStr);
    if (parsedStartTime && parsedEndTime) {
      valid = true;
      hasTimes = true;
      this.start = dateWithTime(this.start, parsedStartTime);
      this.end = dateWithTime(this.end, parsedEndTime);
      setDaysHoursAndMinutes.call(this);
    } else {
      valid = false;
    }
    return valid;
  };
  function setDaysHoursAndMinutes() {
    if (hasTimes) {
      var ms = parseInt((this.end.getTime() - this.start.getTime()));
      days = parseInt(ms / Date.DAY);
      ms = ms - (days * Date.DAY);
      hours = parseInt(ms / Date.HOUR);
      ms = ms - (hours * Date.HOUR);
      minutes = parseInt(ms / Date.MINUTE);
    }
  }

  function dateWithTime(dateWithoutTime, parsedTime) {
    var date = dateWithoutTime.clone();
    date.setHours(parsedTime[0]);
    date.setMinutes(parsedTime[1]);
    date.setMilliseconds(0);
    return date;
  }

  this.toString = function(locale) {
    if (hasTimes) {
      var minutes = this.minutes() > 0 ? ',' + (this.minutes() / 6) : '';
      return  Date.daysLabel(this.days()) + ' ' + Date.hoursLabel(this.hours(), this.minutes());
    } else {
      return this.start.dateFormat(locale.shortDateFormat) + ' - ' + this.end.dateFormat(locale.shortDateFormat);
    }
  };
}
DateRange.emptyRange = function() {
  function NullDateRange() {
    this.start = null;
    this.end = null;
    this.days = function() {return 0;};
    this.shiftDays = function() {};
    this.hasDate = function() {return false;};
  }
  return new NullDateRange();
};
DateRange.parse = function(dateStr1, dateStr2, dateFormat) {
  return new DateRange(Date.parseDate(dateStr1, dateFormat), Date.parseDate(dateStr2, dateFormat));
};
