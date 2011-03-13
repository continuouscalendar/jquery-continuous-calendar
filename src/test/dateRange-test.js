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

module("date range default behavior", {
  setup: resetRange
})

test("creates dange of three days", function() {
  equals(range.start, start)
  equals(range.end, end)
  equals(range.days(), 3)
  ok(!range.hasDate(new Date('09/9/2009')))
  ok(range.hasDate(new Date('09/10/2009')))
  ok(range.hasDate(new Date('09/11/2009')))
  ok(range.hasDate(new Date('09/12/2009')))
  ok(!range.hasDate(new Date('09/13/2009')))
  equals(range.toString(DATE_LOCALE_FI), "10.9.2009 - 12.9.2009")
})

test("range is movable", function() {
  range = range.shiftDays(2)
  equals(range.start.getDate(), 12)
  equals(range.end.getDate(), 12 + 2)
})

test("range is expandable", function() {
  range = range.expandTo(new Date('09/15/2009'))
  equals(range.days(), 6)
})

test("two ranges can do interception", function() {
  var range2 = new DateRange(new Date('09/11/2009'), new Date('09/19/2009'))
  equals(range.and(range2).days(), 2)
  range2 = new DateRange(new Date('09/16/2009'), new Date('09/19/2009'))
  equals(range.and(range2).days(), 0)
})

test("ranges can be asked if it is a subset of another range", function() {
  ok(range.isInside(range))
  ok(!range.isInside(range.shiftDays(1)))
  ok(range.isInside(range.expandDaysTo(7)))
  ok(!range.expandDaysTo(7).isInside(range))
})


module("date range with time behavior", {
  setup: resetRange
})

test("date range can have times", function() {
  DATE_LOCALE_EN.init()
  range.setTimes('10:00', '14:45')
  equals(range.days(), 2)
  equals(range.hours(), 4)
  equals(range.minutes(), 45)
  equals(range.toString(), "2 Days 4.75 Hours")

  DATE_LOCALE_FI.init()
  equals(range.toString(), "2 päivää 4,75 tuntia")

  range.setTimes('17:00', '16:00')
  equals(range.days(), 1)
  equals(range.hours(), 23)
  equals(range.minutes(), 0)
  range.start = range.start.plusDays(1)

  range.setTimes('10:00', '11:00')
  equals(range.toString(), "1 päivä 1 tunti")

  DATE_LOCALE_EN.init()
  equals(range.toString(), "1 Day 1 Hour")
})

test("one day range with start time after end time is not valid", function() {
  ok(range.isValid())
  range.start = new Date('09/13/2009')
  ok(!range.isValid())
  range.start = new Date('09/12/2009')
  ok(range.isValid())
  range.setTimes('15:00', '14:30')
  ok(!range.isValid())
  range.setTimes('15:00', '15:00')
  ok(range.isValid())
  range.setTimes('15:00', '15:30')
  ok(range.isValid())
})

test("invalid time will make range invalid while keeping date information", function() {
  range.setTimes('15:00', '15:30')
  ok(range.isValid())

  range.setTimes('', '15:30')
  ok(!range.isValid())

  range.setTimes('15:00', '15:30')
  ok(range.isValid())

  range.setTimes('asdf', 'fddd')
  ok(!range.isValid())

  range.setTimes('00', '25')
  ok(!range.isValid())

})

test("different time formats are accepted", function() {
  range.setTimes('15:00', '16:10')
  assertHasCorrectHoursAndMinutes(1, 10)

  range.setTimes('14.00', '16.20')
  assertHasCorrectHoursAndMinutes(2, 20)

  range.setTimes('13,00', '16,30')
  assertHasCorrectHoursAndMinutes(3, 30)

  range.setTimes('1200', '1640')
  assertHasCorrectHoursAndMinutes(4, 40)

  range.setTimes('830', '1240')
  assertHasCorrectHoursAndMinutes(4, 10)

  range.setTimes('08', '13')
  assertHasCorrectHoursAndMinutes(5, 0)
})

test("minutes are rounded to 2 digits", function() {
  range.setTimes('15:00', '16:10')
  assertHasCorrectHoursAndMinutes(1, 10)
  DATE_LOCALE_FI.init()
  equals(range.toString(), "2 päivää 1,17 tuntia")
})

function assertHasCorrectHoursAndMinutes(hours, minutes) {
  ok(range.isValid(), "valid range")
  equals(range.hours(), hours, "correct hours")
  equals(range.minutes(), minutes, "correct minutes")
}
function resetRange() {
  start = new Date('09/10/2009')
  end = new Date('09/12/2009')
  range = new DateRange(end, start)
}