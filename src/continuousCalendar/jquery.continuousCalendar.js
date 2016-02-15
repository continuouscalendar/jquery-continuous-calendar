  var $ = require('jquery')
  var DateFormat = require('./dateutils/DateFormat')
  var DateParse = require('./dateutils/DateParse')
  var EN = require('./dateutils/locale/EN')
  var DateRange = require('./dateutils/DateRange')
  var DateTime = require('./dateutils/DateTime')
  var CalendarBody = require('./CalendarBody')
  var RangeEvents = require('./RangeEvents')
  var SingleDateEvents = require('./SingleDateEvents')

  $.continuousCalendar = {
    "version" : "4.12.1"
  }
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
        locale         : EN,
        disableWeekends: false,
        disabledDates  : null,
        minimumRange   : -1,
        selectWeek     : false,
        fadeOutDuration: 0,
        callback       : $.noop,
        popupCallback  : $.noop,
        customScroll   : false,
        scrollOptions  : {
          sizethumb: 'auto'
        },
        theme          : '',
        allowClearDates: false,
        isRange        : false,
        startDate      : null,
        endDate        : null,
        useIsoForInput : false
      }
      var params = $.extend({}, defaults, options)
      var locale = params.locale
      var startDate = fieldDate(params.startField) || params.startDate
      var endDate = fieldDate(params.endField) || params.endDate
      var today = DateTime.today()

      if(params.selectToday) {
        startDate = today
        endDate = today
        setStartField(today)
        setEndField(today)
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

      $(this).addClass('continuousCalendarContainer').addClass(params.theme)
      createCalendar()

      function createCalendar() {
        //TODO change api to take YYYY-MM-DD instead of MM/DD/YYYY and array instead of space separated string
        disabledDatesList = params.disabledDates ? $.map(params.disabledDates.split(' '), function(slashStr) {
          var mdy = slashStr.split('/')
          var year = mdy[2]
          var month = mdy[0]
          var day = mdy[1]
          return [ year, (month.length === 1 ? '0':'') + month, (day.length === 1 ? '0':'') + day].join('-')
        }) : []
        disabledDatesObject = params.disabledDates ? parseDisabledDates(disabledDatesList) : {}
        calendarRange = determineRangeToRenderFormParams(params)
        popupBehavior = popUpBehaviour(params.isPopup)
        dateBehavior = dateBehaviour(params.isRange)
        params.fadeOutDuration = +params.fadeOutDuration
        calendarContainer = getCalendarContainerOrCreateOne()
        calendarContainer.click(function(e) { e.stopPropagation() })
        if($('.startDateLabel', container).isEmpty()) addDateLabels(container, popupBehavior, dateBehavior)
        popupBehavior.initUI()
        dateBehavior.showInitialSelection()
        dateBehavior.performTrigger()
      }

      function initScrollBar() { if(params.customScroll) customScrollContainer = $('.tinyscrollbar', container).tinyscrollbar(params.scrollOptions) }

      function initCalendarTable() {
        if (!calendarBody.scrollContent) {

          calendarBody = $.extend(calendarBody, CalendarBody(calendarContainer, calendarRange, locale,
              params.customScroll, params.disableWeekends, disabledDatesObject))
          bindScrollEvent()

          popupBehavior.initState()
          dateBehavior.addRangeLengthLabel()
          dateBehavior.addDateClearingLabel()
          dateBehavior.initEvents()
          scrollToSelection()
        }
      }

      function determineRangeToRenderFormParams(params) {
        var firstWeekdayOfGivenDate = (startDate || DateTime.today()).getFirstDateOfWeek(locale)
        var rangeStart = dateOrWeek(params.firstDate, -params.weeksBefore * 7)
        var rangeEnd = dateOrWeek(params.lastDate, params.weeksAfter * 7 + 6)

        return  new DateRange(rangeStart, rangeEnd)

        function dateOrWeek(date, week) {
          if(date) {
            if(date instanceof Date) {
              return DateTime.fromDateObject(date)
            } else if (date instanceof DateTime) {
              return date
            } else {
              return DateParse.parse(date, locale)
            }
          }
          return firstWeekdayOfGivenDate.plusDays(week)
        }
      }

      function bindScrollEvent() {
        if(params.customScroll) {
          if(!customScrollContainer) initScrollBar()
          customScrollContainer.bind('scroll', setYearLabel)
        } else {
          var waiting = false
          calendarBody.scrollContent.scroll(function() {
            if (!waiting) {
              setTimeout(function() {
                waiting = false
                setYearLabel()
              }, 250)
              waiting = true
            }
          })
        }
      }

      function parseDisabledDates(dates) {
        var dateMap = {}
        $.each(dates, function(index, date) { dateMap[DateTime.fromIsoDate(date).date] = true })
        return dateMap
      }

      function dateBehaviour(isRange) {
        var basicParams = [container, calendarBody, executeCallback, locale, params, getElemDate, popupBehavior, startDate, setStartField]
        var rangeParams = [endDate, setEndField, calendarRange, disabledDatesList]
        return isRange ? RangeEvents.apply(null, basicParams.concat(rangeParams)) : SingleDateEvents.apply(null, basicParams)
      }

      function popUpBehaviour(isPopup) {
        var popUpVersion = {
          initUI               : function() {
            calendarContainer.addClass('popup').hide()
            var icon = $('<a href="#" class="calendarIcon">' + today.getDate() + '</a>').click(toggleCalendar)
            container.prepend(icon)
          },
          initState            : $.noop,
          getContainer         : function(newContainer) { return $('<div class="popUpContainer">').append(newContainer) },
          close                : function(cell) { toggleCalendar.call(cell) },
          addDateLabelBehaviour: function(label) {
            label.addClass('clickable')
            label.click(toggleCalendar)
          }
        }

        function toggleCalendar() {
          initCalendarTable()
          if(calendarContainer.is(':visible')) {
            calendarContainer.fadeOut(params.fadeOutDuration)
            $(document).unbind('click.continuousCalendar')
          } else {
            params.popupCallback()
            calendarContainer.show()
            if(beforeFirstOpening) {
              initScrollBar()
              calculateCellHeight()
              setYearLabel()
              beforeFirstOpening = false
            }
            dateBehavior.setSelection(fieldDate(params.startField), fieldDate(params.endField))
            scrollToSelection()
            $(document).bind('click.continuousCalendar', toggleCalendar)

          }
          return false
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

      function fieldDate(field) { return field.length > 0 && field.val().length > 0 ? (params.useIsoForInput ? DateTime.fromIsoDate(field.val()) : DateParse.parse(field.val(), locale)) : null }

      function executeCallback(selection) {
        params.callback.call(container, selection)
        container.trigger('calendarChange', selection)
      }

      function getElemDate(elem) { return calendarBody.dateCellDates[$(elem).closest('[date-cell-index]').attr('date-cell-index')] }

      function setStartField(date) { params.startField.val(formatDate(date)) }

      function setEndField(date) { params.endField.val(formatDate(date)) }

      function formatDate(date) { return date ? (params.useIsoForInput ? date.toISODateString() : DateFormat.shortDateFormat(date, locale)) : '' }
    }
  }
  $.fn.calendarRange = function() { return $(this).data('calendarRange') }
  $.fn.exists = function() { return this.length > 0 }
  $.fn.isEmpty = function() { return this.length === 0 }
