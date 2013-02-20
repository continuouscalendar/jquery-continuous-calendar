;
(function(root, factory) {
  if(typeof define === 'function' && define.amd) {
    define(['jquery', './DateFormat', './DateLocale', './DateRange', './DateTime'], factory)
  } else {
    root.RangeEvents = factory(root.jQuery, root.DateFormat, root.DateLocale, root.DateRange, root.DateTime)
  }
})(this, function($, DateFormat, DateLocale, DateRange, DateTime) {
  return function(container, calendarBody, executeCallback, locale, params, getElemDate, calendarRange, setStartField, setEndField, calendar, formatDate, startDate, endDate, disabledDatesList) {
    var mouseDownDate = null
    var selection
    var oldSelection
    var Status = {
      CREATE_OR_RESIZE: 'create',
      MOVE            : 'move',
      NONE            : 'none'
    }
    var status = Status.NONE

    return {
      showInitialSelection: setRangeLabels,
      initEvents          : function() {
        setInitialSelection()
        oldSelection = selection.clone()
        initRangeCalendarEvents(container, calendarBody.bodyTable)
        drawSelection()
      },
      addRangeLengthLabel : function() {
        if($('.rangeLengthLabel', container).isEmpty()) {
          var rangeLengthContainer = $('<div class="label"><span class="rangeLengthLabel"></span></div>')
          $('.continuousCalendar', container).append(rangeLengthContainer)
        }
      },
      addEndDateLabel     : function(dateLabelContainer) { dateLabelContainer.append('<span class="separator"> - </span>').append('<span class="endDateLabel"></span>') },
      performTrigger      : function() {
        container.data('calendarRange', selection)
        executeCallback(selection)
      }
    }

    function setInitialSelection() { selection = startDate && endDate ? new DateRange(startDate, endDate, locale) : DateRange.emptyRange(locale) }

    function initRangeCalendarEvents(container, bodyTable) {
      $('span.rangeLengthLabel', container).text(locale.daysLabel(selection.days()))
      bodyTable.addClass(params.selectWeek ? 'weekRange' : 'freeRange')
      bodyTable.mousedown(mouseDown).mouseover(mouseMove).mouseup(mouseUp)
      disableTextSelection(bodyTable.get(0))
    }

    function mouseDown(event) {
      var elem = event.target
      var hasShiftKeyPressed = event.shiftKey
      if(isInstantSelection(elem, hasShiftKeyPressed)) {
        selection = instantSelection(elem, hasShiftKeyPressed)
        return
      }

      status = Status.CREATE_OR_RESIZE
      mouseDownDate = getElemDate(elem)

      if(mouseDownDate.equalsOnlyDate(selection.end)) {
        mouseDownDate = selection.start
        return
      }
      if(mouseDownDate.equalsOnlyDate(selection.start)) {
        mouseDownDate = selection.end
        return
      }
      if(selection.hasDate(mouseDownDate)) {
        status = Status.MOVE
        return
      }

      if(enabledCell(elem)) startNewRange()

      function enabledCell(elem) { return isDateCell(elem) && isEnabled(elem) }

      function isInstantSelection(elem, hasShiftKeyPressed) {
        if(params.selectWeek) return enabledCell(elem) || isWeekCell(elem)
        else return isWeekCell(elem) || isMonthCell(elem) || hasShiftKeyPressed

      }

      function instantSelection(elem, hasShiftKeyPressed) {
        if((params.selectWeek && enabledCell(elem)) || isWeekCell(elem)) {
          status = Status.NONE
          var firstDayOfWeek = getElemDate($(elem).parent().children('.date').get(0))
          return instantSelectWeek(firstDayOfWeek)
        } else if(isMonthCell(elem)) {
          status = Status.NONE
          var dayInMonth = getElemDate($(elem).siblings('.date').get(0))
          return new DateRange(dayInMonth.firstDateOfMonth(), dayInMonth.lastDateOfMonth(), locale)
        } else if(hasShiftKeyPressed) {
          if(selection.days() > 0 && enabledCell(elem)) {
            status = Status.NONE
            selection = selection.expandTo(getElemDate(elem))
            return selection
          }
        }
        return selection
      }

      function instantSelectWeek(firstDayOfWeek) {
        var firstDay = firstDayOfWeek
        var lastDay = firstDayOfWeek.plusDays(6)
        if(params.disableWeekends) {
          firstDay = firstDayOfWeek.withWeekday(DateTime.MONDAY)
          lastDay = firstDayOfWeek.withWeekday(DateTime.FRIDAY)
        }
        return new DateRange(firstDay, lastDay, locale).and(calendarRange)
      }
    }

    function startNewRange() { selection = new DateRange(mouseDownDate, mouseDownDate, locale) }

    function disableTextSelection(elem) {
      //Firefox
      $(elem).css('MozUserSelect', 'none')
      //IE
      $(elem).bind('selectstart', function() { return false })
      //Opera, etc.
      $(elem).mousedown(function() { return false })
    }

    function mouseMove(event) {
      if(status == Status.NONE) return
      var date = getElemDate(event.target)
      var actions = {
        move  : function() {
          var deltaDays = mouseDownDate.distanceInDays(date)
          var movedSelection = selection.shiftDays(deltaDays).and(calendarRange)
          if(isPermittedRange(movedSelection)) {
            mouseDownDate = date
            selection = movedSelection
          }
        },
        create: function() {
          var newSelection = new DateRange(mouseDownDate, date, locale)
          if(isEnabled(event.target) && isPermittedRange(newSelection)) selection = newSelection
        }
      }
      actions[status]()
      drawSelection()
    }

    function isPermittedRange(newSelection) { return newSelection.isPermittedRange(params.minimumRange, params.disableWeekends, calendarRange) }

    function mouseUp() {
      status = Status.NONE
      if(rangeHasDisabledDate()) selection = DateRange.emptyRange()
      drawSelection()
      afterSelection()
    }

    function rangeHasDisabledDate() {
      for(var i = 0; i < disabledDatesList.length; i++) {
        if(selection.hasDate(new DateTime(disabledDatesList[i]))) return true
      }
      return false
    }

    function drawSelection() {
      selection = DateRange.rangeWithMinimumSize(selection, params.minimumRange, params.disableWeekends, calendarRange)
      drawSelectionBetweenDates(selection)
      $('span.rangeLengthLabel', container).text(locale.daysLabel(selection.days()))
    }

    function drawSelectionBetweenDates(range) {
      $('td.selected', container).removeClass('selected').removeClass('rangeStart').removeClass('rangeEnd').removeClass('invalidSelection')
      iterateAndToggleCells(range)
      oldSelection = range.clone()
    }

    function iterateAndToggleCells(range) {
      if(range.days() == 0) return
      var startIndex = index(range.start)
      var endIndex = index(range.end)
      for(var i = startIndex; i <= endIndex; i++)
        calendarBody.getDateCell(i).get(0).className = dateCellStyle(calendarBody.dateCellDates[i], range.start, range.end).join(' ')
      if(rangeHasDisabledDate()) $('td.selected', container).addClass('invalidSelection')
      function index(date) { return calendarBody.dateCellMap[DateFormat.format(date, 'Ymd', locale)] }
    }

    function dateCellStyle(date, start, end) {
      var styleClass = [calendarBody.dateStyles(date)]
      if(date.equalsOnlyDate(end)) return styleClass.concat('selected rangeEnd')
      if(date.equalsOnlyDate(start)) return styleClass.concat('selected rangeStart')
      if(date.isBetweenDates(start, end)) return styleClass.concat('selected')
      return styleClass
    }

    function afterSelection() {
      if(rangeHasDisabledDate()) {
        selection = DateRange.emptyRange()
        // Flash invalidSelection styled cells when selection is expanded to minimum length
        setTimeout(function() { drawSelectionBetweenDates(selection) }, 200)
      }
      var formattedStart = formatDate(selection.start)
      var formattedEnd = formatDate(selection.end)
      container.data('calendarRange', selection)
      setStartField(formattedStart)
      setEndField(formattedEnd)
      setRangeLabels()
      if(params.selectWeek) calendar.close($('td.selected', container).first())
      executeCallback(selection)
    }

    function setRangeLabels() {
      if(!selection) setInitialSelection()
      if(selection.start && selection.end) {
        var format = locale.weekDateFormat
        $('span.startDateLabel', container).text(DateFormat.format(selection.start, format, locale))
        $('span.endDateLabel', container).text(DateFormat.format(selection.end, format, locale))
        $('span.separator', container).show()
      } else {
        $('span.separator', container).hide()
      }
    }

    function isDateCell(elem) { return $(elem).closest('[date-cell-index]').hasClass('date') }

    function isWeekCell(elem) { return $(elem).hasClass('week') }

    function isMonthCell(elem) { return $(elem).hasClass('month') }

    function isEnabled(elem) { return !$(elem).hasClass('disabled') }
  }
})