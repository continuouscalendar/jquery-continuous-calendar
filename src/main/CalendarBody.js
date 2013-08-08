define(function(require) {
  var $ = require('jquery')
  var DateFormat = require('./DateFormat')
  var DateTime = require('./DateTime')

  return function(calendarContainer, calendarRange, locale, customScroll, disableWeekends, disabledDatesObject) {
    var dateCellMap = {}
    var dateCellDates = []

    var headerTable = $('<table class="calendarHeader">').append(headerRow())
    var bodyTable = $('<table class="calendarBody">').append(calendarBody())
    var scrollContent = $('<div class="calendarScrollContent">').append(bodyTable)
    calendarContainer.append(headerTable)

    if(customScroll) {
      bodyTable.addClass('overview')
      scrollContent.addClass('viewport')
      calendarContainer.append(
          $('<div class="tinyscrollbar"></div>')
              .append('<div class="scrollbar"> <div class="track"> <div class="thumb"> <div class="end"></div> </div> </div> </div>')
              .append(scrollContent))
    } else {
      calendarContainer.append(scrollContent)
    }
    var dateCells = $('td.date', calendarContainer).get()
    highlightToday(dateCellMap)
    var yearTitle = $('th.month', headerTable)

    return {
      bodyTable    : bodyTable,
      scrollContent: scrollContent,
      dateCells    : dateCells,
      yearTitle    : yearTitle,
      dateCellMap  : dateCellMap,
      dateCellDates: dateCellDates,
      dateStyles   : dateStyles,
      getDateCell  : getDateCell
    }

    function headerRow() {
      var tr = $('<tr><th class="month"></th><th class="week">&nbsp;</th>')
      $(locale.dayNames).each(function(index) {
        var weekDay = $('<th>').append(locale.shortDayNames[(index + locale.firstWeekday) % 7]).addClass('weekDay')
        tr.append(weekDay)
      })
      return $('<thead>').append(tr)
    }

    function highlightToday(dateCellMap) {
      var todayKey = DateFormat.format(DateTime.today(), 'Ymd', locale)
      if(todayKey in dateCellMap) {
        getDateCell(dateCellMap[todayKey]).addClass('today').wrapInner('<div>')
      }
    }

    function calendarBody() {
      var firstWeekDay = calendarRange.start.getFirstDateOfWeek(locale)
      var isFirst = true;
      var rows = []
      while(firstWeekDay.compareTo(calendarRange.end) <= 0) {
        calendarRow(rows, firstWeekDay.clone(), isFirst)
        isFirst = false
        firstWeekDay = firstWeekDay.plusDays(7)
      }

      return '<tbody>' + rows.join('') + '</tbody>'

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
        var cell = '<td class="' + dateStyles(date) + '" date-cell-index="' + dateCellDates.length + '">' + date.getDate() + '</td>'
        dateCellMap[DateFormat.format(date, 'Ymd', locale)] = dateCellDates.length
        dateCellDates.push(date)
        return cell
      }

      function monthCell(firstDayOfWeek, isFirst) {
        var th = '<th class="month ' + backgroundBy(firstDayOfWeek)
        if(isFirst || firstDayOfWeek.getDate() <= 7) {
          th += ' monthName">'
          th += locale.monthNames[firstDayOfWeek.getMonth()-1]
        } else {
          th += '">'
          if(firstDayOfWeek.getDate() <= 7 * 2 && firstDayOfWeek.getMonth() === 1) {
            th += firstDayOfWeek.getFullYear()
          }
        }
        return th + '</th>'
      }

      function weekCell(firstDayOfWeek) { return '<th class="week ' + backgroundBy(firstDayOfWeek) + '">' + firstDayOfWeek.getWeekInYear('ISO') + '</th>' }
    }

    function dateStyles(date) { return $.trim(['date', backgroundBy(date), disabledOrNot(date), todayStyle(date), holidayStyle(date)].sort().join(' ')) }

    function backgroundBy(date) { return date.isOddMonth() ? 'odd' : '' }

    function disabledOrNot(date) {
      var disabledWeekendDay = disableWeekends && date.isWeekend()
      var disabledDay = disabledDatesObject[date.getOnlyDate().date]
      var outOfBounds = !calendarRange.hasDate(date)
      return outOfBounds || disabledWeekendDay || disabledDay ? 'disabled' : ''
    }

    function todayStyle(date) { return date.isToday() ? 'today' : '' }

    function holidayStyle(date) { return date.getDay() === 0 ? 'holiday' : '' }

    function getDateCell(index) { return $(dateCells[index]) }
  }
})
