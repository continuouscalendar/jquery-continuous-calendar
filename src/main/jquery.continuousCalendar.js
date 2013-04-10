;
(function(root, factory) {
  if(typeof define === 'function' && define.amd) {
    define(['jquery', './DateFormat', './DateLocale', './DateRange', './DateTime', './CalendarBody', './RangeEvents', 'jquery.tinyscrollbar'], factory)
  } else {
    factory(root.jQuery, root.DateFormat, root.DateLocale, root.DateRange, root.DateTime, root.CalendarBody, RangeEvents)
  }
})(this, function($, DateFormat, DateLocale, DateRange, DateTime, CalendarBody, RangeEvents) {
  $.fn.continuousCalendar = function(options) {
    return this.each(function() { _continuousCalendar.call($(this), options) })
    function _continuousCalendar(options) {
      var defaults = {
        weeksBefore    : 26,
        weeksAfter     : 26,
        firstDate      : null,
        lastDate       : null,
        startField     : $('input.startDate', this),
        endField       : $('input.endDate', this),
        isPopup        : false,
        selectToday    : false,
        locale         : DateLocale.EN,
        disableWeekends: false,
        disabledDates  : null,
        minimumRange   : -1,
        selectWeek     : false,
        fadeOutDuration: 0,
        callback       : $.noop,
        customScroll   : false,
        theme          : ''
      }
      var params = $.extend({}, defaults, options)
      var locale = DateLocale.fromArgument(params.locale)
      var startDate = fieldDate(params.startField)
      var endDate = fieldDate(params.endField)
      var today = DateTime.now()

      if(params.selectToday) {
        var formattedToday = formatDate(today)
        startDate = today
        endDate = today
        setStartField(formattedToday)
        setEndField(formattedToday)
      }
      var container = this
      var averageCellHeight
      var calendarContainer
      var beforeFirstOpening = true
      var popupBehavior
      var dateBehavior
      var customScrollContainer
      var calendarBody = {}
      var calendarRange
      var disabledDatesList
      var disabledDatesObject

      $(this).addClass('continuousCalendarContainer').addClass(params.theme).append('&nbsp;') //IE fix for popup version
      createCalendar()

      function createCalendar() {
        disabledDatesList = params.disabledDates ? params.disabledDates.split(' ') : []
        disabledDatesObject = params.disabledDates ? parseDisabledDates(disabledDatesList) : {}
        calendarRange = determineRangeToRenderFormParams(params)
        popupBehavior = popUpBehaviour(params.isPopup)
        dateBehavior = dateBehaviour(isRange())
        params.fadeOutDuration = +params.fadeOutDuration
        calendarContainer = getCalendarContainerOrCreateOne()
        calendarContainer.click(function(e) { e.stopPropagation() })
        if($('.startDateLabel', container).isEmpty()) addDateLabels(container, popupBehavior, dateBehavior)
        popupBehavior.initUI()
        dateBehavior.showInitialSelection()
        dateBehavior.performTrigger()
      }

      function initScrollBar() { if(params.customScroll) customScrollContainer = $('.tinyscrollbar', container).tinyscrollbar() }

      function initCalendarTable() {
        if(calendarBody.scrollContent) return

        calendarBody = $.extend(calendarBody, CalendarBody(calendarContainer, calendarRange, locale,
          params.customScroll, params.disableWeekends, disabledDatesObject))
        bindScrollEvent()

        popupBehavior.initState()
        dateBehavior.addRangeLengthLabel()
        dateBehavior.initEvents()
        scrollToSelection()
      }

      function determineRangeToRenderFormParams(params) {
        var firstWeekdayOfGivenDate = (startDate || DateTime.now()).getFirstDateOfWeek(locale)
        var firstDate = params.firstDate
        var lastDate = params.lastDate
        var rangeStart = firstDate ? DateFormat.parse(firstDate, locale) : firstWeekdayOfGivenDate.minusDays(params.weeksBefore * 7)
        var rangeEnd = lastDate ? DateFormat.parse(lastDate, locale) : firstWeekdayOfGivenDate.plusDays(params.weeksAfter * 7 + 6)

        return  new DateRange(rangeStart, rangeEnd)
      }

      function bindScrollEvent() {
        if(params.customScroll) {
          if(!customScrollContainer) initScrollBar()
          customScrollContainer.bind('scroll', setYearLabel)
        } else {
          var didScroll = false
          calendarBody.scrollContent.scroll(function() {
            didScroll = true
          })

          setInterval(function() {
            if(didScroll) {
              didScroll = false
              setYearLabel()
            }
          }, 250)
        }
      }

      function parseDisabledDates(dates) {
        var dateMap = {}
        $.each(dates, function(index, date) { dateMap[DateFormat.parse(date).date] = true })
        return dateMap
      }

      function dateBehaviour(isRange) {
        var singleDateVersion = {
          showInitialSelection: function() {
            if(startDate) setDateLabel(DateFormat.format(startDate, locale.weekDateFormat, locale))
          },
          initEvents          : function() {
            initSingleDateCalendarEvents()
            var selectedDateKey = startDate && DateFormat.format(startDate, 'Ymd', locale)
            if(selectedDateKey in calendarBody.dateCellMap) {
              calendarBody.getDateCell(calendarBody.dateCellMap[selectedDateKey]).addClass('selected')
            }
          },
          addRangeLengthLabel : $.noop,
          addEndDateLabel     : $.noop,
          performTrigger      : function() {
            container.data('calendarRange', startDate)
            executeCallback(startDate)
          }
        }
        return isRange ? RangeEvents(container, calendarBody, executeCallback, locale, params, getElemDate,
          calendarRange, setStartField, setEndField, popupBehavior, formatDate, startDate, endDate, disabledDatesList) : singleDateVersion

        function initSingleDateCalendarEvents() {
          $('.date', container).bind('click', function() {
            var dateCell = $(this)
            if(dateCell.hasClass('disabled')) return
            $('td.selected', container).removeClass('selected')
            dateCell.addClass('selected')
            var selectedDate = getElemDate(dateCell.get(0));
            params.startField.val(DateFormat.shortDateFormat(selectedDate, locale))
            setDateLabel(DateFormat.format(selectedDate, locale.weekDateFormat, locale))
            popupBehavior.close(this)
            executeCallback(selectedDate)
          })
        }

        function setDateLabel(val) { $('span.startDateLabel', container).text(val) }

      }

      function popUpBehaviour(isPopup) {
        var popUpVersion = {
          initUI               : function() {
            calendarContainer.addClass('popup').hide()
            var icon = $('<a href="#" class="calendarIcon">' + today.getDate() + '</a>').click(toggleCalendar)
            container.prepend('<div></div>')
            container.prepend(icon)
          },
          initState            : $.noop,
          getContainer         : function(newContainer) { return $('<div class="popUpContainer">').append(newContainer); },
          close                : function(cell) { toggleCalendar.call(cell) },
          addDateLabelBehaviour: function(label) {
            label.addClass('clickable')
            label.click(toggleCalendar)
          }
        }
        var inlineVersion = {
          initUI               : initCalendarTable,
          initState            : calculateCellHeightAndInitScroll,
          getContainer         : function(newContainer) {
            return newContainer
          },
          close                : $.noop,
          addDateLabelBehaviour: $.noop
        }
        return isPopup ? popUpVersion : inlineVersion
      }

      function getCalendarContainerOrCreateOne() {
        var existingContainer = $('.continuousCalendar', container)
        if(existingContainer.exists()) {
          return existingContainer
        } else {
          var newContainer = $('<div class="continuousCalendar">')
          container.append(popupBehavior.getContainer(newContainer))
          return newContainer
        }
      }

      function addDateLabels(container, popupBehavior, dateBehavior) {
        var dateLabelContainer = $('<div class="label"><span class="startDateLabel"></span></div>')
        dateBehavior.addEndDateLabel(dateLabelContainer)
        container.prepend(dateLabelContainer)
        popupBehavior.addDateLabelBehaviour(dateLabelContainer.children())
      }

      function scrollToSelection() {
        var selectionStartOrToday = $('.selected', calendarBody.scrollContent).get(0) || $('.today', calendarBody.scrollContent).get(0)
        if(selectionStartOrToday) {
          var position = selectionStartOrToday.offsetTop - (calendarBody.scrollContent.height() - selectionStartOrToday.offsetHeight) / 2
          if(params.customScroll) {
            var totalHeight = calendarBody.bodyTable.height()
            var maxScroll = totalHeight - calendarBody.scrollContent.height()
            var validPosition = position > maxScroll ? maxScroll : position
            customScrollContainer.tinyscrollbar_update(validPosition > 0 ? validPosition : 0)
          } else {
            calendarBody.scrollContent.scrollTop(position)
          }
        }
      }

      function setYearLabel() {
        var scrollContent = calendarBody.scrollContent.get(0)
        var table = $('table', scrollContent).get(0)
        var scrollTop = params.customScroll ? -$('.overview', calendarContainer).position().top : scrollContent.scrollTop
        var rowNumber = parseInt(scrollTop / averageCellHeight, 10)
        var date = getElemDate(table.rows[rowNumber].cells[2])
        calendarBody.yearTitle.text(date.getFullYear())
      }

      function calculateCellHeightAndInitScroll() {
        initScrollBar()
        calculateCellHeight()
        setYearLabel()
      }

      function calculateCellHeight() { averageCellHeight = parseInt(calendarBody.bodyTable.height() / $('tr', calendarBody.bodyTable).size(), 10) }

      function toggleCalendar() {
        initCalendarTable()
        if(calendarContainer.is(':visible')) {
          calendarContainer.fadeOut(params.fadeOutDuration)
          $(document).unbind('click.continuousCalendar')
        } else {
          calendarContainer.show()
          if(beforeFirstOpening) {
            initScrollBar()
            calculateCellHeight()
            setYearLabel()
            beforeFirstOpening = false
          }
          scrollToSelection()
          $(document).bind('click.continuousCalendar', toggleCalendar)

        }
        return false
      }

      function fieldDate(field) { return field.length > 0 && field.val().length > 0 ? DateFormat.parse(field.val()) : null }

      function executeCallback(selection) {
        params.callback.call(container, selection)
        container.trigger('calendarChange', selection)
      }

      function getElemDate(elem) { return calendarBody.dateCellDates[$(elem).closest('[date-cell-index]').attr('date-cell-index')] }

      function setStartField(value) { params.startField.val(value) }

      function setEndField(value) { params.endField.val(value) }

      function formatDate(date) { return date ? DateFormat.shortDateFormat(date, locale) : '' }

      function isRange() { return params.endField && params.endField.length > 0 }
    }
  }
  $.fn.calendarRange = function() { return $(this).data('calendarRange') }
  $.fn.exists = function() { return this.length > 0 }
  $.fn.isEmpty = function() { return this.length == 0 }
})
