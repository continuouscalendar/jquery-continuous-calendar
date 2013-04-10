define(function(require) {
  var DateTime = require('../main/DateTime')
  var DateRange = require('../main/DateRange')
  var DateFormat = require('../main/DateFormat')
  var DateLocale = require('../main/DateLocale')

  describe('DateRange', function() {
    var range
    var start
    var end
    var outerRange

    describe('date range default behavior', function() {
      beforeEach(resetRange)

      it('creates range of three days', function() {
        expect(range.start).toEqual(start)
        expect(range.end).toEqual(end)
        expect(range.days()).toEqual(3)
        expect(range).not.toHaveDate('09/9/2009')
        expect(range).toHaveDate('09/10/2009')
        expect(range).toHaveDate('09/11/2009')
        expect(range).toHaveDate('09/12/2009')
        expect(range).not.toHaveDate('09/13/2009')
        expect(DateFormat.formatRange(range, DateLocale.FI)).toEqual('10.9.2009 - 12.9.2009')
      })

      it('range is movable', function() {
        var twoDaysAfter = range.shiftDays(2)
        expect(twoDaysAfter.start.getDate()).toEqual(12)
        expect(twoDaysAfter.end.getDate()).toEqual(12 + 2)
      })

      it('range is expandable', function() {
        expect(range.expandTo(new DateTime('09/15/2009')).days()).toEqual(6)
      })

      it('two ranges can do interception', function() {
        expect(range.and(createRange('09/11/2009', '09/19/2009')).days()).toEqual(2)
        expect(range.and(createRange('09/16/2009', '09/19/2009')).days()).toEqual(0)
      })

      it('range can be asked if it is a subset of another range', function() {
        expect(range).toBeInside(range)
        expect(range).not.toBeInside(range.shiftDays(1))
        expect(range).toBeInside(range.expandDaysTo(7))
        expect(range.expandDaysTo(7)).not.toBeInside(range)
      })
    })

    describe('moving date range within outer range', function() {
      beforeEach(resetOuterRange)

      it('range already inside outer range is not moved', function() {
        var range1 = createRange('04/04/2011', '04/10/2011')
        var range2 = range1.shiftInside(outerRange)
        expect(range1).toBeInside(outerRange)
        expect(range2).toBeInside(outerRange)
        expect(range1.start.getDate()).toEqual(range2.start.getDate())
        expect(range1.end.getDate()).toEqual(range2.end.getDate())
      })

      it('range can be moved forward inside outer range', function() {
        var range1 = createRange('03/15/2011', '03/21/2011')
        var range2 = range1.shiftInside(outerRange)
        expect(range1).not.toBeInside(outerRange)
        expect(range2).toBeInside(outerRange)
        expect(range2.start.getDate()).toEqual(28)
        expect(range2.end.getDate()).toEqual(3)
      })

      it('range can be moved backward inside outer range', function() {
        var range1 = createRange('04/28/2011', '05/04/2011')
        var range2 = range1.shiftInside(outerRange)
        expect(range1).not.toBeInside(outerRange)
        expect(range2).toBeInside(outerRange)
        expect(range2.start.getDate()).toEqual(25)
        expect(range2.end.getDate()).toEqual(1)
      })

      it('range longer than outer range cannot be moved', function() {
        var range1 = new DateRange(outerRange.start.minusDays(1), outerRange.end.plusDays(1))
        var range2 = range1.shiftInside(outerRange)
        expect(range2.days()).toEqual(0)
      })
    })

    describe('date range with minimum size within outer range', function() {
      beforeEach(resetOuterRange)

      it('range can be requested near the beginning of outer range', function() {
        var oldRange = createRange('03/28/2011', '04/03/2011')
        var newRange = DateRange.rangeWithMinimumSize(oldRange, 7, true, outerRange)
        expect(newRange.days()).toEqual(7)
        expect(newRange.start.getDate()).toEqual(29)
        expect(newRange.end.getDate()).toEqual(4)
      })

      it('range can be requested near the end of outer range', function() {
        var oldRange = createRange('04/25/2011', '04/25/2011')
        var newRange = DateRange.rangeWithMinimumSize(oldRange, 7, false, outerRange)
        expect(newRange.days()).toEqual(7)
      })

      it('range cannot be requested to be outside outer range', function() {
        var oldRange = createRange('04/26/2011', '04/26/2011')
        var newRange = DateRange.rangeWithMinimumSize(oldRange, 7, false, outerRange)
        expect(newRange.days()).toEqual(0)
      })

      it('range may not be found near the end of outer range due to weekends', function() {
        var oldRange = createRange('04/24/2011', '04/24/2011')
        var newRange = DateRange.rangeWithMinimumSize(oldRange, 7, true, outerRange)
        expect(newRange.days()).toEqual(0)
      })

      it('does not expand an empty range', function() {
        var oldRange = DateRange.emptyRange()
        var newRange = DateRange.rangeWithMinimumSize(oldRange, 7, true, outerRange)
        expect(newRange.days()).toEqual(0)
      })
    })

    describe('date range with time behavior', function() {
      beforeEach(resetRange)

      it('date range can have times', function() {
        var rangeWithTimes = range.withTimes('10:00', '14:45')
        expect(rangeWithTimes.days()).toEqual(2)
        expect(rangeWithTimes.hours()).toEqual(4)
        expect(rangeWithTimes.minutes()).toEqual(45)
        expect(DateFormat.formatRange(rangeWithTimes, DateLocale.FI)).toEqual('2 päivää 4,75 tuntia')
        expect(DateFormat.formatRange(new DateRange(range.start, range.end).withTimes('10:00', '14:45'), DateLocale.EN)).toEqual('2 Days 4.75 Hours')
        var rangeWithPmTimes = range.withTimes('17:00', '16:00')
        expect(rangeWithPmTimes.days()).toEqual(1)
        expect(rangeWithPmTimes.hours()).toEqual(23)
        expect(rangeWithPmTimes.minutes()).toEqual(0)
        range.start = range.start.plusDays(1)
        expect(DateFormat.formatRange(range.withTimes('10:00', '11:00'), DateLocale.FI)).toEqual('1 päivä 1 tunti')
        expect(DateFormat.formatRange(new DateRange(range.start, range.end).withTimes('10:00', '11:00'), DateLocale.EN)).toEqual('1 Day 1 Hour')
      })

      it('one day range with start time after end time is not valid', function() {
        expect(range).toBeValidRange()
        range.start = new DateTime('09/13/2009')
        expect(range).not.toBeValidRange()
        range.start = new DateTime('09/12/2009')
        expect(range).toBeValidRange()
        range = range.withTimes('15:00', '14:30')
        expect(range).not.toBeValidRange()
        range = range.withTimes('15:00', '15:00')
        expect(range).toBeValidRange()
        range = range.withTimes('15:00', '15:30')
        expect(range).toBeValidRange()
      })

      it('invalid time will make range invalid while keeping date information', function() {
        range = range.withTimes('15:00', '15:30')
        expect(range).toBeValidRange()

        range = range.withTimes('', '15:30')
        expect(range).not.toBeValidRange()

        range = range.withTimes('15:00', '15:30')
        expect(range).toBeValidRange()

        range = range.withTimes('asdf', 'fddd')
        expect(range).not.toBeValidRange()

        range = range.withTimes('00', '25')
        expect(range).not.toBeValidRange()

      })

      it('different time formats are accepted', function() {
        assertHasCorrectHoursAndMinutes(range.withTimes('15:00', '16:10'), 1, 10)
        assertHasCorrectHoursAndMinutes(range.withTimes('14.00', '16.20'), 2, 20)
        assertHasCorrectHoursAndMinutes(range.withTimes('13,00', '16,30'), 3, 30)
        assertHasCorrectHoursAndMinutes(range.withTimes('1200', '1640'), 4, 40)
        assertHasCorrectHoursAndMinutes(range.withTimes('830', '1240'), 4, 10)
        assertHasCorrectHoursAndMinutes(range.withTimes('08', '13'), 5, 0)
      })

      it('minutes are rounded to 2 digits', function() {
        var rangeWithTimes = range.withTimes('15:00', '16:10');
        assertHasCorrectHoursAndMinutes(rangeWithTimes, 1, 10)
        expect(DateFormat.formatRange(rangeWithTimes, DateLocale.FI)).toEqual('2 päivää 1,17 tuntia')
      })

      it('range is displayed with the most defining unit', function() {
        range = createRange('01/01/2004', '05/01/2006')
        expect(range).toPrintDefiningDurationOf('2 vuotta', DateLocale.FI)
        range = createRange('01/01/2004', '05/01/2005')
        expect(range).toPrintDefiningDurationOf('1 vuosi', DateLocale.FI)
        range = createRange('01/01/2004', '05/01/2004')
        expect(range).toPrintDefiningDurationOf('4 kuukautta', DateLocale.FI)
        range = createRange('01/01/2004', '02/16/2004')
        expect(range).toPrintDefiningDurationOf('1 kuukausi', DateLocale.FI)
        range = createRange('01/01/2004', '01/31/2004')
        expect(range).toPrintDefiningDurationOf('1 kuukausi', DateLocale.FI)
        range = createRange('01/01/2004', '01/07/2004')
        expect(range).toPrintDefiningDurationOf('7 päivää', DateLocale.FI)
      })
    })

    function assertHasCorrectHoursAndMinutes(range, hours, minutes) {
      expect(range).toBeValidRange()
      expect(range.hours()).toEqual(hours)
      expect(range.minutes()).toEqual(minutes)
    }

    function resetRange() {
      start = new DateTime('09/10/2009')
      end = new DateTime('09/12/2009')
      range = new DateRange(end, start)
    }

    function resetOuterRange() {
      start = new DateTime('03/28/2011')
      end = new DateTime('05/01/2011')
      outerRange = new DateRange(start, end)
    }

    function createRange(date1, date2) {
      return new DateRange(new DateTime(date1), new DateTime(date2))
    }
  })
})

