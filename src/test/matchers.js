define(function(require) {
  var DateTime = require('../main/DateTime')
  var DateFormat = require('../main/DateFormat')
  var jQuery = $ = require('jquery')

  return {
    toHaveLength             : function(length) {
      var result = $(this.actual).length == length
      if(this.actual instanceof jQuery) {
        this.actual = $('<div></div>').append(this.actual.clone()).html()
      }
      return result
    },
    toHaveDate               : function(date_str) { return this.actual.hasDate(new DateTime(date_str)) },
    toBeInside               : function(range) { return this.actual.isInside(range) },
    toBeValidRange           : function() { return this.actual.isValid() },
    toPrintDefiningDurationOf: function(duration_str, locale) { return DateFormat.formatDefiningRangeDuration(this.actual, locale) == duration_str },
    toCompareWith: function(expected) {
      return this.actual.compareTo(expected) === 0
    }
  }
})
