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

describe('DateTime', function() {
  describe('for wrapping Date', function() {
    var date = new Date(2010, 2, 3, 12, 45, 30)
    var dateTime = new DateTime(date)

    $.each([
      { desc: 'unix time',    func: 'getTime' },
      { desc: 'full year',    func: 'getFullYear' },
      { desc: 'month',        func: 'getMonth' },
      { desc: 'date',         func: 'getDate' },
      { desc: 'weekday',      func: 'getDay' },
      { desc: 'hours',        func: 'getHours' },
      { desc: 'minutes',      func: 'getMinutes' },
      { desc: 'seconds',      func: 'getSeconds' },
      { desc: 'milliseconds', func: 'getMilliseconds' }
    ], function(_index, spec) {
      it('returns ' + spec.desc, function() {
        expect(dateTime[spec.func]()).toEqual(date[spec.func]())
      })
    })
  })
})
