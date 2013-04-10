define(function(require) {
  var DateTime = require('../main/DateTime')
  var util = require('TestUtils')
  var __ = util.__
  var sequence = util.sequence

  describe('DateTime', function() {
    with(DateTime) {
      var dateWithMS = new Date(2010, 2, 3, 12, 45, 30)
      var dateWithNoMS = new Date(2010, 2, 3, 12, 45, 0)
      var dateTimeWithMS = new DateTime(dateWithMS)
      var dateTimeWithNoMS = new DateTime(dateWithNoMS)
      var leapYear = 2000
      var normalYear = 2001
      var leapYearMonths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      var normalYearMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      var yearSizes2000_2010 = [366, 365, 365, 365, 366, 365, 365, 365, 366, 365, 365]

      describe('Constructor', function() {
        var currentDate = new Date()
        currentDate.setMilliseconds(0)
        it('with empty arguments', function() {
          expect(new DateTime().withResetMS().getTime()).toEqual(currentDate.getTime())
        })

        it('with string', function() {
          expect(new DateTime('2012/11/3').toISOString()).toEqual('2012-11-03T00:00:00')
        })

        it('with numbers', function() {
          expect(new DateTime(2012, 12, 29, 11, 45, 59).toISOString()).toEqual('2012-12-29T11:45:59')
        })

        it('throws errors on invalid values', function() {
          expect(function() {new DateTime(2012, 12, 29, 11, 45, 60)}).toThrow('Invalid Date: 2012/11/29 11:45:60')
        })
      })

      describe('Factory methods', function() {
        describe('fromIsoDate', function() {
          it('creates dateTime correctly from ISO date', function() {
            expect(fromIsoDate('2012-01-20')).toCompareWith(fromDate(2012, 1, 20))
            expect(fromIsoDate('2012-01-20T13:35')).toCompareWith(fromDate(2012, 1, 20))
          })

          it('thorws errors of invalid iso formats', function() {
            expectToThrow('2010-0101')
            expectToThrow('2010-01-01T')
            expectToThrow('2010-01-01T1012')
          })

          function expectToThrow(input) { expect(fromIsoDate.wrap(input)).toThrow(input + ' is not valid ISO Date (YYYY-MM-DD or YYYY-MM-DDTHH:MM)') }
        })

        describe('fromIsoDateTime', function() {
          it('creates dateTime correctly from ISO date time', function() {
            expect(fromIsoDateTime('2012-01-20T13:35')).toCompareWith(new DateTime(2012, 1, 20, 13, 35))
          })

          it('thorws errors of invalid iso formats', function() {
            expectToThrow('2012-01-20')
            expectToThrow('2012-01-20T')
            expectToThrow('2012-01-20T1020')
          })

          function expectToThrow(input) { expect(fromIsoDateTime.wrap(input)).toThrow(input + ' is not valid ISO Date (YYYY-MM-DDTHH:MM)') }
        })

        describe('fromMillis', function() {
          it('returns DateTime with given milliseconds', function() {
            var ms = new Date().getTime()
            expect(fromMillis(ms).getTime()).toEqual(ms)
          })
        })

        describe('now', function() {
          it('returns current time', function() {
            var date = new Date()
            date.setMilliseconds(0)
            expect(now().withResetMS().getTime()).toEqual(date.getTime())
            expect(now().getTime()).toEqual(now().getTime())
          })
        })

        describe('fromDateTime', function() {
          it('returns new date with given values', function() {
            expect(fromDateTime(2010, 3, 3, 12, 45)).toCompareWith(dateTimeWithNoMS)
          })

          it('throws errors on invalid values', function() {
            expect(fromDateTime.wrap(2010, 1, 1, 25, 0)).toThrow('Invalid Date: 2010/0/1 25:0:0')
            expect(fromDateTime.wrap(2010, 1, 1, 23, 60)).toThrow('Invalid Date: 2010/0/1 23:60:0')
          })
        })

        describe('fromDate', function() {
          it('returns new date with given values', function() {
            expect(fromDate(2010, 3, 3)).toCompareWith(new DateTime(2010, 3, 3, 0, 0, 0))
          })

          it('throws errors on invalid values', function() {
            expect(fromDate.wrap(2010, 'lol', 3)).toThrow('Invalid Date: 2010/NaN/3 0:0:0')
            expect(fromDate.wrap(2010, 14, 3)).toThrow('Invalid Date: 2010/13/3 0:0:0')
            expect(fromDate.wrap(2010, 0, 3)).toThrow('Invalid Date: 2010/-1/3 0:0:0')
            expect(fromDate.wrap(2010, 4, 32)).toThrow('Invalid Date: 2010/3/32 0:0:0')
          })
        })
        describe('fromDateObject', function() {
          it('returns new date from given Date object', function() {
            expect(fromDateObject(dateWithNoMS)).toCompareWith(fromDateTime(2010, 3, 3, 12, 45))
          })
        })
      })

      describe('Constants', function() {
        describe('Units', function() {
          it('have correct values', function() {
            expect(SECOND).toEqual(1000)
            expect(MINUTE).toEqual(60000)
            expect(HOUR).toEqual(3600000)
            expect(WEEK).toEqual(604800000)
          })
        })
        describe('Weekdays', function() {
          it('have correct indexes', function() {
            expect(SUNDAY).toEqual(0)
            expect(MONDAY).toEqual(1)
            expect(TUESDAY).toEqual(2)
            expect(WEDNESDAY).toEqual(3)
            expect(THURSDAY).toEqual(4)
            expect(FRIDAY).toEqual(5)
            expect(SATURDAY).toEqual(6)
          })
        })
      })

      describe('Instance methods', function() {
        describe('for wrapping Date', function() {
          $.each([
            { desc: 'unix time', func: 'getTime' },
            { desc: 'full year', func: 'getFullYear' },
            { desc: 'dateWithMS', func: 'getDate' },
            { desc: 'weekday', func: 'getDay' },
            { desc: 'hours', func: 'getHours' },
            { desc: 'minutes', func: 'getMinutes' },
            { desc: 'seconds', func: 'getSeconds' },
            { desc: 'milliseconds', func: 'getMilliseconds' }
          ], function(_index, spec) {
            it('returns ' + spec.desc, function() {
              expect(dateTimeWithMS[spec.func]()).toEqual(dateWithMS[spec.func]())
            })
          })
        })

        describe('withTime', function() {
          it('should update only time and reset seconds and milliseconds', function() {
            expect(dateTimeWithMS.withTime(10, 30).toString()).toEqual(new DateTime(2010, 3, 3, 10, 30).toString())
            expect(dateTimeWithMS.withTime('11:30').toString()).toEqual(new DateTime(2010, 3, 3, 11, 30).toString())
          })
        })

        describe('getDaysInMonth', function() {
          it('lists days of given month', function() {
            expect($.map(sequence(1, 12), function(month) {return fromDate(leapYear, month, 1).getDaysInMonth()})).toEqual(leapYearMonths)
            expect($.map(sequence(1, 12), function(month) {return fromDate(normalYear, month, 1).getDaysInMonth()})).toEqual(normalYearMonths)
          })
        })

        describe('getDayInYear', function() {
          it('returns number between 0-365 depending on distance of 1st jan of same year', function() {
            expect(fromDate(2010, 1, 1).getDayInYear()).toEqual(1)
            expect($.map(sequence(2000, 2010), function(year) { return fromDate(year, 12, 31).getDayInYear() })).toEqual(yearSizes2000_2010)
          })
        })

        describe('toIsoString', function() {
          it('returns ISO string with local times ', function() {
            expect(fromDateTime(2010, 3, 5, 4, 0).toISOString()).toEqual('2010-03-05T04:00:00')
            expect(fromDateTime(2010, 12, 25, 14, 35).toISOString()).toEqual('2010-12-25T14:35:00')
            var isoDateTime = '2010-12-25T14:35:05'
            expect(fromIsoDateTime(isoDateTime).toISOString()).toEqual(isoDateTime)
            expect(fromIsoDateTime(now().withResetMS().toISOString())).toCompareWith(now().withResetMS())
          })
        })

        describe('plusDay / minusDays s vs distanceInDays', function() {
          it('takes day light saving into account (test passes at least in Finland)', function() {
            var winter1 = fromDateTime(2013, 3, 29, 10, 0)
            var winter2 = fromDateTime(2013, 3, 30, 10, 0)
            expect(winter2.getTime() - winter1.getTime()).toEqual(DAY)
            var summer1 = fromDateTime(2013, 3, 31, 10, 0)
            expect(summer1.getTime() - winter2.getTime()).toEqual(DAY - HOUR)
            var summer2 = fromDateTime(2013, 4, 1, 10, 0)
            expect(summer2.getTime() - summer1.getTime()).toEqual(DAY)
            var summer3 = fromDateTime(2013, 10, 1, 10, 0)
            expect(summer3.getTime() - summer2.getTime()).toEqual(summer2.distanceInDays(summer3) * DAY)
          })

          it('returns date away of given amount of days', function() {
            for(var days = 0; days < 400; days++) {
              expect(now().distanceInDays(now().plusDays(days))).toEqual(days)
            }
            for(days = 0; days < 400; days++) {
              expect(now().minusDays(days).distanceInDays(now())).toEqual(days)
            }
          })
        })

        describe('getWeekInYear', function() {
          expect($.map(sequence(2000, 2010), firstWeekOfYear('ISO'))).toEqual([ 52, 1, 1, 1, 1, 53, 52, 1, 1, 1, 53 ])
          expect($.map(sequence(2000, 2010), firstWeekOfYear('US'))).toEqual([ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ])

          function firstWeekOfYear(standard) { return function(year) {return fromDate(year, 1, 1).getWeekInYear(standard)}}
        })

        describe('isToday', function() {
          it('returns always true for today', function() {
            expect(now().isToday()).toBeTruthy()
            expect(now().plusDays(1).isToday()).toBeFalsy()
          })

          it('returns false for tomorrow and yesterday', function() {
            expect(now().plusDays(1).isToday()).toBeFalsy()
            expect(now().minusDays(1).isToday()).toBeFalsy()
          })
        })

        describe('clone', function() {
          it('has no references to cloned object', function() {
            var original = fromDate(2013, 1, 1)
            var cloned = original.clone()
            cloned.date.setYear(2000)
            expect(original.getFullYear()).toEqual(2013)
          })
        })

        describe('withResetMS', function() {
          it('resets milliseconds', function() {
            expect(fromDateObject(new Date(2010, 0, 1, 12, 30, 59, 30)).withResetMS()).toCompareWith(fromDateObject(new Date(2010, 0, 1, 12, 30, 59, 0)))
          })
        })

        describe('compareTo', function() {
          it('returns positive, zero or negative value', function() {
            expect(dateTimeWithMS.compareTo(dateTimeWithNoMS)).toBeGreaterThan(0)
            expect(dateTimeWithNoMS.compareTo(dateTimeWithMS)).toBeLessThan(0)
            expect(dateTimeWithMS.compareTo(dateTimeWithMS)).toEqual(0)
          })
        })

        describe('isOddMonth', function() {
          it('returns true for odd months', function() {
            expect(dateTimeWithNoMS.isOddMonth()).toBeFalsy()
            expect(dateTimeWithNoMS.plusDays(35).isOddMonth()).toBeTruthy()
          })
        })

        describe('equalsOnlyDate', function() {
          it('returns true when date is same discarding time information', function() {
            expect(dateTimeWithMS.equalsOnlyDate(dateTimeWithNoMS)).toBeTruthy()
            expect(dateTimeWithMS.equalsOnlyDate(dateTimeWithNoMS.withTime(10, 30))).toBeTruthy()
            expect(dateTimeWithMS.plusDays(1).equalsOnlyDate(dateTimeWithNoMS)).toBeFalsy()
            expect(dateTimeWithMS.equalsOnlyDate(dateTimeWithNoMS.plusDays(1))).toBeFalsy()
          })
        })

        describe('isBetweenDates', function() {
          it('returns true when date is between given dates', function() {
            expect(fromDate(2010, 1, 5).isBetweenDates(fromDate(2010, 1, 4), fromDate(2010, 1, 6))).toBeTruthy()
            expect(fromDate(2010, 1, 5).isBetweenDates(fromDate(2010, 1, 5), fromDate(2010, 1, 5))).toBeTruthy()
            expect(fromDate(2010, 1, 5).isBetweenDates(fromDate(2010, 1, 3), fromDate(2010, 1, 4))).toBeFalsy()
            expect(fromDate(2010, 1, 5).isBetweenDates(fromDate(2010, 1, 6), fromDate(2010, 1, 7))).toBeFalsy()
            expect(fromDate(2010, 1, 5).isBetweenDates.wrap(fromDate(2010, 1, 6), fromDate(2010, 1, 4))).toThrow("start date can't be after end date")
          })
        })

        describe('firstDateOfMonth', function() {
          it('returns first date of month', function() {
            expect(dateTimeWithNoMS.firstDateOfMonth()).toCompareWith(fromDate(2010, 3, 1))
            expect(fromDate(2010, 3, 1).firstDateOfMonth()).toCompareWith(fromDate(2010, 3, 1))
          })
        })

        describe('lastDateOfMonth', function() {
          it('returns last date of month', function() {
            expect(dateTimeWithNoMS.lastDateOfMonth()).toCompareWith(fromDate(2010, 3, 31))
            expect(fromDate(2010, 3, 31).lastDateOfMonth()).toCompareWith(fromDate(2010, 3, 31))
          })
        })

        describe('withWeekDay', function() {
          it('returns date with given week day from same week (sunday is the first date of week)', function() {
            var saturday = fromDate(2010, 1, 9)
            expect(saturday.withWeekday(SUNDAY)).toCompareWith(fromDate(2010, 1, 3))
            expect(saturday.withWeekday(MONDAY)).toCompareWith(fromDate(2010, 1, 4))
            expect(saturday.withWeekday(SATURDAY)).toCompareWith(fromDate(2010, 1, 9))
            var sunday = fromDate(2010, 1, 10)
            expect(sunday.getDay()).toEqual(SUNDAY)
            expect(sunday.withWeekday(MONDAY)).toCompareWith(fromDate(2010, 1, 11))
            expect(sunday.withWeekday(TUESDAY)).toCompareWith(fromDate(2010, 1, 12))
            var tuesday = sunday.plusDays(2)
            expect(tuesday.withWeekday(MONDAY)).toCompareWith(fromDate(2010, 1, 11))
            expect(tuesday.withWeekday(TUESDAY)).toCompareWith(fromDate(2010, 1, 12))
          })
        })

        describe('getOnlyDate', function() {
          it('return new DateTime with midnight times', function() {
            expect(fromDateTime(2010, 1, 1, 10, 30).getOnlyDate()).toCompareWith(fromDateTime(2010, 1, 1, 0, 0))
          })
        })

        describe('isWeekend', function() {
          it('returns true for saturday and sunday', function() {
            expect(dateTimeWithNoMS.withWeekday(SATURDAY).isWeekend()).toBeTruthy()
            expect(dateTimeWithNoMS.withWeekday(SUNDAY).isWeekend()).toBeTruthy()
            expect(dateTimeWithNoMS.withWeekday(MONDAY).isWeekend()).toBeFalsy()
            expect(dateTimeWithNoMS.withWeekday(TUESDAY).isWeekend()).toBeFalsy()
            expect(dateTimeWithNoMS.withWeekday(WEDNESDAY).isWeekend()).toBeFalsy()
            expect(dateTimeWithNoMS.withWeekday(THURSDAY).isWeekend()).toBeFalsy()
            expect(dateTimeWithNoMS.withWeekday(FRIDAY).isWeekend()).toBeFalsy()
          })
        })

        describe('toString', function() {
          it('returns same as toISOString', function() {
            expect(dateTimeWithMS.toString()).toEqual('2010-03-03T12:45:30')
          })
        })

        describe('getFirstDateOfWeek', function() {
          it('returns first date of same week according to locale', function() {
            var wednesday = dateTimeWithNoMS.withWeekday(WEDNESDAY)
            expect(wednesday.getFirstDateOfWeek({firstWeekday: MONDAY})).toCompareWith(dateTimeWithNoMS.withWeekday(MONDAY))
            expect(wednesday.getFirstDateOfWeek()).toCompareWith(dateTimeWithNoMS.withWeekday(MONDAY))
            expect(wednesday.getFirstDateOfWeek({firstWeekday: SUNDAY})).toCompareWith(dateTimeWithNoMS.withWeekday(SUNDAY))
          })
        })
      })

      describe('Static methods', function() {
        describe('getDaysInMonth', function() {
          it('lists days of given month', function() {
            expect($.map(sequence(1, 12), getDaysInMonth.curry(leapYear))).toEqual(leapYearMonths)
            expect($.map(sequence(1, 12), getDaysInMonth.curry(normalYear))).toEqual(normalYearMonths)
          })
        })

        describe('getDayInYear', function() {
          it('returns number between 0-365 depending on distance of 1st jan of same year', function() {
            expect($.map(sequence(2000, 2010), getDayInYear.curry(__, 12, 31))).toEqual(yearSizes2000_2010)
          })
        })
      })
    }
  })
})
