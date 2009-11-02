var start;
var end;
var range;

module("date range default behavior", {
  setup: resetRange
});

test("creates dange of three days", function() {
  equals(range.start, start);
  equals(range.end, end);
  equals(range.days(), 3);
  ok(!range.hasDate(new Date('09/9/2009')));
  ok(range.hasDate(new Date('09/10/2009')));
  ok(range.hasDate(new Date('09/11/2009')));
  ok(range.hasDate(new Date('09/12/2009')));
  ok(!range.hasDate(new Date('09/13/2009')));
});

test("range is movable", function() {
  range.shiftDays(2);
  equals(range.start.getDate(), 12);
  equals(range.end.getDate(), 12 + 2);
});

test("range is expandable", function() {
  range.expandTo(new Date('09/15/2009'));
  equals(range.days(), 6);
});

test("two ranges can do interception", function() {
  var range2 = new DateRange(new Date('09/11/2009'), new Date('09/19/2009'));
  equals(range.and(range2).days(), 2);
  range2 = new DateRange(new Date('09/16/2009'), new Date('09/19/2009'));
  equals(range.and(range2).days(), 0);
});

module("date range with time behavior", {
  setup: resetRange
});

test("date range can have times", function() {
  DATE_LOCALE_EN.init();
  range.setTimes('10:00', '14:30');
  equals(range.days(), 2);
  equals(range.hours(), 4);
  equals(range.minutes(), 30);
  equals(range.toString(), "2 Days 4,5 Hours");
  DATE_LOCALE_FI.init();
  equals(range.toString(), "2 päivää 4,5 tuntia");
  range.setTimes('17:00', '16:00');
  equals(range.days(), 1);
  equals(range.hours(), 23);
  equals(range.minutes(), 0);
  range.start = range.start.plusDays(1);
  range.setTimes('10:00', '11:00');
  equals(range.toString(), "1 päivä 1 tunti");
  DATE_LOCALE_EN.init();
  equals(range.toString(), "1 Day 1 Hour");
});

test("one day range with start time after end time is not valid", function() {
  ok(range.isValid());
  range.start = new Date('09/13/2009');
  ok(!range.isValid());
  range.start = new Date('09/12/2009');
  ok(range.isValid());
  range.setTimes('15:00', '14:30');
  ok(!range.isValid());
  range.setTimes('15:00', '15:00');
  ok(range.isValid());
  range.setTimes('15:00', '15:30');
  ok(range.isValid());
});

function resetRange() {
  start = new Date('09/10/2009');
  end = new Date('09/12/2009');
  range = new DateRange(end, start);
}