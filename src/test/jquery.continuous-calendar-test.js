/* ==============================================================================
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

describe('empty calendar of full year', function() {
  it('module init', function() {
    createCalendarContainer()
    createCalendarFromJanuary()
  })

  it('shows year', function() {
    assertHasValues('.continuousCalendar thead th.month', ['2008'])
  })

  it('shows week days', function() {
    assertHasValues('.continuousCalendar thead th.weekDay', [
      'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'
    ])
  })

  it('shows months', function() {
    assertHasValues('.monthName', [Date.monthNames[11]].concat(Date.monthNames))
  })

  it('shows month name on first row of full week', function() {
    var months = cal().find('tbody .month')
    var firstMonth = months.eq(1)
    expect(firstMonth).toHaveText('January')
    expect(firstMonth.next().next()).toHaveText('4')
    var secondMonth = months.eq(5)
    expect(secondMonth).toHaveText('February')
    expect(secondMonth.next().next()).toHaveText('1')
  })

  it('shows year for january', function() {
    var year = cal().find('.month').withText('January').eq(0).parent().next().find('.month').text()
    expect(year).toEqual('2009')
  })

  it('render week numbers', function() {
    expect(cal().find('.week').text()).toBeGreaterThan(0)
  })
})

describe('calendar bounds', function() {
  beforeEach(createCalendarContainer)

  it('lists given number of weeks before given date', function() {
    createCalendarFields({startDate: '4/18/2009'}).continuousCalendar({weeksBefore: 2, weeksAfter: 0})
    assertHasValues('.date', [
      29, 30, 31, 1, 2, 3, 4, 5,
      6, 7, 8, 9, 10, 11, 12,
      13, 14, 15, 16, 17, 18
    ])
  })

  it('lists given number of weeks after given date', function() {
    createCalendarFields({startDate: '4/18/2009'}).continuousCalendar({weeksBefore: 0, weeksAfter: 2})
    assertHasValues('.date', [
      12, 13, 14, 15, 16, 17, 18, 19,
      20, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 1, 2
    ])
  })

  it('if start date not selected show around current day instead', function() {
    createCalendarFields().continuousCalendar({weeksBefore: 0, weeksAfter: 0})
    expect(cal().find('.date').size()).toEqual(7)
    var weekDays = []
    var firstDay = Date.NOW.getFirstDateOfWeek(Date.SUNDAY)
    for(var i = 0; i < 7; i++) {
      weekDays.push(firstDay.plusDays(i).getDate())
    }
    assertHasValues('.date', weekDays)
    expect(cal().find('.selected').size()).toEqual(0)
  })

  it('disabled date is not selectable', function() {
    createCalendarFields().continuousCalendar({firstDate: '4/15/2009', lastDate: '5/9/2009', disableWeekends: true, disabledDates: '4/22/2009 4/29/2009'})
    clickOnDate(15)
    keepsSameDate()
    clickOnDate(13)
    keepsSameDate()
    clickOnDate(18)
    keepsSameDate()
    clickOnDate(19)
    keepsSameDate()
    clickOnDate(22)
    keepsSameDate()
    clickOnDate(29)
    keepsSameDate()

    function keepsSameDate() {
      expect(cal().find('.selected')).toHaveText(15)
    }
  })
})

describe('date picker calendar with day selected', function() {
  beforeEach(createCalendarContainer)

  it('calendar with no range has no range class', function() {
    createCalendarWithOneWeek()
    expect(cal().find('.calendarBody')).not.toHaveClass('range')
  })

  it('highlights selected date', function() {
    createCalendarFields({startDate: '4/30/2009'}).continuousCalendar({weeksBefore: 2, weeksAfter: 2})
    expect(cal().find('.selected')).toHaveText('30')
  })

  it('week number click on single date calendar does nothing', function() {
    createCalendarFields({startDate: '4/18/2009'}).continuousCalendar({weeksBefore: 2, weeksAfter: 0})
    cal().find('.week').withText(15).click()
    expect(cal().find('.selected').size()).toEqual(1)
  })
})

describe('calendar range selection', function() {
  beforeEach(createCalendarContainer)

  it('highlights selected date range with move handles in first and last data', function() {
    createRangeCalendarWithFiveWeeks()
    expect(cal().find('.selected').size()).toEqual(7)
    expect(cal().find('.rangeLengthLabel')).toHaveText('7 Days')
    expect(cal().find('.selected:first')).toHaveClass('rangeStart')
  })

  it('calendar with range has freeRange class', function() {
    createRangeCalendarWithFiveWeeks()
    expect(cal().find('.calendarBody')).toHaveClass('freeRange')
  })
})

describe('calendar events', function() {
  beforeEach(createCalendarContainer)

  it('highlights and selects clicked day', function() {
    createCalendarWithOneWeek()
    cal().find('.date:eq(1)').click()
    expect(cal().find('.selected')).toHaveText('28')
    expect(startFieldValue()).toEqual('4/28/2008')
    expect(startLabelValue()).toEqual('Mon 4/28/2008')
  })

  it('week number click selects whole week', function() {
    createRangeCalendarWithFiveWeeks()
    var weekNumber = cal().find('.week').withText(18)
    mouseClick(weekNumber)
    assertHasValues('.selected', [3, 4, 5, 6, 7, 8, 9])
    expect(startFieldValue()).toEqual('5/3/2009')
    expect(endFieldValue()).toEqual('5/9/2009')
    expect(cal().find('.rangeLengthLabel')).toHaveText('7 Days')
  })

  it('week number click selects whole week without weekend', function() {
    createRangeCalendarWithFiveWeeksAndDisabledWeekends()
    var weekNumber = cal().find('.week').withText(18)
    mouseClick(weekNumber)
    assertHasValues('.selected', [4, 5, 6, 7, 8])
    expect(startFieldValue()).toEqual('5/4/2009')
    expect(endFieldValue()).toEqual('5/8/2009')
    expect(cal().find('.rangeLengthLabel')).toHaveText('5 Days')
  })

  it('week number click selects whole week within the calendar range', function() {
    createRangeCalendarWithFiveWeeks()
    var weekNumber = cal().find('.week').withText(19)
    mouseClick(weekNumber)
    assertHasValues('.selected', [10, 11, 12])
    expect(startFieldValue()).toEqual('5/10/2009')
    expect(endFieldValue()).toEqual('5/12/2009')
    expect(cal().find('.rangeLengthLabel')).toHaveText('3 Days')
  })

  it('mouse click and drag highlights range and updates fields', function() {
    createRangeCalendarWithFiveWeeks()
    startTimer()
    dragDatesSlowly(15, 29)
    var duration = stopTimer()
    expect(cal().find('.selected').size()).toEqual(15, '(' + duration + ' ms)')
    expect(startFieldValue()).toEqual('4/15/2009')
    expect(endFieldValue()).toEqual('4/29/2009')
    expect(cal().find('.rangeLengthLabel')).toHaveText('15 Days')
  })

  it('mouse click and drag works with no initial selection', function() {
    createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({firstDate: '1/1/2009', lastDate: '2/1/2009'})
    dragDates(22, 23)
    expect(cal().find('.selected').size()).toEqual(2)
    expect(cal().find('.rangeLengthLabel')).toHaveText('2 Days')
  })

  it('mouse click on month on range calendar selects whole month', function() {
    createBigCalendar()
    var monthName = cal().find('.month').withText('May')
    mouseClick(monthName)
    expect(cal().find('.selected').size()).toEqual(31)
    var year = startFieldValue().split('/')[2]
    expect(startFieldValue()).toEqual('5/1/' + year)
    expect(endFieldValue()).toEqual('5/31/' + year)
    expect(cal().find('.rangeLengthLabel')).toHaveText('31 Days')
  })

  it('mouse click on month in single date calendar does nothing', function() {
    createBigCalendarForSingleDate()
    cal().find('.month').withText('May').click()
    expect(cal().find('.selected').size()).toEqual(0)
    expect(startFieldValue()).toEqual('')
  })

  it('range is movable', function() {
    createRangeCalendarWithFiveWeeks()
    dragDates(30, 27)
    assertHasValues('.selected', [26, 27, 28, 29, 30, 1, 2])
    expect(startFieldValue()).toEqual('4/26/2009')
    expect(endFieldValue()).toEqual('5/2/2009')
    dragDates(28, 29)
    assertHasValues('.selected', [27, 28, 29, 30, 1, 2, 3])
    expect(startFieldValue()).toEqual('4/27/2009')
    expect(startLabelValue()).toEqual('Mon 4/27/2009')
    expect(endFieldValue()).toEqual('5/3/2009')
  })

  it('range is expandable by clicking with shift key', function() {
    createRangeCalendarWithFiveWeeks()
    clickDateWithShift(7)
    assertHasValues('.selected', [ 29, 30, 1, 2, 3, 4, 5, 6, 7])
    clickDateWithShift(13)
    assertHasValues('.selected', [ 29, 30, 1, 2, 3, 4, 5, 6, 7])
    expect(cal().find('.disabled').size()).toEqual(7)
    //4/15/2009',lastDate:'5/12/2009
  })

  it('range has default of one year per direction', function() {
    createCalendarFields({startDate: '4/29/2009', endDate: '5/5/2009'}).continuousCalendar()
    expect(cal().find('.date').size()).toEqual(7 * (26 * 2 + 1))
  })

  it('highlights current date', function() {
    createBigCalendar()
    var cells = cal().find('.today')
    expect(cells.size()).toEqual(1)
    expect(cells).toHaveText('' + Date.NOW.getDate())
  })

  it('range has current day selected as default when configured so', function() {
    createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({weeksBefore: 20, lastDate: 'today', selectToday: true})
    expect(cal().find('.selected').size()).toEqual(1)
  })

  it('range can be specified with weeks and dates mixed', function() {
    createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({weeksBefore: 20, lastDate: 'today'})
    expect(cal().find('.week').length).toEqual(22)
  })

//TODO fails with IE7
  it('calendar executes callback-function and triggers event when date is picked', function() {
    function testFunction() {
      calendarCallBack++
    }

    bindCalled = 0
    window.calendarCallBack = 0
    createCalendarFields({startDate: ''}).continuousCalendar({firstDate: '4/26/2009', lastDate: '5/2/2009', callback: testFunction})
    cal().bind('calendarChange', function() {
      bindCalled++
    })
    clickOnDate(28)
    expect(bindCalled).toEqual(1, 'bind')
    expect(calendarCallBack).toEqual(2)
    //expect(window.calendarChanged).toEqual(2)
  })

  it('range calendar executes callback-function and triggers event when range is created or changed', function() {
    function testFunction(range) {
      window.calendarContainer = this
      window.calendarCallBack = range.days()
    }

    createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({firstDate: '4/26/2009', lastDate: '5/2/2009', callback: testFunction})
    cal().bind('calendarChange', function() {
      window.calendarChanged = $(this).find('.selected').length
    })
    expect(window.calendarCallBack).toEqual(0)
    dragDates(28, 29)
    expect(window.calendarCallBack).toEqual(2)
    expect(window.calendarContainer.find('.selected')).toHaveLength(2)
    expect(window.calendarChanged).toEqual(2)
  })

  it('calendar provides selection as public field', function() {
    createRangeCalendarWithFiveWeeks()
    expect(cal().calendarRange().days()).toEqual(7)
  })

  it('month and day names are localizable', function() {
    createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({firstDate: '1.1.2009', lastDate: '31.12.2009', locale: DATE_LOCALE_FI})
    assertHasValues('.continuousCalendar thead th.weekDay', ['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su'])
    assertHasValues('.monthName', [
      'joulukuu',
      'tammikuu',
      'helmikuu',
      'maaliskuu',
      'huhtikuu',
      'toukokuu',
      'kesäkuu',
      'heinäkuu',
      'elokuu',
      'syyskuu',
      'lokakuu',
      'marraskuu',
      'joulukuu'])
    mouseDownMouseUpOnDate(1)
    expect(startFieldValue()).toEqual('1.1.2009')
    expect(startLabelValue()).toEqual('to 1.1.2009')
  })

  it('forward drag after one day selection expands selection', function() {
    createRangeCalendarWithFiveWeeks()
    mouseDownMouseUpOnDate(16)
    assertHasValues('.selected', [16])

    dragDates(16, 18)
    assertHasValues('.selected', [16, 17, 18])

    mouseDownMouseUpOnDate(19)
    assertHasValues('.selected', [19])
    dragDates(19, 17)
    assertHasValues('.selected', [17, 18, 19])
  })

  it('date label click does nothing when not pop-up', function() {
    createRangeCalendarWithFiveWeeks()
    cal().find('.startDateLabel').click()
    expect(cal().find('.continuousCalendar')).toBeVisible()
  })
})

describe('pop-up calendar', function() {
  beforeEach(createCalendarContainer)

  it('', function() {
    createPopupCalendar()
    expect(cal().find('.continuousCalendar')).not.toBeVisible()
    expect(startLabelValue()).toEqual('Wed 4/29/2009', 'Initially selected date is shown correctly')
    cal().find('.calendarIcon').click()
    expect(cal().find('.continuousCalendar')).toBeVisible()
    //TODO fix this
    //assertHasValues('.continuousCalendar thead th.month', ['2008'], 'month is shown correctly')
  })

  it('when selecting date', function() {
    var previous = cal(1)
    createPopupCalendar()
    cal().find('.calendarIcon').click()
    cal().find('.date:first').click()
    expect(cal().find('.continuousCalendar')).not.toBeVisible()
    expect(previous.find('.continuousCalendar')).toBeVisible()
    expect(startLabelValue()).toEqual('Sun 10/26/2008')
    expect(startFieldValue()).toEqual('10/26/2008')
  })
})

describe('minimum range with disabled weekends', function() {
  beforeEach(function() {
    createCalendarContainer()
    createCalendarFields({startDate: '4/15/2009', endDate: '4/15/2009'})
      .continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009', minimumRange: 4, disableWeekends: true})
  })

  it('moving and creation has constraints', function() {
    assertHasValues('.selected', [17, 18, 19 , 20]) //initial range is in bounds

  })

  it('moving and creation has constraints', function() {
    dragDates(27, 27)
    assertHasValues('.selected', [27, 28, 29, 30]) //initial range has minimum required size
    dragDates(27, 28)
    assertHasValues('.selected', [27, 28, 29, 30]) //resizing to smaller that permitted from start is ignored
    dragDates(30, 29)
    assertHasValues('.selected', [27, 28, 29, 30]) //resizing to smaller that permitted from end is ignored
    dragDates(27, 26)
    assertHasValues('.selected', [27, 28, 29, 30]) //resizing to earlier skips weekends
    dragDates(30, 1)
    assertHasValues('.selected', [27, 28, 29, 30, 1]) //resizing to later is allowed if not on weekend
    dragDates(28, 29)
    assertHasValues('.selected', [27, 28, 29, 30, 1]) //no reaction when moving over weekend (snap to weekdays)
    dragDatesSlowly(28, 1)
    assertHasValues('.selected', [30, 1, 2, 3, 4]) //moving skips weekends
    dragDatesSlowly(3, 4)
    assertHasValues('.selected', [1, 2, 3, 4, 5]) //moving right allowed
    dragDatesSlowly(4, 3)
    assertHasValues('.selected', [30, 1, 2, 3, 4]) //moving left allowed
    mouseDownMouseUpOnDate(19)
    assertHasValues('.selected', [30, 1, 2, 3, 4]) //prevent selecting range that starts or ends on weekend
    mouseDownMouseUpOnDate(6)
    assertHasValues('.selected', [5, 6, 7, 8]) //selecting range that don't start or end on weekend id is permitted
  })
})

describe('calendar week selection', function() {
  beforeEach(createCalendarContainer)

  it('date click selects whole week', function() {
    createWeekCalendar()
    mouseClick(cal().find('.date').withText(21).first())
    assertHasValues('.selected', [19, 20, 21, 22, 23, 24, 25])
    expect(startFieldValue()).toEqual('4/19/2009')
    expect(endFieldValue()).toEqual('4/25/2009')
    expect(cal().find('.rangeLengthLabel')).toHaveText('7 Days')
  })

  it('date click selects whole week within calendar range', function() {
    createWeekCalendar()
    mouseClick(cal().find('.date').withText(15).first())
    assertHasValues('.selected', [15, 16, 17, 18])
    expect(startFieldValue()).toEqual('4/15/2009')
    expect(endFieldValue()).toEqual('4/18/2009')
    expect(cal().find('.rangeLengthLabel')).toHaveText('4 Days')
  })

  it('date click closes the calendar', function() {
    createPopupWeekCalendar()
    cal().find('.calendarIcon').click()
    mouseClick(cal().find('.date').withText(11))
    expect(cal().find('.continuousCalendar')).not.toBeVisible()
    expect(startFieldValue()).toEqual('5/8/2011')
    expect(endFieldValue()).toEqual('5/14/2011')
  })

  it('week click closes the calendar', function() {
    createPopupWeekCalendar()
    cal().find('.calendarIcon').click()
    mouseClick(cal().find('.week').withText(21))
    expect(cal().find('.continuousCalendar')).not.toBeVisible()
    expect(startFieldValue()).toEqual('5/29/2011')
    expect(endFieldValue()).toEqual('5/31/2011')

  })
})
describe('calendar trigger and callback', function() {
  beforeEach(createCalendarContainer)

  it('when using single date calendar', function() {
    var _this;
    var _arguments
    var container = createCalendarFields({startDate: '4/29/2009'})
      debugger
    container.trigger('calendarChange', function() {
      _this = this
      _arguments = arguments
    })
    container.continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009'})
    expect(_arguments).toHaveLength(2)
    expect(_this).toBe(container)
  })

  it('when using range calendar', function() {
    var container = createCalendarFields({startDate: '4/29/2009', endDate: '5/5/2009'})
    container.continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009'})
  })

  it('tear down', function() {
    $(window).scrollTop(9999999)
  })
})

function startTimer() {
  timerStart = new Date().getTime()
}

function stopTimer() {
  if(typeof timerStart == undefined) {
    return -1
  }
  return new Date().getTime() - timerStart
}
