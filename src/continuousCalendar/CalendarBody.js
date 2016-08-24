var $ = require('jquery')
var DateFormat = require('dateutils').DateFormat
var DateTime = require('dateutils').DateTime

module.exports = function(calendarContainer, calendarRange, locale, customScroll, disableWeekends, disabledDatesObject) {
  var dateCellMap = {}
  var dateCellDates = []
  var dateCells = []
  const yearTitle = el('th', {className:'month'})
  const headerTable = el('table', {className: 'calendarHeader'}, headerRow(yearTitle))
  const bodyTable = el('table', {className: 'calendarBody'}, calendarBody())
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
    const rows = document.createDocumentFragment()

    while(firstWeekDay.compareTo(calendarRange.end) <= 0) {
      rows.appendChild(calendarRow(firstWeekDay, isFirst))
      isFirst = false
      firstWeekDay = firstWeekDay.plusDays(7)
    }

    return el('tbody', {}, rows)

    function calendarRow(firstDayOfWeek, isFirst) {
      const row = el('tr', {}, monthCell(firstDayOfWeek, isFirst))
      row.appendChild(weekCell(firstDayOfWeek))
      for(var i = 0; i < 7; i++) {
        var date = firstDayOfWeek.plusDays(i)
        row.appendChild(dateCell(date))
      }
      return row
    }

    function dateCell(date) {
      const td = el('td', {
        className:         dateStyles(date),
        innerText:         date.getDate()
      })
      if(locale.holidays && (date.toISODateString() in locale.holidays))
        td.title = locale.holidays[date.toISODateString()]
      td.setAttribute('date-cell-index', String(dateCellDates.length))
      dateCellMap[DateFormat.format(date, 'Ymd', locale)] = dateCellDates.length
      dateCellDates.push(date)
      dateCells.push(td)
      return td
    }

    function monthCell(firstDayOfWeek, isFirst) {
      const showMonth = isFirst || firstDayOfWeek.getDate() <= 7
      const showYear = firstDayOfWeek.getDate() <= 7 * 2 && firstDayOfWeek.getMonth() === 1
      return el('th', {
        className: 'month ' + backgroundBy(firstDayOfWeek) + (showMonth ? ' monthName':''),
        innerText: (showMonth ? locale.monthNames[firstDayOfWeek.getMonth()-1] : (showYear ? firstDayOfWeek.getFullYear() : ''))
      })
    }

    function weekCell(firstDayOfWeek) {
      return el('th', {
        className: 'week ' + backgroundBy(firstDayOfWeek),
        innerText: firstDayOfWeek.getWeekInYear('ISO')
      })
    }
  }

  function dateStyles(date) {
    return ['date', backgroundBy(date), disabledOrNot(date), todayStyle(date), holidayStyle(date)]
      .filter(function(x) { return x}).join(' ')
  }

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
