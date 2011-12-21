/* ==============================================================================
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
;
(function($) {
  $.fn.continuousCalendar = function(options) {
    return this.each(function() { _continuousCalendar.call($(this), options) })
    function _continuousCalendar(options) {
      $(this).addClass('continuousCalendarContainer').append('&nbsp;') //IE fix for popup version

      var defaults = {
        weeksBefore: 26,
        weeksAfter: 26,
        firstDate: null,
        lastDate: null,
        startField: $('input.startDate', this),
        endField: $('input.endDate', this),
        isPopup: false,
        selectToday: false,
        locale: DATE_LOCALE_EN,
        disableWeekends: false,
        disabledDates: null,
        minimumRange: -1,
        selectWeek: false,
        fadeOutDuration: 0,
        callback: $.noop
      }
      var params = $.extend(defaults, options)
      var Status = {
        CREATE_OR_RESIZE: 'create',
        MOVE: 'move',
        NONE: 'none'
      }
      params.locale.init()
      var startDate = fieldDate(params.startField)
      var endDate = fieldDate(params.endField)
      if(params.selectToday) {
        var today = Date.NOW
        var formattedToday = formatDate(today)
        startDate = today
        endDate = today
        setStartField(formattedToday)
        setEndField(formattedToday)
      }
      var firstWeekdayOfGivenDate = (startDate || Date.NOW).getFirstDateOfWeek(params.locale.firstWeekday)
      var container = this,
        dateCells = [],
        dateCellDates = [],
        dateCellMap = {},
        mouseDownDate = null, averageCellHeight,
        yearTitle,
        selection,
        oldSelection,
        calendarRange,
        status = Status.NONE,
        calendarContainer,
        scrollContent,
        beforeFirstOpening = true,
        bodyTable,
        calendar

      createCalendar()

      function createCalendar() {
        calendar = $.extend(popUpBehaviour(params.isPopup), dateBehaviour(isRange()))
        selection = startDate && endDate ? new DateRange(startDate, endDate) : DateRange.emptyRange();
        oldSelection = selection.clone()
        var rangeStart = params.firstDate ? Date.parseDate(params.firstDate, params.locale.shortDateFormat) : firstWeekdayOfGivenDate.plusDays(-(params.weeksBefore * 7))
        var rangeEnd = params.lastDate ? Date.parseDate(params.lastDate, params.locale.shortDateFormat) : firstWeekdayOfGivenDate.plusDays(params.weeksAfter * 7 + 6)
        params.disabledDates = params.disabledDates ? parseDisabledDates(params.disabledDates) : {}
        params.fadeOutDuration = parseInt(params.fadeOutDuration, 10)
        calendarRange = new DateRange(rangeStart, rangeEnd)
        calendarContainer = getCalendarContainerOrCreateOne()
        calendarContainer.click(function(e) { e.stopPropagation() })
        if($('.startDateLabel', container).isEmpty()) {
          addDateLabels(container, calendar)
        }
        calendar.initUI()
        calendar.showInitialSelection()
        calendar.performTrigger()
      }

      function initCalendarTable() {
        if(scrollContent) return
        var headerTable = $('<table>').addClass('calendarHeader').append(headerRow())
        bodyTable = $('<table>').addClass('calendarBody').append(calendarBody())
        scrollContent = $('<div>').addClass('calendarScrollContent').append(bodyTable)
        calendarContainer.append(headerTable).append(scrollContent)
        dateCells = $('td.date', container).get()
        calendar.initState()
        calendar.addRangeLengthLabel()
        highlightToday()
        yearTitle = $('th.month', headerTable)
        scrollContent.scroll(setYearLabel)
        if(!params.isPopup) {
          setYearLabel()
          scrollToSelection()
        }
        calendar.initEvents()
      }

      function parseDisabledDates(dates) {
        var dateMap = {}
        $.each(dates.split(' '), function(index, date) { dateMap[Date.parseDate(date, params.locale.shortDateFormat)] = true })
        return dateMap
      }

      function dateBehaviour(isRange) {
        var rangeVersion = {
          showInitialSelection: setRangeLabels,
          initEvents: function() {
            initRangeCalendarEvents(container, bodyTable)
            drawSelection()
          },
          addRangeLengthLabel: function() {
            if($('.rangeLengthLabel', container).isEmpty()) {
              var rangeLengthContainer = $('<div class="label"><span class="rangeLengthLabel"></span></div>')
              $('.continuousCalendar', container).append(rangeLengthContainer)
            }
          },
          addEndDateLabel: function(dateLabelContainer) { dateLabelContainer.append('<span class="separator"> - </span>').append('<span class="endDateLabel"></span>') },
          performTrigger: function() {
            container.data('calendarRange', selection)
            executeCallback(selection)
          }
        }
        var singleDateVersion = {
          showInitialSelection: function() {
            if(params.startField.val()) {
              setDateLabel(Date.parseDate(params.startField.val(), params.locale.shortDateFormat).dateFormat(params.locale.weekDateFormat))
            }
          },
          initEvents: function() {
            initSingleDateCalendarEvents()
            var selectedDateKey = startDate && startDate.dateFormat('Ymd')
            if(dateCellMap[selectedDateKey]) {
              getDateCell(dateCellMap[selectedDateKey]).addClass('selected')
            }
          },
          addRangeLengthLabel: $.noop,
          addEndDateLabel: $.noop,
          performTrigger: function() {
            container.data('calendarRange', startDate)
            executeCallback(startDate)
          }
        }
        return isRange ? rangeVersion : singleDateVersion
      }

      function popUpBehaviour(isPopup) {
        var popUpVersion = {
          initUI: function() {
            calendarContainer.addClass('popup').hide()
            var icon = $('<a href="#" class="calendarIcon">' + Date.NOW.getDate() + '</a>').click(toggleCalendar)
            container.prepend('<div></div>')
            container.prepend(icon)
          },
          initState: $.noop,
          getContainer: function(newContainer) { return $('<div>').addClass('popUpContainer').append(newContainer); },
          addCloseButton: function(tr) {
            var close = $('<th><a href="#"><span>close</span></a></th>')
            $('a', close).click(toggleCalendar)
            tr.append(close)
          },
          close: function(cell) { toggleCalendar.call(cell) },
          addDateLabelBehaviour: function(label) {
            label.addClass('clickable')
            label.click(toggleCalendar)
          }
        }
        var inlineVersion = {
          initUI: initCalendarTable,
          initState: calculateCellHeightAndSetScroll,
          getContainer: function(newContainer) {
            return newContainer
          },
          addCloseButton: $.noop,
          close: $.noop,
          addDateLabelBehaviour: $.noop
        }
        return isPopup ? popUpVersion : inlineVersion
      }

      function highlightToday() {
        var todayKey = Date.NOW.dateFormat('Ymd')
        if(dateCellMap[todayKey]) {
          getDateCell(dateCellMap[todayKey]).addClass('today').wrapInner('<div>')
        }
      }

      function getCalendarContainerOrCreateOne() {
        var existingContainer = $('.continuousCalendar', container)
        if(existingContainer.exists()) {
          return existingContainer
        } else {
          var newContainer = $('<div>').addClass('continuousCalendar')
          container.append(calendar.getContainer(newContainer))
          return newContainer
        }
      }

      function addDateLabels(container, calendar) {
        var dateLabelContainer = $('<div class="label"><span class="startDateLabel"></span></div>')
        calendar.addEndDateLabel(dateLabelContainer)
        container.prepend(dateLabelContainer)
        calendar.addDateLabelBehaviour(dateLabelContainer.children())
      }

      function initRangeCalendarEvents(container, bodyTable) {
        $('span.rangeLengthLabel', container).text(Date.daysLabel(selection.days()))
        bodyTable.addClass(params.selectWeek ? 'weekRange' : 'freeRange')
        bodyTable.mousedown(mouseDown).mouseover(mouseMove).mouseup(mouseUp)
        disableTextSelection(bodyTable.get(0))
      }

      function scrollToSelection() {
        var selectionStartOrToday = $('.selected, .today', scrollContent).get(0)
        if(selectionStartOrToday) {
          scrollContent.scrollTop(selectionStartOrToday.offsetTop - (scrollContent.height() - selectionStartOrToday.offsetHeight) / 2)
        }
      }

      function setYearLabel() {
        var scrollContent = $('.calendarScrollContent', container).get(0)
        var table = $('table', scrollContent).get(0)
        var rowNumber = parseInt(scrollContent.scrollTop / averageCellHeight)
        var date = getElemDate(table.rows[rowNumber].cells[2])
        yearTitle.text(date.getFullYear())
      }

      function headerRow() {
        var tr = $('<tr>').append(yearCell())
        tr.append($('<th class="week">&nbsp;</th>'))
        $(Date.dayNames).each(function(index) {
          var weekDay = $('<th>').append(Date.dayNames[(index + params.locale.firstWeekday) % 7].substr(0, 2)).addClass('weekDay')
          tr.append(weekDay)
        })
        calendar.addCloseButton(tr);
        return $('<thead>').append(tr)
        function yearCell() { return $('<th>').addClass('month').append(firstWeekdayOfGivenDate.getFullYear()) }
      }

      function calculateCellHeightAndSetScroll() {
        calculateCellHeight()
        scrollToSelection()
      }

      function calculateCellHeight() { averageCellHeight = parseInt(bodyTable.height() / $('tr', bodyTable).size()) }

      function toggleCalendar() {
        initCalendarTable()
        if(calendarContainer.is(':visible')) {
          calendarContainer.fadeOut(params.fadeOutDuration)
          $(document).unbind('click.continuousCalendar')
        } else {
          calendarContainer.show()
          if(beforeFirstOpening) {
            calculateCellHeight()
            setYearLabel()
            beforeFirstOpening = false
          }
          scrollToSelection()
          $(document).bind('click.continuousCalendar', toggleCalendar)

        }
        return false
      }

      function calendarBody() {
        var firstWeekDay = calendarRange.start.getFirstDateOfWeek(params.locale.firstWeekday)
        var isFirst = true;
        var rows = []
        while(firstWeekDay.compareTo(calendarRange.end) <= 0) {
          calendarRow(rows, firstWeekDay.clone(), isFirst)
          isFirst = false
          firstWeekDay = firstWeekDay.plusDays(7)
        }
        return '<tbody>' + rows.join('') + '</tbody>'
      }

      function calendarRow(rows, firstDayOfWeek, isFirst) {
        rows.push('<tr>')
        rows.push(monthCell(firstDayOfWeek, isFirst))
        rows.push(weekCell(firstDayOfWeek))
        for(var i = 0; i < 7; i++) {
          var date = firstDayOfWeek.plusDays(i)
          rows.push(dateCell(date))
        }
        rows.push('</tr>')
      }

      function dateCell(date) {
        var dateCell = '<td class="' + dateStyles(date) + '" date-cell-index="' + dateCellDates.length + '">' + date.getDate() + '</td>'
        dateCellMap[date.dateFormat('Ymd')] = dateCellDates.length
        dateCellDates.push(date)
        return dateCell
      }

      function monthCell(firstDayOfWeek, isFirst) {
        var th = '<th class="month ' + backgroundBy(firstDayOfWeek)
        if(isFirst || firstDayOfWeek.getDate() <= 7) {
          th += ' monthName">'
          th += Date.monthNames[firstDayOfWeek.getMonth()]
        } else {
          th += '">'
          if(firstDayOfWeek.getDate() <= 7 * 2 && firstDayOfWeek.getMonth() == 0) {
            th += firstDayOfWeek.getFullYear()
          }
        }
        return th + '</th>'
      }

      function weekCell(firstDayOfWeek) { return '<th class="week ' + backgroundBy(firstDayOfWeek) + '">' + firstDayOfWeek.getWeekInYear('ISO') + '</th>' }

      function dateStyles(date) { return $.trim(['date', backgroundBy(date), disabledOrNot(date), todayStyle(date), holidayStyle(date)].sort().join(' ')) }

      function backgroundBy(date) { return date.isOddMonth() ? 'odd' : '' }

      function disabledOrNot(date) {
        var disabledWeekendDay = params.disableWeekends && date.isWeekend()
        var disabledDay = params.disabledDates[date.getOnlyDate()]
        var outOfBounds = !calendarRange.hasDate(date)
        return outOfBounds || disabledWeekendDay || disabledDay ? 'disabled' : ''
      }

      function todayStyle(date) { return date.isToday() ? 'today' : '' }

      function holidayStyle(date) { return date.getDay() == 0 ? 'holiday' : '' }

      function initSingleDateCalendarEvents() {
        $('.date', container).bind('click', function() {
          var dateCell = $(this)
          if(dateCell.hasClass('disabled')) return
          $('td.selected', container).removeClass('selected')
          dateCell.addClass('selected')
          var selectedDate = getElemDate(dateCell.get(0));
          params.startField.val(selectedDate.dateFormat(params.locale.shortDateFormat))
          setDateLabel(selectedDate.dateFormat(params.locale.weekDateFormat))
          calendar.close(this)
          executeCallback(selectedDate)
        })
      }

      function startNewRange() { selection = new DateRange(mouseDownDate, mouseDownDate) }

      function mouseDown(event) {
        var elem = event.target

        if(isInstantSelection(event)) {
          selection = instantSelection(event)
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

        if(enabledCell(elem)) {
          startNewRange()
        }

        function enabledCell(elem) { return isDateCell(elem) && isEnabled(elem) }

        function isInstantSelection(event) {
          if(params.selectWeek) {
            return enabledCell(event.target) || isWeekCell(event.target)
          } else {
            return isWeekCell(event.target) || isMonthCell(event.target) || event.shiftKey
          }
        }

        function instantSelection(event) {
          var elem = event.target
          if((params.selectWeek && enabledCell(elem)) || isWeekCell(elem)) {
            status = Status.NONE
            var firstDayOfWeek = getElemDate($(elem).parent().children('.date').get(0))
            return instantSelectWeek(firstDayOfWeek)
          } else if(isMonthCell(elem)) {
            status = Status.NONE
            var dayInMonth = getElemDate($(elem).siblings('.date').get(0))
            return new DateRange(dayInMonth.firstDateOfMonth(), dayInMonth.lastDateOfMonth())
          } else if(event.shiftKey) {
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
            firstDay = firstDayOfWeek.withWeekday(Date.MONDAY)
            lastDay = firstDayOfWeek.withWeekday(Date.FRIDAY)
          }
          return new DateRange(firstDay, lastDay).and(calendarRange)
        }
      }

      function mouseMove(event) {
        if(status == Status.NONE) {
          return
        }
        var date = getElemDate(event.target)
          ;
        ({
          move: function() {
            var deltaDays = mouseDownDate.distanceInDays(date)
            var movedSelection = selection.shiftDays(deltaDays).and(calendarRange)
            if(isPermittedRange(movedSelection)) {
              mouseDownDate = date
              selection = movedSelection
            }
          },
          create: function() {
            var newSelection = new DateRange(mouseDownDate, date)
            if(isEnabled(event.target) && isPermittedRange(newSelection)) {
              selection = newSelection
            }
          }

        })[status]()
        drawSelection()
      }

      function isPermittedRange(newSelection) { return newSelection.isPermittedRange(params.minimumRange, params.disableWeekends, calendarRange) }

      function mouseUp() {
        status = Status.NONE
        drawSelection()
        afterSelection()
      }

      function drawSelection() {
        selection = DateRange.rangeWithMinimumSize(selection, params.minimumRange, params.disableWeekends, calendarRange)
        drawSelectionBetweenDates(selection)
        $('span.rangeLengthLabel', container).text(Date.daysLabel(selection.days()))
      }

      function drawSelectionBetweenDates(range) {
        $('td.selected', container).removeClass('selected').removeClass('rangeStart').removeClass('rangeEnd')
        //iterateAndToggleCells(oldSelection.start, oldSelection.end)
        iterateAndToggleCells(range)
        oldSelection = range.clone()
      }

      function iterateAndToggleCells(range) {
        if(range.days() == 0) return
        var startIndex = dateCellMap[range.start.dateFormat('Ymd')]
        var endIndex = dateCellMap[range.end.dateFormat('Ymd')]
        for(var i = startIndex; i <= endIndex; i++) {
          setDateCellStyle(i, range.start, range.end)
        }
      }

      function setDateCellStyle(i, start, end) {
        var date = dateCellDates[i]
        var elem = getDateCell(i).get(0)
        var styleClass = [dateStyles(date)]
        if(date.equalsOnlyDate(end)) {
          styleClass.push('selected rangeEnd')
        } else {
          if(date.equalsOnlyDate(start)) {
            styleClass.push('selected rangeStart')
          } else {
            if(date.isBetweenDates(start, end)) {
              styleClass.push('selected')
            }
          }
        }
        elem.className = styleClass.join(' ')
      }

      function afterSelection() {
        var formattedStart = formatDate(selection.start)
        var formattedEnd = formatDate(selection.end)
        container.data('calendarRange', selection)
        setStartField(formattedStart)
        setEndField(formattedEnd)
        setRangeLabels()
        if(params.selectWeek) {
          calendar.close($('td.selected', container).first())
        }
        executeCallback(selection)
      }

      function setRangeLabels() {
        if(selection.start && selection.end) {
          var format = params.locale.weekDateFormat
          $('span.startDateLabel', container).text(selection.start.dateFormat(format))
          $('span.endDateLabel', container).text(selection.end.dateFormat(format))
          $('span.separator', container).show()
        } else {
          $('span.separator', container).hide()
        }
      }

      function fieldDate(field) { return field.length > 0 && field.val().length > 0 ? Date.parseDate(field.val(), params.locale.shortDateFormat) : null; }

      function disableTextSelection(elem) {
        if($.browser.mozilla) {//Firefox
          $(elem).css('MozUserSelect', 'none')
        } else {
          if($.browser.msie) {//IE
            $(elem).bind('selectstart', function() {
              return false
            })
          } else {//Opera, etc.
            $(elem).mousedown(function() {
              return false
            })
          }
        }
      }

      function executeCallback(selection) {
        params.callback.call(container, selection)
        container.trigger('calendarChange', selection)
      }

      function isDateCell(elem) { return $(elem).hasClass('date') }

      function isWeekCell(elem) { return $(elem).hasClass('week') }

      function isMonthCell(elem) { return $(elem).hasClass('month') }

      function isEnabled(elem) { return !$(elem).hasClass('disabled') }

      function getElemDate(elem) { return dateCellDates[$(elem).attr('date-cell-index')] }

      function getDateCell(index) { return $(dateCells[index]) }

      function setStartField(value) { params.startField.val(value) }

      function setEndField(value) { params.endField.val(value) }

      function formatDate(date) { return date.dateFormat(params.locale.shortDateFormat) }

      function setDateLabel(val) { $('span.startDateLabel', container).text(val) }

      function isRange() { return params.endField && params.endField.length > 0 }
    }
  }
  $.fn.calendarRange = function() { return $(this).data('calendarRange') }
  $.fn.exists = function() { return this.length > 0 }
  $.fn.isEmpty = function() { return this.length == 0 }
})(jQuery)
