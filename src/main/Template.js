define(function(require) {
  /**
   * @param {string} tmpl Should contain <%= `name` %> which replaced by `value`
   * @param {Object} variables Ex. {`name`: '`value`'}
   * @return {string}
   */
  function helper(tmpl, data) {
    if (!data) {
      return tmpl
    }

    for (var name in data) {
      var encodedName = ['<%= ', name, ' %>'].join('')
      tmpl = tmpl.replace(encodedName, data[name])
    }
    return tmpl
  }

  var templates = {}

  templates.header = function() {
    return helper('<table class="calendarHeader" />')
  }

  templates.body = function() {
    return helper('<table class="calendarBody" />')
  }

  templates.scrollContent = function() {
    return helper('<div class="calendarScrollContent" />')
  }

  templates.tinyScrollbar = function() {
    var tmpl = [
      '<div class="tinyscrollbar">',
      '<div class="scrollbar">',
      '<div class="track">',
      '<div class="thumb">',
      '<div class="end">',
      '</div></div></div></div></div>'
    ].join('')
    return helper(tmpl)
  }

  templates.headerRow = function() {
    return helper('<tr><th class="month" /><th class="week">&nbsp;</th>')
  }

  templates.th = function() {
    return helper('<th>')
  }

  templates.thead = function() {
    return helper('<thead>')
  }

  templates.tbody = function(data) {
    var tmpl = '<tbody><%= rows %></tbody>'
    return helper(tmpl, data)
  }

  templates.bodyRow = function(data) {
    var tmpl = '<tr><%= content %></tr>'
    return helper(tmpl, data)
  }

  templates.dateCell = function(data) {
    var tmpl = [
      '<td class="<%= classNames %>" date-cell-index="<%= index %>">',
      '<%= content %>',
      '</td>'
    ].join('')
    return helper(tmpl, data)
  }

  templates.weekCell = function(data) {
    var tmpl = '<th class="week <%= classNames %>"><%= content %></th>'
    return helper(tmpl, data)
  }

  templates.monthCell = function(data) {
    var tmpl = '<th class="month <%= classNames %>"><%= content %></th>'
    return helper(tmpl, data)
  }

  templates.innerWrapper = function() {
    return helper('<div />')
  }

  templates.lengthLabel = function() {
    return helper('<div class="label"><span class="rangeLengthLabel" /></div>')
  }

  templates.separator = function() {
    return helper('<span class="separator"> - </span>')
  }

  templates.endDateLabel = function() {
    return helper('<span class="endDateLabel" />')
  }

  templates.startDateLabel = function() {
    return helper('<div class="label"><span class="startDateLabel" /></div>')
  }

  templates.clearDates = function() {
    return helper('<span class="clearDates clickable" />')
  }

  templates.clearLabel = function() {
    return helper('<div class="label clearLabel" />')
  }

  templates.icon = function(data) {
    var tmpl = '<a href="javascirpt:;" class="calendarIcon"><%= content %></a>'
    return helper(tmpl, data)
  }

  templates.popupContainer = function() {
    return helper('<div class="popUpContainer" />')
  }

  templates.calendar = function() {
    return helper('<div class="continuousCalendar" />')
  }

  templates.emptyContainer = function() {
    return helper('<div />')
  }

  return templates
})
