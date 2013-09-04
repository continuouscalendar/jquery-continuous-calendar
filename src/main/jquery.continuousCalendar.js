define(function(require) {
  var $ = require('jquery')
  var DateFormat = require('./DateFormat')
  var DateLocale = require('./DateLocale')
  var DateRange = require('./DateRange')
  var DateTime = require('./DateTime')
  var CalendarBody = require('./CalendarBody')
  var RangeEvents = require('./RangeEvents')
  var SingleDateEvents = require('./SingleDateEvents')
  var Template = require('./Template')
  require('jquery.tinyscrollbar')

  $.continuousCalendar = {
    version : typeof VERSION !== 'undefined' ? VERSION : 'nightly',
    released: typeof RELEASED !== 'undefined' ? RELEASED : 'nightly'
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
        locale         : DateLocale.EN,
        disableWeekends: false,
        disabledDates  : null,
        minimumRange   : -1,
        selectWeek     : false,
        fadeOutDuration: 0,
        callback       : $.noop,
        customScroll   : false,
        scrollOptions  : {
          sizethumb: 'auto'
        },
        theme          : '',
        allowClearDates: false
      }
      var params = $.extend({}, defaults, options)
      if (options) {
        params.templates = $.extend(true, {}, Template, options.templates)
      } else {
        params.templates = Template
      }
      var locale = DateLocale.fromArgument(params.locale)
      var startDate = fieldDate(params.startField)
      var endDate = fieldDate(params.endField)
      var today = DateTime.today()

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

      function initScrollBar() { if(params.customScroll) customScrollContainer = $('.tinyscrollbar', container).tinyscrollbar(params.scrollOptions) }

      function initCalendarTable() {
        if (!calendarBody.scrollContent) {

          calendarBody = $.extend(calendarBody, CalendarBody(calendarContainer, calendarRange, locale,
              params.customScroll, params.disableWeekends, disabledDatesObject, params.templates))
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

        function dateOrWeek(date, week) { return date ? DateFormat.parse(date, locale) : firstWeekdayOfGivenDate.plusDays(week)}
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
        $.each(dates, function(index, date) { dateMap[DateFormat.parse(date).date] = true })
        return dateMap
      }

      function dateBehaviour(isRange) {
        var basicParams = [container, calendarBody, executeCallback, locale, params, getElemDate, popupBehavior, startDate, params.templates]
        var rangeParams = [endDate, calendarRange, setStartField, setEndField, formatDate, disabledDatesList]
        return isRange ? RangeEvents.apply(null, basicParams.concat(rangeParams)) : SingleDateEvents.apply(null, basicParams)
      }

      function popUpBehaviour(isPopup) {
        var popUpVersion = {
          initUI               : function() {
            calendarContainer.addClass('popup').hide()
            var icon = $(Template.icon({
              content: today.getDate()
            }))
            icon.click(toggleCalendar)
            container.prepend(Template.emptyContainer())
            container.prepend(icon)
          },
          initState            : $.noop,
          getContainer         : function(newContainer) { return $(Template.popupContainer()).append(newContainer); },
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
          var newContainer = $(Template.calendar())
          container.append(popupBehavior.getContainer(newContainer))
          return newContainer
        }
      }

      function addDateLabels(container, popupBehavior, dateBehavior) {
        var dateLabelContainer = $(Template.startDateLabel())
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
  $.fn.isEmpty = function() { return this.length === 0 }
})
