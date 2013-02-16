/* ==============================================================================
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

;
(function(root, factory) {
  if(typeof define === 'function' && define.amd) {
    define(['jquery', 'jquery.tinyscrollbar', './DateFormat', './DateLocale', './DateRange', './DateTime'],
      function($, _tinyscrollbar, DateFormat, DateLocale, DateRange, DateTime) {
        return factory($, DateFormat, DateLocale, DateRange, DateTime)
      })
  } else {
    root.CalendarBody = factory(root.jQuery, root.DateFormat, root.DateLocale, root.DateRange, root.DateTime)
  }
})(this, function($, DateFormat, DateLocale, DateRange, DateTime) {
  return function(calendarContainer, params, startDate) {
    var firstWeekdayOfGivenDate = (startDate || DateTime.now()).getFirstDateOfWeek(params.locale)
    var rangeStart = params.firstDate ? DateFormat.parse(params.firstDate, params.locale) : firstWeekdayOfGivenDate.plusDays(-(params.weeksBefore * 7))
    var rangeEnd = params.lastDate ? DateFormat.parse(params.lastDate, params.locale) : firstWeekdayOfGivenDate.plusDays(params.weeksAfter * 7 + 6)

    var calendarRange = new DateRange(rangeStart, rangeEnd, params.locale)
    var headerTable = $('<table>').addClass('calendarHeader').append(headerRow())
    var bodyTable
    var scrollContent
    var dateCells
    var yearTitle
    var dateCellMap = {}
    var dateCellDates = []

    if(params.customScroll) {
      bodyTable = $('<table>').addClass('calendarBody').addClass('overview').append(calendarBody())
      scrollContent = $('<div>').addClass('calendarScrollContent').addClass('viewport').append(bodyTable)
      calendarContainer.append(headerTable)
        .append(
          $('<div class="tinyscrollbar"></div>')
            .append('<div class="scrollbar"> <div class="track"> <div class="thumb"> <div class="end"></div> </div> </div> </div>')
            .append(scrollContent))
    } else {
      bodyTable = $('<table>').addClass('calendarBody').append(calendarBody())
      scrollContent = $('<div>').addClass('calendarScrollContent').append(bodyTable)
      calendarContainer.append(headerTable).append(scrollContent)
    }
    dateCells = $('td.date', calendarContainer).get()
    highlightToday(dateCellMap)
    yearTitle = $('th.month', headerTable)

    return {
      bodyTable    : bodyTable,
      scrollContent: scrollContent,
      dateCells    : dateCells,
      yearTitle    : yearTitle,
      dateCellMap  : dateCellMap,
      dateCellDates: dateCellDates,
      dateStyles   : dateStyles,
      calendarRange: calendarRange,
      getDateCell  : getDateCell
    }

    function headerRow() {
      var tr = $('<tr>').append(yearCell())
      tr.append($('<th class="week">&nbsp;</th>'))
      $(params.locale.dayNames).each(function(index) {
        //TODO move to DateLocale
        var weekDay = $('<th>').append(params.locale.dayNames[(index + params.locale.firstWeekday) % 7].substr(0, 2)).addClass('weekDay')
        tr.append(weekDay)
      })
      return $('<thead>').append(tr)
      function yearCell() { return $('<th>').addClass('month').append(firstWeekdayOfGivenDate.getFullYear()) }
    }

    function highlightToday(dateCellMap) {
      var todayKey = DateFormat.format(DateTime.now(), 'Ymd', params.locale)
      if(todayKey in dateCellMap) {
        getDateCell(dateCellMap[todayKey]).addClass('today').wrapInner('<div>')
      }
    }

    function calendarBody() {
      var firstWeekDay = calendarRange.start.getFirstDateOfWeek(params.locale)
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
        var dateCell = '<td class="' + dateStyles(date) + '" date-cell-index="' + dateCellDates.length + '">' + date.getDate() + '</td>'
        dateCellMap[DateFormat.format(date, 'Ymd', params.locale)] = dateCellDates.length
        dateCellDates.push(date)
        return dateCell
      }

      function monthCell(firstDayOfWeek, isFirst) {
        var th = '<th class="month ' + backgroundBy(firstDayOfWeek)
        if(isFirst || firstDayOfWeek.getDate() <= 7) {
          th += ' monthName">'
          th += params.locale.monthNames[firstDayOfWeek.getMonth()]
        } else {
          th += '">'
          if(firstDayOfWeek.getDate() <= 7 * 2 && firstDayOfWeek.getMonth() == 0) {
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
      var disabledWeekendDay = params.disableWeekends && date.isWeekend()
      var disabledDay = params.disabledDates[date.getOnlyDate().date]
      var outOfBounds = !calendarRange.hasDate(date)
      return outOfBounds || disabledWeekendDay || disabledDay ? 'disabled' : ''
    }

    function todayStyle(date) { return date.isToday() ? 'today' : '' }

    function holidayStyle(date) { return date.getDay() == 0 ? 'holiday' : '' }

    function getDateCell(index) { return $(dateCells[index]) }
  }
})

