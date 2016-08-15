//简体中文
var DateTime = require('../DateTime');
var DateFormat = require('../DateFormat');
module.exports = {
    id: 'AU',
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    shortDayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    yearsLabel: function (years) {
        return years + ' ' + (years === 1 ? '年' : '年');
    },
    monthsLabel: function (months) {
        return months + ' ' + (months === 1 ? '月' : '月')
    },
    daysLabel: function (days) {
        return days + ' ' + (days === 1 ? '日' : '日')
    },
    hoursLabel: function (hours, minutes) {
        var hoursAndMinutes = DateFormat.hoursAndMinutes(hours, minutes);
        return hoursAndMinutes + ' ' + (+hoursAndMinutes === 1 ? '小时' : '小时')
    },
    clearRangeLabel: '范围',
    clearDateLabel: '日期',
    shortDateFormat: 'Y年m月d日',
    weekDateFormat: 'Y年m月d日 D',
    dateTimeFormat: 'Y年m月d日 H时i分s秒',
    firstWeekday: DateTime.MONDAY,
    holidays: {}
};