$.fn.continuousCalendar = function(day, month, year) {
  var date = new Date(month + "/" + day + "/" + year);
  var monday = date.getFirstDateOfWeek(1);
  this.append("<table><tbody><tr><td>" + monday.getDate() + "</td></tr></tbody></table>");
}