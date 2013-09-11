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
  var templates = {
    header: function() { return helper('<table class="calendarHeader" />') },

    body: function() { return helper('<table class="calendarBody" />') },

    scrollContent: function() { return helper('<div class="calendarScrollContent" />') },

    /**
     * @private
     */
    _tinyScrollbar: function() {
      var tmpl = [
        '<div class="tinyscrollbar">',
        '<div class="scrollbar">',
        '<div class="track">',
        '<div class="thumb">',
        '<div class="end">',
        '</div></div></div></div></div>'
      ].join('')
      return helper(tmpl)
    },

    /**
     * @private
     */
    _headerRow: function() { return helper('<tr><th class="month" /><th class="week">&nbsp;</th>') },

    th: function() { return helper('<th>') },

    thead: function() { return helper('<thead>') },

    /**
     * @param {object} data
     * @config {string} rows
     */
    tbody: function(data) {
      var tmpl = '<tbody><%= rows %></tbody>'
      return helper(tmpl, data)
    },

    /**
     * @param {object} data
     * @config {string} content
     */
    bodyRow: function(data) {
      var tmpl = '<tr><%= content %></tr>'
      return helper(tmpl, data)
    },

    /**
     * @private
     * @param {object} data
     * @config {string} index
     * @config {string} classNames
     * @config {string} content
     */
    _dateCell: function(data) {
      var tmpl = [
        '<td class="<%= classNames %>" date-cell-index="<%= index %>">',
        '<%= content %>',
        '</td>'
      ].join('')
      return helper(tmpl, data)
    },

    /**
     * @param {object} data
     * @config {string} classNames
     * @config {string} content
     */
    weekCell: function(data) {
      var tmpl = '<th class="week <%= classNames %>"><%= content %></th>'
      return helper(tmpl, data)
    },

    /**
     * @private
     * @param {object} data
     * @config {string} classNames
     * @config {string} content
     */
    _monthCell: function(data) {
      var tmpl = '<th class="month <%= classNames %>"><%= content %></th>'
      return helper(tmpl, data)
    },

    innerWrapper: function() { return helper('<div />') },

    /**
     * @private
     */
    _lengthLabel: function() { return helper('<div class="label"><span class="rangeLengthLabel" /></div>') },

    /**
     * @private
     */
    _separator: function() { return helper('<span class="separator"> - </span>') },

    /**
     * @private
     */
    _endDateLabel: function() { return helper('<span class="endDateLabel" />') },

    /**
     * @private
     */
    _startDateLabel: function() { return helper('<div class="label"><span class="startDateLabel" /></div>') },

    /**
     * @private
     */
    _clearDates: function() { return helper('<span class="clearDates clickable" />') },

    clearLabel: function() { return helper('<div class="label clearLabel" />') },

    icon: function(data) {
      var tmpl = '<a href="javascirpt:;" class="calendarIcon"><%= content %></a>'
      return helper(tmpl, data)
    },

    popupContainer: function() { return helper('<div class="popUpContainer" />') },

    /**
     * @private
     */
    _calendar: function() { return helper('<div class="continuousCalendar" />') },

    emptyContainer: function() { return helper('<div />') }
  }

  /**
   * @param {string} tmpl Should contain <%= `name` %> which replaced by `value`
   * @param {Object} variables Ex. {`name`: '`value`'}
   * @return {string}
   */
  function helper(tmpl, data) {
    if (!data) { return tmpl }

    for (var name in data) {
      var encodedName = ['<%= ', name, ' %>'].join('')
      tmpl = tmpl.replace(encodedName, data[name])
    }
    return tmpl
  }

  return templates
})
