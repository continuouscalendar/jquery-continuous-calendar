define(function(require, _exports, module) {
  var DateTime = require('../main/DateTime')
  var DateRange = require('../main/DateRange')
  var DateFormat = require('../main/DateFormat')
  var DateLocale = require('../main/DateLocale')

  describe(module.id, function() {
    var range
    var start
    var end
    var outerRange

    describe('date range default behavior', function() {
      beforeEach(resetRange)

      it('creates range of three days', function() {
        expect(range.start).to.eql(start)
        expect(range.end).to.eql(end)
        expect(range.days()).to.equal(3)
        expect(range).not.to.toHaveDate('2009-09-09')
        expect(range).to.toHaveDate('2009-09-10')
        expect(range).to.toHaveDate('2009-09-11')
        expect(range).to.toHaveDate('2009-09-12')
        expect(range).not.to.toHaveDate('2009-09-13')
        expect(DateFormat.formatRange(range, DateLocale.FI)).to.equal('10.9.2009 - 12.9.2009')
      })

      it('range is movable', function() {
        var twoDaysAfter = range.shiftDays(2)
        expect(twoDaysAfter.start.getDate()).to.equal(12)
        expect(twoDaysAfter.end.getDate()).to.equal(12 + 2)
      })

      it('range is expandable', function() {
        expect(range.expandTo(DateTime.fromDate(2009, 9, 15)).days()).to.equal(6)
      })

      it('two ranges can do interception', function() {
        expect(range.and(createRange('2009-09-11', '2009-09-19')).days()).to.equal(2)
        expect(range.and(createRange('2009-09-16', '2009-09-19')).days()).to.equal(0)
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
        var range1 = createRange('2011-04-04', '2011-04-10')
        var range2 = range1.shiftInside(outerRange)
        expect(range1).toBeInside(outerRange)
        expect(range2).toBeInside(outerRange)
        expect(range1.start.getDate()).to.eql(range2.start.getDate())
        expect(range1.end.getDate()).to.eql(range2.end.getDate())
      })

      it('range can be moved forward inside outer range', function() {
        var range1 = createRange('2011-03-15', '2011-03-21')
        var range2 = range1.shiftInside(outerRange)
        expect(range1).not.toBeInside(outerRange)
        expect(range2).toBeInside(outerRange)
        expect(range2.start.getDate()).to.equal(28)
        expect(range2.end.getDate()).to.equal(3)
      })

      it('range can be moved backward inside outer range', function() {
        var range1 = createRange('2011-04-28', '2011-05-04')
        var range2 = range1.shiftInside(outerRange)
        expect(range1).not.toBeInside(outerRange)
        expect(range2).toBeInside(outerRange)
        expect(range2.start.getDate()).to.equal(25)
        expect(range2.end.getDate()).to.equal(1)
      })

      it('range longer than outer range cannot be moved', function() {
        var range1 = new DateRange(outerRange.start.minusDays(1), outerRange.end.plusDays(1))
        var range2 = range1.shiftInside(outerRange)
        expect(range2.days()).to.equal(0)
      })
    })

    describe('date range with minimum size within outer range', function() {
      beforeEach(resetOuterRange)

      it('range can be requested near the beginning of outer range', function() {
        var oldRange = createRange('2011-03-28', '2011-04-03')
        var newRange = DateRange.rangeWithMinimumSize(oldRange, 7, true, outerRange)
        expect(newRange.days()).to.equal(7)
        expect(newRange.start.getDate()).to.equal(29)
        expect(newRange.end.getDate()).to.equal(4)
      })

      it('range can be requested near the end of outer range', function() {
        var oldRange = createRange('2011-04-25', '2011-04-25')
        var newRange = DateRange.rangeWithMinimumSize(oldRange, 7, false, outerRange)
        expect(newRange.days()).to.equal(7)
      })

      it('range cannot be requested to be outside outer range', function() {
        var oldRange = createRange('2011-04-26', '2011-04-26')
        var newRange = DateRange.rangeWithMinimumSize(oldRange, 7, false, outerRange)
        expect(newRange.days()).to.equal(0)
      })

      it('range may not be found near the end of outer range due to weekends', function() {
        var oldRange = createRange('2011-04-24', '2011-04-24')
        var newRange = DateRange.rangeWithMinimumSize(oldRange, 7, true, outerRange)
        expect(newRange.days()).to.equal(0)
      })

      it('does not expand an empty range', function() {
        var oldRange = DateRange.emptyRange()
        var newRange = DateRange.rangeWithMinimumSize(oldRange, 7, true, outerRange)
        expect(newRange.days()).to.equal(0)
      })
    })

    describe('date range with time behavior', function() {
      beforeEach(resetRange)

      it('date range can have times', function() {
        var rangeWithTimes = range.withTimes('10:00', '14:45')
        expect(rangeWithTimes.days()).to.equal(2)
        expect(rangeWithTimes.hours()).to.equal(4)
        expect(rangeWithTimes.minutes()).to.equal(45)
        expect(DateFormat.formatRange(rangeWithTimes, DateLocale.FI)).to.equal('2 päivää 4,75 tuntia')
        expect(DateFormat.formatRange(new DateRange(range.start, range.end).withTimes('10:00', '14:45'), DateLocale.EN)).to.equal('2 Days 4.75 Hours')
        var rangeWithPmTimes = range.withTimes('17:00', '16:00')
        expect(rangeWithPmTimes.days()).to.equal(1)
        expect(rangeWithPmTimes.hours()).to.equal(23)
        expect(rangeWithPmTimes.minutes()).to.equal(0)
        range.start = range.start.plusDays(1)
        expect(DateFormat.formatRange(range.withTimes('10:00', '11:00'), DateLocale.FI)).to.equal('1 päivä 1 tunti')
        expect(DateFormat.formatRange(new DateRange(range.start, range.end).withTimes('10:00', '11:00'), DateLocale.EN)).to.equal('1 Day 1 Hour')
      })

      it('one day range with start time after end time is not valid', function() {
        expect(range).toBeValidRange()
        range.start = DateTime.fromDate(2009, 9, 13)
        expect(range).not.toBeValidRange()
        range.start = DateTime.fromDate(2009, 9, 12)
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
        expect(DateFormat.formatRange(rangeWithTimes, DateLocale.FI)).to.equal('2 päivää 1,17 tuntia')
      })

      it('range is displayed with the most defining unit', function() {
        range = createRange('2004-01-01', '2006-05-01')
        expect(range).toPrintDefiningDurationOf('2 vuotta', DateLocale.FI)
        range = createRange('2004-01-01', '2005-05-01')
        expect(range).toPrintDefiningDurationOf('1 vuosi', DateLocale.FI)
        range = createRange('2004-01-01', '2004-05-01')
        expect(range).toPrintDefiningDurationOf('4 kuukautta', DateLocale.FI)
        range = createRange('2004-01-01', '2004-02-16')
        expect(range).toPrintDefiningDurationOf('1 kuukausi', DateLocale.FI)
        range = createRange('2004-01-01', '2004-01-31')
        expect(range).toPrintDefiningDurationOf('1 kuukausi', DateLocale.FI)
        range = createRange('2004-01-01', '2004-01-07')
        expect(range).toPrintDefiningDurationOf('7 päivää', DateLocale.FI)
      })
    })

    function assertHasCorrectHoursAndMinutes(range, hours, minutes) {
      expect(range).toBeValidRange()
      expect(range.hours()).to.equal(hours)
      expect(range.minutes()).to.equal(minutes)
    }

    function resetRange() {
      start = DateTime.fromDate(2009, 9, 10)
      end = DateTime.fromDate(2009, 9, 12)
      range = new DateRange(end, start)
    }

    function resetOuterRange() {
      start = DateTime.fromDate(2011, 3, 28)
      end = DateTime.fromDate(2011, 5, 1)
      outerRange = new DateRange(start, end)
    }

    function createRange(date1, date2) {
      return new DateRange(DateTime.fromIsoDate(date1), DateTime.fromIsoDate(date2))
    }
  })
})

