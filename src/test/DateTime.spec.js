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

define(function(require) {
  var DateTime = require('../main/DateTime')

  describe('DateTime', function() {
    var date = new Date(2010, 2, 3, 12, 45, 30)
    var dateTime = new DateTime(date)

    describe('constructor', function() {
      var currentDate = new Date()
      it('with empty arguments', function() {
        var currentDateTime = new DateTime()
        expect(currentDateTime.getFullYear()).toEqual(currentDate.getFullYear())
        expect(currentDateTime.getMonth()).toEqual(currentDate.getMonth())
        expect(currentDateTime.getDay()).toEqual(currentDate.getDay())
      })

      it('with string', function() {
        var parsedDateTime = new DateTime('2012/11/3');
        expect(parsedDateTime.getFullYear()).toEqual(2012)
        expect(parsedDateTime.getMonth()).toEqual(10)
        expect(parsedDateTime.getDate()).toEqual(3)
      })

      it('with numbers', function() {
        var dateTimeWithNumbers = new DateTime(2012, 12, 29, 11, 45)
        expect(dateTimeWithNumbers.getFullYear()).toEqual(2012)
        expect(dateTimeWithNumbers.getMonth()).toEqual(11)
        expect(dateTimeWithNumbers.getDate()).toEqual(29)
        expect(dateTimeWithNumbers.getHours()).toEqual(11)
        expect(dateTimeWithNumbers.getMinutes()).toEqual(45)
      })
    })

    describe('for wrapping Date', function() {
      $.each([
        { desc: 'unix time', func: 'getTime' },
        { desc: 'full year', func: 'getFullYear' },
        { desc: 'month', func: 'getMonth' },
        { desc: 'date', func: 'getDate' },
        { desc: 'weekday', func: 'getDay' },
        { desc: 'hours', func: 'getHours' },
        { desc: 'minutes', func: 'getMinutes' },
        { desc: 'seconds', func: 'getSeconds' },
        { desc: 'milliseconds', func: 'getMilliseconds' }
      ], function(_index, spec) {
        it('returns ' + spec.desc, function() {
          expect(dateTime[spec.func]()).toEqual(date[spec.func]())
        })
      })
    })

    describe('withTime', function() {
      it('should update only time and reset seconds and milliseconds', function() {
        expect(dateTime.withTime(10, 30).toString()).toEqual(new DateTime(2010, 3, 3, 10, 30).toString())
        expect(dateTime.withTime('11:30').toString()).toEqual(new DateTime(2010, 3, 3, 11, 30).toString())
      })
    })

    describe('fromIsoDate', function() {
      it('creates dateTime correctly from ISO date', function() {
        assertDates(DateTime.fromIsoDate('2012-1-20'), new DateTime(2012, 1, 20, 0, 0))
        assertDates(DateTime.fromIsoDate('2012-1-20T13:35'), new DateTime(2012, 1, 20, 0, 0))
      })
    })

    describe('fromIsoDateTime', function() {
      it('creates dateTime correctly from ISO date time', function() {
        assertDates(DateTime.fromIsoDateTime('2012-1-20T13:35'), new DateTime(2012, 1, 20, 13, 35))
      })
    })

    function assertDates(actual, expected) {
      expect(actual.getFullYear()).toEqual(expected.getFullYear())
      expect(actual.getMonth()).toEqual(expected.getMonth())
      expect(actual.getDate()).toEqual(expected.getDate())
      expect(actual.getHours()).toEqual(expected.getHours())
      expect(actual.getMinutes()).toEqual(expected.getMinutes())
    }
  })
})
