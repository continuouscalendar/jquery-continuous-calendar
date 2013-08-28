define(function(require) {
  var DateTime = require('../main/DateTime')
  var DateRange = require('../main/DateRange')
  var DateFormat = require('../main/DateFormat')
  var DateLocale = require('../main/DateLocale')
  var $ = require('jquery')
  require('../main/jquery.continuousCalendar')

  describe('jquery.continuous-calendar', function() {
    describe('empty calendar of full year', function() {
      it('module init', function() {
        createCalendarContainer()
        createCalendarFromJanuary()
      })

      //TODO failing randomly
      it('shows year', function() {
        assertHasValues('.continuousCalendar thead th.month', ['2008'])
      })

      it('shows week days', function() {
        assertHasValues('.continuousCalendar thead th.weekDay', [
          'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'
        ])
      })

      it('shows months', function() {
        assertHasValues('.monthName', [DateLocale.EN.monthNames[11]].concat(DateLocale.EN.monthNames))
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
        var firstDay = DateTime.now().getFirstDateOfWeek(DateLocale.EN)
        for(var i = 0; i < 7; i++) {
          weekDays.push(firstDay.plusDays(i).getDate())
        }
        assertHasValues('.date', weekDays)
        expect(cal().find('.selected').size()).toEqual(0)
      })

      it('disabled date is not selectable', function() {
        createCalendarFields().continuousCalendar({firstDate: '4/15/2009', lastDate: '5/9/2009', disableWeekends: true, disabledDates: '4/22/2009 4/29/2009'})
        elemByDate(15).click()
        keepsSameDate()
        elemByDate(13).click()
        keepsSameDate()
        elemByDate(18).click()
        keepsSameDate()
        elemByDate(19).click()
        keepsSameDate()
        elemByDate(22).click()
        keepsSameDate()
        elemByDate(29).click()
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

      it('can be cleared', function() {
        createCalendarFields({startDate: '7/24/2013'}).continuousCalendar({weeksBefore: 2, weeksAfter: 0, allowClearDates: true})
        var clearDates = cal().find('.clearDates')
        expect(clearDates).toBeVisible()
        clearDates.click()
        expect(cal().find('.selected').size()).toEqual(0)
        expect(clearDates).not.toBeVisible()
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

      it('is cleared if a disabled date is inside the range', function() {
        createCalendarFields({startDate: '4/29/2009', endDate: '5/5/2009'}).continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009', disabledDates: '4/22/2009'})
        dragDatesSlowly(15, 29)
        expect(cal().find('.selected').size()).toEqual(0)
        expect(startFieldValue()).toEqual('')
        expect(endFieldValue()).toEqual('')
        expect(cal().find('.rangeLengthLabel')).toHaveText('0 Days')
      })

      it('can be cleared', function() {
        createCalendarFields({startDate: '7/24/2013', endDate: '8/5/2013'}).continuousCalendar({firstDate: '7/22/2009', lastDate: '8/7/2009', allowClearDates: true})
        var clearDates = cal().find('.clearDates')
        expect(clearDates).toBeVisible()
        clearDates.click()
        expect(cal().find('.selected').size()).toEqual(0)
        expect(clearDates).not.toBeVisible()
        expect(startFieldValue()).toEqual('')
        expect(endFieldValue()).toEqual('')
        expect(cal().find('.rangeLengthLabel')).toHaveText('0 Days')
      })
    })

    describe('calendar events', function() {
      beforeEach(createCalendarContainer)

      it('highlights and selects clicked day', function() {
        createCalendarWithOneWeek()
        cal().find('.date:eq(1)').click()
        expect(cal().find('.selected')).toHaveText('28')
        expect(startFieldValue()).toEqual('4/28/2008')
        expect(startLabelValue()).toEqual('Mo 4/28/2008')
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
        dragDatesSlowly(15, 29)
        expect(cal().find('.selected').size()).toEqual(15)
        expect(startFieldValue()).toEqual('4/15/2009')
        expect(endFieldValue()).toEqual('4/29/2009')
        expect(cal().find('.rangeLengthLabel')).toHaveText('15 Days')
      })

      describe('when current date is start or end of selection', function() {
        var today = DateTime.now()
        var todayStr = DateFormat.shortDateFormat(today)
        var weekAgo = today.minusDays(7)
        var weekAgoStr = DateFormat.shortDateFormat(weekAgo)
        var weekAhead = today.plusDays(7)
        var weekAheadStr = DateFormat.shortDateFormat(weekAhead)

        beforeEach(function() {
          createCalendarWithNoRange(weekAgoStr, weekAheadStr)
        })

        it('drag can start or end on current date', function() {
          dragDatesSlowly(today.getDate(), weekAhead.getDate())
          expect(cal().find('.selected').size()).toEqual(8)
          expect(startFieldValue()).toEqual(todayStr)
          expect(endFieldValue()).toEqual(weekAheadStr)
          expect(cal().find('.rangeLengthLabel')).toHaveText('8 Days')
          dragDatesSlowly(weekAgo.getDate(), today.getDate())
          expect(cal().find('.selected').size()).toEqual(8)
          expect(startFieldValue()).toEqual(weekAgoStr)
          expect(endFieldValue()).toEqual(todayStr)
          expect(cal().find('.rangeLengthLabel')).toHaveText('8 Days')
        })

        it('mouse click on current date selects current date', function() {
          elemByDate(today.getDate()).mousedown().mouseover().mouseup()
          expect(startFieldValue()).toEqual(todayStr)
          expect(endFieldValue()).toEqual(todayStr)
          expect(cal().find('.rangeLengthLabel')).toHaveText('1 Day')
        })
      })

      it('mouse click and drag works with no initial selection', function() {
        createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({firstDate: '1/1/2009', lastDate: '2/1/2009'})
        dragDates(22, 23)
        expect(cal().find('.selected').size()).toEqual(2)
        expect(cal().find('.rangeLengthLabel')).toHaveText('2 Days')
      })

      it('mouse click on month on range calendar selects whole month', function() {
        createCalendarFields({startDate: '', endDate: '' }).continuousCalendar({firstDate: '1/1/2009', lastDate: '3/1/2009'})
        var monthName = cal().find('.month').withText('February').last()
        mouseClick(monthName)
        expect(cal().find('.selected').size()).toEqual(28)
        var year = startFieldValue().split('/')[2]
        expect(startFieldValue()).toEqual('2/1/2009')
        expect(endFieldValue()).toEqual('2/28/2009')
        expect(cal().find('.rangeLengthLabel')).toHaveText('28 Days')
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
        expect(startLabelValue()).toEqual('Mo 4/27/2009')
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
        expect(cells).toHaveText('' + DateTime.now().getDate())
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
        elemByDate(28).click()
        expect(bindCalled).toEqual(1, 'bind')
        expect(calendarCallBack).toEqual(2)
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
        createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({firstDate: '1/1/2009', lastDate: '12/31/2009', locale: 'fi'})
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
        expect(startLabelValue()).toEqual('We 4/29/2009', 'Initially selected date is shown correctly')
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
        expect(startLabelValue()).toEqual('Su 10/26/2008')
        expect(startFieldValue()).toEqual('10/26/2008')
      })

      it('clearing closes the calendar', function() {
        createClearablePopupWeekCalendar()
        cal().find('.calendarIcon').click()
        cal().find('.clearDates').click()
        expect(cal().find('.continuousCalendar')).not.toBeVisible()
        expect(startFieldValue()).toEqual('')
        expect(endFieldValue()).toEqual('')
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
        var _this
        var _arguments
        var container = createCalendarFields({startDate: '4/29/2009'})
        container.bind('calendarChange', function() {
          _this = this
          _arguments = arguments
        })
        container.continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009'})
        expect(_arguments).toHaveLength(2)
        expect(_this).toBe(container.get(0))
      })

      it('when using range calendar', function() {
        var container = createCalendarFields({startDate: '4/29/2009', endDate: '5/5/2009'})
        container.continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009'})
      })

      it('tear down', function() {
        $(window).scrollTop(9999999)
      })
    })
  })
  $.fn.withText = function(text) {
    return this.filter(function() { return $(this).text() == text.toString() }).first()
  }
  var testIndex = 0

  function createCalendarContainer() {
    testIndex++
    var container = $('<div>').addClass('testCalendarContainer')
    var containerWrapper = $('<div>').addClass('containerWrapper')
    var suite_description = jasmine.currentEnv_.currentSpec.suite.description
    var description = jasmine.currentEnv_.currentSpec.description
    var index = $('<div></div>').append('<strong>' + suite_description + '</strong><br>' + description).addClass('testLabel')
    container.attr('id', calendarId())
    containerWrapper.append(index)
    containerWrapper.append(container)
    $('#calendars').append(containerWrapper)
  }

  function cal(delta) { return $('#' + calendarId(delta)) }

  function createCalendarFields(params) {
    var container = $('#' + calendarId())
    addFieldIfRequired('startDate')
    addFieldIfRequired('endDate')
    function addFieldIfRequired(fieldName) {
      if(params && params[fieldName] != undefined) {
        var field = $('<input>').attr('type', 'text').addClass(fieldName).val(params[fieldName])
        container.append(field)
      }
    }

    return container
  }

  function mouseClick(selector) {
    var targetElement = (typeof selector == 'object') ? selector : cal().find(selector)
    targetElement.mousedown().mouseup()
  }

  function clickDateWithShift(date) {
    elemByDate(date)
      .trigger({type: 'mousedown', shiftKey: true})
      .mouseover()
      .mouseup()
  }

  function mouseDownMouseUpOnDate(date) { elemByDate(date).mousedown().mouseover().mouseup() }

  function dragDates(enter, exit) {
    elemByDate(enter).mousedown()
    elemByDate(exit).mouseover().mouseup()
  }

  function dragDatesSlowly(enter, exit) {
    elemByDate(enter).mousedown()
    for(var day = enter; day < exit; day++) {
      elemByDate(day).mouseover()
    }
    elemByDate(exit).mouseover().mouseup()
  }

  function createCalendarWithOneWeek() { createCalendarFields({startDate: '4/30/2008'}).continuousCalendar({weeksBefore: 0, weeksAfter: 0}) }

  function createCalendarWithNoRange(start, end) { createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({firstDate: start, lastDate: end}) }

  function createRangeCalendarWithFiveWeeks() {
    createCalendarFields({startDate: '4/29/2009', endDate: '5/5/2009'}).continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009'})
  }

  function createRangeCalendarWithFiveWeeksAndDisabledWeekends() {
    createCalendarFields({startDate: '4/29/2009', endDate: '5/5/2009'}).continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009', disableWeekends: true})
  }

  function createWeekCalendar() {
    createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009', selectWeek: true})
  }

  function createBigCalendar() {
    var todayText = DateFormat.format(DateTime.now(), DateLocale.EN.shortDateFormat)
    createCalendarFields({startDate: todayText, endDate: todayText }).continuousCalendar({weeksBefore: 60, weeksAfter: 30})
  }

  function createBigCalendarForSingleDate() { createCalendarFields({startDate: ''}).continuousCalendar({weeksBefore: 20, weeksAfter: 20}) }

  function createCalendarFromJanuary() { createCalendarFields({startDate: ''}).continuousCalendar({firstDate: '1/1/2009', lastDate: '12/31/2009'}) }

  function createPopupCalendar() { createCalendarFields({startDate: '4/29/2009'}).continuousCalendar({isPopup: true}) }

  function createClearablePopupCalendar() { createCalendarFields({startDate: '7/24/2013'}).continuousCalendar({isPopup: true, allowClearDates: true}) }

  function createPopupWeekCalendar() {
    createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({firstDate: '5/1/2011', lastDate: '5/31/2011', isPopup: true, selectWeek: true})
  }

  function createClearablePopupWeekCalendar() {
    createCalendarFields({startDate: '7/23/2013', endDate: '7/25/2013'}).continuousCalendar({firstDate: '7/21/2011', lastDate: '8/6/2011', isPopup: true, selectWeek: true, allowClearDates: true})
  }

  function elemByDate(date) { return elemFromContainerByDate(cal(), date) }

  function elemFromContainerByDate(container, date) {
    var dateCell = container.find('.date')
    var divContent = dateCell.find('div').withText(date)
    return divContent.length === 0 ? dateCell.withText(date) : divContent
  }

  function calendarId(delta) { return 'continuousCalendar' + (testIndex - (delta || 0)) }

  function startFieldValue() { return cal().find('input.startDate').val() }

  function startLabelValue() { return cal().find('span.startDateLabel').text() }

  function endFieldValue() { return cal().find('input.endDate').val() }

  function click(selector) { $(selector).click() }

  function assertHasValues(selector, expectedArray) {
    expect($.map(cal().find(selector), function(elem) {
      return $(elem).text()
    })).toEqual($.map(expectedArray, function(i) { return i.toString() }))
  }
})

