define(function(require) {
  var $ = require('jquery')
  var DateFormat = require('./DateFormat')

  return function(container, calendarBody, executeCallback, locale, params, getElemDate, popupBehavior, startDate) {
    return {
      showInitialSelection: showInitialSelection,
      initEvents          : initEvents,
      addRangeLengthLabel : $.noop,
      addEndDateLabel     : $.noop,
      performTrigger      : performTrigger
    }

    function showInitialSelection() { if(startDate) setDateLabel(DateFormat.format(startDate, locale.weekDateFormat, locale)) }

    function initEvents() {
      initSingleDateCalendarEvents()
      var selectedDateKey = startDate && DateFormat.format(startDate, 'Ymd', locale)
      if(selectedDateKey in calendarBody.dateCellMap) {
        calendarBody.getDateCell(calendarBody.dateCellMap[selectedDateKey]).addClass('selected')
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
          $('td.selected', container).removeClass('selected')
          dateCell.addClass('selected')
          var selectedDate = getElemDate(dateCell.get(0));
          params.startField.val(DateFormat.shortDateFormat(selectedDate, locale))
          setDateLabel(DateFormat.format(selectedDate, locale.weekDateFormat, locale))
          popupBehavior.close(this)
          executeCallback(selectedDate)
        }
      })
    }

    function setDateLabel(val) { $('span.startDateLabel', container).text(val) }
  }
})
