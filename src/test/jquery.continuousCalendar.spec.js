define(function(require, _exports, module) {
  var DateTime = require('../main/DateTime')
  var DateRange = require('../main/DateRange')
  var DateFormat = require('../main/DateFormat')
  var DateLocale = require('../main/DateLocale')
  var $ = require('jquery')
  require('../main/jquery.continuousCalendar')

  describe(module.id, function() {
    describe('empty calendar of full year', function() {
      before(function() {
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
        expect(firstMonth).to.have.text('January')
        expect(firstMonth.next().next()).to.have.text('4')
        var secondMonth = months.eq(5)
        expect(secondMonth).to.have.text('February')
        expect(secondMonth.next().next()).to.have.text('1')
      })

      it('shows year for january', function() {
        var year = cal().find('.month').withText('January').eq(0).parent().next().find('.month').text()
        expect(year).to.equal('2009')
      })

      it('render week numbers', function() {
        expect(cal().find('.week').text()).to.be.above(0)
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
        expect(cal().find('.date').size()).to.equal(7)
        var weekDays = []
        var firstDay = DateTime.now().getFirstDateOfWeek(DateLocale.EN)
        for(var i = 0; i < 7; i++) {
          weekDays.push(firstDay.plusDays(i).getDate())
        }
        assertHasValues('.date', weekDays)
        expect(cal().find('.selected').size()).to.equal(0)
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
          expect(cal().find('.selected')).to.have.text('15')
        }
      })
    })

    describe('date picker calendar with day selected', function() {
      beforeEach(createCalendarContainer)

      it('calendar with no range has no range class', function() {
        createCalendarWithOneWeek()
        expect(cal().find('.calendarBody')).not.to.have.class('range')
      })

      it('highlights selected date', function() {
        createCalendarFields({startDate: '4/30/2009'}).continuousCalendar({weeksBefore: 2, weeksAfter: 2})
        expect(cal().find('.selected')).to.have.text('30')
      })

      it('week number click on single date calendar does nothing', function() {
        createCalendarFields({startDate: '4/18/2009'}).continuousCalendar({weeksBefore: 2, weeksAfter: 0})
        cal().find('.week').withText(15).click()
        expect(cal().find('.selected').size()).to.equal(1)
      })

      it('can be cleared', function() {
        createCalendarFields({startDate: '7/24/2013'}).continuousCalendar({weeksBefore: 2, weeksAfter: 0, allowClearDates: true})
        var clearDates = cal().find('.clearDates')
        expect(clearDates).to.be.visible
        clearDates.click()
        expect(cal().find('.selected').size()).to.equal(0)
        expect(clearDates).not.to.be.visible
      })
    })

    describe('calendar range selection', function() {
      beforeEach(createCalendarContainer)

      it('highlights selected date range with move handles in first and last data', function() {
        createRangeCalendarWithFiveWeeks()
        expect(cal().find('.selected').size()).to.equal(7)
        expect(cal().find('.rangeLengthLabel')).to.have.text('7 Days')
        expect(cal().find('.selected:first')).to.have.class('rangeStart')
      })

      it('calendar with range has freeRange class', function() {
        createRangeCalendarWithFiveWeeks()
        expect(cal().find('.calendarBody')).to.have.class('freeRange')
      })

      it('is cleared if a disabled date is inside the range', function() {
        createCalendarFields({startDate: '4/29/2009', endDate: '5/5/2009'}).continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009', disabledDates: '4/22/2009', isRange: true})
        dragDatesSlowly(15, 29)
        expect(cal().find('.selected').size()).to.equal(0)
        expect(startFieldValue()).to.equal('')
        expect(endFieldValue()).to.equal('')
        expect(cal().find('.rangeLengthLabel')).to.have.text('0 Days')
      })

      it('can be cleared', function() {
        createCalendarFields({startDate: '7/24/2013', endDate: '8/5/2013'}).continuousCalendar({firstDate: '7/22/2009', lastDate: '8/7/2009', allowClearDates: true, isRange: true})
        var clearDates = cal().find('.clearDates')
        expect(clearDates).to.be.visible
        clearDates.click()
        expect(cal().find('.selected').size()).to.equal(0)
        expect(clearDates).not.to.be.visible
        expect(startFieldValue()).to.equal('')
        expect(endFieldValue()).to.equal('')
        expect(cal().find('.rangeLengthLabel')).to.have.text('0 Days')
      })

      it('does not throw an error when range selection is dragged outside of calendar', function() {
        createCalendarWithNoRange('7/14/2013', '7/26/2013')
        dragOutsideCalendar(15)
      })

      it('changes its selection when opening according to start and end fields', function() {
        createPopupRangeCalendar('12/15/2013', '2/22/2014')
        setStartFieldValue('1/14/2014')
        setEndFieldValue('1/16/2014')
        cal().find('.calendarIcon').click()
        assertHasValues('.selected', [14, 15, 16])
        expect(startLabelValue()).to.equal('Tu 1/14/2014')
        expect(endLabelValue()).to.equal('Th 1/16/2014')
      })
    })

    describe('calendar events', function() {
      beforeEach(createCalendarContainer)

      it('highlights and selects clicked day', function() {
        createCalendarWithOneWeek()
        cal().find('.date:eq(1)').click()
        expect(cal().find('.selected')).to.have.text('28')
        expect(startFieldValue()).to.equal('4/28/2008')
        expect(startLabelValue()).to.equal('Mo 4/28/2008')
      })

      it('week number click selects whole week', function() {
        createRangeCalendarWithFiveWeeks()
        var weekNumber = cal().find('.week').withText(18)
        mouseClick(weekNumber)
        assertHasValues('.selected', [3, 4, 5, 6, 7, 8, 9])
        expect(startFieldValue()).to.equal('5/3/2009')
        expect(endFieldValue()).to.equal('5/9/2009')
        expect(cal().find('.rangeLengthLabel')).to.have.text('7 Days')
      })

      it('week number click selects whole week without weekend', function() {
        createRangeCalendarWithFiveWeeksAndDisabledWeekends()
        var weekNumber = cal().find('.week').withText(18)
        mouseClick(weekNumber)
        assertHasValues('.selected', [4, 5, 6, 7, 8])
        expect(startFieldValue()).to.equal('5/4/2009')
        expect(endFieldValue()).to.equal('5/8/2009')
        expect(cal().find('.rangeLengthLabel')).to.have.text('5 Days')
      })

      it('week number click selects whole week within the calendar range', function() {
        createRangeCalendarWithFiveWeeks()
        var weekNumber = cal().find('.week').withText(19)
        mouseClick(weekNumber)
        assertHasValues('.selected', [10, 11, 12])
        expect(startFieldValue()).to.equal('5/10/2009')
        expect(endFieldValue()).to.equal('5/12/2009')
        expect(cal().find('.rangeLengthLabel')).to.have.text('3 Days')
      })

      it('mouse click and drag highlights range and updates fields', function() {
        createRangeCalendarWithFiveWeeks()
        dragDatesSlowly(15, 29)
        expect(cal().find('.selected').size()).to.equal(15)
        expect(startFieldValue()).to.equal('4/15/2009')
        expect(endFieldValue()).to.equal('4/29/2009')
        expect(cal().find('.rangeLengthLabel')).to.have.text('15 Days')
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
          expect(cal().find('.selected').size()).to.equal(8)
          expect(startFieldValue()).to.equal(todayStr)
          expect(endFieldValue()).to.equal(weekAheadStr)
          expect(cal().find('.rangeLengthLabel')).to.have.text('8 Days')
          dragDatesSlowly(weekAgo.getDate(), today.getDate())
          expect(cal().find('.selected').size()).to.equal(8)
          expect(startFieldValue()).to.equal(weekAgoStr)
          expect(endFieldValue()).to.equal(todayStr)
          expect(cal().find('.rangeLengthLabel')).to.have.text('8 Days')
        })

        it('mouse click on current date selects current date', function() {
          elemByDate(today.getDate()).mousedown().mouseover().mouseup()
          expect(startFieldValue()).to.equal(todayStr)
          expect(endFieldValue()).to.equal(todayStr)
          expect(cal().find('.rangeLengthLabel')).to.have.text('1 Day')
        })
      })

      it('mouse click and drag works with no initial selection', function() {
        createCalendarFields().continuousCalendar({firstDate: '1/1/2009', lastDate: '2/1/2009', isRange: true})
        dragDates(22, 23)
        expect(cal().find('.selected').size()).to.equal(2)
        expect(cal().find('.rangeLengthLabel')).to.have.text('2 Days')
      })

      it('mouse click on month on range calendar selects whole month', function() {
        createCalendarFields().continuousCalendar({firstDate: '1/1/2009', lastDate: '3/1/2009', isRange: true})
        var monthName = cal().find('.month').withText('February').last()
        mouseClick(monthName)
        expect(cal().find('.selected').size()).to.equal(28)
        expect(startLabelValue()).to.equal('Su 2/1/2009')
        expect(endLabelValue()).to.equal('Sa 2/28/2009')
        expect(cal().find('.rangeLengthLabel')).to.have.text('28 Days')
      })

      it('mouse click on month in single date calendar does nothing', function() {
        createBigCalendarForSingleDate()
        cal().find('.month').withText('May').click()
        expect(cal().find('.selected').size()).to.equal(0)
        expect(startFieldValue()).to.equal('')
      })

      it('range is movable', function() {
        createRangeCalendarWithFiveWeeks()
        dragDates(30, 27)
        assertHasValues('.selected', [26, 27, 28, 29, 30, 1, 2])
        expect(startFieldValue()).to.equal('4/26/2009')
        expect(endFieldValue()).to.equal('5/2/2009')
        dragDates(28, 29)
        assertHasValues('.selected', [27, 28, 29, 30, 1, 2, 3])
        expect(startFieldValue()).to.equal('4/27/2009')
        expect(startLabelValue()).to.equal('Mo 4/27/2009')
        expect(endFieldValue()).to.equal('5/3/2009')
      })

      it('range is expandable by clicking with shift key', function() {
        createRangeCalendarWithFiveWeeks()
        clickDateWithShift(7)
        assertHasValues('.selected', [ 29, 30, 1, 2, 3, 4, 5, 6, 7])
        clickDateWithShift(13)
        assertHasValues('.selected', [ 29, 30, 1, 2, 3, 4, 5, 6, 7])
        expect(cal().find('.disabled').size()).to.equal(7)
        //4/15/2009',lastDate:'5/12/2009
      })

      it('range has default of one year per direction', function() {
        createCalendarFields({startDate: '4/29/2009', endDate: '5/5/2009'}).continuousCalendar({isRange: true})
        expect(cal().find('.date').size()).to.equal(7 * (26 * 2 + 1))
      })

      it('highlights current date', function() {
        createBigCalendar()
        var cells = cal().find('.today')
        expect(cells.size()).to.equal(1)
        expect(cells).to.have.text('' + DateTime.now().getDate())
      })

      it('range has current day selected as default when configured so', function() {
        createCalendarFields().continuousCalendar({weeksBefore: 20, lastDate: 'today', selectToday: true, isRange: true})
        expect(cal().find('.selected').size()).to.equal(1)
      })

      it('range can be specified with weeks and dates mixed', function() {
        createCalendarFields().continuousCalendar({weeksBefore: 20, lastDate: 'today', isRange: true})
        expect(cal().find('.week').length).to.equal(22)
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
        expect(bindCalled).to.equal(1, 'bind')
        expect(calendarCallBack).to.equal(2)
      })

      it('range calendar executes callback-function and triggers event when range is created or changed', function() {
        function testFunction(range) {
          window.calendarContainer = this
          window.calendarCallBack = range.days()
        }

        createCalendarFields().continuousCalendar({firstDate: '4/26/2009', lastDate: '5/2/2009', callback: testFunction, isRange: true})
        cal().bind('calendarChange', function() {
          window.calendarChanged = $(this).find('.selected').length
        })
        expect(window.calendarCallBack).to.equal(0)
        dragDates(28, 29)
        expect(window.calendarCallBack).to.equal(2)
        expect(window.calendarContainer.find('.selected')).toHaveLength(2)
        expect(window.calendarChanged).to.equal(2)
      })

      it('calendar provides selection as public field', function() {
        createRangeCalendarWithFiveWeeks()
        expect(cal().calendarRange().days()).to.equal(7)
      })

      it('month and day names are localizable', function() {
        createCalendarFields().continuousCalendar({firstDate: '1/1/2009', lastDate: '12/31/2009', locale: 'fi', isRange: true})
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
        expect(startLabelValue()).to.equal('to 1.1.2009')
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
        expect(cal().find('.continuousCalendar')).to.be.visible
      })
    })

    describe('pop-up calendar', function() {
      beforeEach(createCalendarContainer)

      it('', function() {
        createPopupCalendar()
        expect(cal().find('.continuousCalendar')).not.to.be.visible
        expect(startLabelValue()).to.equal('We 4/29/2009')
        cal().find('.calendarIcon').click()
        expect(cal().find('.continuousCalendar')).to.be.visible
        //TODO fix this
        //assertHasValues('.continuousCalendar thead th.month', ['2008'], 'month is shown correctly')
      })

      it('when selecting date', function() {
        var previous = cal(1)
        createPopupCalendar()
        cal().find('.calendarIcon').click()
        cal().find('.date:first').click()
        expect(cal().find('.continuousCalendar')).not.to.be.visible
        expect(previous.find('.continuousCalendar')).to.be.visible
        expect(startLabelValue()).to.equal('Su 10/26/2008')
        expect(startFieldValue()).to.equal('10/26/2008')
        expect(cal().calendarRange().date).to.eql(DateTime.fromDate(2008, 10, 26).date)
      })

      it('clearing closes the calendar', function() {
        createClearablePopupWeekCalendar()
        cal().find('.calendarIcon').click()
        cal().find('.clearDates').click()
        expect(cal().find('.continuousCalendar')).not.to.be.visible
        expect(startFieldValue()).to.equal('')
        expect(endFieldValue()).to.equal('')
      })

      it('changes its selection when opening according to start field value', function() {
        createCalendarFields({startDate: ''}).continuousCalendar({isPopup: true, locale: 'fi'})
        setStartFieldValue('16.12.2013')
        cal().find('.calendarIcon').click()
        assertHasValues('.selected', [16])
        expect(startLabelValue()).to.equal('ma 16.12.2013')
      })
    })

    describe('minimum range with disabled weekends', function() {
      beforeEach(function() {
        createCalendarContainer()
        createCalendarFields({startDate: '4/15/2009', endDate: '4/15/2009'})
          .continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009', minimumRange: 4, disableWeekends: true, isRange: true})
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
        expect(startLabelValue()).to.equal('Su 4/19/2009')
        expect(endLabelValue()).to.equal('Sa 4/25/2009')
        expect(cal().find('.rangeLengthLabel')).to.have.text('7 Days')
      })

      it('date click selects whole week within calendar range', function() {
        createWeekCalendar()
        mouseClick(cal().find('.date').withText(15).first())
        assertHasValues('.selected', [15, 16, 17, 18])
        expect(startLabelValue()).to.equal('We 4/15/2009')
        expect(endLabelValue()).to.equal('Sa 4/18/2009')
        expect(cal().find('.rangeLengthLabel')).to.have.text('4 Days')
      })

      it('date click closes the calendar', function() {
        createPopupWeekCalendar()
        cal().find('.calendarIcon').click()
        mouseClick(cal().find('.date').withText(11))
        expect(cal().find('.continuousCalendar')).not.to.be.visible
        expect(startLabelValue()).to.equal('Su 5/8/2011')
        expect(endLabelValue()).to.equal('Sa 5/14/2011')
      })

      it('week click closes the calendar', function() {
        createPopupWeekCalendar()
        cal().find('.calendarIcon').click()
        mouseClick(cal().find('.week').withText(21))
        expect(cal().find('.continuousCalendar')).not.to.be.visible
        expect(startFieldValue()).to.equal('5/29/2011')
        expect(endFieldValue()).to.equal('5/31/2011')

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
        expect(_this).to.eql(container.get(0))
      })

      it('when using range calendar', function() {
        var container = createCalendarFields({startDate: '4/29/2009', endDate: '5/5/2009'})
        container.continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009', isRange: true})
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
    var currentTest = mocha.suite.ctx.currentTest
    var suite_description = currentTest.parent.title
    var description = currentTest.title
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

  function dragOutsideCalendar(enter) {
    elemByDate(enter).mousedown()
    cal().find(".monthName").mouseover()
  }

  function createCalendarWithOneWeek() { createCalendarFields({startDate: '4/30/2008'}).continuousCalendar({weeksBefore: 0, weeksAfter: 0}) }

  function createCalendarWithNoRange(start, end) { createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({firstDate: start, lastDate: end, isRange: true}) }

  function createRangeCalendarWithFiveWeeks() {
    createCalendarFields({startDate: '4/29/2009', endDate: '5/5/2009'}).continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009', isRange: true})
  }

  function createRangeCalendarWithFiveWeeksAndDisabledWeekends() {
    createCalendarFields({startDate: '4/29/2009', endDate: '5/5/2009'}).continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009', disableWeekends: true, isRange: true})
  }

  function createWeekCalendar() {
    createCalendarFields().continuousCalendar({firstDate: '4/15/2009', lastDate: '5/12/2009', selectWeek: true, isRange: true})
  }

  function createBigCalendar() {
    var todayText = DateFormat.format(DateTime.now(), DateLocale.EN.shortDateFormat)
    createCalendarFields({startDate: todayText, endDate: todayText }).continuousCalendar({weeksBefore: 60, weeksAfter: 30, isRange: true})
  }

  function createBigCalendarForSingleDate() { createCalendarFields({startDate: ''}).continuousCalendar({weeksBefore: 20, weeksAfter: 20}) }

  function createCalendarFromJanuary() { createCalendarFields({startDate: ''}).continuousCalendar({firstDate: '1/1/2009', lastDate: '12/31/2009'}) }

  function createPopupCalendar() { createCalendarFields({startDate: '4/29/2009'}).continuousCalendar({isPopup: true}) }

  function createPopupRangeCalendar(start, end) { createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({firstDate: start, lastDate: end, isPopup: true, isRange: true}) }

  function createPopupWeekCalendar() {
    createCalendarFields({startDate: '', endDate: ''}).continuousCalendar({firstDate: '5/1/2011', lastDate: '5/31/2011', isPopup: true, selectWeek: true, isRange: true})
  }

  function createClearablePopupWeekCalendar() {
    createCalendarFields({startDate: '7/23/2013', endDate: '7/25/2013'}).continuousCalendar({firstDate: '7/21/2011', lastDate: '8/6/2011', isPopup: true, selectWeek: true, allowClearDates: true, isRange: true})
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

  function endLabelValue() { return cal().find('span.endDateLabel').text() }

  function click(selector) { $(selector).click() }

  function setStartFieldValue(value) { return cal().find('input.startDate').val(value) }

  function setEndFieldValue(value) { return cal().find('input.endDate').val(value) }

  function assertHasValues(selector, expectedArray) {
    expect($.map(cal().find(selector), function(elem) {
      return $(elem).text()
    })).to.eql($.map(expectedArray, function(i) { return i.toString() }))
  }
})
