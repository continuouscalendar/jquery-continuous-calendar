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
      'joulukuu']
    Date.dayNames = ['su','ma','ti','ke','to','pe','la']
    Date.daysLabel = function(days) {
      return days + ' ' + (days == '1' ? 'päivä' : 'päivää');
    }
    Date.hoursLabel = function(hours, minutes) {
      var hoursAndMinutes = Date.hoursAndMinutes(hours, minutes).replace('.', ',')
      return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'tunti' : 'tuntia');
    }
  },
  shortDateFormat: 'j.n.Y',
  weekDateFormat: 'D j.n.Y',
  dateTimeFormat: 'D j.n.Y k\\lo G:i',
  firstWeekday: Date.MONDAY
}
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
      'December']
    Date.dayNames = ['Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday']
    Date.daysLabel = function(days) {
      return days + ' ' + (days == '1' ? 'Day' : 'Days');
    }
    Date.hoursLabel = function(hours, minutes) {
      var hoursAndMinutes = Date.hoursAndMinutes(hours, minutes)
      return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Hour' : 'Hours');
    }
  },
  shortDateFormat: 'n/j/Y',
  weekDateFormat: 'D n/j/Y',
  dateTimeFormat: 'D n/j/Y G:i',
  firstWeekday: Date.SUNDAY
};
window.DATE_LOCALE_AU = {
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
      'December']
    Date.dayNames = ['Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday']
    Date.daysLabel = function(days) {
      return (days - 1) + ' Days'
    }
    Date.hoursLabel = function(hours, minutes) {
      var hoursAndMinutes = Date.hoursAndMinutes(hours, minutes)
      return hoursAndMinutes + ' ' + (hoursAndMinutes == '1' ? 'Hour' : 'Hours');
    }
  },
  shortDateFormat: 'j/n/Y',
  weekDateFormat: 'D j/n/Y',
  dateTimeFormat: 'D j/n/Y G:i',
  firstWeekday: Date.SUNDAY
};
