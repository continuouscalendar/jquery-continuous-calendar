module("Charge from customer selector", {
  setup: resetAll,
  tearDown: resetAll
});
test("lists week days for 18.4.2009", function() {
  var specifiedDay = new Date("4/18/2009");
  var monday = specifiedDay.getFirstDateOfWeek(1);
  equals(monday.getDate(),13);
  var sunday = monday.plusDays(6);
  equals(sunday.getDate(), 19);

  $("#continuousCalendar").continuousCalendar(18,4,2009);
  equals($("#continuousCalendar").html(), '<table><tbody><tr><td>13</td></tr></tbody></table>');
  //equals($("#continuousCalendar").html(), "<table><tr><td>13</td><td>14</td><td>1</td><td>1</td><td>1</td>");
  //same([1,2,3],[13,14,15,16,17,18,19]);
  //x.getDate() //18
  //getMonth() //3
  //getYear()+1900
  //getDay() la 6, su 0
  //new Date("4/18/2009,22:31")
});
function resetAll() {

}
