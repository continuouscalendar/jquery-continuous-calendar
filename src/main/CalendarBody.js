define(function(require) {
  var $ = require('jquery')
  var DateFormat = require('./DateFormat')
  var DateTime = require('./DateTime')

  return function(calendarContainer, calendarRange, locale, customScroll, disableWeekends, disabledDatesObject, Template) {
    var dateCellMap = {}
    var dateCellDates = []

    var headerTable = $(Template.header()).append(headerRow())
    var bodyTable = $(Template.body()).append(calendarBody())
    var scrollContent = $(Template.scrollContent()).append(bodyTable)
    calendarContainer.append(headerTable)

    if(customScroll) {
      bodyTable.addClass('overview')
      scrollContent.addClass('viewport')
      calendarContainer.append(
          $(Template._tinyScrollbar()).append(scrollContent))
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
      var tr = $(Template._headerRow())
      $(locale.dayNames).each(function(index) {
        var weekDay = $(Template.th())
            .append(locale.shortDayNames[(index + locale.firstWeekday) % 7])
            .addClass('weekDay')
        tr.append(weekDay)
      })
      return $(Template.thead()).append(tr)
    }

    function highlightToday(dateCellMap) {
      var todayKey = DateFormat.format(DateTime.today(), 'Ymd', locale)
      if(todayKey in dateCellMap) {
        getDateCell(dateCellMap[todayKey])
            .addClass('today')
            .wrapInner(Template.innerWrapper())
      }
    }

    function calendarBody() {
      var firstWeekDay = calendarRange.start.getFirstDateOfWeek(locale)
      var isFirst = true;
      var rows = []
      while(firstWeekDay.compareTo(calendarRange.end) <= 0) {
        rows.push(calendarRow(firstWeekDay.clone(), isFirst))
        isFirst = false
        firstWeekDay = firstWeekDay.plusDays(7)
      }

      return Template.tbody({ rows: rows.join('') })

      function calendarRow(firstDayOfWeek, isFirst) {
        var contentArray = []
        contentArray.push(monthCell(firstDayOfWeek, isFirst))
        contentArray.push(weekCell(firstDayOfWeek))
        for(var i = 0; i < 7; i++) {
          var date = firstDayOfWeek.plusDays(i)
          contentArray.push(dateCell(date))
        }
        return Template.bodyRow({ content: contentArray.join('') })
      }

      function dateCell(date) {
        var cell = Template._dateCell({
          classNames: dateStyles(date),
          index: dateCellDates.length,
          content: date.getDate()
        })
        dateCellMap[DateFormat.format(date, 'Ymd', locale)] = dateCellDates.length
        dateCellDates.push(date)
        return cell
      }

      function monthCell(firstDayOfWeek, isFirst) {
        var classNames = backgroundBy(firstDayOfWeek)
        var content = ''
        if(isFirst || firstDayOfWeek.getDate() <= 7) {
          classNames += ' monthName'
          content = locale.monthNames[firstDayOfWeek.getMonth()-1]
        } else if(firstDayOfWeek.getDate() <= 7 * 2 && firstDayOfWeek.getMonth() === 1) {
          content = firstDayOfWeek.getFullYear()
        }
        return Template._monthCell({ classNames: classNames, content: content })
      }

      function weekCell(firstDayOfWeek) {
        return Template.weekCell({
          classNames: backgroundBy(firstDayOfWeek),
          content: firstDayOfWeek.getWeekInYear('ISO')
        })
      }
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
