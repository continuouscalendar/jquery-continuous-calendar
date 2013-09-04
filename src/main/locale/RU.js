define(function(require) {
  var DateTime = require('../DateTime')
  var DateFormat = require('../DateFormat')

  /**
   * For example:
   *   1 год
   *   2 года, 3 года, 4 года
   *   5 лет, 6 лет … 11 лет, 12 лет … 20 лет
   *   21 год, 31 год
   *   22 года, 32 года
   * @param {number} number
   * @param {Array} words
   * @return {string}
   */
  function pluralize(number, words) {
    var magnitude = number % 100;
    var pluralWord = ''

    if ((magnitude > 10 && magnitude < 20) || (number === 0)) {
      pluralWord = words[2];
    } else {
      switch (Math.abs(number % 10)) {
        case 1: pluralWord = words[0]; break
        case 2:
        case 3:
        case 4: pluralWord = words[1]; break
        default: pluralWord = words[2]; break
      }
    }
    return [number, pluralWord].join(' ')
  }

  return {
    id             : 'RU',
    monthNames     : [ 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    dayNames       : ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    shortDayNames  : ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    yearsLabel     : function(years) {return pluralize(years, ['Год', 'Года', 'Лет'])},
    monthsLabel    : function(months) {return pluralize(months, ['Месяц', 'Месяца', 'Месяцев'])},
    daysLabel      : function(days) {return pluralize(days, ['День', 'Дня', 'Дней'])},
    hoursLabel     : function(hours, minutes) {
      var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes).replace('.', ',')
      /*
       * It's weird to say like this but correct pronounce is:
       * 1,2  = '1 целая две десятых часа'
       * 0,1  = '1 десятая часа'
       * 0,06 = '6 сотых часа'
       * 2,05 = '2 целых пять сотых часа'
       * 3,12 = '3 целых двенадцать сотых часа'
       * 4,29 = '4 целых 29 сотых часа'
       */
      return hoursAndMinutes + ' Часа'
    },
    clearRangeLabel: 'Очистить диапазон',
    clearDateLabel : 'Очистить дату',
    shortDateFormat: 'j.n.Y',
    weekDateFormat : 'D j.n.Y',
    dateTimeFormat : 'D j.n.Y k\\lo G:i',
    firstWeekday   : DateTime.MONDAY
  }
})
