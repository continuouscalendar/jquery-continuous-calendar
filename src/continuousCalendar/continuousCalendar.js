var DateFormat = require('dateutils').DateFormat
var DateParse = require('dateutils').DateParse
var EN = require('dateutils').DateLocale.EN
var DateRange = require('dateutils').DateRange
var DateTime = require('dateutils').DateTime
var CalendarBody = require('./CalendarBody')
var RangeEvents = require('./RangeEvents')
var SingleDateEvents = require('./SingleDateEvents')

module.exports = function(container, options) {
  var defaults = {
    weeksBefore:     26,
    weeksAfter:      26,
    firstDate:       null,
    lastDate:        null,
    startField:      container.querySelector('input.startDate'),
    endField:        container.querySelector('input.endDate'),
    isPopup:         false,
    selectToday:     false,
    locale:          EN,
    disableWeekends: false,
    disabledDates:   null,
    minimumRange:    -1,
    selectWeek:      false,
    fadeOutDuration: 0,
    callback:        function() {},
    popupCallback:   function() {},
    customScroll:    false,
    scrollOptions:   {
      sizethumb: 'auto'
    },
    theme:           '',
    allowClearDates: false,
    isRange:         false,
    startDate:       null,
    endDate:         null,
    useIsoForInput:  false
  }
  var params = extend(defaults, options)
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

  container.classList.add('continuousCalendarContainer')
  container.classList.add('params.theme')
  createCalendar()

  function createCalendar() {
    //TODO change api to take YYYY-MM-DD instead of MM/DD/YYYY and array instead of space separated string
    disabledDatesList = params.disabledDates ? params.disabledDates.split(' ').map(function(slashStr) {
      var mdy = slashStr.split('/')
      var year = mdy[2]
      var month = mdy[0]
      var day = mdy[1]
      return [year, (month.length === 1 ? '0' : '') + month, (day.length === 1 ? '0' : '') + day].join('-')
    }) : []
    disabledDatesObject = params.disabledDates ? parseDisabledDates(disabledDatesList) : {}
    calendarRange = determineRangeToRenderFormParams(params)
    popupBehavior = popUpBehaviour(params.isPopup)
    dateBehavior = dateBehaviour(params.isRange)
    params.fadeOutDuration = +params.fadeOutDuration
    calendarContainer = getCalendarContainerOrCreateOne()
    //calendarContainer.click(function(e) { e.stopPropagation() })
    if(!container.querySelector('.startDateLabel')) addDateLabels(container, popupBehavior, dateBehavior)
    popupBehavior.initUI()
    dateBehavior.showInitialSelection()
    dateBehavior.performTrigger()
  }

  function initCalendarTable() {
    if(!calendarBody.scrollContent) {

      calendarBody = extend(calendarBody, CalendarBody(calendarContainer, calendarRange, locale,
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

    return new DateRange(rangeStart, rangeEnd)

    function dateOrWeek(date, week) {
      if(date) {
        if(date instanceof Date) {
          return DateTime.fromDateObject(date)
        } else if(date instanceof DateTime) {
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
      if(!customScrollContainer) customScrollContainer = params.initScrollBar(container, params)
      customScrollContainer.bind('scroll', setYearLabel)
    } else {
      var waiting = false
      calendarBody.scrollContent.addEventListener('scroll', function() {
        if(!waiting) {
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
    dates.forEach(function(date) { dateMap[DateTime.fromIsoDate(date).date] = true })
    return dateMap
  }

  function dateBehaviour(isRange) {
    var basicParams = [container, calendarBody, params.executeCallback, locale, params, getElemDate, popupBehavior, startDate, setStartField]
    var rangeParams = [endDate, setEndField, calendarRange, disabledDatesList]
    return isRange ? RangeEvents.apply(null, basicParams.concat(rangeParams)) : SingleDateEvents.apply(null, basicParams)
  }

  function popUpBehaviour(isPopup) {
    var popUpVersion = {
      initUI:                function() {
        calendarContainer.classList.add('popup')
        calendarContainer.style.display = 'none'
        var icon = createElement('a', {
          'href':  '#',
          'class': 'calendarIcon'
        })
        icon.innerText = today.getDate()
        icon.addEventListener('click', toggleCalendar)
        container.insertBefore(icon, container.firstChild)
      },
      initState:             function() { },
      getContainer:          function(newContainer) {
        var popUpContainer = createElement('div', {
          'class': 'popUpContainer'
        })
        popUpContainer.appendChild(newContainer)
        return popUpContainer
      },
      close:                 toggleCalendar,
      addDateLabelBehaviour: function(labels) {
        Array.prototype.slice.call(labels).forEach(function(label) {
          label.classList.add('clickable')
          label.addEventListener('click', toggleCalendar)
        })
      }
    }

    function toggleCalendar() {
      initCalendarTable()
      if(calendarContainer.style.display === '' ) {
        //calendarContainer.fadeOut(params.fadeOutDuration)
        calendarContainer.style.display = 'none'
        //TODO re-actiate
        //$(document).unbind('click.continuousCalendar')
      } else {
        params.popupCallback()
        calendarContainer.style.display = ''
        if(beforeFirstOpening) {
          params.initScrollBar(container, params)
          calculateCellHeight()
          setYearLabel()
          beforeFirstOpening = false
        }
        dateBehavior.setSelection(fieldDate(params.startField), fieldDate(params.endField))
        scrollToSelection()
        //TODO re-actiate
        //$(document).bind('click.continuousCalendar', toggleCalendar)

      }
      return false
    }

    var inlineVersion = {
      initUI:                initCalendarTable,
      initState:             calculateCellHeightAndInitScroll,
      getContainer:          function(newContainer) {
        return newContainer
      },
      close:                 function() {},
      addDateLabelBehaviour: function() {}
    }
    return isPopup ? popUpVersion : inlineVersion
  }

  function getCalendarContainerOrCreateOne() {
    var existingContainer = container.querySelector('.continuousCalendar')
    if(existingContainer) {
      return existingContainer
    } else {
      var newContainer = createElement('div', {'class':'continuousCalendar'})
      container.appendChild(popupBehavior.getContainer(newContainer))
      return newContainer
    }
  }

  function addDateLabels(container2, popupBehavior, dateBehavior) {
    var dateLabelContainer = createElement('div', {'class': 'label'})
    dateLabelContainer.appendChild(createElement('span', {'class': 'startDateLabel'}))
    dateBehavior.addEndDateLabel(dateLabelContainer)
    container2.insertBefore(dateLabelContainer, container2.firstChild)
    popupBehavior.addDateLabelBehaviour(dateLabelContainer.childNodes)
  }

  function scrollToSelection() {
    var scrollContent = calendarBody.scrollContent
    var selectionStartOrToday = scrollContent.querySelector('.selected') || scrollContent.querySelector('.today')
    if(selectionStartOrToday) {
      var height = calendarBody.scrollContent.clientHeight
      var position = selectionStartOrToday.offsetTop - (height - selectionStartOrToday.offsetHeight) / 2
      if(params.customScroll) {
        var totalHeight = calendarBody.bodyTable.clientHeight
        var maxScroll = totalHeight - height
        var validPosition = position > maxScroll ? maxScroll : position
        customScrollContainer.tinyscrollbar_update(validPosition > 0 ? validPosition : 0)
      } else {
        calendarBody.scrollContent.scrollTop = position
      }
    }
  }

  function setYearLabel() {
    var scrollContent = calendarBody.scrollContent
    var table = scrollContent.querySelector('table')
    var scrollTop = params.customScroll ? -calendarContainer.querySelector('.overview').offsetTop : scrollContent.scrollTop
    var rowNumber = parseInt(scrollTop / averageCellHeight, 10)
    var date = getElemDate(table.rows[rowNumber].cells[2])
    calendarBody.yearTitle.innerText = date.getFullYear()
  }

  function calculateCellHeightAndInitScroll() {
    params.initScrollBar(container, params)
    calculateCellHeight()
    setYearLabel()
  }

  function calculateCellHeight() { averageCellHeight = parseInt(calendarBody.bodyTable.clientHeight / calendarBody.bodyTable.querySelectorAll('tr').length, 10) }

  function fieldDate(field) { return field && field.value && field.value.length > 0 ? (params.useIsoForInput ? DateTime.fromIsoDate(field.value) : DateParse.parse(field.value, locale)) : null }

  function getElemDate(elem) {
    return calendarBody.dateCellDates[elem.getAttribute('date-cell-index') || elem.parentNode.getAttribute('date-cell-index')]
  }

  function setStartField(date) { if(params.startField) params.startField.value = formatDate(date) }

  function setEndField(date) { if(params.endField) params.endField.value = formatDate(date) }

  function formatDate(date) { return date ? (params.useIsoForInput ? date.toISODateString() : DateFormat.shortDateFormat(date, locale)) : '' }

  function extend(destination, source) {
    for(var property in source)
      destination[property] = source[property]
    return destination
  }
  function createElement(tagName, attributes) {
    var el = document.createElement(tagName)
    Object.keys(attributes).forEach(function(key) {
      el.setAttribute(key, attributes[key])
    })
    return el
  }
}
