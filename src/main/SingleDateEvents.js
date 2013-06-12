define(function(require) {
  var $ = require('jquery')
  var DateFormat = require('./DateFormat')

  return function(container, calendarBody, executeCallback, locale, params, getElemDate, popupBehavior, startDate) {
    return {
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
})