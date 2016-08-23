var $ = require('jquery')
var DateFormat = require('dateutils').DateFormat
var DateTime = require('dateutils').DateTime

module.exports = function(calendarContainer, calendarRange, locale, customScroll, disableWeekends, disabledDatesObject) {
  var dateCellMap = {}
  var dateCellDates = []
  const yearTitle = el('th', {className:'month'})
  const headerTable = el('table', {className: 'calendarHeader'}, headerRow(yearTitle))
  const bodyTable = el('table', {className: 'calendarBody', innerHTML: calendarBody()})
  const scrollContent = el('div', {className:'calendarScrollContent'}, bodyTable)
  calendarContainer.get(0).appendChild(headerTable)

  if(customScroll) {
    bodyTable.classList.add('overview')
    scrollContent.classList.add('viewport')
    calendarContainer.get(0).appendChild(el('div', {
      className: 'tinyscrollbar',
      innerHTML: '<div class="scrollbar"> <div class="track"> <div class="thumb"> <div class="end"></div> </div> </div> </div>'
    }, scrollContent))
  } else {
    calendarContainer.get(0).appendChild(scrollContent)
  }
  var dateCells = $('td.date', calendarContainer).get()
  highlightToday(dateCellMap)

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

  function headerRow(yearTitle) {
    const thead = el('thead')
    const tr = el('tr', {className:'month'}, yearTitle)
    tr.insertAdjacentHTML('beforeend', '<th class="week">&nbsp;</th>' + locale.dayNames.map(function(name, index) {
      return'<th class="weekDay">' + locale.shortDayNames[(index + locale.firstWeekday) % 7] + '</th>'
    }).join(''))
    thead.appendChild(tr)
    return thead
  }

  function highlightToday(dateCellMap) {
    var todayKey = DateFormat.format(DateTime.today(), 'Ymd', locale)
    if(todayKey in dateCellMap) {
      getDateCell(dateCellMap[todayKey]).addClass('today').wrapInner('<div>')
    }
  }

  function calendarBody() {
    var firstWeekDay = calendarRange.start.getFirstDateOfWeek(locale)
    var isFirst = true
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
      var tooltip = (locale.holidays && (date.toISODateString() in locale.holidays)) ? 'title="' + locale.holidays[date.toISODateString()] + '" ' : ''
      var cell = '<td class="' + dateStyles(date) + '" date-cell-index="' + dateCellDates.length + '" ' + tooltip + '>' + date.getDate() + '</td>'
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

  function holidayStyle(date) {
    var isSunday = date.getDay() === 0
    var isHoliday =  locale.holidays && (date.toISODateString() in locale.holidays)
    return (isSunday || isHoliday) ? 'holiday' : ''
  }

  function getDateCell(index) { return $(dateCells[index]) }

  function el(tagName, properties, childNode) {
    var elem = document.createElement(tagName)
    for(var i in properties) elem[i] = properties[i]
    if(childNode) elem.appendChild(childNode)
    return elem
  }

  function els(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector))
  }
}
