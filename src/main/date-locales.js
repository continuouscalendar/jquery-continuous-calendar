window.DATE_LOCALE_FI = {
  init: function() {
    Date.monthNames = [
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
      'joulukuu'];
    Date.dayNames = ['Su','Ma','Ti','Ke','To','Pe','La'];
    Date.daysLabel = function(days) {return days + ' ' + (days == '1' ? 'päivä' : 'päivää');};
    Date.hoursLabel = function(hours, minutes) {
      var hoursAndMinutes = Date.hoursAndMinutes(hours, minutes).replace('.',',');
      return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'tunti' : 'tuntia');};
  },
  shortDateFormat: 'j.n.Y',
  weekDateFormat: 'D j.n.Y',
  dateTimeFormat: 'D j.n.Y k\\lo G:i',
  firstWeekday: Date.MONDAY
};
window.DATE_LOCALE_EN = {
  init: function() {
    Date.monthNames = ['January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'];
    Date.dayNames = ['Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'];
    Date.daysLabel = function(days) {return days + ' ' + (days == '1' ? 'Day' : 'Days');};
    Date.hoursLabel = function(hours, minutes) {
      var hoursAndMinutes = Date.hoursAndMinutes(hours, minutes);
      return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Hour' : 'Hours');};
  },
  shortDateFormat: 'n/j/Y',
  weekDateFormat: 'D n/j/Y',
  dateTimeFormat: 'D n/j/Y G:i',
  firstWeekday: Date.SUNDAY
};