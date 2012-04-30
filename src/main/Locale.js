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
Locale = {}

Locale.MONDAY = 1
Locale.FRIDAY = 5
Locale.SUNDAY = 0
Locale.hoursAndMinutes = function(hours, minutes) { return (Math.round((hours + minutes / 60) * 100) / 100).toString() }

Locale.FI = {
  id:'FI',
  monthNames: [
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
    'joulukuu'],
  dayNames: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
  yearsLabel: function(years) { return years + ' ' + (years == '1' ? 'vuosi' : 'vuotta'); },
  monthsLabel: function(months) { return months + ' ' + (months == '1' ? 'kuukausi' : 'kuukautta'); },
  daysLabel: function(days) { return days + ' ' + (days == '1' ? 'päivä' : 'päivää'); },
  hoursLabel: function(hours, minutes) {
    var hoursAndMinutes = Locale.hoursAndMinutes(hours, minutes).replace('.', ',')
    return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'tunti' : 'tuntia');
  },
  shortDateFormat: 'j.n.Y',
  weekDateFormat: 'D j.n.Y',
  dateTimeFormat: 'D j.n.Y k\\lo G:i',
  firstWeekday: Locale.MONDAY
}
Locale.EN = {
  id:'EN',
  monthNames: ['January',
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
    'December'],
  dayNames: ['Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'],
  yearsLabel: function(years) { return years + ' ' + (years == '1' ? 'Year' : 'Years'); },
  monthsLabel: function(months) { return months + ' ' + (months == '1' ? 'Months' : 'Months'); },
  daysLabel: function(days) { return days + ' ' + (days == '1' ? 'Day' : 'Days'); },
  hoursLabel: function(hours, minutes) {
    var hoursAndMinutes = Locale.hoursAndMinutes(hours, minutes)
    return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Hour' : 'Hours');
  },
  shortDateFormat: 'n/j/Y',
  weekDateFormat: 'D n/j/Y',
  dateTimeFormat: 'D n/j/Y G:i',
  firstWeekday: Locale.SUNDAY
};
Locale.AU = {
  id:'AU',
  monthNames: ['January',
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
    'December'],
  dayNames: ['Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'],
  yearsLabel: function(years) { return years + ' ' + (years == '1' ? 'Year' : 'Years'); },
  monthsLabel: function(months) { return months + ' ' + (months == '1' ? 'Months' : 'Months'); },
  daysLabel: function(days) { return days + ' ' + (days == '1' ? 'Day' : 'Days'); },
  hoursLabel: function(hours, minutes) {
    var hoursAndMinutes = Locale.hoursAndMinutes(hours, minutes)
    return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Hour' : 'Hours');
  },
  shortDateFormat: 'j/n/Y',
  weekDateFormat: 'D j/n/Y',
  dateTimeFormat: 'D j/n/Y G:i',
  firstWeekday: Locale.SUNDAY
}
Locale.DEFAULT = Locale.EN

Locale.fromArgument = function(stringOrObject) {
  if(typeof stringOrObject == 'string')
    return Locale[stringOrObject]
  else return stringOrObject || Locale.DEFAULT
}