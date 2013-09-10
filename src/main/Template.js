/**
 * Templates could be redefined with options provided for $.fn.continuousCalendar
 * For example:
 *   $.fn.continuousCalendar({
 *     templates: {
 *       header: function() {
 *         return '<table class="awesome-header" />'
 *       }
 *     }
 *   })
 *
 * There public and private templates, private starts with underscore. Only public templates could be redefined.
 * List of public templates:
 *   + header
 *   + body
 *   + scrollContent
 *   + th
 *   + thead
 *   + tbody
 *   + bodyRow
 *   + weekCell
 *   + innerWrapper
 *   + clearLabel
 *   + icon
 *   + popupContainer
 *   + emptyContainer
 *
 * @constructor
 * @return {Object.<Function.<String>>}
 */
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

  /**
   * @private
   */
  templates._tinyScrollbar = function() {
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

  /**
   * @private
   */
  templates._headerRow = function() {
    return helper('<tr><th class="month" /><th class="week">&nbsp;</th>')
  }

  templates.th = function() {
    return helper('<th>')
  }

  templates.thead = function() {
    return helper('<thead>')
  }

  /**
   * @param {object} data
   * @config {string} rows
   */
  templates.tbody = function(data) {
    var tmpl = '<tbody><%= rows %></tbody>'
    return helper(tmpl, data)
  }

  /**
   * @param {object} data
   * @config {string} content
   */
  templates.bodyRow = function(data) {
    var tmpl = '<tr><%= content %></tr>'
    return helper(tmpl, data)
  }

  /**
   * @private
   * @param {object} data
   * @config {string} index
   * @config {string} classNames
   * @config {string} content
   */
  templates._dateCell = function(data) {
    var tmpl = [
      '<td class="<%= classNames %>" date-cell-index="<%= index %>">',
      '<%= content %>',
      '</td>'
    ].join('')
    return helper(tmpl, data)
  }

  /**
   * @param {object} data
   * @config {string} classNames
   * @config {string} content
   */
  templates.weekCell = function(data) {
    var tmpl = '<th class="week <%= classNames %>"><%= content %></th>'
    return helper(tmpl, data)
  }

  /**
   * @private
   * @param {object} data
   * @config {string} classNames
   * @config {string} content
   */
  templates._monthCell = function(data) {
    var tmpl = '<th class="month <%= classNames %>"><%= content %></th>'
    return helper(tmpl, data)
  }

  templates.innerWrapper = function() {
    return helper('<div />')
  }

  /**
   * @private
   */
  templates._lengthLabel = function() {
    return helper('<div class="label"><span class="rangeLengthLabel" /></div>')
  }

  /**
   * @private
   */
  templates._separator = function() {
    return helper('<span class="separator"> - </span>')
  }

  /**
   * @private
   */
  templates._endDateLabel = function() {
    return helper('<span class="endDateLabel" />')
  }

  /**
   * @private
   */
  templates._startDateLabel = function() {
    return helper('<div class="label"><span class="startDateLabel" /></div>')
  }

  /**
   * @private
   */
  templates._clearDates = function() {
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

  /**
   * @private
   */
  templates._calendar = function() {
    return helper('<div class="continuousCalendar" />')
  }

  templates.emptyContainer = function() {
    return helper('<div />')
  }

  return templates
})
