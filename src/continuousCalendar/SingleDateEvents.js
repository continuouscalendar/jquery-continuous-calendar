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
      const clearDates = container.get(0).querySelector('.clearDates')
      if(clearDates) clearDates.style.display = ''
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
    const selectedElem = container.get(0).querySelector('td.selected')
    selectedElem && selectedElem.classList.remove('selected')
    cell.get(0).classList.add('selected')
    setFieldValues(date)
  }

  function setFieldValues(date) {
    container.data('calendarRange', date)
    setStartField(date)
    setDateLabel(DateFormat.format(date, locale.weekDateFormat, locale))
  }

  function addDateClearingLabel() {
    if(params.allowClearDates) {
      container.get(0).querySelector('.continuousCalendar').insertAdjacentHTML('beforeend', '<div class="label clearLabel">' +
        '<span class="clearDates clickable" style="display: none">' + locale.clearDateLabel + '</span></div>')
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
    container.get(0).querySelector('span.startDateLabel').innerText = val
    if(params.allowClearDates) {
      container.get(0).querySelector('.clearDates').style.display = (val === '' ? 'none' : '')
    }
  }

  function clickClearDate() {
    container.get(0).querySelector('td.selected').classList.remove('selected')
    params.startField.get(0).value = ''
    setDateLabel('')
  }
}
