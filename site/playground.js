requirejs.config({
  paths: {
    'jquery'              : '../src/lib/jquery-1.8.0.min',
    'jquery.tinyscrollbar': '../src/main/jquery.tinyscrollbar-1.66/jquery.tinyscrollbar'
  }
})

define(function(require) {
  require('../src/main/jquery.continuousCalendar')
  var $ = require('jquery')
  var DateFormat = require('../src/main/DateFormat')
  var DateLocale = require('../src/main/DateLocale')
  var DateTime = require('../src/main/DateTime')
  jQuery = $

  counter = 0
  $('#create').click(create)

  var locales = $.grep($.map(DateLocale, function(obj, key) {return key}), function(code) {return code.length == 2})
  $('.locales')
    .append($.map(locales, radioChoice).join('\n'))
    .find('input:first').click()

  function radioChoice(l) { return '<label class="row"><input type="radio" name="locale" value="' + l + '" id="' + l + '" /><span class="label">DateLocale.' + l + '</span></label>' }

  var now = DateTime.today()
  var disabledDates = $([now, now, now])
    .map(function(i, el) { return DateFormat.format(el.plusDays(i + 3), 'n/j/Y') })
    .toArray()
    .join(' ')
  $('#disabledDates').val(disabledDates)
  var selection = $([now.plusDays(10), now.plusDays(18)])
    .map(function(i, el) { return DateFormat.format(el, 'n/j/Y') })
    .toArray()
  $('#selectionStart').val(selection[0])
  $('#selectionEnd').val(selection[1])

  create()

  function create() {
    var containerClass = 'container' + counter
    var container = $('<div>').addClass(containerClass)
    var containerWrapper = $('<div class="containerWrapper">').append(container)
    if(valueOf('isRange')) {
      container.append('<input type="hidden" class="startDate" value="' + $('#selectionStart').val() + '" /><input type="hidden" class="endDate" value="' + $('#selectionEnd').val() + '"/>')
    }
    $('body').append(containerWrapper)
    var optionsList = [ 'selectToday', 'disableWeekends', 'isPopup', 'weeksBefore', 'weeksAfter', 'firstDate', 'lastDate', 'minimumRange', 'selectWeek', 'disabledDates', 'fadeOutDuration', 'customScroll', 'allowClearDates' ]
    var options = {
      theme : $('[name=theme]:checked').val(),
      locale: $('[name=locale]:checked').val()
    }

    for(var i = 0; i < optionsList.length; i++) {
      var value = valueOf(optionsList[i])
      if(value) {
        options[optionsList[i]] = value
      }
    }
    var params = JSON.stringify(options)
    containerWrapper.prepend('<textarea  class="example_params">$(selector).continuousCalendar(' + params + ')</textarea>')
    container.continuousCalendar(options)
    function valueOf(id) {
      var elem = $('#' + id)
      return elem.attr('type') == 'checkbox' ? elem.filter(':checked').length > 0 : elem.val()
    }

    return false
  }
})

