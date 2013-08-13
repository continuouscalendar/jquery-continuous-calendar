define(function(require) {
  var $ = require('jquery')
  var DateFormat = require('./DateFormat')
  var DateRange = require('./DateRange')
  var DateTime = require('./DateTime')

  return function(container, calendarBody, executeCallback, locale, params, getElemDate, calendar, startDate,
                  endDate, calendarRange, setStartField, setEndField, formatDate, disabledDatesList) {
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
      initEvents          : initEvents,
      addRangeLengthLabel : addRangeLengthLabel,
      addEndDateLabel     : addEndDateLabel,
      addDateClearingLabel: addDateClearingLabel,
      performTrigger      : performTrigger
    }

    function initEvents() {
      setInitialSelection()
      oldSelection = selection.clone()
      initRangeCalendarEvents(container, calendarBody.bodyTable)
      drawSelection()
    }

    function addRangeLengthLabel() {
      if($('.rangeLengthLabel', container).isEmpty()) {
        var rangeLengthContainer = $('<div class="label"><span class="rangeLengthLabel"></span></div>')
        $('.continuousCalendar', container).append(rangeLengthContainer)
      }
    }

    function addEndDateLabel(dateLabelContainer) { dateLabelContainer.append('<span class="separator"> - </span>').append('<span class="endDateLabel"></span>') }

    function addDateClearingLabel() {
      if(params.allowClearDates) {
        var dateClearingLabel = $('<span class="clearDates clickable"></span>').text(locale.clearRangeLabel)
        var dateClearingContainer = $('<div class="label clearLabel"></div>').append(dateClearingLabel)
        $('.continuousCalendar', container).append(dateClearingContainer)
      }
    }

    function performTrigger() {
      container.data('calendarRange', selection)
      executeCallback(selection)
    }

    function setInitialSelection() {
      selection = startDate && endDate ? new DateRange(startDate, endDate) : DateRange.emptyRange()
      if (!selection.start && !selection.end) {
        $('span.separator', container).hide()
      }
    }

    function initRangeCalendarEvents(container, bodyTable) {
      $('span.rangeLengthLabel', container).text(locale.daysLabel(selection.days()))
      if (params.allowClearDates) {
        $('span.clearDates', container).click(clearRangeClick)
      }
      bodyTable.addClass(params.selectWeek ? 'weekRange' : 'freeRange')
      bodyTable.mousedown(mouseDown).mouseover(mouseMove).mouseup(mouseUp)
      disableTextSelection(bodyTable.get(0))
    }

    function mouseDown(event) {
      var elem = event.target
      var hasShiftKeyPressed = event.shiftKey
      if(isInstantSelection(elem, hasShiftKeyPressed)) {
        selection = instantSelection(elem, hasShiftKeyPressed)
      } else {
        status = Status.CREATE_OR_RESIZE
        mouseDownDate = getElemDate(elem)
        if(mouseDownDate.equalsOnlyDate(selection.end)) mouseDownDate = selection.start
        else if(mouseDownDate.equalsOnlyDate(selection.start)) mouseDownDate = selection.end
        else if(selection.hasDate(mouseDownDate)) status = Status.MOVE
        else if(enabledCell(elem)) startNewRange()
      }


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
      if (status !== Status.NONE) {
        var date = getElemDate(event.target)
        var actions = {
          move:   function() {
            var deltaDays = mouseDownDate.distanceInDays(date)
            var movedSelection = selection.shiftDays(deltaDays).and(calendarRange)
            if (isPermittedRange(movedSelection)) {
              mouseDownDate = date
              selection = movedSelection
            }
          },
          create: function() {
            var newSelection = new DateRange(mouseDownDate, date, locale)
            if (isEnabled(event.target) && isPermittedRange(newSelection)) selection = newSelection
          }
        }
        actions[status]()
        drawSelection()
      }
    }

    function isPermittedRange(newSelection) { return newSelection.isPermittedRange(params.minimumRange, params.disableWeekends, calendarRange) }

    function mouseUp() {
      status = Status.NONE
      if(rangeHasDisabledDate()) selection = DateRange.emptyRange()
      drawSelection()
      afterSelection()
    }

    function clearRangeClick(event) {
      selection = DateRange.emptyRange()
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
      var clearDates = $('span.clearDates', container)
      clearDates.toggle(selection.hasSelection())
    }

    function drawSelectionBetweenDates(range) {
      $('td.selected', container).removeClass('selected').removeClass('rangeStart').removeClass('rangeEnd').removeClass('invalidSelection')
      iterateAndToggleCells(range)
      oldSelection = range.clone()
    }

    function iterateAndToggleCells(range) {
      if (range.days() > 0) {
        var startIndex = index(range.start)
        var endIndex = index(range.end)
        for (var i = startIndex; i <= endIndex; i++)
          calendarBody.getDateCell(i).get(0).className = dateCellStyle(calendarBody.dateCellDates[i], range.start, range.end).join(' ')
        if (rangeHasDisabledDate()) $('td.selected', container).addClass('invalidSelection')
      }
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
        $('span.separator, span.clearRangeLabel', container).show()
        $('span.startDateLabel', container).closest('.label').show()
      } else {
        if (!selection.start) {
          $('span.startDateLabel', container).empty()
          $('span.startDateLabel', container).closest('.label').hide()
        }
        if (!selection.end) {
          $('span.endDateLabel', container).empty()
        }
        $('span.separator, span.clearRangeLabel', container).hide()
      }
    }

    function isDateCell(elem) { return $(elem).closest('[date-cell-index]').hasClass('date') }

    function isWeekCell(elem) { return $(elem).hasClass('week') }

    function isMonthCell(elem) { return $(elem).hasClass('month') }

    function isEnabled(elem) { return !$(elem).hasClass('disabled') }
  }
})
