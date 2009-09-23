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

function resetRange() {
  start = new Date('09/10/2009');
  end = new Date('09/12/2009');
  range = new DateRange(end, start);
}