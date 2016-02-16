  var $ = require('jquery')
  var DateFormat = require('dateutils').DateFormat
  var DateParse = require('dateutils').DateParse

  module.exports = function(container, calendarBody, executeCallback, locale, params, getElemDate, popupBehavior, startDate, setStartField) {
    return {
      showInitialSelection: showInitialSelection,
      initEvents          : initEvents,
      addRangeLengthLabel : $.noop,
      addEndDateLabel     : $.noop,
      addDateClearingLabel: addDateClearingLabel,
      setSelection        : setSelection,
      performTrigger      : performTrigger
    }

    function showInitialSelection() {
      if(startDate) {
        setFieldValues(startDate)
        $('.clearDates', container).show()
      }
    }

    function initEvents() {
      initSingleDateCalendarEvents()
      setSelection(fieldDate(params.startField) || startDate)
    }

    function fieldDate(field) { return field.length > 0 && field.val().length > 0 ? DateParse.parse(field.val(), locale) : null }

    function setSelection(date) {
      var selectedDateKey = date && DateFormat.format(date, 'Ymd', locale)
      if(selectedDateKey in calendarBody.dateCellMap) {
        setSelectedDate(date, calendarBody.getDateCell(calendarBody.dateCellMap[selectedDateKey]))
      }
    }

    function setSelectedDate(date, cell) {
      $('td.selected', container).removeClass('selected')
      cell.addClass('selected')
      setFieldValues(date)
    }

    function setFieldValues(date) {
      container.data('calendarRange', date)
      setStartField(date)
      setDateLabel(DateFormat.format(date, locale.weekDateFormat, locale))
    }

    function addDateClearingLabel() {
      if(params.allowClearDates) {
        var dateClearingLabel = $('<span class="clearDates clickable"></span>').hide()
        dateClearingLabel.text(locale.clearDateLabel)
        var dateClearingContainer = $('<div class="label clearLabel"></div>').append(dateClearingLabel)
        $('.continuousCalendar', container).append(dateClearingContainer)
      }
    }

    function performTrigger() {
      container.data('calendarRange', startDate)
      executeCallback(startDate)
    }

    function initSingleDateCalendarEvents() {
      $('.date', container).bind('click', function() {
        var dateCell = $(this)
        if (!dateCell.hasClass('disabled')) {
          var selectedDate = getElemDate(dateCell.get(0))
          setSelectedDate(selectedDate, dateCell)
          popupBehavior.close(this)
          executeCallback(selectedDate)
        }
      })
      $('.clearDates', container).click(clickClearDate)
    }

    function setDateLabel(val) {
      $('span.startDateLabel', container).text(val)
      if(params.allowClearDates) {
        $('.clearDates', container).toggle(val !== '')
      }
    }

    function clickClearDate() {
      $('td.selected', container).removeClass('selected')
      params.startField.val('')
      setDateLabel('')
    }
  }
